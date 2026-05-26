## Why

O ManyVagas precisa de uma base técnica unificada antes que qualquer outra feature (Currículo Base, Geração com IA, Editor, Exportações) possa ser construída. Hoje o repositório está vazio em código — sem essa fundação, nenhum desenvolvedor consegue rodar o produto localmente nem evoluir as funcionalidades de negócio.

## What Changes

- Criar estrutura de monorepo com pastas raiz `/frontend`, `/backend` e `/docs`.
- Criar aplicação Angular em `/frontend` rodando em `http://localhost:4200`.
- Criar API ASP.NET Core em `/backend` rodando em `http://localhost:5000`, com CORS liberado apenas para `localhost:4200`.
- Expor endpoint `GET /health` retornando `{ "status": "ok", "version": "1.0.0" }`.
- Configurar SQLite + EF Core no backend, com criação automática do arquivo de banco e aplicação automática de migrations no startup.
- Criar entidades e tabelas `BaseResume` e `GeneratedResume` (registro único cada, sobrescrito a cada operação).
- Configurar rotas Angular (`/`, `/curriculo-base`, `/gerar`, `/editor`) com redirecionamento inteligente da raiz baseado no estado do banco e guards para rotas que exigem pré-requisitos.
- Configurar credenciais do Azure OpenAI via `appsettings.json` do backend, incluído no `.gitignore`.
- Criar script único de inicialização na raiz que sobe frontend e backend simultaneamente e instala dependências ausentes.
- Criar `README.md` na raiz com pré-requisitos (Node.js LTS, .NET SDK LTS, Angular CLI), links de download, passo a passo de setup e instruções de verificação.

## Capabilities

### New Capabilities
- `monorepo-structure`: Organização de pastas raiz do repositório (frontend, backend, docs) e README de setup.
- `frontend-app`: Aplicação Angular base, suas rotas e comportamento de redirecionamento/guards.
- `backend-api`: API ASP.NET Core base, health check e configuração de CORS.
- `database`: Banco SQLite com EF Core, criação automática, migrations e entidades `BaseResume` e `GeneratedResume`.
- `app-configuration`: Configuração de credenciais do Azure OpenAI via `appsettings.json` e proteção via `.gitignore`.
- `dev-tooling`: Script único de inicialização do ambiente local (frontend + backend + dependências).

### Modified Capabilities
<!-- Nenhuma: este é o setup inicial; ainda não existem specs prévios. -->

## Impact

- **Código novo**: cria toda a base do repositório — projeto Angular em `/frontend`, projeto ASP.NET Core em `/backend`, script de inicialização na raiz, `README.md`, `.gitignore`.
- **Dependências**: introduz Node.js LTS, Angular CLI, .NET SDK LTS, EF Core (provider SQLite) e bibliotecas padrão do template Angular/ASP.NET Core.
- **Portas locais**: reserva `4200` (frontend) e `5000` (backend) no ambiente de desenvolvimento.
- **Configuração sensível**: `appsettings.json` do backend não vai para o repositório; cada desenvolvedor cria localmente com suas credenciais do Azure OpenAI.
- **APIs externas**: prepara o terreno para integração futura com Azure OpenAI (sem chamadas ainda nesta feature).
- **Habilita** todas as features subsequentes (F-02 Currículo Base, F-03 Geração com IA, F-06 Editor, F-04/F-05 Exportações, F-07 Score ATS, F-08 Skill Gaps).
