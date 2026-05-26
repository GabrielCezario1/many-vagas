## Context

O ManyVagas é um monorepo com frontend Angular e backend .NET 10 (minimal API). O banco de dados é SQLite via Entity Framework Core. A entidade `GeneratedResume` já existe na migration inicial. O backend já possui `AppDbContext`, `BaseResume` e `GeneratedResume` como entidades. A integração com Azure OpenAI ainda não foi implementada — este é o primeiro contato do sistema com IA.

As credenciais do Azure OpenAI (endpoint, key, deployment name) são configuradas em `appsettings.json` (não versionado) e carregadas via `IConfiguration`. O modelo alvo é `gpt-4o`.

## Goals / Non-Goals

**Goals:**
- Implementar o endpoint `POST /api/resume/generate` no backend, que orquestra a chamada ao Azure OpenAI, aplica fórmula XYZ e retorna currículo otimizado + skill analysis
- Implementar a tela Angular `/gerar` com todas as interações descritas no PRD (loading animado, erros, redirecionamento)
- Persistir o `GeneratedResume` no SQLite após geração bem-sucedida (upsert: um único registro por usuário)
- Suportar os dois idiomas (PT-BR / EN) via instrução no system prompt

**Non-Goals:**
- Autenticação/multiusuário — o sistema é single-user (sem login)
- Streaming da resposta da IA (a resposta é aguardada integralmente antes de redirecionar)
- Histórico de currículos gerados — apenas o último gerado é mantido
- Validação mínima do campo de vaga (qualquer texto é aceito, incluindo descrições muito curtas)

## Decisions

### D1 — SDK Azure.AI.OpenAI vs. chamada HTTP direta
**Decisão:** Usar o SDK NuGet `Azure.AI.OpenAI`.  
**Rationale:** O SDK trata autenticação, serialização, retries básicos e versionamento da API automaticamente. Evita boilerplate de HttpClient + serialização manual.  
**Alternativa considerada:** `HttpClient` direto contra a API REST do Azure OpenAI — descartado por maior surface de bugs.

### D2 — Estrutura do prompt
**Decisão:** Usar dois papéis: `system` (instrução de persona/regras da fórmula XYZ/idioma) e `user` (currículo base serializado como JSON + descrição da vaga).  
**Rationale:** Separar contexto de instrução (system) do conteúdo variável (user) melhora a coerência da resposta e facilita ajustes no comportamento sem alterar a lógica de negócio.  
**Alternativa considerada:** Tudo em `user` — descartado por perda de controle sobre o comportamento do modelo.

### D3 — Formato da resposta da IA
**Decisão:** Solicitar resposta JSON estruturada (`response_format: json_object`) com os campos do `GeneratedResume` + `matchedSkills` + `missingSkills`.  
**Rationale:** Evita parsing frágil de texto livre; o SDK suporta `response_format: json_object` com `gpt-4o`.  
**Alternativa considerada:** Texto livre com parsing via regex — descartado por fragilidade.

### D4 — Upsert do GeneratedResume
**Decisão:** Manter um único registro de `GeneratedResume` no banco (upsert por ID fixo ou delete+insert).  
**Rationale:** O PRD define que o currículo gerado "sobrescreve o anterior" — não há histórico de versões nesta fase.  
**Alternativa considerada:** Múltiplos registros com timestamp — fora de escopo do PRD atual.

### D5 — Timeout da requisição
**Decisão:** Configurar timeout de 60 segundos no `HttpClient` subjacente ao SDK do Azure OpenAI.  
**Rationale:** O PRD menciona que o processamento pode levar entre 10-30 segundos; 60s dá margem sem penalizar o UX com esperas excessivas.

### D6 — Comunicação frontend-backend durante geração
**Decisão:** Single HTTP request (POST fire-and-wait); o loading animado no frontend é puramente cosmético (temporizador local alternando mensagens).  
**Rationale:** Simplicidade — streaming ou polling adicionam complexidade sem benefício real dado o tempo esperado de 10-30s.

## Risks / Trade-offs

- **[Risco] Custo e quota da API Azure OpenAI** → Mitigação: configurar alertas de billing no portal Azure; o sistema é single-user, então o volume é baixo.
- **[Risco] Resposta mal-formatada da IA (JSON inválido)** → Mitigação: envolver a deserialização em try-catch; retornar erro 502 para o frontend com mensagem adequada.
- **[Risco] Descrição de vaga muito curta gera currículo genérico** → Comportamento esperado, documentado no PRD como não-erro; sem validação mínima de conteúdo.
- **[Trade-off] Sem streaming** → A tela de loading cobre o período de espera com mensagens animadas, mas o usuário não vê progresso real. Aceitável para MVP.
- **[Risco] appsettings.json com credenciais acidentalmente commitado** → Mitigação: `appsettings.json` já está no `.gitignore`; usar `appsettings.example.json` como referência.

## Migration Plan

1. Adicionar pacote `Azure.AI.OpenAI` via `dotnet add package`
2. Adicionar configuração `AzureOpenAI` ao `appsettings.example.json` (sem valores reais)
3. Implementar e testar o endpoint backend localmente com `appsettings.Development.json`
4. Implementar e testar a tela Angular localmente
5. Nenhuma nova migration de banco é necessária (entidade `GeneratedResume` já existe)

**Rollback:** Remoção do controller e da página Angular — sem impacto no banco de dados.

## Open Questions

- O system prompt deve ser em PT-BR, EN, ou bilíngue? → Decisão: idioma do prompt varia conforme o idioma selecionado pelo usuário (consistência com o output esperado).
- Qual deployment name padrão no `appsettings.example.json`? → Usar `gpt-4o` como placeholder.
