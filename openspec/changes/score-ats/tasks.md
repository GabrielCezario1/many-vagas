## 1. Backend — DTOs e Estrutura

- [x] 1.1 Criar `AtsScoreRequest.cs` em `backend/Data/` com campos `ResumeText` (string) e `JobDescription` (string)
- [x] 1.2 Criar `AtsScoreBreakdownDto.cs` em `backend/Data/` com campos `KeywordMatch`, `ActionVerbs`, `Quantification`, `Completeness` (todos double)
- [x] 1.3 Criar `AtsScoreResponse.cs` em `backend/Data/` com campos `TotalScore` (int) e `Breakdown` (AtsScoreBreakdownDto)

## 2. Backend — Algoritmo Heurístico

- [x] 2.1 Criar `AtsScoreService.cs` em `backend/Services/` com método `Calculate(string resumeText, string jobDescription) : AtsScoreResponse`
- [x] 2.2 Implementar cálculo de Keyword Match: extrair keywords da vaga (≥ 3 chars, word-boundary regex), calcular proporção das encontradas no currículo, multiplicar por 40
- [x] 2.3 Implementar lista de verbos de ação (≥ 50 verbos PT/EN) como campo estático no serviço
- [x] 2.4 Implementar cálculo de Verbos de Ação: identificar bullet points (linhas com `-`, `•`, `*`, numeração), calcular proporção que inicia com verbo da lista, multiplicar por 25
- [x] 2.5 Implementar cálculo de Quantificação: proporção de bullets com número, percentual ou métrica (`%`, `R$`, `$`, `k`, `M`), multiplicar por 20
- [x] 2.6 Implementar cálculo de Completude: verificar presença de e-mail/telefone (5 pts), experiência (5 pts), habilidades (5 pts), somar até 15
- [x] 2.7 Calcular `TotalScore` como `(int)Math.Round(keywordMatch + actionVerbs + quantification + completeness)` com clamp 0–100

## 3. Backend — Endpoint

- [x] 3.1 Registrar `AtsScoreService` como singleton/scoped em `Program.cs`
- [x] 3.2 Adicionar endpoint `POST /api/ats-score` em `Program.cs` com validação de campos obrigatórios (retorna 400 se vazio) e invocação de `AtsScoreService.Calculate`

## 4. Frontend — Serviço

- [x] 4.1 Criar interface `AtsScoreBreakdown` e `AtsScoreResult` em `api.service.ts`
- [x] 4.2 Adicionar método `calculateAtsScore(resumeText: string, jobDescription: string): Observable<AtsScoreResult>` em `ApiService`

## 5. Frontend — Componente AtsScorePanelComponent

- [x] 5.1 Criar componente standalone `AtsScorePanelComponent` em `frontend/src/app/components/ats-score-panel/` com `ats-score-panel.ts`, `ats-score-panel.html`, `ats-score-panel.css`
- [x] 5.2 Definir inputs/signals do componente: `scoreBefore` (number | null), `scoreAfter` (number | null), `breakdownBefore` (AtsScoreBreakdown | null), `breakdownAfter` (AtsScoreBreakdown | null), `jobDescription` (string)
- [x] 5.3 Implementar computed signal `scoreLabel` que retorna faixa por score: Crítico (0–40), Fraco (41–60), Bom (61–80), Excelente (81–100)
- [x] 5.4 Implementar computed signal `scoreColor` que retorna classe CSS por faixa: `red`, `orange`, `yellow`, `green`
- [x] 5.5 Implementar template HTML com dois blocos lado a lado (Antes/Depois), barra de progresso, rótulo, diferença destacada e quatro linhas de breakdown
- [x] 5.6 Implementar estado "—" no bloco Antes quando `scoreBefore` é null, com mensagem e link para `/curriculo-base`
- [x] 5.7 Implementar estado de erro com mensagem "Não foi possível calcular o score." e botão "Tentar novamente" com output event `retry`
- [x] 5.8 Estilizar barras de progresso com cor dinâmica por faixa no CSS do componente

## 6. Frontend — Integração no Editor

- [x] 6.1 Importar `AtsScorePanelComponent` no `EditorComponent` (standalone imports)
- [x] 6.2 Adicionar lógica no `EditorComponent` para carregar scores ao inicializar: chamar `calculateAtsScore` com texto do currículo base e do currículo otimizado
- [x] 6.3 Adicionar lógica de recálculo do score "Depois" ao salvar edições no editor (sem recarregar página)
- [x] 6.4 Incluir `<app-ats-score-panel>` no template `editor.html` no painel lateral
