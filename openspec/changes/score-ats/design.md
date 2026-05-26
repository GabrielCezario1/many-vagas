## Context

O projeto ManyVagas já possui geração de currículo otimizado via Azure OpenAI (F-03) e persistência via SQLite/EF Core. O editor (F-06) é um stub em espera de implementação. O backend é uma Minimal API .NET 10; o frontend é Angular com sinais reativos.

Atualmente, não existe nenhum mecanismo que forneça ao usuário um indicador numérico de alinhamento do currículo à vaga. A geração devolve apenas o currículo otimizado, sem uma pontuação objetiva que permita comparar antes e depois.

O Score ATS deve ser calculado **sem chamada à IA** — puramente heurístico — para evitar custo adicional e latência. O cálculo deve ser rápido (< 100ms) e determinístico dado o mesmo input.

## Goals / Non-Goals

**Goals:**
- Calcular score ATS (0–100) via algoritmo heurístico no backend em quatro dimensões.
- Expor endpoint `POST /api/ats-score` que recebe texto de currículo + descrição da vaga e retorna score total e breakdown.
- Exibir no painel lateral do editor dois scores lado a lado (antes/depois) com barras coloridas, rótulos e breakdown por dimensão.
- Recalcular score "Depois" automaticamente ao salvar edições no editor.
- Tratar estado de ausência de currículo base (exibir "—") e erro de cálculo (mensagem + retry).

**Non-Goals:**
- Não usar IA/LLM para calcular o score.
- Não persistir o score no banco de dados (cálculo on-demand a cada request).
- Não implementar o editor completo (F-06) — apenas o painel lateral de score dentro do editor stub.
- Não implementar skill gaps (F-05) neste change.

## Decisions

### D1 — Algoritmo heurístico no backend (não no frontend)

**Decisão**: O cálculo ocorre exclusivamente no backend via `AtsScoreService`.

**Rationale**: Centralizar a lógica no backend garante consistência (mesma lógica para todos os clientes), facilita testes unitários e mantém o frontend como camada de apresentação. Processar no frontend exporia a lógica e dificultaria mudanças futuras de algoritmo.

**Alternativa considerada**: Calcular no frontend (TypeScript). Descartado pela duplicação de lógica e pela dificuldade de testar.

---

### D2 — Quatro dimensões com pesos fixos

**Decisão**: Keyword Match 40%, Verbos de Ação 25%, Quantificação 20%, Completude 15%. Score total = soma ponderada, arredondado para inteiro.

**Rationale**: Os pesos refletem o impacto real em sistemas ATS reais: keywords são o fator mais determinante, verbos de ação e quantificação melhoram a leitura automática, completude garante que campos obrigatórios estão preenchidos.

**Alternativa considerada**: Score único sem breakdown. Descartado porque o breakdown fornece feedback acionável ao usuário.

---

### D3 — Endpoint separado `POST /api/ats-score` (não integrado ao generate)

**Decisão**: Endpoint dedicado para score, independente do endpoint de geração.

**Rationale**: Permite calcular o score do currículo base sem gerar novamente, suporta recálculo após edições no editor, e mantém responsabilidade única em cada endpoint.

**Alternativa considerada**: Retornar o score junto com a geração. Descartado porque o score "Antes" (do currículo base) e o recálculo após edições precisariam de endpoint separado de qualquer forma.

---

### D4 — Componente Angular standalone `AtsScorePanelComponent`

**Decisão**: Novo componente standalone adicionado ao painel lateral do `EditorComponent`. Usa Signals para estado reativo.

**Rationale**: Isolamento de responsabilidade, testabilidade e alinhamento com o padrão do projeto (Angular standalone + Signals).

---

### D5 — Keyword Match por normalização de texto (lowercase + stemming simples)

**Decisão**: Comparação por substring após normalização (lowercase, remoção de pontuação). Sem stemming morfológico.

**Rationale**: Simplicidade e performance. Stemming completo adicionaria uma dependência de biblioteca e complexidade desproporcional ao benefício.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Keyword Match superficial pode gerar falsos positivos (ex: "Java" encontrado em "JavaScript") | Comparar por word-boundary (regex `\b`), não substring genérica |
| Lista de verbos de ação hardcoded pode ficar desatualizada | Lista inicial abrangente (~50 verbos); expansível sem breaking change |
| Score não persiste — recalculado a cada abertura do editor | Aceitável: cálculo < 100ms; permite sempre refletir estado atual do currículo |
| Editor (F-06) ainda é stub — painel de score depende de sua estrutura | Implementar o painel como componente isolado que o editor inclui; painel não depende de lógica do editor |

## Migration Plan

1. Adicionar `AtsScoreService` e DTOs no backend sem afetar endpoints existentes.
2. Adicionar `POST /api/ats-score` no `Program.cs`.
3. Criar `AtsScorePanelComponent` no frontend e integrá-lo ao `EditorComponent`.
4. Adicionar método `calculateAtsScore()` no `ApiService`.

Rollback: remover o endpoint e o componente — sem impacto em banco de dados (não há migração).

## Open Questions

- Qual deve ser a lista inicial de verbos de ação? (Sugestão: ~50 verbos em PT/EN; definir no spec.)
- O painel lateral deve ser expansível/colapsável ou sempre visível? (Assumindo sempre visível por ora.)
