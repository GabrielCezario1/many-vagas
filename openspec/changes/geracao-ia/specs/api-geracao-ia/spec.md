## ADDED Requirements

### Requirement: Endpoint de geração recebe vaga e idioma
O backend SHALL expor `POST /api/resume/generate` aceitando a descrição da vaga e o idioma selecionado.

#### Scenario: Requisição válida com currículo base existente
- **WHEN** o frontend envia `POST /api/resume/generate` com `{ jobDescription: string, language: "pt-br" | "en" }`
- **WHEN** existe um `BaseResume` no banco
- **THEN** o backend combina o currículo base serializado + descrição da vaga + idioma e envia ao Azure OpenAI (gpt-4o)
- **THEN** o backend retorna HTTP 200 com `{ generatedResume: {...}, matchedSkills: string[], missingSkills: string[] }`

#### Scenario: Requisição válida sem currículo base
- **WHEN** o frontend envia `POST /api/resume/generate` com descrição de vaga e idioma
- **WHEN** NÃO existe `BaseResume` no banco
- **THEN** o backend envia apenas a descrição da vaga + idioma ao Azure OpenAI
- **THEN** o backend retorna HTTP 200 com currículo otimizado gerado somente com informações da vaga

### Requirement: Prompt instrui aplicação da fórmula XYZ
O system prompt enviado ao Azure OpenAI SHALL instruir o modelo a reescrever bullet points de experiência na fórmula "Accomplished X, measured by Y, by doing Z".

#### Scenario: Currículo gerado contém bullets no formato XYZ
- **WHEN** o backend monta o prompt de geração
- **THEN** o system prompt contém instrução explícita para aplicar a fórmula XYZ nos bullet points de experiência
- **THEN** o system prompt instrui o modelo a injetar keywords relevantes da vaga no currículo

### Requirement: Idioma do currículo é respeitado
O system prompt SHALL instruir o modelo a gerar todo o conteúdo do currículo no idioma selecionado.

#### Scenario: Geração em Português (PT-BR)
- **WHEN** o campo `language` da requisição é `"pt-br"`
- **THEN** o system prompt instrui o modelo a gerar o currículo em Português Brasileiro

#### Scenario: Geração em Inglês (EN)
- **WHEN** o campo `language` da requisição é `"en"`
- **THEN** o system prompt instrui o modelo a gerar o currículo em Inglês

### Requirement: Resposta da IA é deserializada em JSON estruturado
O backend SHALL solicitar resposta em formato JSON ao Azure OpenAI e deserializar nos campos do `GeneratedResume` + skill analysis.

#### Scenario: Resposta JSON válida do modelo
- **WHEN** o Azure OpenAI retorna resposta JSON válida
- **THEN** o backend deserializa os campos do currículo otimizado e as listas `matchedSkills` e `missingSkills`
- **THEN** o backend retorna esses dados ao frontend com HTTP 200

#### Scenario: Resposta JSON inválida do modelo
- **WHEN** o Azure OpenAI retorna resposta que não pode ser deserializada como JSON
- **THEN** o backend retorna HTTP 502 com mensagem de erro indicando falha no parsing da resposta

### Requirement: Timeout da chamada ao Azure OpenAI
O backend SHALL configurar timeout de 60 segundos na chamada ao Azure OpenAI.

#### Scenario: Azure OpenAI não responde dentro do timeout
- **WHEN** a chamada ao Azure OpenAI excede 60 segundos sem resposta
- **THEN** o backend retorna HTTP 504 ao frontend
- **THEN** o frontend interpreta como timeout e exibe a mensagem adequada

### Requirement: Erros da API do Azure OpenAI são tratados e repassados
O backend SHALL capturar exceções do SDK Azure.AI.OpenAI e retornar HTTP 502 com mensagem identificável.

#### Scenario: Azure OpenAI retorna erro (quota, serviço indisponível)
- **WHEN** o SDK do Azure OpenAI lança uma exceção (ex: quota excedida, serviço indisponível)
- **THEN** o backend retorna HTTP 502 com body `{ error: "azure_openai_error", message: string }`
- **THEN** o frontend interpreta o código de erro e exibe a mensagem adequada ao usuário

### Requirement: Credenciais do Azure OpenAI são configuradas via appsettings
O backend SHALL ler `Endpoint`, `ApiKey` e `DeploymentName` do Azure OpenAI a partir da seção `AzureOpenAI` do `appsettings.json`.

#### Scenario: Configuração ausente ou incompleta
- **WHEN** a seção `AzureOpenAI` do `appsettings.json` está ausente ou com campos vazios
- **THEN** a aplicação falha na inicialização (fail-fast) com mensagem clara sobre a configuração ausente
