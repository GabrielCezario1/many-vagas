## ADDED Requirements

### Requirement: Exportar PDF do currículo via endpoint
O sistema SHALL fornecer um endpoint `POST /api/resume/export/pdf` que recebe o conteúdo atual do currículo no body e retorna o arquivo PDF como stream binário com o Content-Type `application/pdf`.

#### Scenario: Geração bem-sucedida
- **WHEN** o cliente envia `POST /api/resume/export/pdf` com um body JSON válido contendo o conteúdo do currículo
- **THEN** o sistema retorna HTTP 200 com Content-Type `application/pdf`, Content-Disposition `attachment; filename="curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf"` e o binário do arquivo PDF

#### Scenario: Body inválido ou vazio
- **WHEN** o cliente envia `POST /api/resume/export/pdf` com body ausente ou JSON inválido
- **THEN** o sistema retorna HTTP 400 Bad Request

### Requirement: Template PDF profissional e fixo
O sistema SHALL gerar o PDF usando um template fixo, sem opções de customização de layout, fonte ou cores pelo usuário. O template SHALL conter as seguintes seções na ordem: cabeçalho, Resumo Profissional, Experiências Profissionais, Educação, Habilidades, Idiomas, Projetos.

#### Scenario: Cabeçalho do PDF
- **WHEN** o PDF é gerado com dados pessoais preenchidos
- **THEN** o topo do documento exibe o nome completo em destaque, o cargo desejado abaixo do nome e email, telefone e localidade na linha seguinte

#### Scenario: Ordem das seções
- **WHEN** o PDF é gerado com todas as seções preenchidas
- **THEN** as seções aparecem na ordem: (1) Cabeçalho, (2) Resumo Profissional, (3) Experiências Profissionais, (4) Educação, (5) Habilidades, (6) Idiomas, (7) Projetos

### Requirement: Seções vazias omitidas do PDF
O sistema SHALL omitir do documento PDF qualquer seção cujo conteúdo esteja ausente, nulo ou seja uma lista vazia.

#### Scenario: Seção sem conteúdo é omitida
- **WHEN** o campo "Projetos" está ausente ou é uma lista vazia no body da requisição
- **THEN** a seção "Projetos" não aparece no PDF gerado e as demais seções são exibidas normalmente

### Requirement: Nome do arquivo segue padrão com cargo desejado
O sistema SHALL nomear o arquivo PDF seguindo o padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf`, onde espaços no cargo são substituídos por hífens e acentos/cedilha são normalizados para ASCII.

#### Scenario: Nomeação do arquivo com cargo simples
- **WHEN** o cargo desejado é "Desenvolvedor Frontend" e a data atual é 2026-05-25
- **THEN** o Content-Disposition do response inclui `filename="curriculo-Desenvolvedor-Frontend-2026-05-25.pdf"`

#### Scenario: Nomeação do arquivo com cargo acentuado
- **WHEN** o cargo desejado é "Desenvolvedor Sênior"
- **THEN** o filename gerado é `curriculo-Desenvolvedor-Senior-{YYYY-MM-DD}.pdf` (sem acento)
