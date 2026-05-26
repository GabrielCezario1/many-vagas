namespace ManyVagas.Api.Data;

public class BaseResume
{
    public int Id { get; set; }

    /// <summary>
    /// JSON-serialized string containing all resume sections (personal info,
    /// experience, education, skills, etc.). Single-record pattern: there is
    /// at most one row in this table.
    /// </summary>
    public required string Content { get; set; }
}
