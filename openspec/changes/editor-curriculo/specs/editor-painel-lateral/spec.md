## ADDED Requirements

### Requirement: Painel lateral sempre visível

O painel lateral SHALL permanecer sempre visível durante toda a sessão de edição, sem possibilidade de colapsar ou ocultar, exibindo o Score ATS comparativo e os Skill Gaps.

#### Scenario: Painel visível durante edição

- **WHEN** o editor está carregado
- **THEN** o painel lateral está visível com Score ATS e Skill Gaps
- **AND** não há botão para colapsar ou ocultar o painel

---

### Requirement: Score ATS comparativo no painel lateral

O painel lateral SHALL exibir o Score ATS com os valores "Antes" (score do currículo base original) e "Depois" (score do currículo gerado/editado), juntamente com o breakdown por dimensão (Keyword Match, Verbos de Ação, Quantificação, Completude).

#### Scenario: Exibição do score comparativo inicial

- **WHEN** o editor carrega com um currículo gerado
- **THEN** o painel lateral exibe o score "Antes" (do currículo base)
- **AND** o score "Depois" (do currículo gerado pela IA)
- **AND** o breakdown das dimensões com barras de progresso e valores numéricos

---

### Requirement: Skill Gaps no painel lateral

O painel lateral SHALL exibir a análise de Skill Gaps do currículo gerado, indicando quais skills da vaga o candidato possui (✅) e quais estão ausentes (❌).

#### Scenario: Exibição de skill gaps

- **WHEN** o editor carrega com um currículo gerado
- **THEN** o painel lateral exibe a lista de skills requeridas pela vaga
- **AND** cada skill é marcada com ✅ se presente no currículo ou ❌ se ausente
- **AND** exibe o resumo de quantas skills o candidato possui do total requerido

---

### Requirement: Botão "Atualizar Score" recalcula sob demanda

O sistema SHALL recalcular o Score ATS somente quando o usuário clicar explicitamente em "Atualizar Score", nunca de forma automática ou em tempo real.

#### Scenario: Recalcular score após edição

- **WHEN** usuário edita o conteúdo do currículo no editor
- **AND** clica no botão "Atualizar Score"
- **THEN** sistema envia o conteúdo atual do editor ao backend para recálculo
- **AND** botão exibe estado de loading durante o recálculo
- **AND** score "Depois" é atualizado com o novo valor calculado
- **AND** breakdown das dimensões é atualizado

#### Scenario: Score não recalcula automaticamente

- **WHEN** usuário digita ou edita campos no editor
- **THEN** o score no painel lateral não se altera automaticamente
- **AND** o botão "Atualizar Score" permanece visível indicando que pode haver diferença
