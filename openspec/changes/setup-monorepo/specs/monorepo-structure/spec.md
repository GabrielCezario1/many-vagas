## ADDED Requirements

### Requirement: Estrutura de pastas raiz
O repositório SHALL conter, na raiz, exatamente as pastas `frontend`, `backend` e `docs`, além de um arquivo `README.md` com instruções de setup.

#### Scenario: Pastas presentes após clone
- **WHEN** o desenvolvedor clona o repositório e navega para a raiz
- **THEN** existem as pastas `frontend`, `backend` e `docs`
- **AND** existe um arquivo `README.md` na raiz

### Requirement: README com instruções de setup
O `README.md` da raiz SHALL documentar tudo que um novo desenvolvedor precisa para subir o projeto a partir do zero.

#### Scenario: Conteúdo mínimo do README
- **WHEN** um novo desenvolvedor abre o `README.md`
- **THEN** encontra: nome e descrição do projeto, pré-requisitos com versões (Node.js LTS, .NET SDK LTS, Angular CLI), links de download de cada ferramenta, passo a passo de instalação de dependências, comando único para rodar o projeto, URLs de acesso do frontend e do backend, instruções para verificar o ambiente via health check, e instrução para criar `appsettings.json` com as credenciais do Azure OpenAI.
