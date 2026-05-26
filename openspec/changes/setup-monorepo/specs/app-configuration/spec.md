## ADDED Requirements

### Requirement: Credenciais do Azure OpenAI via appsettings.json
O backend SHALL ler as credenciais do Azure OpenAI a partir do arquivo `appsettings.json`. O backend SHALL iniciar mesmo sem credenciais válidas; chamadas à IA SHALL falhar com erro de autenticação claramente identificável nos logs.

#### Scenario: Backend sem credenciais configuradas
- **WHEN** o desenvolvedor inicializa o backend sem ter configurado as credenciais em `appsettings.json`
- **THEN** o backend inicia normalmente
- **AND** uma chamada à IA retorna erro de autenticação claramente identificável nos logs

#### Scenario: Backend com credenciais válidas
- **WHEN** o desenvolvedor configurou o `appsettings.json` com credenciais válidas e o backend sobe
- **THEN** a integração com Azure OpenAI fica disponível para uso

### Requirement: Proteção do appsettings.json no controle de versão
O arquivo `appsettings.json` do backend SHALL estar listado no `.gitignore` e não SHALL ser rastreado pelo git.

#### Scenario: Commit ignora appsettings.json
- **WHEN** o desenvolvedor faz alterações e roda `git status`
- **THEN** o arquivo `appsettings.json` do backend não aparece como arquivo rastreável
- **AND** o `.gitignore` contém entrada que cobre esse arquivo
