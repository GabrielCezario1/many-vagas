## MODIFIED Requirements

### Requirement: Exportar DOCX a partir do editor

O sistema SHALL exportar o conteúdo atual do editor como arquivo DOCX quando o usuário clicar em "Exportar DOCX", iniciando o download automaticamente com o nome `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx` e exibindo estado de loading durante a geração.

#### Scenario: Exportar DOCX com sucesso

- **WHEN** usuário clica em "Exportar DOCX" com o editor carregado
- **THEN** o conteúdo atual do editor é enviado ao backend via `POST /api/resume/export/docx`
- **AND** o botão "Exportar DOCX" exibe spinner em substituição ao ícone
- **AND** o botão "Exportar DOCX" é desabilitado
- **AND** o botão "Exportar PDF" é desabilitado
- **AND** o download do arquivo `.docx` é iniciado automaticamente no browser
- **AND** o nome do arquivo segue o padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx`
- **AND** um toast verde exibe "Arquivo baixado com sucesso!"
- **AND** ambos os botões retornam ao estado habilitado com ícones originais
- **AND** a sessão registra que ao menos uma exportação foi realizada

#### Scenario: Falha na exportação DOCX

- **WHEN** usuário clica em "Exportar DOCX"
- **AND** o backend retorna erro durante a geração
- **THEN** nenhum download é iniciado
- **AND** um toast vermelho exibe "Erro ao gerar o arquivo. Tente novamente."
- **AND** ambos os botões retornam ao estado habilitado com ícones originais

---

### Requirement: Estado de loading dos botões de exportação

Os botões "Exportar PDF" e "Exportar DOCX" SHALL exibir estado visual de loading e ficar desabilitados durante o processamento de qualquer exportação, prevenindo cliques duplos e exportações simultâneas.

#### Scenario: Loading durante exportação DOCX

- **WHEN** usuário clica em "Exportar DOCX"
- **AND** a exportação está em andamento
- **THEN** o botão "Exportar DOCX" exibe spinner
- **AND** ambos os botões de exportação estão desabilitados durante o processamento
- **AND** ao concluir (sucesso ou erro), ambos os botões retornam ao estado normal
