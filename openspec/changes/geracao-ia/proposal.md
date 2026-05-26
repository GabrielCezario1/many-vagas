## Why

O ManyVagas precisa de um mecanismo para transformar o currículo base do usuário em um currículo otimizado para ATS, adaptado especificamente para cada vaga. Sem essa funcionalidade, o produto não entrega seu valor principal: aumentar as chances de aprovação em processos seletivos ao personalizar automaticamente o currículo com keywords da vaga e a fórmula XYZ.

## What Changes

- Criação da tela de geração (`/gerar`) com campo de descrição de vaga e seletor de idioma (PT-BR / EN)
- Novo endpoint no backend (`POST /api/resume/generate`) que recebe a vaga + idioma, combina com o currículo base e chama o Azure OpenAI (gpt-4o)
- O backend aplica a fórmula XYZ nos bullet points de experiência e injeta keywords da vaga no currículo gerado
- O currículo gerado é salvo no SQLite (`GeneratedResume`) e retorna `matchedSkills` + `missingSkills` para uso em F-04 e F-05
- Redirecionamento automático para `/editor` após sucesso
- Estados de loading com mensagens animadas durante o processamento
- Tratamento de erros (timeout, falha da API do Azure OpenAI, falha de conectividade)

## Capabilities

### New Capabilities

- `tela-geracao`: Tela Angular em `/gerar` com formulário de geração (campo de vaga, seletor de idioma, loading animado, tratamento de erros)
- `api-geracao-ia`: Endpoint backend que orquestra a chamada ao Azure OpenAI, aplica fórmula XYZ, injeta keywords e retorna currículo otimizado + skill analysis
- `persistencia-curriculo-gerado`: Salvamento do `GeneratedResume` no SQLite após geração bem-sucedida, disponibilizando o resultado entre sessões

### Modified Capabilities

<!-- Nenhuma capability existente tem requisitos alterados por esta mudança -->

## Impact

- **Frontend**: Nova página `GenerationPageComponent` em `frontend/src/app/pages/geracao/`; rota `/gerar` adicionada ao `app.routes.ts`; `ApiService` recebe novo método `generateResume()`
- **Backend**: Novo controller `ResumeGenerationController` com endpoint `POST /api/resume/generate`; integração com `Azure.AI.OpenAI` SDK; leitura do `BaseResume` e escrita do `GeneratedResume` via `AppDbContext`
- **Dependências**: Adicionar pacote NuGet `Azure.AI.OpenAI` ao projeto backend; credenciais Azure OpenAI em `appsettings.json` (não commitado)
- **Banco de dados**: Entidade `GeneratedResume` já existe na migration inicial; nenhuma nova migration necessária
