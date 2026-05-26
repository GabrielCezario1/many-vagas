## Why

O usuário precisa entender rapidamente quais competências exigidas pela vaga ele já possui e quais ainda faltam no seu perfil. Essa informação é o principal insight de autoconhecimento do ManyVagas e é gerada gratuitamente como parte do output da IA (F-03) — sem custo adicional de requisição.

## What Changes

- Adiciona a seção **Skill Gaps** no painel lateral do editor (F-06), imediatamente abaixo do breakdown de Score ATS (F-04)
- Exibe contagem resumida: "Você tem X de Y skills pedidas"
- Exibe `matchedSkills` como tags verdes (✅) indicando compatibilidade
- Exibe `missingSkills` como tags vermelhas (❌) indicando lacunas
- Trata estados especiais: sem currículo base, lista vazia de matched/missing, vaga sem skills identificáveis
- Consome exclusivamente os dados já retornados pela geração com IA — nenhum endpoint novo

## Capabilities

### New Capabilities

- `skill-gaps-panel`: Seção visual no painel lateral do editor que exibe a análise de skill gaps com contagem resumida, tags coloridas de skills com match e skills faltando, e mensagens de estado especial

### Modified Capabilities

<!-- Sem alterações em capabilities existentes -->

## Impact

- **Frontend**: Novo componente/seção no painel lateral do editor (`EditorComponent` ou equivalente)
- **Dados**: Leitura dos campos `matchedSkills` e `missingSkills` já presentes no estado da geração (F-03)
- **Backend**: Nenhuma alteração — dados já são retornados em `GenerateResumeResponse`
- **Navegação**: Link "Preencher agora" aponta para a tela de Currículo Base (F-02)
