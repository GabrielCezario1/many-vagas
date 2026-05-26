## 1. Backend — Persistência do currículo editado

- [x] 1.1 Adicionar endpoint `PUT /api/generated-resume` em `Program.cs` que recebe um `BaseResumeContentDto` (structured DTO), atualiza o campo `Content` do registro existente no SQLite e retorna 404 se não houver registro
- [x] 1.2 Adicionar método `saveGeneratedResume(dto: BaseResumeDto): Observable<void>` em `ApiService` que chama `PUT /api/generated-resume`

## 2. Backend — Stubs de exportação (integração F-07/F-08)

- [x] 2.1 Adicionar endpoint `POST /api/generated-resume/export/pdf` em `Program.cs` que retorna 501 Not Implemented (stub para F-07)
- [x] 2.2 Adicionar endpoint `POST /api/generated-resume/export/docx` em `Program.cs` que retorna 501 Not Implemented (stub para F-08)
- [x] 2.3 Adicionar métodos `exportPdf(dto: BaseResumeDto): Observable<Blob>` e `exportDocx(dto: BaseResumeDto): Observable<Blob>` em `ApiService`

## 3. Frontend — Topo da tela do editor

- [x] 3.1 Substituir o `<h2 class="editor-title">` atual pelo cabeçalho superior com botão "Gerar Novo Currículo" à esquerda e botões "Exportar PDF" / "Exportar DOCX" à direita no `editor.html`
- [x] 3.2 Adicionar signal `hasExported = signal(false)` em `editor.ts` para rastrear se houve exportação na sessão atual
- [x] 3.3 Adicionar signal `showConfirmDialog = signal(false)` e handler `onGerarNovoCurriculo()` em `editor.ts` com lógica de confirmar ou navegar diretamente para `/gerar`
- [x] 3.4 Adicionar dialog de confirmação no `editor.html` (renderizado condicionalmente via `@if (showConfirmDialog())`) com os botões "Sair sem exportar" e "Cancelar"
- [x] 3.5 Atualizar `editor.css` com os estilos do cabeçalho superior e do dialog de confirmação

## 4. Frontend — Seções editáveis estruturadas

- [x] 4.1 Refatorar `editor.ts` para substituir `editedText = signal('')` por um signal com o DTO estruturado `editedResume = signal<BaseResumeDto | null>(null)` pré-carregado com o currículo gerado
- [x] 4.2 Substituir o `<textarea>` no `editor.html` por seções editáveis inline: Dados Pessoais (nome, email, telefone, cidade, LinkedIn, GitHub)
- [x] 4.3 Adicionar seção "Resumo Profissional" com campo de texto editável inline no `editor.html`
- [x] 4.4 Adicionar seção "Experiências" com campos cargo, empresa, datas, bullets dinâmicos (adicionar/remover bullet e experiência) no `editor.html`
- [x] 4.5 Adicionar seção "Educação" com campos instituição, curso, grau, datas e botões adicionar/remover no `editor.html`
- [x] 4.6 Adicionar seção "Skills" com lista de chips editáveis e botão "Adicionar skill" no `editor.html`
- [x] 4.7 Adicionar seção "Idiomas" com campos idioma + nível e botões adicionar/remover no `editor.html`
- [x] 4.8 Adicionar seção "Projetos" com campos nome, descrição, tecnologias, link e botões adicionar/remover no `editor.html`
- [x] 4.9 Remover a função `resumeToText()` de `editor.ts` ou convertê-la para aceitar o `BaseResumeDto` estruturado (já que o score é calculado a partir do texto serializado)
- [x] 4.10 Atualizar `editor.css` com os estilos das seções editáveis (labels, inputs inline, botões adicionar/remover, chips de skill)

## 5. Frontend — Persistência automática com debounce

- [x] 5.1 Adicionar lógica de auto-save com debounce de 800ms em `editor.ts`: sempre que `editedResume` mudar, chamar `saveGeneratedResume()` via `ApiService`
- [x] 5.2 Adicionar listener `window.beforeunload` em `editor.ts` (`ngOnInit`) para forçar persistência imediata ao fechar o app (cancelar debounce pendente e salvar síncronamente)
- [x] 5.3 Remover o destructor de debounce no `ngOnDestroy` de `editor.ts`

## 6. Frontend — Botão "Atualizar Score"

- [x] 6.1 Renomear o botão "Salvar e recalcular score" para "Atualizar Score" no `editor.html`
- [x] 6.2 Atualizar a função `save()` em `editor.ts` para serializar o `editedResume` estruturado em texto antes de chamar `calculateAtsScore()` (usando a função auxiliar de serialização)
- [x] 6.3 Mover o botão "Atualizar Score" para dentro do painel lateral (`editor-sidebar`) no `editor.html`, abaixo do componente `<app-ats-score-panel>`

## 7. Frontend — Botões de exportação

- [x] 7.1 Adicionar signals `isExportingPdf = signal(false)` e `isExportingDocx = signal(false)` em `editor.ts`
- [x] 7.2 Implementar handlers `onExportPdf()` e `onExportDocx()` em `editor.ts` que chamam os métodos do `ApiService`, disparam o download do Blob retornado, exibem loading e marcam `hasExported.set(true)` ao concluir
- [x] 7.3 Vincular os botões "Exportar PDF" e "Exportar DOCX" no `editor.html` com `[disabled]` e indicador de loading durante exportação

## 8. Frontend — Mensagem de redirecionamento na tela /gerar

- [x] 8.1 Ler `sessionStorage.getItem('editorRedirectMessage')` em `gerar.ts` no `ngOnInit` e armazenar em um signal `redirectMessage`
- [x] 8.2 Exibir a mensagem de redirecionamento no topo de `gerar.html` (condicionalmente via `@if`) e limpar o item do sessionStorage após exibir

