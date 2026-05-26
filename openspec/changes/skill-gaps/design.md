## Context

O editor (F-06) usa Angular standalone components com signals (`@angular/core` ≥ 18). O painel lateral já renderiza `<app-ats-score-panel>` via `<aside class="editor-sidebar">` em `editor.html`. O componente `Editor` carrega `GeneratedResumeDto` no `ngOnInit` através de `api.getGeneratedResume()`; esse DTO já possui os campos `matchedSkills: string[]` e `missingSkills: string[]`. Não há chamada adicional ao backend — os dados já estão disponíveis. O padrão arquitetural vigente é: componente de painel isolado com `input()` signals, adicionado ao `imports[]` do `Editor` e renderizado no template.

## Goals / Non-Goals

**Goals:**
- Criar o componente `SkillGapsPanelComponent` seguindo o mesmo padrão do `AtsScorePanelComponent`
- Expor os dados via signals de input (`matchedSkills`, `missingSkills`, `hasBaseResume`)
- Renderizar contagem resumida, tags verdes (matched) e tags vermelhas (missing)
- Tratar estados especiais: sem currículo base, listas vazias, vaga sem skills
- Inserir o componente no `editor.html` abaixo do `<app-ats-score-panel>`

**Non-Goals:**
- Edição ou alteração da lista de skill gaps pelo usuário
- Chamada de endpoint adicional ao backend
- Persistência das skill gaps além da sessão de geração
- Filtragem ou agrupamento de skills por categoria

## Decisions

### Componente standalone isolado
Criar `frontend/src/app/components/skill-gaps-panel/` com `skill-gaps-panel.ts`, `skill-gaps-panel.html` e `skill-gaps-panel.css`. Alternativa descartada: expandir `AtsScorePanelComponent` — violaria o princípio de responsabilidade única e aumentaria acoplamento.

### Inputs via `input()` signals
O `Editor` expõe `matchedSkills = signal<string[]>([])` e `missingSkills = signal<string[]>([])` preenchidos quando `getGeneratedResume()` retorna. O `SkillGapsPanelComponent` recebe esses valores via `input<string[]>()`. Alternativa descartada: injetar `ApiService` no componente de painel — quebraria a separação de responsabilidades (painel não faz requisições).

### `hasBaseResume` como input booleano
Para o estado especial "sem currículo base", o `Editor` já carrega o `BaseResume` via `api.getBaseResume()`; o resultado booleano é passado como input `hasBaseResume`. Se `null` (ainda carregando), o painel não exibe o aviso.

### Posição no template
O `<app-skill-gaps-panel>` é adicionado diretamente dentro do `<aside class="editor-sidebar">`, após `<app-ats-score-panel>`, sem wrapper extra.

## Risks / Trade-offs

- **Dados ainda carregando**: `matchedSkills` e `missingSkills` começam como arrays vazios; o painel pode renderizar brevemente o estado "vazia" antes dos dados chegarem. Mitigação: exibir a seção somente se `generatedResume !== null` (passado via input `generated`).
- **Vaga sem skills**: a IA pode retornar ambas as listas vazias — o painel exibe a mensagem "Nenhuma skill identificada na vaga." Aceito como comportamento correto.
- **Link "Preencher agora"**: usa `RouterLink` apontando para `/curriculo-base`. Requer que a rota exista — já implementada em F-02.
