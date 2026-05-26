## ADDED Requirements

### Requirement: Endpoint de geração do arquivo DOCX

O sistema SHALL expor o endpoint `POST /api/resume/export/docx` que recebe o conteúdo do currículo no body, gera um arquivo `.docx` com template profissional e retorna o binário para download.

#### Scenario: Geração bem-sucedida

- **WHEN** o frontend envia uma requisição POST para `/api/resume/export/docx` com o conteúdo do currículo
- **THEN** o sistema retorna o arquivo binário `.docx` com Content-Type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **AND** o status HTTP é 200

#### Scenario: Body inválido ou vazio

- **WHEN** a requisição chega sem body ou com estrutura inválida
- **THEN** o sistema retorna status HTTP 400

#### Scenario: Erro interno na geração

- **WHEN** ocorre uma exceção durante a geração do DOCX
- **THEN** o sistema retorna status HTTP 500
- **AND** nenhum arquivo é enviado ao cliente

---

### Requirement: Estrutura do template DOCX

O sistema SHALL gerar o arquivo `.docx` com template profissional contendo estilos Word editáveis (Heading 1, Heading 2, bullets) na ordem definida pelo PRD.

#### Scenario: Cabeçalho com dados pessoais

- **WHEN** o DOCX é gerado com dados pessoais preenchidos
- **THEN** o documento contém o nome completo com estilo Heading 1
- **AND** o cargo desejado como parágrafo abaixo do nome
- **AND** email, telefone e localidade na linha seguinte

#### Scenario: Ordem das seções no documento

- **WHEN** o DOCX é gerado
- **THEN** as seções aparecem na ordem: Cabeçalho → Resumo → Experiências → Educação → Habilidades → Idiomas → Projetos
- **AND** cada seção tem título com estilo Heading 2

#### Scenario: Seção sem conteúdo é omitida

- **WHEN** uma seção (ex.: Projetos) não possui conteúdo preenchido
- **THEN** essa seção não aparece no documento gerado
- **AND** as demais seções são renderizadas normalmente

---

### Requirement: Arquivo DOCX totalmente editável

O sistema SHALL gerar arquivos `.docx` compatíveis com Microsoft Word e editores compatíveis com Open XML.

#### Scenario: Arquivo abre e é editável no Word

- **WHEN** o usuário abre o arquivo gerado no Word ou LibreOffice
- **THEN** o documento exibe todos os estilos corretamente
- **AND** o conteúdo é editável diretamente no editor
