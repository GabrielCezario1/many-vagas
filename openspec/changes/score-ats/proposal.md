## Why

Candidatos precisam de feedback objetivo sobre o alinhamento do currículo à vaga antes e depois da otimização por IA. Sem um score quantificado, o usuário não consegue avaliar o impacto real da geração (F-03) e fica sem clareza sobre o que melhorar. O Score ATS resolve isso com um algoritmo heurístico de baixo custo — sem chamadas à IA — calculado em quatro dimensões relevantes para sistemas de triagem automática.

## What Changes

- Novo endpoint no backend: `POST /api/score` que recebe o texto do currículo e a descrição da vaga, retornando o score total (0–100) e o breakdown por dimensão.
- Algoritmo heurístico de scoring implementado no backend com quatro dimensões: Keyword Match (40%), Verbos de Ação (25%), Quantificação (20%) e Completude (15%).
- Novo painel lateral no editor (F-06) exibindo dois blocos lado a lado: score "Antes" (currículo base) e score "Depois" (currículo otimizado), com diferença destacada.
- Barra de progresso colorida e rótulo textual por faixa: Crítico (0–40 / vermelho), Fraco (41–60 / laranja), Bom (61–80 / amarelo), Excelente (81–100 / verde).
- Breakdown das quatro dimensões com barras de progresso individuais e valores proporcionais.
- Recálculo automático do score "Depois" ao salvar edições no editor.
- Estado de indisponibilidade quando currículo base está ausente ou ocorre erro no cálculo.

## Capabilities

### New Capabilities

- `ats-score-calculation`: Algoritmo heurístico no backend que calcula o score ATS em quatro dimensões (keyword match, verbos de ação, quantificação, completude) e retorna o resultado estruturado via API.
- `ats-score-display`: Componente de painel lateral no editor Angular que exibe os dois scores (antes/depois) com barras de progresso coloridas, rótulos por faixa, breakdown por dimensão e estado de indisponibilidade.

### Modified Capabilities

<!-- Nenhuma capability existente tem requisitos alterados por esta mudança. -->

## Impact

- **Backend**: Novo serviço `AtsScoreService` em `backend/Services/`, novo endpoint no `Program.cs`, novo DTO `AtsScoreRequest`/`AtsScoreResponse` em `backend/Data/`.
- **Frontend**: Novo componente Angular `ats-score-panel` no editor (F-06); o `api.service.ts` recebe novo método para chamar o endpoint de score; recálculo reativo disparado ao salvar edições.
- **Sem dependências externas**: Algoritmo puramente heurístico — sem custo de API de IA.
- **Dependência funcional**: Requer que a geração (F-03) tenha sido executada para exibir o score "Depois"; o score "Antes" depende do currículo base (F-02) estar salvo.
