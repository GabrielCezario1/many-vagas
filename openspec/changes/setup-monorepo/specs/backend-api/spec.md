## ADDED Requirements

### Requirement: API ASP.NET Core base em /backend
O sistema SHALL conter uma API ASP.NET Core na pasta `/backend`, criada com a versão estável mais recente do .NET SDK, que serve em `http://localhost:5000`.

#### Scenario: Backend responde na porta 5000
- **WHEN** o desenvolvedor inicia o ambiente local
- **THEN** a API responde em `http://localhost:5000`
- **AND** aceita requisições HTTP vindas do frontend em `http://localhost:4200`

### Requirement: Endpoint de health check
A API SHALL expor o endpoint `GET /health` retornando o status e a versão atuais do backend.

#### Scenario: Health check com backend no ar
- **WHEN** uma requisição `GET http://localhost:5000/health` é enviada e o backend está rodando
- **THEN** a resposta tem status HTTP 200
- **AND** o corpo da resposta é `{ "status": "ok", "version": "1.0.0" }`

#### Scenario: Health check com backend fora do ar
- **WHEN** uma requisição `GET http://localhost:5000/health` é enviada e o backend não está rodando
- **THEN** o cliente recebe erro de conexão recusada
- **AND** nenhuma resposta HTTP é retornada

### Requirement: CORS restrito ao frontend local
A API SHALL aceitar requisições cross-origin exclusivamente da origem `http://localhost:4200`. Qualquer outra origem SHALL ser bloqueada.

#### Scenario: Requisição vinda do frontend local
- **WHEN** o frontend em `http://localhost:4200` faz uma requisição HTTP à API
- **THEN** a requisição é processada normalmente
- **AND** a resposta inclui os headers de CORS adequados

#### Scenario: Requisição vinda de origem diferente
- **WHEN** uma requisição chega de uma origem diferente de `http://localhost:4200`
- **THEN** a API retorna HTTP 403
- **AND** a requisição não é processada
