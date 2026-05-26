namespace ManyVagas.Api.Data;

/// <summary>Request body for POST /api/resume/generate.</summary>
/// <param name="JobDescription">Full text of the job description to optimize the resume against.</param>
/// <param name="Language">Target language: "pt-br" or "en".</param>
public record GenerateResumeRequest(string JobDescription, string Language);
