## Context

O projeto ManyVagas possui um pipeline de otimização de currículo: o usuário preenche o Currículo Base (F-02), gera uma versão otimizada pela IA (F-03) e, em seguida, é redirecionado para o Editor (F-06) para revisar e exportar o resultado.

Atualmente a tela `/editor` não existe — há apenas um guard (`editor.guard.ts`) que já tenta proteger a rota, verificando se existe currículo gerado salvo no banco. O backend já possui a tabela `GeneratedResume` no SQLite com o conteúdo gerado, o `AtsScoreService` para cálculo do score e os DTOs necessários.

O frontend usa Angular com signals/standalone components. O backend é .NET 10 com SQLite via EF Core.

## Goals / Non-Goals

**Goals:**
- Criar a `EditorPage` Angular na rota `/editor` com layout 2/3 + 1/3
- Exibir o currículo gerado em seções editáveis inline com campos dinâmicos (igual ao Currículo Base)
- Painel lateral fixo com Score ATS comparativo (antes/depois) e Skill Gaps
- Botão "Atualizar Score" para recalcular o score com o conteúdo atual do editor sob demanda
- Guard que redireciona para `/gerar` quando não há currículo gerado salvo
- Persistência automática das edições no SQLite ao navegar ou fechar o app
- Botão "Gerar Novo Currículo" com diálogo de confirmação se não houve exportação na sessão
- Botões "Exportar PDF" e "Exportar DOCX" que disparam os fluxos F-07/F-08

**Non-Goals:**
- Recálculo automático (tempo real) do score ATS durante a digitação
- Histórico de versões ou undo/redo das edições
- Implementação dos fluxos de exportação PDF/DOCX (escopo de F-07/F-08)
- Preview visual do currículo formatado — o editor é somente textual/estruturado
- Testes automatizados de qualquer tipo

## Decisions

### D1 — Painel lateral não colapsa

**Decisão:** O painel lateral (1/3) é fixo e sempre visível — sem botão de colapsar.

**Rationale:** O PRD especifica explicitamente "sem colapsar". A proposta de valor do editor está na edição simultânea com visibilidade do score; esconder o painel prejudicaria isso.

**Alternativa descartada:** Painel colapsável via toggle — rejeitado pelo PRD.

---

### D2 — Persistência automática por debounce

**Decisão:** As edições são persistidas automaticamente no banco SQLite com debounce de ~800ms após cada alteração, sem botão "Salvar" manual.

**Rationale:** O PRD exige que fechar e reabrir o app preserve as edições. Um botão "Salvar" explícito introduz risco de perda de dados (usuário esquece de salvar). O debounce evita requests excessivos durante digitação contínua.

**Alternativa descartada:** Salvar apenas ao navegar para outra rota (via `canDeactivate`) — risco de perda se o app fechar abruptamente; não cobre o caso de fechar o browser diretamente.

---

### D3 — Reutilização dos componentes de seções do Currículo Base

**Decisão:** Os componentes de seções editáveis (experiências, skills, idiomas, projetos, bullet points) são os mesmos do Currículo Base (F-02), ou wrappers finos em cima deles.

**Rationale:** O PRD exige "o mesmo comportamento dinâmico" do F-02. Duplicar lógica seria manutenção duplicada. O F-02 já tem os componentes validados.

**Alternativa descartada:** Componentes exclusivos do editor — criaria divergência de comportamento e duplicidade de código.

---

### D4 — Score não recalcula em tempo real

**Decisão:** O score no painel lateral só é atualizado quando o usuário clica explicitamente em "Atualizar Score".

**Rationale:** O PRD especifica "score manual" como comportamento geral. Recálculo em tempo real geraria carga desnecessária no backend e na IA a cada keystroke.

**Alternativa descartada:** Recálculo automático com debounce — rejeitado explicitamente pelo PRD.

---

### D5 — Endpoint de recálculo de score reutiliza AtsScoreService existente

**Decisão:** O botão "Atualizar Score" chama o mesmo endpoint `POST /api/ats-score` já existente (F-04), passando o conteúdo atual do editor.

**Rationale:** O `AtsScoreService` já encapsula a lógica de score. Criar um endpoint separado para o editor seria duplicação desnecessária.

---

### D6 — Guard na rota `/editor` usa consulta ao banco via ApiService

**Decisão:** O `editor.guard.ts` existente faz uma chamada ao backend (`GET /api/generated-resume/latest`) para verificar se há currículo gerado antes de permitir o acesso.

**Rationale:** Verificação local (sem banco) poderia dar falso positivo/negativo após limpeza de estado. O banco é a fonte de verdade.

## Risks / Trade-offs

- **[Risco] Latência do debounce de persistência** → Em conexões lentas com o backend local, o usuário pode fechar o app antes do debounce disparar e perder as últimas edições. Mitigação: emitir persistência imediata no evento `beforeunload` do browser.

- **[Risco] Divergência de componentes entre F-02 e F-06** → Se o Currículo Base for refatorado sem considerar o Editor, os componentes compartilhados podem quebrar. Mitigação: manter os componentes de seção em um módulo/feature compartilhado, não em F-02 diretamente.

- **[Trade-off] Painel lateral consome 1/3 da tela** → Em telas pequenas (< 1024px) o layout pode ficar apertado. Decisão: o PRD não menciona responsividade para mobile; o editor é pensado para desktop. Aceitar limitação em telas pequenas por ora.

- **[Risco] Guard redireciona para /gerar mas a mensagem some antes de ser lida** → Mitigação: usar um query param ou service de flash message para exibir "Gere um currículo primeiro" na tela de destino.
