namespace ManyVagas.Api.Data;

public class GeneratedResume
{
    public int Id { get; set; }

    /// <summary>
    /// JSON-serialized string with the full generated resume content.
    /// Single-record pattern: at most one row in this table.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>ATS compatibility score (0–100).</summary>
    public int AtsScore { get; set; }

    /// <summary>JSON-serialized list of skill gaps detected.</summary>
    public required string SkillGaps { get; set; }

    /// <summary>ISO 639-1 language code (e.g. "pt-BR", "en-US").</summary>
    public required string Language { get; set; }

    /// <summary>UTC timestamp of when this resume was generated.</summary>
    public DateTime GeneratedAt { get; set; }
}
