namespace ManyVagas.Api.Data;

// ─── F-07 – DTO for PDF export requests ──────────────────────────────────────
// Mirrors BaseResumeContentDto fields and adds CargoDesejado (required for
// the generated filename and the document header).

public record PdfExportRequest(
    string? Nome,
    string? Email,
    string? Telefone,
    string? Cidade,
    string? LinkedIn,
    string? GitHub,
    string? Resumo,
    List<ExperienciaDto>? Experiencias,
    List<EducacaoDto>? Educacao,
    List<string>? Habilidades,
    List<IdiomaDto>? Idiomas,
    List<ProjetoDto>? Projetos,
    string? CargoDesejado
);
