## Context

O ManyVagas é um produto novo, sem código pré-existente. O repositório contém apenas documentação (`docs/`) e a configuração do OpenSpec. A primeira feature (F-01) precisa estabelecer toda a fundação técnica — frontend Angular, backend ASP.NET Core, banco SQLite, integração entre camadas e tooling local — antes que qualquer feature de negócio possa ser desenvolvida.

**Restrições principais:**
- Stack fixa: Angular (frontend) + ASP.NET Core (backend) + SQLite + EF Core.
- Tudo roda localmente; sem deploy em nuvem nesta feature.
- O desenvolvedor deve conseguir rodar o projeto com um único comando após clonar o repositório.
- Credenciais do Azure OpenAI não podem ser commitadas.
- Versões alvo: Node.js LTS, .NET SDK LTS, Angular CLI na versão estável mais recente.

## Goals / Non-Goals

**Goals:**
- Estrutura de monorepo simples e legível (`/frontend`, `/backend`, `/docs`).
- Ambiente de desenvolvimento "clone-and-run": um comando sobe tudo.
- Banco SQLite criado e migrado automaticamente — zero passos manuais.
- Rotas Angular funcionando com redirecionamento inteligente baseado no estado do banco.
- CORS restrito ao frontend local — sem abrir desnecessariamente.
- README claro o suficiente para um dev novo subir o ambiente sem ajuda.

**Non-Goals:**
- Implementar qualquer lógica de currículo, geração com IA, score ATS, skill gaps ou exportação (ficam para features posteriores).
- Pipeline de CI/CD, deploy em nuvem ou containerização (Docker).
- Autenticação, multi-usuário ou multi-tenant — o produto assume um único usuário local.
- Versionamento de currículos ou histórico — `BaseResume` e `GeneratedResume` são registros únicos sobrescritos.
- Internacionalização do app (a configuração de idioma da IA é apenas um campo persistido).

## Decisions

### Decisão 1: Monorepo com pastas raiz simples (sem workspace tool)
Optamos por uma estrutura plana com `/frontend`, `/backend`, `/docs` na raiz, sem usar Nx, Turborepo ou pnpm workspaces. **Por quê:** o projeto tem apenas duas aplicações independentes (uma Angular, uma .NET) que não compartilham código nem dependências; um workspace tool adicionaria complexidade sem benefício. **Alternativa considerada:** Nx — descartada por overhead de aprendizado e configuração para um projeto pequeno.

### Decisão 2: Script único na raiz usando `concurrently`
Um `package.json` na raiz contém um script `start` que usa a biblioteca `concurrently` para subir `ng serve` (frontend) e `dotnet run` (backend) em paralelo, no mesmo terminal, com logs prefixados. **Por quê:** funciona cross-platform (Windows/Linux/Mac) sem precisar de scripts `.bat`/`.sh` separados; é a abordagem mais comum e bem documentada. **Alternativas consideradas:** scripts shell separados (não cross-platform), Docker Compose (overhead desnecessário para dev local sem container).

### Decisão 3: Banco SQLite criado via `Database.Migrate()` no startup
No `Program.cs` do backend, após construir o app, executamos `db.Database.Migrate()` dentro de um escopo de serviço. Isso cria o arquivo SQLite se não existir e aplica todas as migrations pendentes. **Por quê:** atende ao requisito de "clone-and-run" — desenvolvedor não precisa rodar `dotnet ef database update`. **Alternativa considerada:** `EnsureCreated()` — descartada porque não suporta migrations versionadas que serão necessárias em features futuras.

### Decisão 4: Entidades `BaseResume` e `GeneratedResume` como registros únicos
Cada tabela armazena no máximo um registro. Salvar substitui o anterior. Modelamos com chave primária `Id` (int) e na lógica de aplicação garantimos que sempre operamos no registro com menor `Id` (ou o único existente). **Por quê:** o produto é single-user single-state — não há valor em histórico nesta versão. **Alternativa considerada:** múltiplos registros com flag `IsActive` — descartada por adicionar complexidade sem requisito de negócio.

### Decisão 5: Conteúdo do currículo (seções) serializado como JSON em coluna `Content`
Em vez de modelar tabelas relacionais para experiências, formações, skills etc., armazenamos o currículo inteiro como JSON em uma única coluna `TEXT` do SQLite. **Por quê:** as seções têm forma flexível e são manipuladas como um todo (gerar, editar, exportar); modelagem relacional traria joins sem ganho. **Alternativa considerada:** tabelas relacionais por seção — descartada por overhead de schema sem requisito de query relacional.

### Decisão 6: Rotas Angular com guards funcionais
Usamos `CanActivateFn` (guards funcionais introduzidos no Angular 14+) para implementar redirecionamento de `/` e proteção de `/editor`. O guard consulta o backend (`GET /api/base-resume/exists` e `GET /api/generated-resume/exists` — endpoints leves apenas de existência) para decidir. **Por quê:** guards funcionais são o padrão atual recomendado pelo Angular; consultas leves de existência evitam carregar payload completo. **Alternativa considerada:** estado em `localStorage` — descartada porque o banco é fonte da verdade e o usuário pode limpar o storage do navegador.

### Decisão 7: CORS restrito por configuração nomeada
Configuramos uma política CORS chamada `"FrontendLocal"` que permite apenas `http://localhost:4200`, qualquer método e qualquer header. Aplicamos com `app.UseCors("FrontendLocal")`. **Por quê:** explícito e fácil de evoluir quando for adicionar ambientes (staging/prod). **Alternativa considerada:** `AllowAnyOrigin()` — descartada por requisito explícito de só aceitar a origem local.

### Decisão 8: `appsettings.json` no `.gitignore`; `appsettings.example.json` versionado
O arquivo real fica fora do git; um `appsettings.example.json` versionado serve de template com placeholders. **Por quê:** padrão consagrado para credenciais; o exemplo permite ao novo desenvolvedor saber exatamente quais chaves precisa preencher. **Alternativa considerada:** User Secrets do .NET — descartada nesta feature para manter o fluxo simples e visível no README; pode ser adotado em features futuras.

## Risks / Trade-offs

- **[Risco] Versões "LTS mais recentes" mudam ao longo do tempo, podendo introduzir incompatibilidades** → Mitigação: o README documenta as versões testadas no momento do setup; um dev que use versões muito mais novas pode precisar ajustar.
- **[Risco] Migration automática no startup pode falhar e travar a inicialização** → Mitigação: logs claros do EF Core; a falha é imediata e visível, não silenciosa.
- **[Risco] Armazenar o currículo como JSON dificulta queries por campo específico** → Mitigação: o produto não tem requisito de busca por campo dentro do currículo; se surgir, podemos migrar.
- **[Trade-off] Sobrescrever sempre o currículo gerado significa que o usuário perde a versão anterior ao gerar uma nova** → Aceito: é requisito explícito do produto manter apenas o mais recente.
- **[Risco] `concurrently` mistura logs do frontend e backend no mesmo terminal** → Mitigação: prefixos `[FE]` / `[BE]` configurados no script; desenvolvedor pode rodar separado se preferir.
- **[Risco] Porta 4200 ou 5000 ocupada por outro processo** → Mitigação: mensagem de erro do próprio Angular/Kestrel é clara; documentado em "Comportamentos Gerais" do PRD.
