## 1. Backend — Configuração e Dependências

- [x] 1.1 Adicionar pacote NuGet `Azure.AI.OpenAI` ao `ManyVagas.Api.csproj` via `dotnet add package`
- [x] 1.2 Adicionar seção `AzureOpenAI` ao `appsettings.example.json` com campos `Endpoint`, `ApiKey` e `DeploymentName` como placeholders
- [x] 1.3 Registrar `AzureOpenAIClient` no container de DI em `Program.cs`, lendo configurações de `appsettings.json`; falhar com mensagem clara se configuração estiver ausente

## 2. Backend — DTOs e Contrato da API

- [x] 2.1 Criar `GenerateResumeRequest.cs` com propriedades `JobDescription (string)` e `Language (string: "pt-br" | "en")`
- [x] 2.2 Criar `GenerateResumeResponse.cs` com a estrutura do currículo otimizado + `MatchedSkills (string[])` + `MissingSkills (string[])`
- [x] 2.3 Criar `AiGeneratedResumeDto.cs` representando o JSON esperado na resposta do Azure OpenAI (mesmos campos do `GeneratedResume` + skill lists)

## 3. Backend — Serviço de Geração com IA

- [x] 3.1 Criar `ResumeGenerationService.cs` com método `GenerateAsync(BaseResume?, string jobDescription, string language)`
- [x] 3.2 Implementar montagem do system prompt com instrução de fórmula XYZ, injeção de keywords e idioma selecionado
- [x] 3.3 Implementar montagem do user prompt: currículo base serializado como JSON (ou ausente) + descrição da vaga
- [x] 3.4 Configurar `response_format: json_object` na chamada ao Azure OpenAI e timeout de 60 segundos
- [x] 3.5 Implementar deserialização da resposta JSON em `AiGeneratedResumeDto`; retornar erro 502 se parsing falhar
- [x] 3.6 Registrar `ResumeGenerationService` no container de DI em `Program.cs`

## 4. Backend — Controller e Persistência

- [x] 4.1 Criar `ResumeGenerationController.cs` com endpoint `POST /api/resume/generate`
- [x] 4.2 Implementar leitura do `BaseResume` existente no banco via `AppDbContext` (pode ser null — geração prossegue sem ele)
- [x] 4.3 Implementar chamada ao `ResumeGenerationService` dentro do controller
- [x] 4.4 Implementar upsert do `GeneratedResume` no SQLite: atualizar registro existente ou inserir novo
- [x] 4.5 Tratar `TaskCanceledException` (timeout) → HTTP 504; exceções do SDK Azure → HTTP 502; erros de banco → HTTP 500
- [x] 4.6 Registrar o controller/endpoint no `Program.cs`

## 5. Frontend — Serviço e Roteamento

- [x] 5.1 Adicionar método `generateResume(jobDescription: string, language: string)` ao `ApiService` com chamada `POST /api/resume/generate`
- [x] 5.2 Adicionar rota `/gerar` ao `app.routes.ts` apontando para `GenerationPageComponent` (lazy load)
- [x] 5.3 Adicionar método `getGeneratedResume()` ao `ApiService` para verificar existência de currículo gerado anterior

## 6. Frontend — Componente de Geração

- [x] 6.1 Criar `GenerationPageComponent` em `frontend/src/app/pages/geracao/` com template de formulário (textarea, seletor de idioma, botão)
- [x] 6.2 Implementar validação de idioma obrigatório: destacar seletor e exibir mensagem se botão for clicado sem seleção
- [x] 6.3 Implementar lógica de loading: desabilitar formulário ao submeter, exibir mensagens animadas em sequência ("Analisando a vaga..." → "Aplicando fórmula XYZ..." → "Otimizando keywords...")
- [x] 6.4 Implementar redirecionamento automático para `/editor` após resposta HTTP 200 do backend
- [x] 6.5 Implementar tratamento de erros: timeout (504) → mensagem específica; falha API (502) → mensagem específica; erro de rede → mensagem de conectividade
- [x] 6.6 Garantir preservação dos valores do formulário (textarea e idioma) em todos os cenários de erro
- [x] 6.7 Implementar verificação de `BaseResume` no `ngOnInit`: exibir aviso não-bloqueante se ausente
- [x] 6.8 Implementar verificação de `GeneratedResume` anterior no `ngOnInit`: exibir aviso com link para `/editor` se existir

