## 1. Backend — Endpoints do Currículo Base

- [x] 1.1 Adicionar endpoint `GET /api/base-resume` em `Program.cs` que retorna o conteúdo do currículo ou 404 se não existir
- [x] 1.2 Adicionar endpoint `POST /api/base-resume` em `Program.cs` com lógica de upsert (criar ou atualizar o registro único) e validação de payload não-vazio
- [x] 1.3 Criar DTO `BaseResumeContentDto` (record C#) com os campos do currículo para desserialização e validação mínima no backend

## 2. Frontend — ApiService

- [x] 2.1 Adicionar tipo `BaseResumeDto` em `api.service.ts` com a interface completa do currículo (pessoal, resumo, experiências, educação, habilidades, idiomas, projetos)
- [x] 2.2 Implementar método `getBaseResume(): Observable<BaseResumeDto | null>` no `ApiService` (GET, retorna null em 404)
- [x] 2.3 Implementar método `saveBaseResume(data: BaseResumeDto): Observable<void>` no `ApiService` (POST)

## 3. Frontend — Estrutura do Formulário Reativo

- [x] 3.1 Importar `ReactiveFormsModule` e criar `FormGroup` raiz em `CurriculoBase` com `FormControl` para Dados Pessoais e Resumo Profissional
- [x] 3.2 Adicionar `FormArray` `experiencias` com método helper `addExperiencia()` e `removeExperiencia(index)` — cada item com Empresa, Cargo, Início, Fim, flagAtualmente, bullets (FormArray interno)
- [x] 3.3 Adicionar `FormArray` `educacao` com método helper `addEducacao()` e `removeEducacao(index)` — cada item com Instituição, Curso, Grau, Período
- [x] 3.4 Adicionar `FormArray` `idiomas` com método helper `addIdioma()` e `removeIdioma(index)` — cada item com Idioma e Nível (select)
- [x] 3.5 Adicionar `FormArray` `projetos` com método helper `addProjeto()` e `removeProjeto(index)` — cada item com Nome, Descrição, Tecnologias (array de string), Link
- [x] 3.6 Implementar lógica de habilidades técnicas como array de strings simples com métodos `addSkill(skill: string)` e `removeSkill(index)`

## 4. Frontend — Validação e Estados de UI

- [x] 4.1 Configurar validators nos campos obrigatórios: Nome (`Validators.required`), Email (`Validators.required`, `Validators.email`), LinkedIn e GitHub (`Validators.pattern` URL quando preenchidos)
- [x] 4.2 Implementar lógica de toggle "Atualmente" — ao marcar, desabilitar o campo de data de fim da experiência correspondente
- [x] 4.3 Implementar validação de ao menos uma experiência antes do submit
- [x] 4.4 Adicionar método `isInvalid(fieldPath)` helper para exibição condicional de erros nos templates

## 5. Frontend — Template HTML da Página

- [x] 5.1 Criar template da seção Dados Pessoais com `[formControlName]`, placeholders e mensagens de erro condicionais
- [x] 5.2 Criar template da seção Resumo Profissional (textarea)
- [x] 5.3 Criar template da seção Experiências com `*ngFor` sobre `experiencias.controls`, botões de adicionar/remover e sub-lista de bullets dinâmicos
- [x] 5.4 Criar template da seção Educação com `*ngFor` sobre `educacao.controls` e botões de adicionar/remover
- [x] 5.5 Criar template da seção Habilidades Técnicas com campo de entrada + botão, lista de tags com ícone de remover
- [x] 5.6 Criar template da seção Idiomas com `*ngFor` sobre `idiomas.controls`, campo texto + `<select>` de nível
- [x] 5.7 Criar template da seção Projetos com `*ngFor` sobre `projetos.controls`, campos de nome/descrição/link e tags de tecnologias
- [x] 5.8 Criar botão "Salvar Currículo" com estado de loading (`[disabled]="saving()"`) e indicador visual de carregamento

## 6. Frontend — Carregamento e Salvamento

- [x] 6.1 Implementar `ngOnInit` para chamar `getBaseResume()` e pré-preencher o formulário com os dados retornados (usando `patchValue` e reconstrução dos FormArrays)
- [x] 6.2 Implementar tratamento de erro no carregamento inicial — exibir mensagem de erro de conectividade e ocultar formulário quando backend inacessível
- [x] 6.3 Implementar método `onSubmit()`: validar formulário, chamar `saveBaseResume()`, tratar sucesso (toast + redirect `/gerar`) e erro (toast de falha)
- [x] 6.4 Implementar toast inline com signal de estado (`toastMessage`, `toastType`) e timeout de 3 segundos via `setTimeout`

## 7. Frontend — Estilos

- [x] 7.1 Estilizar campos inválidos com borda vermelha (classe `.ng-invalid.ng-touched`) e mensagens de erro (`.error-message`)
- [x] 7.2 Estilizar tags de habilidades e tecnologias com layout flexbox e botão de remover
- [x] 7.3 Estilizar toast de sucesso (verde) e erro (vermelho) com posicionamento fixo e transição CSS
- [x] 7.4 Estilizar estado de loading do botão (opacidade reduzida, cursor `not-allowed`)

## 8. Validação End-to-End

- [ ] 8.1 Verificar que ao salvar um currículo válido, o banco SQLite contém o JSON com todos os campos
- [ ] 8.2 Verificar que ao reabrir `/curriculo-base`, os dados são carregados corretamente nos FormArrays
- [ ] 8.3 Verificar que o redirecionamento para `/gerar` ocorre após salvar com sucesso
- [ ] 8.4 Verificar que erros de validação bloqueiam o submit e destacam os campos inválidos corretamente
