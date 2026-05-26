## Why

Após a geração do currículo otimizado pela IA (F-03), o usuário precisa de uma tela dedicada para revisar, ajustar e exportar o resultado — sem perder o contexto do Score ATS e dos Skill Gaps já calculados. Sem este editor, o usuário não consegue refinar o currículo gerado nem exportá-lo para PDF ou DOCX.

## What Changes

- Introduz a rota `/editor` com uma tela dividida em editor (2/3) e painel lateral (1/3)
- Editor pré-carregado com o currículo gerado pela IA, com todos os campos imediatamente editáveis inline
- Campos dinâmicos (adicionar/remover bullet points, experiências, skills, idiomas, projetos) com o mesmo comportamento do Currículo Base (F-02)
- Persistência automática do currículo editado no SQLite — fechar e reabrir o app preserva o conteúdo
- Guard na rota `/editor`: redireciona para `/gerar` se não houver currículo gerado salvo
- Painel lateral fixo (nunca colapsa) exibindo Score ATS comparativo (antes/depois) e Skill Gaps
- Botão "Atualizar Score" no painel lateral para recalcular o score com o conteúdo atual do editor (não há recálculo automático)
- Botão "Gerar Novo Currículo" com diálogo de confirmação se o currículo ainda não foi exportado na sessão
- Botões "Exportar PDF" e "Exportar DOCX" no topo da tela (integram com F-07 e F-08)

## Capabilities

### New Capabilities

- `editor-page`: Tela principal do editor — layout 2/3 + 1/3, guard de acesso, pré-carregamento do currículo gerado, persistência SQLite entre sessões e navegação "Gerar Novo Currículo" com confirmação
- `editor-secoes`: Seções editáveis do currículo (dados pessoais, resumo, experiências, educação, skills, idiomas, projetos) com edição inline e campos dinâmicos
- `editor-painel-lateral`: Painel lateral com Score ATS comparativo (antes/depois com breakdown por dimensão) e Skill Gaps, além do botão "Atualizar Score"
- `editor-exportacao`: Botões "Exportar PDF" e "Exportar DOCX" no topo da tela com estado de loading e integração com F-07/F-08

### Modified Capabilities

## Impact

- **Frontend (Angular)**: Nova página `EditorPage` na rota `/editor`; guard `editor.guard.ts` já existe e precisa ser adaptado; componentes de seções editáveis reutilizando lógica do Currículo Base (F-02)
- **Backend (.NET)**: Novo endpoint para recalcular o ATS Score a partir do conteúdo atual do editor (reutiliza `AtsScoreService`); endpoints de exportação PDF/DOCX acionados pelos botões (F-07/F-08)
- **Banco de dados**: Tabela `GeneratedResume` no SQLite já existe (F-03); o editor lê e persiste nela
- **Dependências**: Requer F-03 (geração), F-04 (score ATS), F-05 (skill gaps) implementados; F-07 e F-08 (exportação) serão integrados pelos botões desta tela
