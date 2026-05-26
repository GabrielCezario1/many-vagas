## ADDED Requirements

### Requirement: Score ATS calculado por algoritmo heurístico em quatro dimensões
O sistema SHALL calcular um score ATS de 0 a 100 para um dado texto de currículo e descrição de vaga, utilizando exclusivamente lógica heurística no backend, sem chamadas a APIs externas de IA. O score SHALL ser a soma ponderada de quatro dimensões: Keyword Match (40%), Verbos de Ação (25%), Quantificação (20%) e Completude (15%).

#### Scenario: Cálculo com currículo e vaga fornecidos
- **WHEN** o endpoint `POST /api/ats-score` recebe `{ "resumeText": "<texto>", "jobDescription": "<vaga>" }` com ambos os campos não-vazios
- **THEN** o sistema retorna HTTP 200 com `{ "totalScore": <0-100>, "breakdown": { "keywordMatch": <0-40>, "actionVerbs": <0-25>, "quantification": <0-20>, "completeness": <0-15> } }`

#### Scenario: Score total é soma ponderada arredondada para inteiro
- **WHEN** os valores das dimensões são calculados
- **THEN** o `totalScore` SHALL ser igual a `Math.Round(keywordMatch + actionVerbs + quantification + completeness)` com valor entre 0 e 100 inclusive

### Requirement: Dimensão Keyword Match (peso 40)
O sistema SHALL calcular a pontuação de keyword match como a proporção de palavras-chave únicas da descrição da vaga encontradas no texto do currículo (após normalização), multiplicada por 40. A comparação SHALL usar word-boundary (regex `\b`) após converter ambos os textos para lowercase e remover pontuação.

#### Scenario: Todas as keywords da vaga encontradas no currículo
- **WHEN** todas as palavras-chave únicas da vaga (≥ 3 caracteres) estão presentes no texto do currículo
- **THEN** `keywordMatch` SHALL ser 40

#### Scenario: Nenhuma keyword da vaga encontrada no currículo
- **WHEN** nenhuma palavra-chave da vaga está presente no texto do currículo
- **THEN** `keywordMatch` SHALL ser 0

#### Scenario: Proporção parcial de keywords encontradas
- **WHEN** 50% das palavras-chave únicas da vaga são encontradas no currículo
- **THEN** `keywordMatch` SHALL ser próximo de 20 (±1 por arredondamento)

### Requirement: Dimensão Verbos de Ação (peso 25)
O sistema SHALL calcular a pontuação de verbos de ação como a proporção de bullet points do currículo que começam com um verbo de ação da lista pré-definida, multiplicada por 25. A lista SHALL conter no mínimo 50 verbos em português e inglês.

#### Scenario: Todos os bullets começam com verbos de ação
- **WHEN** todos os bullet points identificados no currículo começam com um verbo da lista
- **THEN** `actionVerbs` SHALL ser 25

#### Scenario: Currículo sem bullet points identificáveis
- **WHEN** o texto do currículo não contém linhas iniciadas por `-`, `•`, `*` ou numeração
- **THEN** `actionVerbs` SHALL ser 0

#### Scenario: Proporção parcial de bullets com verbos de ação
- **WHEN** 60% dos bullets começam com verbos de ação
- **THEN** `actionVerbs` SHALL ser próximo de 15 (±1 por arredondamento)

### Requirement: Dimensão Quantificação (peso 20)
O sistema SHALL calcular a pontuação de quantificação como a proporção de bullet points que contêm pelo menos um número, percentual (ex: "30%") ou métrica (ex: "R$", "$", "k", "M") multiplicada por 20.

#### Scenario: Todos os bullets possuem quantificação
- **WHEN** todos os bullet points do currículo contêm pelo menos um número ou métrica
- **THEN** `quantification` SHALL ser 20

#### Scenario: Nenhum bullet possui quantificação
- **WHEN** nenhum bullet point do currículo contém números ou métricas
- **THEN** `quantification` SHALL ser 0

### Requirement: Dimensão Completude (peso 15)
O sistema SHALL calcular a pontuação de completude verificando a presença das seções obrigatórias no texto do currículo: dados pessoais (e-mail ou telefone), ao menos uma experiência profissional, ao menos uma habilidade/skill. Cada seção presente contribui proporcionalmente com 5 pontos.

#### Scenario: Todas as seções obrigatórias presentes
- **WHEN** o texto do currículo contém e-mail ou telefone, ao menos uma experiência e ao menos uma habilidade
- **THEN** `completeness` SHALL ser 15

#### Scenario: Apenas dados pessoais presentes
- **WHEN** o texto contém e-mail ou telefone, mas não contém experiência nem habilidades
- **THEN** `completeness` SHALL ser 5

### Requirement: Endpoint POST /api/ats-score valida inputs
O sistema SHALL retornar erro HTTP 400 quando `resumeText` ou `jobDescription` estiverem ausentes ou vazios na requisição.

#### Scenario: Campo resumeText ausente
- **WHEN** a requisição não contém o campo `resumeText` ou ele é vazio/whitespace
- **THEN** o sistema retorna HTTP 400 com mensagem de validação

#### Scenario: Campo jobDescription ausente
- **WHEN** a requisição não contém o campo `jobDescription` ou ele é vazio/whitespace
- **THEN** o sistema retorna HTTP 400 com mensagem de validação
