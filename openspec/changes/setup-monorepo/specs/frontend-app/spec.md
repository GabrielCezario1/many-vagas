## ADDED Requirements

### Requirement: Aplicação Angular base em /frontend
O sistema SHALL conter uma aplicação Angular na pasta `/frontend`, criada com a versão estável mais recente do Angular CLI, que serve em `http://localhost:4200`.

#### Scenario: Frontend responde na porta 4200
- **WHEN** o desenvolvedor inicia o ambiente local
- **THEN** a aplicação Angular responde em `http://localhost:4200`
- **AND** a página inicial carrega sem erros no console do navegador

#### Scenario: Backend indisponível ao carregar a aplicação
- **WHEN** o usuário acessa `http://localhost:4200` e o backend não está rodando
- **THEN** a aplicação exibe uma mensagem clara de erro de conectividade
- **AND** não apresenta tela em branco nem erro genérico sem contexto

### Requirement: Rotas mapeadas
A aplicação SHALL expor as seguintes rotas: `/` (redirecionamento), `/curriculo-base`, `/gerar` e `/editor`.

#### Scenario: Rota raiz sem currículo base salvo
- **WHEN** o usuário acessa `/` e não existe currículo base salvo no banco
- **THEN** o sistema redireciona para `/curriculo-base`

#### Scenario: Rota raiz com currículo base salvo
- **WHEN** o usuário acessa `/` e já existe um currículo base salvo no banco
- **THEN** o sistema redireciona para `/gerar`

#### Scenario: Acesso ao editor sem currículo gerado
- **WHEN** o usuário tenta acessar `/editor` diretamente e não existe currículo gerado salvo
- **THEN** o sistema redireciona para `/gerar`
- **AND** exibe a mensagem "Gere um currículo primeiro para acessar o editor."

#### Scenario: Backend inacessível na tela de geração
- **WHEN** o usuário acessa `/gerar` e o backend não está acessível
- **THEN** a tela de geração exibe mensagem de erro de conectividade

#### Scenario: Rota desconhecida
- **WHEN** o usuário acessa qualquer rota não mapeada
- **THEN** o sistema redireciona para `/curriculo-base`
