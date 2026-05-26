using Azure.AI.OpenAI;
using ManyVagas.Api.Data;
using OpenAI.Chat;
using System.Text.Json;

namespace ManyVagas.Api.Services;

/// <summary>
/// Builds and executes the Azure OpenAI chat completion request to generate
/// an ATS-optimized resume from a base resume and job description.
/// </summary>
public class ResumeGenerationService
{
    private readonly AzureOpenAIClient _client;
    private readonly string _deployment;

    private static readonly JsonSerializerOptions _jsonOpts =
        new() { PropertyNameCaseInsensitive = true };

    public ResumeGenerationService(AzureOpenAIClient client, IConfiguration config)
    {
        _client = client;
        _deployment = config["AzureOpenAI:Deployment"] ?? "gpt-4o";
    }

    /// <summary>
    /// Calls Azure OpenAI to produce an optimized resume.
    /// Throws <see cref="OperationCanceledException"/> on timeout,
    /// <see cref="Azure.RequestFailedException"/> on Azure API errors, and
    /// <see cref="JsonException"/> when the model returns malformed JSON.
    /// </summary>
    public async Task<AiGeneratedResumeDto> GenerateAsync(
        BaseResumeContentDto? baseResume,
        string jobDescription,
        string language,
        CancellationToken cancellationToken = default)
    {
        var chatClient = _client.GetChatClient(_deployment);

        var options = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
        };

        ChatCompletion completion = await chatClient.CompleteChatAsync(
            [
                new SystemChatMessage(BuildSystemPrompt(language)),
                new UserChatMessage(BuildUserPrompt(baseResume, jobDescription)),
            ],
            options,
            cancellationToken);

        var json = completion.Content[0].Text;

        return JsonSerializer.Deserialize<AiGeneratedResumeDto>(json, _jsonOpts)
            ?? throw new JsonException("A resposta da IA não contém JSON válido.");
    }

    // ─── Prompt builders ──────────────────────────────────────────────────────

    private static string BuildSystemPrompt(string language)
    {
        var lang = string.Equals(language, "en", StringComparison.OrdinalIgnoreCase)
            ? "English"
            : "Brazilian Portuguese (PT-BR)";

        return $$"""
            You are an expert ATS resume optimizer. Your task is to generate a fully
            optimized resume in {{lang}}.

            Rules:
            1. Write ALL resume content in {{lang}} — including section titles, bullet
               points, summary, and skills.
            2. Rewrite every experience bullet point using the XYZ formula:
               "Accomplished X, measured by Y, by doing Z."
            3. Inject relevant keywords from the job description into the skills,
               summary, and experience sections.
            4. Keep personal contact information (name, email, phone, city,
               LinkedIn, GitHub) unchanged from the input.
            5. Respond ONLY with a single JSON object matching the schema below —
               no markdown, no preamble, no explanation:
            {
              "nome": "string",
              "email": "string",
              "telefone": "string",
              "cidade": "string",
              "linkedIn": "string",
              "gitHub": "string",
              "resumo": "string",
              "experiencias": [
                {
                  "empresa": "string",
                  "cargo": "string",
                  "dataInicio": "string",
                  "dataFim": "string | null",
                  "atualmente": false,
                  "bullets": ["string"]
                }
              ],
              "educacao": [
                {
                  "instituicao": "string",
                  "curso": "string",
                  "grau": "string",
                  "dataInicio": "string",
                  "dataFim": "string"
                }
              ],
              "habilidades": ["string"],
              "idiomas": [{ "idioma": "string", "nivel": "string" }],
              "projetos": [
                {
                  "nome": "string",
                  "descricao": "string",
                  "tecnologias": ["string"],
                  "link": "string"
                }
              ],
              "matchedSkills": ["string"],
              "missingSkills": ["string"],
              "atsScore": 0
            }
            """;
    }

    private static string BuildUserPrompt(BaseResumeContentDto? baseResume, string jobDescription)
    {
        var resumeJson = baseResume is not null
            ? JsonSerializer.Serialize(baseResume)
            : "{}";

        return $"""
            ## Job Description
            {jobDescription}

            ## Current Resume (JSON)
            {resumeJson}
            """;
    }
}
