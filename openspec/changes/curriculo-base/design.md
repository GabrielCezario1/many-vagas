## Context

O ManyVagas possui um monorepo com frontend Angular 19 (standalone components, reactive forms) e backend ASP.NET Core 10 (minimal API, EF Core + SQLite). A entidade `BaseResume` já existe no banco com um único campo `Content` (string JSON) — padrão single-record. Os endpoints de existência (`/api/base-resume/exists`) já foram criados. O `ApiService` Angular centraliza a comunicação HTTP. As páginas do formulário (`curriculo-base.ts/html/css`) existem como scaffolds vazios.

## Goals / Non-Goals

**Goals:**
- Implementar o formulário reativo completo com as 7 seções do PRD (Dados Pessoais, Resumo, Experiências, Educação, Habilidades, Idiomas, Projetos)
- Adicionar endpoints `GET /api/base-resume` e `POST /api/base-resume` (upsert) ao backend
- Validação client-side com destaque visual de campos inválidos
- Toast de feedback (sucesso/erro) e estado de loading no botão de salvar
- Redirecionamento automático para `/gerar` após salvar com sucesso

**Non-Goals:**
- Integração com IA, geração de currículo ou score ATS (features futuras)
- Exportação de currículo (PDF, DOCX)
- Autenticação multi-usuário — sistema é single-user por design
- Versionamento de currículos ou histórico de alterações

## Decisions

### 1. Angular Reactive Forms com FormArray para seções dinâmicas

**Decisão:** Usar `ReactiveFormsModule` com `FormGroup` raiz e `FormArray` para Experiências, Educação, Idiomas e Projetos.

**Rationale:** Reactive Forms permitem validação programática, acesso tipado ao estado e são mais adequadas para formulários complexos com listas dinâmicas. Template-driven forms tornariam as validações cruzadas e os FormArrays difíceis de gerenciar.

**Alternativa descartada:** Template-driven forms — limitadas para formulários com muitos campos dinâmicos.

---

### 2. Estrutura JSON livre no campo `Content` da entidade `BaseResume`

**Decisão:** Manter o padrão existente de serializar todo o currículo como um JSON no campo `Content`. O backend desserializa para um `record` ou `Dictionary` para validação mínima.

**Rationale:** Evita migrações de schema ao adicionar/modificar seções. O banco já está criado. O único consumidor dos dados é o próprio ManyVagas, então não há necessidade de colunas relacionais neste momento.

**Alternativa descartada:** Normalização em tabelas relacionais (Experience, Education etc.) — sobrecarga desnecessária para MVP, exigiria novas migrações.

---

### 3. Upsert via `POST /api/base-resume`

**Decisão:** Um único endpoint `POST` faz upsert — se existe registro, atualiza; se não, cria. O frontend não precisa distinguir create vs update.

**Rationale:** Simplifica o frontend e o backend. O padrão single-record significa que há sempre no máximo 1 linha na tabela.

**Alternativa descartada:** `PUT` separado de `POST` — mais verboso sem benefício real no contexto single-record.

---

### 4. Toast de feedback como componente Angular inline

**Decisão:** Implementar toast simples diretamente no componente da página (signal de estado + CSS transition), sem biblioteca externa.

**Rationale:** Mantém dependências mínimas. O PRD exige apenas dois tipos de toast (sucesso/erro) com timeout de 3 segundos — não justifica adicionar Angular CDK Overlay ou ngx-toastr.

**Alternativa descartada:** `ngx-toastr` ou Angular CDK — overhead desnecessário para o caso de uso atual.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Evolução do schema JSON pode quebrar dados salvos em versões anteriores | Usar parsing defensivo no frontend (campos ausentes tratados como `undefined`/`null`) e no backend (aceitar JSON parcial) |
| FormArray com muitas experiências pode impactar performance de change detection | Usar `OnPush` strategy na página e `trackBy` nos `*ngFor` |
| Backend minimal API sem validação de contrato pode aceitar JSON malformado | Validar mínimo no endpoint (verificar que `Content` não é vazio/nulo antes de persistir) |
