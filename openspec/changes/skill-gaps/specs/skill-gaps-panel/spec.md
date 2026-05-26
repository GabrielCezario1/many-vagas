## ADDED Requirements

### Requirement: Exibir contagem resumida de skills
O sistema SHALL exibir na seção de Skill Gaps uma frase de resumo indicando quantas skills do currículo do usuário correspondem ao total de skills identificadas na vaga.

#### Scenario: Contagem com matched e missing
- **WHEN** o painel recebe `matchedSkills` e `missingSkills` com ao menos um item entre eles
- **THEN** o sistema exibe o texto "Você tem X de Y skills pedidas" onde X = `matchedSkills.length` e Y = `matchedSkills.length + missingSkills.length`

#### Scenario: Ambas as listas vazias
- **WHEN** o painel recebe `matchedSkills = []` e `missingSkills = []`
- **THEN** o sistema exibe a mensagem "Nenhuma skill identificada na vaga." e não exibe tags nem subseções

### Requirement: Exibir skills com match como tags verdes
O sistema SHALL exibir cada item de `matchedSkills` como uma tag visual verde com ícone ✅, na subseção "Você já tem:".

#### Scenario: Lista de matched não vazia
- **WHEN** `matchedSkills` contém ao menos um item
- **THEN** cada skill é renderizada como uma tag verde com prefixo ✅

#### Scenario: Lista de matched vazia com currículo base presente
- **WHEN** `matchedSkills` está vazia E `hasBaseResume` é `true`
- **THEN** o sistema exibe a mensagem "Nenhuma skill do seu currículo foi identificada na vaga."

### Requirement: Exibir skills ausentes como tags vermelhas
O sistema SHALL exibir cada item de `missingSkills` como uma tag visual vermelha com ícone ❌, na subseção "Faltam:".

#### Scenario: Lista de missing não vazia
- **WHEN** `missingSkills` contém ao menos um item
- **THEN** cada skill é renderizada como uma tag vermelha com prefixo ❌

#### Scenario: Lista de missing vazia
- **WHEN** `missingSkills` está vazia E ao menos uma skill foi identificada na vaga
- **THEN** o sistema exibe a mensagem "Você tem todas as skills identificadas na vaga! 🎉"

### Requirement: Tratar ausência de currículo base
O sistema SHALL exibir uma mensagem informativa e um link de ação quando o currículo base não foi preenchido.

#### Scenario: Sem currículo base
- **WHEN** `hasBaseResume` é `false`
- **THEN** o sistema exibe a mensagem "Preencha o Currículo Base para ver as skills que você já tem."
- **THEN** o sistema exibe um link "Preencher agora" que navega para `/curriculo-base`
- **THEN** as `missingSkills` (se houver) são exibidas normalmente como tags vermelhas

### Requirement: Posicionamento no painel lateral do editor
O sistema SHALL renderizar o componente `SkillGapsPanelComponent` no painel lateral do editor (`editor.html`), imediatamente após `<app-ats-score-panel>`.

#### Scenario: Painel lateral carregado após geração bem-sucedida
- **WHEN** o editor carrega após uma geração bem-sucedida (F-03)
- **THEN** a seção de Skill Gaps é visível abaixo do breakdown do Score ATS no painel lateral

### Requirement: Tags responsivas com wrap automático
O sistema SHALL exibir as tags de skills com `flex-wrap: wrap` para que se ajustem ao espaço disponível no painel.

#### Scenario: Muitas skills na lista
- **WHEN** a lista de matched ou missing contém mais de 4 skills
- **THEN** as tags que não cabem na primeira linha quebram automaticamente para a linha seguinte
