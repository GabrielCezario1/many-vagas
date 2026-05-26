namespace ManyVagas.Api.Data;

// ─── Task 1.3 ─ DTO for base-resume JSON blob ───────────────────────────────
// Used only for deserialization and minimal validation in the API endpoints.
// The data is persisted as a JSON string inside BaseResume.Content (blob pattern).

public record BaseResumeContentDto(
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
    List<ProjetoDto>? Projetos
);

public record ExperienciaDto(
    string? Empresa,
    string? Cargo,
    string? DataInicio,
    string? DataFim,
    bool Atualmente,
    List<string>? Bullets
);

public record EducacaoDto(
    string? Instituicao,
    string? Curso,
    string? Grau,
    string? DataInicio,
    string? DataFim
);

public record IdiomaDto(
    string? Idioma,
    string? Nivel
);

public record ProjetoDto(
    string? Nome,
    string? Descricao,
    List<string>? Tecnologias,
    string? Link
);
