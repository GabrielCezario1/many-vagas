namespace ManyVagas.Api.Data;

public class AtsScoreBreakdownDto
{
    public double KeywordMatch { get; set; }
    public double ActionVerbs { get; set; }
    public double Quantification { get; set; }
    public double Completeness { get; set; }
}
