using System.Text.RegularExpressions;
using ManyVagas.Api.Data;

namespace ManyVagas.Api.Services;

public class AtsScoreService
{
    // Task 2.3 – ≥50 action verbs in PT/EN as static field
    private static readonly HashSet<string> ActionVerbSet = new(StringComparer.OrdinalIgnoreCase)
    {
        // Portuguese — past tense
        "desenvolvi", "implementei", "criei", "liderei", "gerenciei", "coordenei", "otimizei",
        "aumentei", "reduzi", "melhorei", "construí", "projetei", "analisei", "planejei",
        "executei", "entreguei", "conduzi", "estabeleci", "defini", "introduzi",
        "migrei", "automatizei", "integrei", "configurei", "implantei", "supervisionei",
        "treinei", "mentorei", "colaborei", "contribuí", "lancei", "alcancei", "refatorei",
        // Portuguese — infinitive
        "desenvolver", "implementar", "criar", "liderar", "gerenciar", "coordenar",
        "otimizar", "aumentar", "reduzir", "melhorar", "construir", "projetar",
        "analisar", "planejar", "executar", "entregar", "conduzir", "estabelecer",
        // English — past tense
        "developed", "implemented", "created", "led", "managed", "coordinated",
        "optimized", "increased", "reduced", "improved", "built", "designed",
        "analyzed", "planned", "executed", "delivered", "drove", "established",
        "defined", "introduced", "migrated", "automated", "integrated", "configured",
        "deployed", "supervised", "trained", "mentored", "collaborated", "contributed",
        "launched", "achieved", "streamlined", "accelerated", "architected", "engineered",
        "spearheaded", "transformed", "scaled", "maintained", "refactored", "debugged",
        "resolved", "facilitated", "championed", "negotiated", "oversaw", "redesigned",
        // English — present/infinitive
        "develop", "implement", "create", "lead", "manage", "coordinate",
        "optimize", "build", "design", "analyze", "plan", "execute", "deliver"
    };

    // Task 2.1 – Main entry point
    public AtsScoreResponse Calculate(string resumeText, string jobDescription)
    {
        var keywordMatch   = CalculateKeywordMatch(resumeText, jobDescription);  // Task 2.2
        var actionVerbs    = CalculateActionVerbs(resumeText);                   // Task 2.4
        var quantification = CalculateQuantification(resumeText);                // Task 2.5
        var completeness   = CalculateCompleteness(resumeText);                  // Task 2.6

        // Task 2.7 – TotalScore = round of sum, clamped to 0–100
        var total = (int)Math.Round(keywordMatch + actionVerbs + quantification + completeness);
        total = Math.Clamp(total, 0, 100);

        return new AtsScoreResponse
        {
            TotalScore = total,
            Breakdown = new AtsScoreBreakdownDto
            {
                KeywordMatch   = keywordMatch,
                ActionVerbs    = actionVerbs,
                Quantification = quantification,
                Completeness   = completeness
            }
        };
    }

    // Task 2.2 – Keyword Match: extract unique keywords (≥3 chars) from job, check with word-boundary
    private static double CalculateKeywordMatch(string resumeText, string jobDescription)
    {
        var normalizedJob    = NormalizeText(jobDescription);
        var normalizedResume = NormalizeText(resumeText);

        var keywords = Regex.Matches(normalizedJob, @"\b\w{3,}\b")
            .Select(m => m.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (keywords.Count == 0) return 0;

        var found = keywords.Count(k =>
            Regex.IsMatch(normalizedResume, $@"\b{Regex.Escape(k)}\b", RegexOptions.IgnoreCase));

        return (double)found / keywords.Count * 40;
    }

    // Task 2.4 – Action Verbs: proportion of bullets starting with a verb from the list × 25
    private static double CalculateActionVerbs(string resumeText)
    {
        var bullets = ExtractBullets(resumeText);
        if (bullets.Count == 0) return 0;

        var withVerbs = bullets.Count(b =>
        {
            var firstWord = Regex.Match(b.Trim(), @"^\w+").Value;
            return ActionVerbSet.Contains(firstWord);
        });

        return (double)withVerbs / bullets.Count * 25;
    }

    // Task 2.5 – Quantification: proportion of bullets with number/percentage/metric × 20
    private static double CalculateQuantification(string resumeText)
    {
        var bullets = ExtractBullets(resumeText);
        if (bullets.Count == 0) return 0;

        var withMetrics = bullets.Count(b =>
            Regex.IsMatch(b, @"\d") ||
            Regex.IsMatch(b, @"%|R\$|\$|\bk\b|\bM\b"));

        return (double)withMetrics / bullets.Count * 20;
    }

    // Task 2.6 – Completeness: email/phone (5pts), experience (5pts), skills (5pts)
    private static double CalculateCompleteness(string resumeText)
    {
        double score = 0;

        // Email or phone
        if (Regex.IsMatch(resumeText, @"\b[\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,}\b") ||
            Regex.IsMatch(resumeText, @"\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}"))
            score += 5;

        // Experience section
        if (Regex.IsMatch(resumeText,
            @"\bexperiência\b|\bexperience\b|\bempresa\b|\bcompany\b|\bcargo\b|\bposition\b|\btrabalh",
            RegexOptions.IgnoreCase))
            score += 5;

        // Skills section
        if (Regex.IsMatch(resumeText,
            @"\bhabilidades\b|\bskills\b|\btecnologias\b|\btechnologies\b|\bcompetências\b",
            RegexOptions.IgnoreCase))
            score += 5;

        return score;
    }

    // Identifies bullet-point lines: -, •, *, or numbered lists
    private static List<string> ExtractBullets(string text)
    {
        return text.Split('\n')
            .Where(l => Regex.IsMatch(l.TrimStart(), @"^[-•*]|^\d+[.)]\s"))
            .Select(l => Regex.Replace(l.TrimStart(), @"^[-•*\d.)]+\s*", "").Trim())
            .Where(l => l.Length > 0)
            .ToList();
    }

    private static string NormalizeText(string text) =>
        Regex.Replace(text.ToLower(), @"[^\w\s]", " ");
}
