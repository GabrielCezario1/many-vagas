## 1. Estrutura do Monorepo

- [x] 1.1 Criar pasta `/frontend` na raiz do repositório
- [x] 1.2 Criar pasta `/backend` na raiz do repositório
- [x] 1.3 Confirmar existência da pasta `/docs` (já presente) e que apenas as três pastas raiz aparecem além de arquivos de configuração
- [x] 1.4 Criar `.gitignore` na raiz cobrindo `node_modules`, `bin/`, `obj/`, `*.db`, `backend/**/appsettings.json` e arquivos comuns do Angular/.NET

## 2. Frontend Angular

- [x] 2.1 Em `/frontend`, criar projeto Angular novo com `ng new` usando a versão estável mais recente (sem SSR, com roteamento habilitado)
- [x] 2.2 Configurar `ng serve` para rodar na porta 4200 (default)
- [x] 2.3 Definir as rotas `/curriculo-base`, `/gerar`, `/editor` com componentes placeholder vazios
- [x] 2.4 Criar guard funcional para a rota `/` que consulta o backend e redireciona para `/curriculo-base` ou `/gerar` conforme existência de currículo base
- [x] 2.5 Criar guard funcional para `/editor` que redireciona para `/gerar` (com mensagem informativa) caso não exista currículo gerado
- [x] 2.6 Configurar rota wildcard `**` redirecionando para `/curriculo-base`
- [x] 2.7 Criar serviço Angular para chamadas ao backend (base URL `http://localhost:5000`) com tratamento de erro de conectividade e exibição de mensagem clara ao usuário
- [ ] 2.8 Validar manualmente: `ng serve` sobe em `http://localhost:4200` e a página inicial carrega sem erros no console

## 3. Backend ASP.NET Core

- [x] 3.1 Em `/backend`, criar projeto ASP.NET Core Web API com `dotnet new webapi` usando o .NET SDK LTS mais recente
- [x] 3.2 Configurar `launchSettings.json` / `Program.cs` para subir em `http://localhost:5000`
- [x] 3.3 Adicionar política CORS nomeada `"FrontendLocal"` permitindo apenas `http://localhost:4200` (qualquer método e header) e aplicar com `app.UseCors("FrontendLocal")`
- [x] 3.4 Implementar endpoint `GET /health` retornando `{ "status": "ok", "version": "1.0.0" }` com status HTTP 200
- [ ] 3.5 Validar manualmente: `dotnet run` sobe em `http://localhost:5000` e `GET /health` retorna o payload esperado

## 4. Banco de Dados (SQLite + EF Core)

- [x] 4.1 Adicionar pacotes NuGet `Microsoft.EntityFrameworkCore.Sqlite` e `Microsoft.EntityFrameworkCore.Design` ao backend
- [x] 4.2 Criar classe `AppDbContext` com `DbSet<BaseResume>` e `DbSet<GeneratedResume>`
- [x] 4.3 Criar entidade `BaseResume` com `Id` (int, PK) e `Content` (string, JSON serializado das seções)
- [x] 4.4 Criar entidade `GeneratedResume` com `Id` (int, PK), `Content` (string, JSON), `AtsScore` (int), `SkillGaps` (string, JSON), `Language` (string), `GeneratedAt` (DateTime)
- [x] 4.5 Registrar `AppDbContext` no DI com connection string SQLite apontando para `app.db` na pasta do backend
- [x] 4.6 Gerar migration inicial com `dotnet ef migrations add InitialCreate`
- [x] 4.7 No `Program.cs`, executar `db.Database.Migrate()` em um escopo de serviço após `app.Build()` para criar/migrar o banco no startup
- [x] 4.8 Criar endpoints leves de existência: `GET /api/base-resume/exists` e `GET /api/generated-resume/exists` retornando `{ "exists": bool }` (usados pelos guards do frontend)
- [ ] 4.9 Validar manualmente: ao subir o backend pela primeira vez o arquivo `app.db` é criado; ao reiniciar, nenhuma migration é reaplicada

## 5. Configuração de Credenciais

- [x] 5.1 Criar `backend/appsettings.example.json` versionado com a estrutura da seção `AzureOpenAI` contendo placeholders (`Endpoint`, `ApiKey`, `Deployment`)
- [x] 5.2 Garantir que `backend/appsettings.json` está coberto pelo `.gitignore` da raiz
- [x] 5.3 Carregar a seção `AzureOpenAI` via `IConfiguration` no backend (sem chamadas reais à IA nesta feature) e logar erro de autenticação claro caso a configuração esteja ausente quando alguma feature futura tentar usá-la
- [ ] 5.4 Validar manualmente: rodar `git status` após editar `appsettings.json` não lista o arquivo como rastreável

## 6. Script Único de Inicialização

- [x] 6.1 Criar `package.json` na raiz declarando `concurrently` como devDependency
- [x] 6.2 Adicionar script `start` rodando `concurrently` com `npm --prefix frontend start` e `dotnet run --project backend` com prefixos `[FE]` e `[BE]`
- [x] 6.3 Adicionar script `setup` (ou hook no `start`) que verifica e instala dependências ausentes: `npm install` em `/frontend` e `dotnet restore` em `/backend` quando necessário
- [x] 6.4 Adicionar verificação inicial dos pré-requisitos (`node`, `npm`, `ng`, `dotnet`) que aborta com mensagem clara identificando a ferramenta ausente
- [ ] 6.5 Validar manualmente em diretório limpo: `npm install` (raiz) + `npm start` sobe frontend e backend, instalando dependências ausentes antes

## 7. README e Documentação

- [x] 7.1 Escrever `README.md` na raiz com nome e descrição do projeto
- [x] 7.2 Documentar pré-requisitos com versões (Node.js LTS, .NET SDK LTS, Angular CLI) e links oficiais de download
- [x] 7.3 Documentar passo a passo de instalação e o comando único de execução
- [x] 7.4 Documentar URLs de acesso (`http://localhost:4200`, `http://localhost:5000`) e como verificar o ambiente via `GET /health`
- [x] 7.5 Documentar como criar `backend/appsettings.json` a partir de `appsettings.example.json` e preencher as credenciais do Azure OpenAI

## 8. Validação Final

- [ ] 8.1 Em um clone limpo, rodar `npm install` na raiz e `npm start`; confirmar que frontend e backend sobem e o `/health` responde corretamente
- [ ] 8.2 Confirmar redirecionamento de `/` para `/curriculo-base` com banco vazio
- [ ] 8.3 Inserir manualmente um registro em `BaseResume` (ferramenta SQLite) e confirmar que `/` agora redireciona para `/gerar`
- [ ] 8.4 Confirmar que `/editor` redireciona para `/gerar` quando não há `GeneratedResume`, exibindo a mensagem correta
- [ ] 8.5 Confirmar que uma requisição com `Origin` diferente de `http://localhost:4200` recebe HTTP 403 do backend
