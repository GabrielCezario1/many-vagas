## ADDED Requirements

### Requirement: Endpoint GET para recuperar o currículo base
O sistema SHALL expor `GET /api/base-resume` que retorna o conteúdo JSON do currículo base se existir, ou `404 Not Found` se nenhum registro foi salvo.

#### Scenario: Currículo existente
- **WHEN** existe um registro na tabela `BaseResumes`
- **THEN** o endpoint retorna `200 OK` com o conteúdo JSON do currículo deserializado

#### Scenario: Currículo inexistente
- **WHEN** a tabela `BaseResumes` está vazia
- **THEN** o endpoint retorna `404 Not Found`

---

### Requirement: Endpoint POST para upsert do currículo base
O sistema SHALL expor `POST /api/base-resume` que aceita o conteúdo JSON do currículo e realiza upsert — cria novo registro se não existe, ou atualiza o existente. Deve validar que o payload não está vazio antes de persistir.

#### Scenario: Criar currículo pela primeira vez
- **WHEN** a tabela `BaseResumes` está vazia e o cliente envia payload JSON válido
- **THEN** o endpoint persiste um novo registro no banco
- **AND** retorna `200 OK` com confirmação

#### Scenario: Atualizar currículo existente
- **WHEN** já existe um registro em `BaseResumes` e o cliente envia novo payload
- **THEN** o endpoint atualiza o `Content` do registro existente
- **AND** retorna `200 OK` com confirmação

#### Scenario: Payload vazio ou inválido
- **WHEN** o cliente envia payload nulo ou com `Content` vazio
- **THEN** o endpoint retorna `400 Bad Request`
- **AND** nenhuma alteração é persistida no banco

---

### Requirement: Endpoint de existência do currículo base (já existente — incluído por completude)
O sistema SHALL manter o endpoint `GET /api/base-resume/exists` que retorna `{ "exists": true/false }` indicando se há registro salvo.

#### Scenario: Verificação com registro existente
- **WHEN** existe ao menos um registro em `BaseResumes`
- **THEN** o endpoint retorna `{ "exists": true }`

#### Scenario: Verificação sem registro
- **WHEN** a tabela `BaseResumes` está vazia
- **THEN** o endpoint retorna `{ "exists": false }`

---

### Requirement: Método `saveBaseResume` no ApiService Angular
O sistema SHALL adicionar ao `ApiService` o método `saveBaseResume(data: BaseResumeDto): Observable<void>` que faz `POST /api/base-resume` e o método `getBaseResume(): Observable<BaseResumeDto>` que faz `GET /api/base-resume`.

#### Scenario: Salvar com sucesso via ApiService
- **WHEN** o método `saveBaseResume` é chamado com um DTO válido
- **THEN** uma requisição `POST /api/base-resume` é enviada com o JSON serializado
- **AND** o Observable completa sem erro em caso de resposta 200

#### Scenario: Carregar currículo existente via ApiService
- **WHEN** o método `getBaseResume` é chamado
- **THEN** uma requisição `GET /api/base-resume` é enviada
- **AND** o Observable emite o `BaseResumeDto` em caso de resposta 200
- **AND** em caso de resposta 404, o Observable emite `null` (currículo não encontrado)
