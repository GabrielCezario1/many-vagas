## Why

O usuário precisa baixar o currículo gerado em formato Word (.docx) para submetê-lo em vagas que exigem documento editável, ou para continuar editando fora do sistema. Sem essa funcionalidade, o fluxo de geração não cobre o caso de uso de candidaturas que requerem arquivos editáveis — o PDF gerado em F-07 não substitui essa necessidade.

## What Changes

- Adição do botão "Exportar DOCX" na barra superior do Editor de Currículo (F-06), à direita do botão "Exportar PDF"
- Novo endpoint no backend responsável por receber o conteúdo do editor, aplicar um template DOCX profissional fixo e retornar o arquivo binário `.docx`
- Download automático pelo navegador após geração bem-sucedida, com nome de arquivo no padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx`
- Bloqueio de ambos os botões de exportação (PDF e DOCX) durante qualquer geração em andamento
- Seções sem conteúdo são omitidas automaticamente do documento gerado
- Template DOCX preserva hierarquia com estilos Word editáveis (Título 1, Título 2, bullets)

## Capabilities

### New Capabilities

- `docx-export`: Geração e download de arquivo DOCX do currículo a partir do conteúdo atual do editor, com template fixo, profissional e totalmente editável no Word

### Modified Capabilities

- `editor-curriculo`: Adição do botão "Exportar DOCX" na barra superior e lógica de bloqueio coordenado entre os botões de exportação (compartilhada com F-07)

## Impact

- **Frontend**: Componente do editor (F-06) recebe novo botão "Exportar DOCX" e lógica de estado de carregamento/bloqueio coordenado com o botão "Exportar PDF"
- **Backend**: Novo endpoint `POST /api/resume/export/docx` que recebe o conteúdo do currículo e retorna o arquivo `.docx` como stream binário
- **Dependências**: Requer biblioteca de geração de DOCX no backend (ex.: `DocumentFormat.OpenXml` ou `NPOI` para .NET)
- **Pré-requisito de sessão**: A exportação depende de um currículo gerado e carregado no editor — usuários sem currículo na sessão são redirecionados para F-03
