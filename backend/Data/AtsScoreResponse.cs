namespace ManyVagas.Api.Data;

public class AtsScoreResponse
{
    public int TotalScore { get; set; }
    public AtsScoreBreakdownDto Breakdown { get; set; } = new();
}
