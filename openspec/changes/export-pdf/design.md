## Context

O projeto ManyVagas já possui o Editor de Currículo (F-06) com os botões "Exportar PDF" e "Exportar DOCX" presentes na barra superior, mas ainda sem lógica de exportação implementada (escopo deixado para F-07/F-08). O backend é .NET 10 com SQLite via EF Core; o frontend usa Angular 18+ com signals/standalone components.

O currículo gerado é armazenado na tabela `GeneratedResume` com seu conteúdo como JSON string no campo `Content`, com o mesmo schema de `BaseResumeContentDto` acrescido do campo `CargoDesejado` (injetado pela IA via `AiGeneratedResumeDto`). O backend ainda não possui nenhuma dependência de geração de PDF.

## Goals / Non-Goals

**Goals:**
- Novo endpoint `POST /api/resume/export/pdf` que recebe o conteúdo do editor e retorna o PDF como stream binário
- Lógica de geração de PDF com template profissional e fixo usando **QuestPDF** (biblioteca .NET, licença gratuita para projetos não-comerciais/open source)
- Integração no frontend: o botão "Exportar PDF" do editor aciona o endpoint, inicia o download automático e gerencia o estado de loading/bloqueio
- Nomenclatura automática do arquivo: `curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf` (espaços substituídos por hífens)
- Seções sem conteúdo são omitidas do PDF gerado
- Redirecionamento para `/gerar` quando não há currículo na sessão

**Non-Goals:**
- Customização de layout, fonte ou cores pelo usuário — template fixo
- Preview do PDF no browser antes do download
- Armazenamento do PDF gerado no banco ou servidor
- Múltiplos templates ou temas
- Testes automatizados de qualquer tipo

## Decisions

### D1 — Biblioteca de PDF: QuestPDF

**Decisão:** Usar **QuestPDF** para geração do PDF no backend .NET.

**Rationale:** QuestPDF é a biblioteca .NET mais moderna para PDF programático, com API fluente e sem dependências nativas (diferente de Puppeteer/Playwright que requerem Chromium). É adequada para templates fixos estruturados como um currículo. Licença gratuita para uso open source/não-comercial.

**Alternativa descartada:** `iText7` — requer licença paga para uso comercial. `PdfSharp` — API mais baixo nível, sem layout automático de fluxo. `Puppeteer Sharp` — overhead de Chromium headless desnecessário para um template estático.

---

### D2 — Endpoint recebe o conteúdo do editor via body (não busca do banco)

**Decisão:** O endpoint `POST /api/resume/export/pdf` recebe o conteúdo do currículo no body da requisição (o mesmo `BaseResumeContentDto` acrescido de `CargoDesejado`), em vez de buscar o `GeneratedResume` mais recente do banco.

**Rationale:** O PRD especifica "o PDF reflete o conteúdo do editor no momento do clique". O editor pode ter edições não persistidas ainda (debounce). Passar o conteúdo atual via body garante que o PDF represente exatamente o estado visual atual do editor, sem depender de sincronismo de persistência.

**Alternativa descartada:** Buscar o `GeneratedResume` do banco via `GET` + id — risco de divergência com o estado atual do editor se o debounce ainda não persistiu.

---

### D3 — Download via Blob URL no frontend (sem iframe ou window.open)

**Decisão:** O frontend recebe o PDF como `arraybuffer`, cria um `Blob`, gera uma URL temporária com `URL.createObjectURL` e simula um clique em um `<a>` programático para disparar o download.

**Rationale:** É o padrão mais confiável para downloads de binários vindos de APIs com autenticação (sem expor a URL publicamente). Funciona em todos os navegadores modernos. Permite nomear o arquivo no `download` attribute do link.

**Alternativa descartada:** Retornar uma URL pública temporária para o arquivo — introduz complexidade de armazenamento e gerenciamento de TTL de URLs. Abrir em nova aba via `window.open` — browsers podem bloquear como popup e não permite nomear o arquivo.

---

### D4 — Bloqueio coordenado dos botões de exportação via signal compartilhado

**Decisão:** O estado de loading/bloqueio dos botões PDF e DOCX é gerenciado por um único signal `isExporting` no componente do editor, não por signals independentes por botão.

**Rationale:** O PRD especifica que ambos os botões devem ser bloqueados durante qualquer exportação em andamento. Um signal único (`isExporting: boolean`) é mais simples e evita estados inconsistentes (ex: DOCX travado mas PDF disponível).

**Alternativa descartada:** Signals separados `isPdfExporting` e `isDocxExporting` para cada botão — mais complexo e pode gerar estado inconsistente com o PRD.

---

### D5 — Template PDF fixo: seções omitidas se sem conteúdo

**Decisão:** A geração do PDF verifica se cada seção (Resumo, Experiências, Educação, Habilidades, Idiomas, Projetos) tem conteúdo antes de renderizar. Seções vazias ou com listas vazias são simplesmente puladas.

**Rationale:** O PRD especifica explicitamente que seções sem conteúdo não aparecem no PDF. A verificação ocorre no backend durante a renderização com QuestPDF.

## Risks / Trade-offs

- **[Risco] QuestPDF ainda não é pacote instalado no projeto** → Mitigação: adicionar `QuestPDF` via `dotnet add package` como primeira task de implementação. Verificar compatibilidade com .NET 10.

- **[Risco] Arquivo PDF grande em currículos com muito conteúdo** → Trade-off aceitável: currículos são documentos curtos (1-2 páginas); sem paginação complexa. QuestPDF gerencia quebra de página automaticamente.

- **[Risco] Nome do arquivo com caracteres especiais (acentos, cedilha no cargo)** → Mitigação: sanitizar o `CargoDesejado` ao gerar o nome do arquivo — remover acentos e substituir espaços por hífens (ex: `Desenvolvedor Sênior` → `Desenvolvedor-Senior`).

- **[Trade-off] Conteúdo não persistido vs. PDF enviado** → Se o debounce não persistiu as últimas edições quando o usuário clica em exportar, o banco ficará levemente desatualizado em relação ao PDF baixado. Isso é intencional (decisão D2) e aceitável pelo PRD.
