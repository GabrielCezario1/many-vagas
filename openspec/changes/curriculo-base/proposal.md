## Why

O ManyVagas precisa de um ponto central de entrada de dados profissionais. Sem o Currículo Base, o usuário teria que redigitar suas informações a cada geração de currículo, tornando o produto inviável para uso contínuo. Esta é a funcionalidade F-02 e pré-requisito direto para as features de Geração por IA (F-03), Score ATS (F-04) e Skill Gaps (F-05).

## What Changes

- Criação da rota `/curriculo-base` com formulário estruturado em seções
- Novo endpoint `POST /api/resume/base` para persistir os dados no banco SQLite via EF Core
- Novo endpoint `GET /api/resume/base` para recuperar dados salvos no carregamento inicial
- Formulário com 7 seções dinâmicas: Dados Pessoais, Resumo Profissional, Experiências, Educação, Habilidades Técnicas, Idiomas e Projetos
- Validação client-side com bloqueio de submit em campos obrigatórios ausentes ou com formato inválido
- Redirecionamento automático para `/gerar` após salvar com sucesso
- Feedback visual com toast de sucesso/erro e estado de loading no botão de salvar

## Capabilities

### New Capabilities

- `curriculo-base-form`: Formulário completo de entrada de dados do currículo com todas as 7 seções, validação, estados de loading/erro e redirecionamento pós-salvar
- `curriculo-base-api`: Endpoints de leitura e escrita do currículo base no backend ASP.NET Core

### Modified Capabilities

<!-- Nenhuma capability existente tem seus requisitos alterados por esta mudança. -->

## Impact

- **Frontend (Angular)**: nova página `CurriculoBasePage`, novo componente de formulário reativo, serviço de currículo expandido com métodos `getBase()` e `saveBase()`
- **Backend (ASP.NET Core)**: novos endpoints REST em `ResumeController`, entidade `BaseResume` já existente no EF Core (migração `InitialCreate` já aplicada)
- **Banco de dados**: tabela `BaseResumes` já criada pela migração inicial; nenhuma alteração de schema necessária
- **Rotas**: adição de `/curriculo-base` ao roteador Angular e proteção pela lógica de `editor.guard.ts` se aplicável
