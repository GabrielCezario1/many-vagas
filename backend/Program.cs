using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using Microsoft.EntityFrameworkCore;
using ManyVagas.Api.Data;
using ManyVagas.Api.Services;
using QuestPDF.Infrastructure;

// ─── F-07 – QuestPDF community licence (must be set before first PDF generation)
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// ─── CORS ────────────────────────────────────────────────────────────────────
// Task 3.3 – Allow only the Angular dev server origin.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendLocal", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ─── Database ────────────────────────────────────────────────────────────────
// Task 4.5 – Register AppDbContext with SQLite, pointing to app.db.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "app.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// ─── Azure OpenAI configuration ──────────────────────────────────────────────
// Registered conditionally — missing credentials cause 503 on the generate
// endpoint only; the rest of the API remains functional.
var azureOpenAiSection = builder.Configuration.GetSection("AzureOpenAI");
var aoaiEndpoint   = azureOpenAiSection["Endpoint"];
var aoaiApiKey     = azureOpenAiSection["ApiKey"];
var aoaiDeployment = azureOpenAiSection["Deployment"];

var aoaiConfigured = !string.IsNullOrWhiteSpace(aoaiEndpoint)
                  && !string.IsNullOrWhiteSpace(aoaiApiKey)
                  && !string.IsNullOrWhiteSpace(aoaiDeployment);

if (aoaiConfigured)
{
    builder.Services.AddSingleton(
        new AzureOpenAIClient(new Uri(aoaiEndpoint!), new AzureKeyCredential(aoaiApiKey!)));
}

// ─── Application services ─────────────────────────────────────────────────────
if (aoaiConfigured)
    builder.Services.AddScoped<ResumeGenerationService>();

// Task 3.1 – Register AtsScoreService (no external dependencies — singleton is fine)
builder.Services.AddSingleton<AtsScoreService>();

// F-07 – Register PdfGenerationService (stateless — singleton is appropriate)
builder.Services.AddSingleton<PdfGenerationService>();

// F-08 – Register DocxExportService as scoped
builder.Services.AddScoped<DocxExportService>();

var app = builder.Build();

// ─── Auto-migrate SQLite on startup ──────────────────────────────────────────
// Task 4.7 – Run pending EF Core migrations before accepting requests.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.UseCors("FrontendLocal");

// ─── Endpoints ────────────────────────────────────────────────────────────────

// Task 3.4 – Health check
app.MapGet("/health", () => Results.Ok(new { status = "ok", version = "1.0.0" }));

// Task 4.8 – Existence endpoints used by Angular route guards.
app.MapGet("/api/base-resume/exists", async (AppDbContext db) =>
{
    var exists = await db.BaseResumes.AnyAsync();
    return Results.Ok(new { exists });
});

app.MapGet("/api/generated-resume/exists", async (AppDbContext db) =>
{
    var exists = await db.GeneratedResumes.AnyAsync();
    return Results.Ok(new { exists });
});

// ─── Task 1.1 – GET /api/base-resume ─────────────────────────────────────────
// Returns the stored resume JSON or 404 if no record exists yet.
app.MapGet("/api/base-resume", async (AppDbContext db) =>
{
    var resume = await db.BaseResumes.FirstOrDefaultAsync();
    if (resume is null) return Results.NotFound();

    var content = JsonSerializer.Deserialize<BaseResumeContentDto>(
        resume.Content,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
    );
    return Results.Ok(content);
});

// ─── Task 1.2 – POST /api/base-resume ────────────────────────────────────────
// Upsert: creates or replaces the single resume record.
// Returns 400 when the required "nome" field is absent or empty.
app.MapPost("/api/base-resume", async (BaseResumeContentDto dto, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Nome))
        return Results.BadRequest(new { error = "O campo nome é obrigatório." });

    var json = JsonSerializer.Serialize(dto);

    var existing = await db.BaseResumes.FirstOrDefaultAsync();
    if (existing is null)
    {
        db.BaseResumes.Add(new BaseResume { Content = json });
    }
    else
    {
        existing.Content = json;
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Currículo salvo com sucesso." });
});

// ─── POST /api/resume/generate ────────────────────────────────────────────────
// Generates an ATS-optimized resume via Azure OpenAI and persists it.
// Returns 503 if Azure OpenAI is not configured, 504 on timeout,
// 502 on Azure API/parsing errors, 500 on DB errors.
app.MapPost("/api/resume/generate", async (
    GenerateResumeRequest req,
    AppDbContext db,
    HttpContext ctx,
    CancellationToken ct) =>
{
    if (!aoaiConfigured)
        return Results.Problem(
            detail: "Azure OpenAI credentials are not configured. Add AzureOpenAI section to appsettings.json.",
            statusCode: 503);

    var svc = ctx.RequestServices.GetRequiredService<ResumeGenerationService>();

    // 4.2 – Load base resume (null is fine; generation proceeds without it)
    var baseResumeEntity = await db.BaseResumes.FirstOrDefaultAsync(ct);
    BaseResumeContentDto? baseResume = null;
    if (baseResumeEntity is not null)
    {
        baseResume = JsonSerializer.Deserialize<BaseResumeContentDto>(
            baseResumeEntity.Content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    // 4.3 – Call the AI service with a 60-second timeout
    AiGeneratedResumeDto aiResult;
    using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
    using var linkedCts  = CancellationTokenSource.CreateLinkedTokenSource(ct, timeoutCts.Token);
    try
    {
        aiResult = await svc.GenerateAsync(baseResume, req.JobDescription, req.Language, linkedCts.Token);
    }
    catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested)
    {
        return Results.Json(new { error = "timeout", message = "A geração excedeu o tempo limite de 60 segundos." }, statusCode: 504);
    }
    catch (Azure.RequestFailedException ex)
    {
        return Results.Json(new { error = "azure_api_error", message = ex.Message }, statusCode: 502);
    }
    catch (System.Text.Json.JsonException ex)
    {
        return Results.Json(new { error = "invalid_ai_response", message = ex.Message }, statusCode: 502);
    }

    // 4.4 – Upsert GeneratedResume (single-record pattern)
    var contentJson = JsonSerializer.Serialize(new
    {
        aiResult.Nome, aiResult.Email, aiResult.Telefone, aiResult.Cidade,
        aiResult.LinkedIn, aiResult.GitHub, aiResult.Resumo,
        aiResult.Experiencias, aiResult.Educacao, aiResult.Habilidades,
        aiResult.Idiomas, aiResult.Projetos,
    });
    var skillGapsJson = JsonSerializer.Serialize(new
    {
        matched = aiResult.MatchedSkills ?? [],
        missing = aiResult.MissingSkills ?? [],
    });

    try
    {
        var existing = await db.GeneratedResumes.FirstOrDefaultAsync(ct);
        if (existing is null)
        {
            db.GeneratedResumes.Add(new GeneratedResume
            {
                Content     = contentJson,
                AtsScore    = aiResult.AtsScore,
                SkillGaps   = skillGapsJson,
                Language    = req.Language,
                GeneratedAt = DateTime.UtcNow,
            });
        }
        else
        {
            existing.Content     = contentJson;
            existing.AtsScore    = aiResult.AtsScore;
            existing.SkillGaps   = skillGapsJson;
            existing.Language    = req.Language;
            existing.GeneratedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
    }
    catch (Exception ex) when (ex is not OperationCanceledException)
    {
        return Results.Json(new { error = "db_error", message = "Erro ao salvar o currículo gerado." }, statusCode: 500);
    }

    return Results.Ok(new GenerateResumeResponse(
        aiResult.MatchedSkills ?? [],
        aiResult.MissingSkills ?? [],
        aiResult.AtsScore));
});

// ─── GET /api/generated-resume ────────────────────────────────────────────────
// Returns the latest generated resume with ATS analysis, or 404 if none exists.
app.MapGet("/api/generated-resume", async (AppDbContext db) =>
{
    var resume = await db.GeneratedResumes.FirstOrDefaultAsync();
    if (resume is null) return Results.NotFound();

    var content = JsonSerializer.Deserialize<object>(
        resume.Content,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

    var skillGaps = JsonSerializer.Deserialize<System.Text.Json.JsonElement>(
        resume.SkillGaps,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

    return Results.Ok(new
    {
        resume      = content,
        atsScore    = resume.AtsScore,
        matchedSkills = skillGaps.TryGetProperty("matched", out var m)
            ? m.Deserialize<List<string>>() : [],
        missingSkills = skillGaps.TryGetProperty("missing", out var mi)
            ? mi.Deserialize<List<string>>() : [],
        language    = resume.Language,
        generatedAt = resume.GeneratedAt,
    });
});

// ─── PUT /api/generated-resume ───────────────────────────────────────────────
// Persists editor edits to the stored generated resume content.
// Returns 404 if no generated resume record exists yet.
app.MapPut("/api/generated-resume", async (BaseResumeContentDto dto, AppDbContext db) =>
{
    var existing = await db.GeneratedResumes.FirstOrDefaultAsync();
    if (existing is null) return Results.NotFound();

    existing.Content = JsonSerializer.Serialize(dto);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Currículo editado salvo com sucesso." });
});

// ─── POST /api/generated-resume/export/pdf ───────────────────────────────────
// Stub retained for backward compatibility. Returns 501 Not Implemented.
app.MapPost("/api/generated-resume/export/pdf", () => Results.StatusCode(501));

// ─── F-07 – POST /api/resume/export/pdf ──────────────────────────────────────
// Generates an A4 PDF from the submitted resume data.
// Returns 400 when CargoDesejado is absent (required for the filename).
app.MapPost("/api/resume/export/pdf", (PdfExportRequest req, PdfGenerationService svc) =>
{
    if (string.IsNullOrWhiteSpace(req.CargoDesejado))
        return Results.BadRequest(new { error = "O campo cargoDesejado é obrigatório." });

    var pdfBytes = svc.GeneratePdf(req);
    var date      = DateTime.Now.ToString("yyyy-MM-dd");
    var sanitized = PdfGenerationService.SanitizeFileName(req.CargoDesejado);
    var fileName  = $"curriculo-{sanitized}-{date}.pdf";
    return Results.File(pdfBytes, "application/pdf", fileName);
});

// ─── F-08 – POST /api/resume/export/docx ────────────────────────────────────
// Generates a .docx from the submitted resume data.
// Returns 400 when CargoDesejado is absent, 500 on generation error.
app.MapPost("/api/resume/export/docx", (PdfExportRequest req, DocxExportService svc) =>
{
    if (req is null || string.IsNullOrWhiteSpace(req.CargoDesejado))
        return Results.BadRequest(new { error = "O campo cargoDesejado é obrigatório." });

    try
    {
        var docxBytes = svc.GenerateDocx(req);
        var date      = DateTime.Now.ToString("yyyy-MM-dd");
        var sanitized = PdfGenerationService.SanitizeFileName(req.CargoDesejado);
        var fileName  = $"curriculo-{sanitized}-{date}.docx";
        return Results.File(docxBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileName);
    }
    catch
    {
        return Results.StatusCode(500);
    }
});

// ─── Task 3.2 – POST /api/ats-score ─────────────────────────────────────────
// Returns ATS score (0–100) and breakdown for the given resume + job description.
// Returns 400 when either field is absent or whitespace.
app.MapPost("/api/ats-score", (AtsScoreRequest req, AtsScoreService svc) =>
{
    if (string.IsNullOrWhiteSpace(req.ResumeText))
        return Results.BadRequest(new { error = "O campo resumeText é obrigatório." });

    if (string.IsNullOrWhiteSpace(req.JobDescription))
        return Results.BadRequest(new { error = "O campo jobDescription é obrigatório." });

    var result = svc.Calculate(req.ResumeText, req.JobDescription);
    return Results.Ok(result);
});

app.Run();
