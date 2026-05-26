## ADDED Requirements

### Requirement: Painel lateral exibe dois scores ATS lado a lado
O editor SHALL exibir um painel lateral contendo dois blocos de score lado a lado: "Antes" (score do currículo base) e "Depois" (score do currículo otimizado após geração). Cada bloco SHALL mostrar o valor numérico (ex: "42/100"), uma barra de progresso colorida e um rótulo de interpretação por faixa.

#### Scenario: Ambos os scores disponíveis após geração
- **WHEN** o editor é carregado após uma geração bem-sucedida e o currículo base está disponível
- **THEN** o painel exibe o bloco "Antes" com score do currículo base e o bloco "Depois" com score do currículo otimizado
- **THEN** a diferença entre os dois scores é destacada com sinal (ex: "+36 pts")

#### Scenario: Somente score "Depois" disponível (sem currículo base)
- **WHEN** a geração foi realizada sem currículo base salvo
- **THEN** o bloco "Antes" exibe "—" e a mensagem "Preencha o Currículo Base para ver a comparação."
- **THEN** o link "Preencher agora" navega para a tela de Currículo Base (rota `/curriculo-base`)

### Requirement: Cores e rótulos de interpretação por faixa de score
O sistema SHALL aplicar cor e rótulo conforme a faixa de pontuação de cada score exibido no painel.

#### Scenario: Score entre 0 e 40 (Crítico)
- **WHEN** o valor do score está entre 0 e 40 inclusive
- **THEN** a barra de progresso é vermelha e o rótulo exibe "Crítico"

#### Scenario: Score entre 41 e 60 (Fraco)
- **WHEN** o valor do score está entre 41 e 60 inclusive
- **THEN** a barra de progresso é laranja e o rótulo exibe "Fraco"

#### Scenario: Score entre 61 e 80 (Bom)
- **WHEN** o valor do score está entre 61 e 80 inclusive
- **THEN** a barra de progresso é amarela e o rótulo exibe "Bom"

#### Scenario: Score entre 81 e 100 (Excelente)
- **WHEN** o valor do score está entre 81 e 100 inclusive
- **THEN** a barra de progresso é verde e o rótulo exibe "Excelente"

### Requirement: Breakdown por dimensão exibido abaixo do score principal
O painel SHALL exibir quatro linhas de breakdown abaixo dos scores, cada uma com o nome da dimensão, uma barra de progresso proporcional e o valor parcial (ex: "32/40"). O breakdown SHALL ser exibido para ambos os scores quando disponíveis.

#### Scenario: Breakdown completo com ambos os scores disponíveis
- **WHEN** ambos os scores estão disponíveis e o usuário visualiza o painel
- **THEN** quatro linhas são exibidas: "Keyword Match", "Verbos de Ação", "Quantificação", "Completude"
- **THEN** cada linha exibe o valor da dimensão no formato `<valor>/<máximo>` para ambos os currículos

#### Scenario: Breakdown exibido com score único disponível
- **WHEN** apenas o score "Depois" está disponível
- **THEN** o breakdown mostra os valores do currículo otimizado com a coluna "Antes" omitida ou em estado "—"

### Requirement: Recálculo automático do score após edições no editor
O sistema SHALL recalcular o score "Depois" automaticamente quando o usuário salva edições no editor de currículo. O score "Antes" SHALL permanecer fixo e não ser afetado por edições.

#### Scenario: Usuário salva edições no editor
- **WHEN** o usuário edita o currículo no editor e aciona salvar
- **THEN** o sistema chama `POST /api/ats-score` com o texto do currículo editado e a vaga
- **THEN** o bloco "Depois" é atualizado com o novo score sem recarregar a página

#### Scenario: Score "Antes" permanece inalterado após edições
- **WHEN** o usuário realiza edições no editor e salva
- **THEN** o bloco "Antes" mantém o mesmo valor calculado na abertura do editor

### Requirement: Estado de erro no cálculo do score
O sistema SHALL exibir uma mensagem de erro amigável e botão de retry quando a chamada ao endpoint de score falha, sem recarregar a página.

#### Scenario: Falha na chamada ao endpoint de score
- **WHEN** a chamada a `POST /api/ats-score` retorna erro HTTP ou timeout
- **THEN** o painel exibe a mensagem "Não foi possível calcular o score."
- **THEN** um botão "Tentar novamente" reprocessa a chamada sem recarregar a página
