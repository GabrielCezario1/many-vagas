## ADDED Requirements

### Requirement: Exportar PDF a partir do editor

O sistema SHALL exportar o conteúdo atual do editor como arquivo PDF quando o usuário clicar em "Exportar PDF", iniciando o download automaticamente e exibindo estado de loading durante a geração.

#### Scenario: Exportar PDF com sucesso

- **WHEN** usuário clica em "Exportar PDF" com o editor carregado
- **THEN** o conteúdo atual do editor é enviado ao backend
- **AND** o botão exibe estado de loading durante a geração do arquivo
- **AND** o download do arquivo PDF é iniciado automaticamente no browser
- **AND** a sessão registra que ao menos uma exportação foi realizada (para controle do diálogo de confirmação)

---

### Requirement: Exportar DOCX a partir do editor

O sistema SHALL exportar o conteúdo atual do editor como arquivo DOCX quando o usuário clicar em "Exportar DOCX", iniciando o download automaticamente e exibindo estado de loading durante a geração.

#### Scenario: Exportar DOCX com sucesso

- **WHEN** usuário clica em "Exportar DOCX" com o editor carregado
- **THEN** o conteúdo atual do editor é enviado ao backend
- **AND** o botão exibe estado de loading durante a geração do arquivo
- **AND** o download do arquivo DOCX é iniciado automaticamente no browser
- **AND** a sessão registra que ao menos uma exportação foi realizada (para controle do diálogo de confirmação)

---

### Requirement: Estado de loading dos botões de exportação

Os botões "Exportar PDF" e "Exportar DOCX" SHALL exibir estado visual de loading e ficar desabilitados durante o processamento de uma exportação, prevenindo cliques duplos.

#### Scenario: Loading durante exportação

- **WHEN** usuário clica em um botão de exportação
- **AND** a exportação está em andamento
- **THEN** o botão clicado exibe indicador de loading
- **AND** o botão está desabilitado durante o processamento
- **AND** ao concluir, o botão retorna ao estado normal
