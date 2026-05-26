## Context

O projeto ManyVagas possui um pipeline de otimização de currículo: Currículo Base (F-02) → Geração IA (F-03) → Editor (F-06) → Exportação (F-07/F-08). A exportação DOCX (F-08) é o último passo — o usuário faz o download do currículo editado como arquivo `.docx` editável no Word.

O módulo PDF (F-07) já define o padrão de integração: botão na barra superior do editor, endpoint `POST /api/resume/export/pdf`, bloqueio coordenado de ambos os botões durante geração. A exportação DOCX segue exatamente o mesmo padrão, adicionando apenas a geração no formato `.docx`.

O backend é .NET 10 com Minimal API, SQLite via EF Core. O frontend usa Angular com signals/standalone components.

## Goals / Non-Goals

**Goals:**
- Novo endpoint `POST /api/resume/export/docx` que recebe o conteúdo do editor e retorna o arquivo binário `.docx`
- Template DOCX profissional com estilos Word (Heading 1, Heading 2, bullets) que produz documento editável
- Botão "Exportar DOCX" no editor Angular, integrado à lógica de bloqueio coordenado com o botão PDF
- Download automático com nome `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx`
- Seções sem conteúdo são omitidas do documento gerado

**Non-Goals:**
- Customização de layout, fonte ou cores pelo usuário
- Preview do DOCX no browser
- Múltiplos templates DOCX
- Testes automatizados de qualquer tipo

## Decisions

### D1 — Biblioteca `DocumentFormat.OpenXml` (Open XML SDK) para geração do DOCX

**Decisão:** Usar `DocumentFormat.OpenXml` (SDK oficial da Microsoft) para construir o arquivo `.docx` no backend .NET.

**Rationale:** É a biblioteca oficial da Microsoft para manipulação de arquivos Office Open XML no .NET. Não tem dependências externas além do SDK, é gratuita, open-source e produz arquivos totalmente compatíveis com Word. Não requer licença como alternativas comerciais (ex.: Aspose.Words).

**Alternativa descartada:** `NPOI` — suporte ao formato DOCX moderno (Open XML) é mais limitado; melhor para formatos legados (.xls, .doc).

**Alternativa descartada:** `ClosedXML.Report` — foco em Excel; não serve para DOCX.

---

### D2 — Endpoint stateless: conteúdo enviado no body da requisição

**Decisão:** O endpoint `POST /api/resume/export/docx` recebe o conteúdo completo do currículo no body da requisição (mesmo DTO que o PDF), sem ler do banco.

**Rationale:** O conteúdo do editor pode ter edições não persistidas ainda (o auto-save tem debounce). Enviar o estado atual do frontend garante que o DOCX reflete exatamente o que o usuário vê. Mesma decisão do endpoint PDF (F-07).

---

### D3 — Reutilização do DTO de exportação do PDF (F-07)

**Decisão:** O endpoint DOCX usa o mesmo DTO de request que o PDF (`GeneratedResumeContentDto` ou equivalente), sem criar um novo tipo.

**Rationale:** O conteúdo exportado é o mesmo; só muda o formato de saída. Criar DTOs separados seria duplicação desnecessária.

---

### D4 — Bloqueio coordenado de botões no frontend compartilhado com F-07

**Decisão:** A lógica de bloqueio (ambos os botões desabilitados durante qualquer exportação em andamento) é mantida no serviço/componente do editor, não duplicada.

**Rationale:** O PRD especifica que ambos os botões são bloqueados durante qualquer geração. O estado de "exportando" é compartilhado entre PDF e DOCX. O componente editor já gerencia esse estado a partir de F-07; a exportação DOCX apenas usa o mesmo sinal/estado.

---

### D5 — Nome do arquivo gerado no frontend

**Decisão:** O nome do arquivo (`curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx`) é montado no frontend no momento do download, usando o campo `cargoDesejado` do currículo carregado e a data atual.

**Rationale:** O backend retorna apenas o blob binário; nomear o arquivo no frontend é mais simples e evita que o backend precise conhecer a data do cliente. Espaços no cargo são substituídos por hífens via `replace(/\s+/g, '-')`. Mesma abordagem do PDF (F-07).

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `DocumentFormat.OpenXml` gera XML verboso e a API é de baixo nível | Encapsular a geração em um `DocxTemplateBuilder` interno; não expor detalhes do SDK para o resto do código |
| Estilos Word podem variar entre versões do Word/LibreOffice | Usar apenas estilos built-in do Word (Heading 1, Heading 2, Normal, List Bullet) que têm suporte universal |
| Arquivo gerado pode ficar grande se o currículo tiver muito conteúdo | DOCX com texto puro é sempre pequeno (< 100 KB); não é um risco prático |
| Falha na geração do DOCX não deve bloquear o editor | O endpoint retorna 500 e o frontend exibe toast de erro — os botões são reabilitados |
