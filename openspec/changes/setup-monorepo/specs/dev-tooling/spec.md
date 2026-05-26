## ADDED Requirements

### Requirement: Pré-requisitos verificáveis pelo script
O script de inicialização SHALL falhar com mensagem clara quando uma das ferramentas pré-requisito (Node.js LTS, Angular CLI ou .NET SDK LTS) não estiver instalada.

#### Scenario: Ferramenta pré-requisito ausente
- **WHEN** o desenvolvedor executa o script de inicialização e ao menos uma das ferramentas requeridas não está instalada
- **THEN** o terminal exibe mensagem de erro indicando qual ferramenta está ausente
- **AND** o processo de inicialização é interrompido antes de tentar subir os serviços

### Requirement: Script único de inicialização
A raiz do repositório SHALL prover um único comando que sobe simultaneamente o frontend Angular em `http://localhost:4200` e o backend ASP.NET Core em `http://localhost:5000`.

#### Scenario: Inicialização única sobe frontend e backend
- **WHEN** o desenvolvedor executa o script de inicialização na raiz e todos os pré-requisitos estão instalados
- **THEN** o frontend Angular sobe em `http://localhost:4200`
- **AND** o backend ASP.NET Core sobe em `http://localhost:5000`
- **AND** ambos os processos ficam ativos sem precisar de terminais adicionais

### Requirement: Instalação automática de dependências
O script de inicialização SHALL detectar ausência de dependências (`node_modules` do frontend e pacotes restaurados do backend) e instalá-las automaticamente antes de subir os serviços.

#### Scenario: Primeira execução sem dependências instaladas
- **WHEN** o desenvolvedor executa o script e `node_modules` ou os pacotes .NET ainda não foram instalados
- **THEN** o script instala as dependências automaticamente antes de subir os serviços
