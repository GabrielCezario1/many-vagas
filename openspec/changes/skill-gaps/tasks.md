## 1. Componente SkillGapsPanelComponent

- [x] 1.1 Criar `frontend/src/app/components/skill-gaps-panel/skill-gaps-panel.ts` como standalone component com inputs `matchedSkills`, `missingSkills` e `hasBaseResume`
- [x] 1.2 Criar `frontend/src/app/components/skill-gaps-panel/skill-gaps-panel.html` com template: contagem resumida, subseção "Você já tem:" com tags verdes, subseção "Faltam:" com tags vermelhas
- [x] 1.3 Criar `frontend/src/app/components/skill-gaps-panel/skill-gaps-panel.css` com estilos para tags verdes, tags vermelhas e flex-wrap
- [x] 1.4 Implementar `computed` `totalSkills` (matchedSkills.length + missingSkills.length) e `summaryText` ("Você tem X de Y skills pedidas") no componente

## 2. Estados Especiais no Template

- [x] 2.1 Adicionar bloco `@if` para o caso de ambas as listas vazias: exibir "Nenhuma skill identificada na vaga."
- [x] 2.2 Adicionar bloco para `matchedSkills` vazia com `hasBaseResume = true`: exibir "Nenhuma skill do seu currículo foi identificada na vaga."
- [x] 2.3 Adicionar bloco para `missingSkills` vazia (com skills identificadas): exibir "Você tem todas as skills identificadas na vaga! 🎉"
- [x] 2.4 Adicionar bloco para `hasBaseResume = false`: exibir mensagem informativa e link `RouterLink` para `/curriculo-base` com texto "Preencher agora"

## 3. Integração no Editor

- [x] 3.1 Adicionar signals `matchedSkills = signal<string[]>([])` e `missingSkills = signal<string[]>([])` e `hasBaseResume = signal<boolean | null>(null)` ao `Editor` em `editor.ts`
- [x] 3.2 Preencher `matchedSkills` e `missingSkills` com os valores de `GeneratedResumeDto` no callback de `getGeneratedResume()` em `loadScores()`
- [x] 3.3 Preencher `hasBaseResume` com `true/false` no callback de `getBaseResume()` em `loadScores()`
- [x] 3.4 Importar `SkillGapsPanelComponent` no array `imports` do `Editor`
- [x] 3.5 Adicionar `<app-skill-gaps-panel>` no `editor.html` dentro do `<aside class="editor-sidebar">`, após `<app-ats-score-panel>`, passando os três inputs
