using ManyVagas.Api.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;
using System.Text;

namespace ManyVagas.Api.Services;

// ─── F-07 – PDF generation service using QuestPDF ────────────────────────────
// Generates an A4 PDF from a PdfExportRequest.
// Sections are omitted when the corresponding data is absent/empty.
// License must be set to Community before any Document.Create call.

public class PdfGenerationService
{
    // ─── Public entry point ───────────────────────────────────────────────────
    public byte[] GeneratePdf(PdfExportRequest request)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(1.75f, Unit.Centimetre);
                page.MarginVertical(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Content().Column(col =>
                {
                    // ── 2.2 Header ──────────────────────────────────────────
                    BuildHeader(col, request);
                    col.Item().Height(10);

                    // ── 2.3 Resumo Profissional ─────────────────────────────
                    if (!string.IsNullOrWhiteSpace(request.Resumo))
                    {
                        RenderSectionTitle(col, "Resumo Profissional");
                        col.Item().PaddingTop(2).Text(request.Resumo).FontSize(10);
                        col.Item().Height(8);
                    }

                    // ── 2.4 Experiências Profissionais ──────────────────────
                    if (request.Experiencias?.Count > 0)
                    {
                        RenderSectionTitle(col, "Experiências Profissionais");
                        BuildExperiencias(col, request.Experiencias);
                        col.Item().Height(8);
                    }

                    // ── 2.5 Educação ────────────────────────────────────────
                    if (request.Educacao?.Count > 0)
                    {
                        RenderSectionTitle(col, "Educação");
                        BuildEducacao(col, request.Educacao);
                        col.Item().Height(8);
                    }

                    // ── 2.6 Habilidades ─────────────────────────────────────
                    if (request.Habilidades?.Count > 0)
                    {
                        RenderSectionTitle(col, "Habilidades");
                        var skills = request.Habilidades
                            .Where(h => !string.IsNullOrWhiteSpace(h));
                        col.Item().PaddingTop(2)
                            .Text(string.Join("  ·  ", skills))
                            .FontSize(10);
                        col.Item().Height(8);
                    }

                    // ── 2.7 Idiomas ─────────────────────────────────────────
                    if (request.Idiomas?.Count > 0)
                    {
                        RenderSectionTitle(col, "Idiomas");
                        var langs = request.Idiomas
                            .Where(i => !string.IsNullOrWhiteSpace(i.Idioma))
                            .Select(i => string.IsNullOrWhiteSpace(i.Nivel)
                                ? i.Idioma!
                                : $"{i.Idioma} ({i.Nivel})");
                        col.Item().PaddingTop(2)
                            .Text(string.Join("  ·  ", langs))
                            .FontSize(10);
                        col.Item().Height(8);
                    }

                    // ── 2.8 Projetos ────────────────────────────────────────
                    if (request.Projetos?.Count > 0)
                    {
                        RenderSectionTitle(col, "Projetos");
                        BuildProjetos(col, request.Projetos);
                    }
                });
            });
        }).GeneratePdf();
    }

    // ─── Header ───────────────────────────────────────────────────────────────
    private static void BuildHeader(ColumnDescriptor col, PdfExportRequest req)
    {
        col.Item()
            .BorderBottom(1.5f)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingBottom(8)
            .Column(hdr =>
            {
                if (!string.IsNullOrWhiteSpace(req.Nome))
                    hdr.Item().Text(req.Nome)
                        .FontSize(22).Bold().FontColor(Colors.Grey.Darken4);

                if (!string.IsNullOrWhiteSpace(req.CargoDesejado))
                    hdr.Item().Text(req.CargoDesejado)
                        .FontSize(12).FontColor(Colors.Indigo.Medium);

                var contact = new List<string>();
                if (!string.IsNullOrWhiteSpace(req.Email))    contact.Add(req.Email);
                if (!string.IsNullOrWhiteSpace(req.Telefone)) contact.Add(req.Telefone);
                if (!string.IsNullOrWhiteSpace(req.Cidade))   contact.Add(req.Cidade);

                if (contact.Count > 0)
                    hdr.Item().PaddingTop(3)
                        .Text(string.Join("  ·  ", contact))
                        .FontSize(9).FontColor(Colors.Grey.Medium);
            });
    }

    // ─── Experiências ─────────────────────────────────────────────────────────
    private static void BuildExperiencias(ColumnDescriptor col, List<ExperienciaDto> list)
    {
        foreach (var exp in list)
        {
            col.Item().PaddingTop(4).Column(expCol =>
            {
                expCol.Item().Row(row =>
                {
                    row.RelativeItem()
                        .Text($"{exp.Cargo ?? string.Empty} — {exp.Empresa ?? string.Empty}")
                        .Bold().FontSize(10);

                    var period = exp.Atualmente
                        ? $"{exp.DataInicio} — Presente"
                        : $"{exp.DataInicio} — {exp.DataFim}";
                    row.AutoItem()
                        .Text(period)
                        .FontSize(9).FontColor(Colors.Grey.Medium);
                });

                foreach (var bullet in exp.Bullets?.Where(b => !string.IsNullOrWhiteSpace(b)) ?? [])
                    expCol.Item().PaddingLeft(10).Text($"• {bullet}").FontSize(9);
            });
        }
    }

    // ─── Educação ─────────────────────────────────────────────────────────────
    private static void BuildEducacao(ColumnDescriptor col, List<EducacaoDto> list)
    {
        foreach (var edu in list)
        {
            col.Item().PaddingTop(4).Column(eduCol =>
            {
                eduCol.Item().Row(row =>
                {
                    row.RelativeItem()
                        .Text($"{edu.Grau ?? string.Empty} em {edu.Curso ?? string.Empty}")
                        .Bold().FontSize(10);

                    row.AutoItem()
                        .Text($"{edu.DataInicio} — {edu.DataFim}")
                        .FontSize(9).FontColor(Colors.Grey.Medium);
                });

                if (!string.IsNullOrWhiteSpace(edu.Instituicao))
                    eduCol.Item()
                        .Text(edu.Instituicao)
                        .FontSize(9).FontColor(Colors.Grey.Medium);
            });
        }
    }

    // ─── Projetos ─────────────────────────────────────────────────────────────
    private static void BuildProjetos(ColumnDescriptor col, List<ProjetoDto> list)
    {
        foreach (var proj in list)
        {
            col.Item().PaddingTop(4).Column(projCol =>
            {
                if (!string.IsNullOrWhiteSpace(proj.Nome))
                    projCol.Item().Text(proj.Nome).Bold().FontSize(10);

                if (!string.IsNullOrWhiteSpace(proj.Descricao))
                    projCol.Item().Text(proj.Descricao).FontSize(9);

                if (proj.Tecnologias?.Count > 0)
                    projCol.Item()
                        .Text("Tecnologias: " + string.Join(", ", proj.Tecnologias))
                        .FontSize(9).FontColor(Colors.Grey.Medium);

                if (!string.IsNullOrWhiteSpace(proj.Link))
                    projCol.Item().Text(proj.Link).FontSize(9).FontColor(Colors.Blue.Medium);
            });
        }
    }

    // ─── Section title ────────────────────────────────────────────────────────
    private static void RenderSectionTitle(ColumnDescriptor col, string title)
    {
        col.Item()
            .PaddingBottom(2)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Text(title)
            .FontSize(11).Bold().FontColor(Colors.Grey.Darken4);
        col.Item().Height(4);
    }

    // ── 2.9 Filename sanitization ─────────────────────────────────────────────
    // Removes diacritics, replaces spaces with hyphens, strips non-alphanumeric.
    public static string SanitizeFileName(string cargoDesejado)
    {
        if (string.IsNullOrWhiteSpace(cargoDesejado)) return "Curriculo";

        var normalized = cargoDesejado.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return new string(
            sb.ToString()
              .Replace(' ', '-')
              .Where(c => char.IsLetterOrDigit(c) || c == '-')
              .ToArray()
        );
    }
}
