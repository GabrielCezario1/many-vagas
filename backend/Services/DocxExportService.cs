using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using ManyVagas.Api.Data;

namespace ManyVagas.Api.Services;

// ─── F-08 – DOCX generation service using DocumentFormat.OpenXml ─────────────
// Generates a .docx file from a PdfExportRequest (reused DTO per design D3).
// Sections are omitted when the corresponding data is absent/empty.
// Uses Word built-in heading styles (Heading1, Heading2).

public class DocxExportService
{
    // ─── Public entry point ────────────────────────────────────────────────────
    public byte[] GenerateDocx(PdfExportRequest req)
    {
        using var ms = new MemoryStream();
        using (var doc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document))
        {
            var mainPart = doc.AddMainDocumentPart();
            mainPart.Document = new Document();
            var body = new Body();
            mainPart.Document.Append(body);

            // ── 1.3 Header (Name → Heading1, cargo, contact line) ────────────
            BuildHeader(body, req);

            // ── 1.4 Sections in order, each omitted when empty (1.5) ─────────

            // Resumo Profissional
            if (!string.IsNullOrWhiteSpace(req.Resumo))
            {
                body.Append(CreateHeading("Resumo Profissional", 2));
                body.Append(CreateParagraph(req.Resumo));
            }

            // Experiências Profissionais
            if (req.Experiencias?.Count > 0)
            {
                body.Append(CreateHeading("Experiências Profissionais", 2));
                BuildExperiencias(body, req.Experiencias);
            }

            // Educação
            if (req.Educacao?.Count > 0)
            {
                body.Append(CreateHeading("Educação", 2));
                BuildEducacao(body, req.Educacao);
            }

            // Habilidades
            var skills = req.Habilidades?.Where(h => !string.IsNullOrWhiteSpace(h)).ToList();
            if (skills?.Count > 0)
            {
                body.Append(CreateHeading("Habilidades", 2));
                body.Append(CreateParagraph(string.Join("  ·  ", skills)));
            }

            // Idiomas
            var langs = req.Idiomas?
                .Where(i => !string.IsNullOrWhiteSpace(i.Idioma))
                .Select(i => string.IsNullOrWhiteSpace(i.Nivel)
                    ? i.Idioma!
                    : $"{i.Idioma} ({i.Nivel})")
                .ToList();
            if (langs?.Count > 0)
            {
                body.Append(CreateHeading("Idiomas", 2));
                body.Append(CreateParagraph(string.Join("  ·  ", langs)));
            }

            // Projetos
            if (req.Projetos?.Count > 0)
            {
                body.Append(CreateHeading("Projetos", 2));
                BuildProjetos(body, req.Projetos);
            }

            mainPart.Document.Save();
        }

        return ms.ToArray();
    }

    // ─── Header: Name (Heading 1) → CargoDesejado → email · telefone · cidade ─
    private static void BuildHeader(Body body, PdfExportRequest req)
    {
        if (!string.IsNullOrWhiteSpace(req.Nome))
            body.Append(CreateHeading(req.Nome, 1));

        if (!string.IsNullOrWhiteSpace(req.CargoDesejado))
            body.Append(CreateParagraph(req.CargoDesejado));

        var contact = new List<string>();
        if (!string.IsNullOrWhiteSpace(req.Email))    contact.Add(req.Email);
        if (!string.IsNullOrWhiteSpace(req.Telefone)) contact.Add(req.Telefone);
        if (!string.IsNullOrWhiteSpace(req.Cidade))   contact.Add(req.Cidade);

        if (contact.Count > 0)
            body.Append(CreateParagraph(string.Join("  ·  ", contact)));
    }

    // ─── Experiências ─────────────────────────────────────────────────────────
    private static void BuildExperiencias(Body body, List<ExperienciaDto> list)
    {
        foreach (var exp in list)
        {
            var period = exp.Atualmente
                ? $"{exp.DataInicio} — Presente"
                : $"{exp.DataInicio} — {exp.DataFim}";
            var title = $"{exp.Cargo ?? string.Empty} — {exp.Empresa ?? string.Empty}   {period}";
            body.Append(CreateBoldParagraph(title.Trim()));

            foreach (var bullet in exp.Bullets?.Where(b => !string.IsNullOrWhiteSpace(b)) ?? [])
                body.Append(CreateBulletParagraph(bullet));
        }
    }

    // ─── Educação ─────────────────────────────────────────────────────────────
    private static void BuildEducacao(Body body, List<EducacaoDto> list)
    {
        foreach (var edu in list)
        {
            var line = $"{edu.Grau ?? string.Empty} em {edu.Curso ?? string.Empty} — {edu.Instituicao ?? string.Empty}";
            body.Append(CreateBoldParagraph(line.Trim()));
            var period = $"{edu.DataInicio} — {edu.DataFim}".Trim(' ', '—', ' ');
            if (!string.IsNullOrWhiteSpace(period))
                body.Append(CreateParagraph(period));
        }
    }

    // ─── Projetos ─────────────────────────────────────────────────────────────
    private static void BuildProjetos(Body body, List<ProjetoDto> list)
    {
        foreach (var proj in list)
        {
            if (!string.IsNullOrWhiteSpace(proj.Nome))
                body.Append(CreateBoldParagraph(proj.Nome));
            if (!string.IsNullOrWhiteSpace(proj.Descricao))
                body.Append(CreateParagraph(proj.Descricao));
            if (proj.Tecnologias?.Count > 0)
                body.Append(CreateParagraph("Tecnologias: " + string.Join(", ", proj.Tecnologias)));
            if (!string.IsNullOrWhiteSpace(proj.Link))
                body.Append(CreateParagraph(proj.Link));
        }
    }

    // ─── Paragraph builders ───────────────────────────────────────────────────

    /// <summary>Creates a paragraph with a built-in Word heading style (Heading1 or Heading2).</summary>
    private static Paragraph CreateHeading(string text, int level)
    {
        var styleId = level == 1 ? "Heading1" : "Heading2";
        return new Paragraph(
            new ParagraphProperties(
                new ParagraphStyleId { Val = styleId }
            ),
            new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve })
        );
    }

    private static Paragraph CreateParagraph(string text)
    {
        return new Paragraph(
            new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve })
        );
    }

    private static Paragraph CreateBoldParagraph(string text)
    {
        return new Paragraph(
            new Run(
                new RunProperties(new Bold()),
                new Text(text) { Space = SpaceProcessingModeValues.Preserve }
            )
        );
    }

    private static Paragraph CreateBulletParagraph(string text)
    {
        return new Paragraph(
            new ParagraphProperties(
                new Indentation { Left = "720" }
            ),
            new Run(new Text($"• {text}") { Space = SpaceProcessingModeValues.Preserve })
        );
    }
}
