namespace ManyVagas.Api.Data;

/// <summary>
/// Represents the JSON object returned by Azure OpenAI in response to the
/// resume-generation prompt.  Mirrors the structure of BaseResumeContentDto
/// plus the ATS analysis fields.
/// </summary>
public record AiGeneratedResumeDto(
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
    List<string>? MatchedSkills,
    List<string>? MissingSkills,
    int AtsScore
);
