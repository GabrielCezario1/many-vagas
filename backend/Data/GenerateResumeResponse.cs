namespace ManyVagas.Api.Data;

/// <summary>
/// Response payload for POST /api/resume/generate.
/// The full resume content is persisted in the database and returned via
/// GET /api/generated-resume; this response carries only the ATS analysis.
/// </summary>
public record GenerateResumeResponse(
    List<string> MatchedSkills,
    List<string> MissingSkills,
    int AtsScore
);
