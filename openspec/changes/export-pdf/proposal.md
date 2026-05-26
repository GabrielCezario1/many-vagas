## Why

O usuário precisa de uma forma rápida e padronizada de baixar o currículo gerado em formato PDF, adequado para candidaturas a vagas. Sem essa funcionalidade, o fluxo de geração do currículo não entrega valor concreto — o resultado fica preso no editor sem saída utilizável.

## What Changes

- Adição do botão "Exportar PDF" na barra superior do Editor de Currículo (F-06), ao lado do botão "Exportar DOCX"
- Novo endpoint no backend responsável por receber o conteúdo do editor, aplicar um template PDF profissional fixo e retornar o arquivo binário
- Download automático pelo navegador após geração bem-sucedida, com nome de arquivo no padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf`
- Bloqueio de ambos os botões de exportação (PDF e DOCX) durante qualquer geração em andamento
- Seções sem conteúdo são omitidas automaticamente do documento gerado

## Capabilities

### New Capabilities

- `pdf-export`: Geração e download de arquivo PDF do currículo a partir do conteúdo atual do editor, com template fixo e profissional

### Modified Capabilities

- `editor-curriculo`: Adição do botão "Exportar PDF" na barra superior e lógica de bloqueio coordenado entre os botões de exportação

## Impact

- **Frontend**: Componente do editor (F-06) recebe novo botão e lógica de estado de carregamento/bloqueio coordenado
- **Backend**: Novo endpoint `POST /api/resume/export/pdf` que recebe o conteúdo do currículo e retorna o arquivo PDF como stream binário
- **Dependências**: Requer biblioteca de geração de PDF no backend (ex.: `QuestPDF` ou `iText` para .NET)
- **Pré-requisito de sessão**: A exportação depende de um currículo gerado e carregado no editor — usuários sem currículo na sessão são redirecionados para F-03
