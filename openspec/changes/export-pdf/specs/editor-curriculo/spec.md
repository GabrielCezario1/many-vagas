## ADDED Requirements

### Requirement: Botão Exportar PDF na barra superior do editor
O editor SHALL exibir um botão "Exportar PDF" na barra superior, à direita, ao lado do botão "Exportar DOCX", quando há currículo carregado na sessão.

#### Scenario: Botão visível e habilitado no estado inicial
- **WHEN** o usuário está na tela do Editor com um currículo carregado
- **THEN** o botão "Exportar PDF" está visível e habilitado na barra superior à direita, exibindo ícone de PDF e rótulo "Exportar PDF"

### Requirement: Exportação PDF inicia download automático
O sistema SHALL, quando o usuário clicar em "Exportar PDF", enviar o conteúdo atual do editor ao endpoint `POST /api/resume/export/pdf` e iniciar o download automático do arquivo retornado pelo navegador.

#### Scenario: Clique inicia geração e download
- **WHEN** o usuário clica em "Exportar PDF" com o currículo preenchido
- **THEN** o botão exibe um spinner, ambos os botões de exportação (PDF e DOCX) são desabilitados, e o conteúdo atual do editor é enviado ao backend para geração

#### Scenario: Download bem-sucedido
- **WHEN** o backend retorna o PDF com sucesso
- **THEN** o navegador inicia o download automaticamente com o nome `curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf`, um toast verde "Arquivo baixado com sucesso!" é exibido e ambos os botões de exportação voltam ao estado habilitado com os ícones originais

#### Scenario: Falha na geração
- **WHEN** o backend retorna erro durante a geração do PDF
- **THEN** nenhum download é iniciado, um toast vermelho "Erro ao gerar o arquivo. Tente novamente." é exibido e ambos os botões de exportação voltam ao estado habilitado

### Requirement: Bloqueio coordenado dos botões de exportação
O sistema SHALL bloquear simultaneamente os botões "Exportar PDF" e "Exportar DOCX" enquanto qualquer operação de exportação estiver em andamento.

#### Scenario: Exportação PDF bloqueia botão DOCX
- **WHEN** uma exportação PDF está em progresso
- **THEN** o botão "Exportar DOCX" está desabilitado

#### Scenario: Exportação DOCX bloqueia botão PDF
- **WHEN** uma exportação DOCX está em progresso
- **THEN** o botão "Exportar PDF" está desabilitado
