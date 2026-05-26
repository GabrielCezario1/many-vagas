## ADDED Requirements

### Requirement: Editor page acessível apenas com currículo gerado

O sistema SHALL redirecionar o usuário para `/gerar` ao tentar acessar `/editor` quando não existe nenhum currículo gerado salvo no banco SQLite, exibindo a mensagem "Gere um currículo primeiro para acessar o editor."

#### Scenario: Acesso direto sem currículo gerado

- **WHEN** usuário navega diretamente para `/editor`
- **AND** não existe currículo gerado salvo no banco
- **THEN** sistema redireciona para `/gerar`
- **AND** exibe a mensagem: "Gere um currículo primeiro para acessar o editor."

#### Scenario: Acesso com currículo gerado de sessão anterior

- **WHEN** usuário navega para `/editor`
- **AND** existe currículo gerado salvo no banco de uma sessão anterior
- **THEN** editor carrega com o currículo previamente salvo
- **AND** o score ATS e skill gaps do currículo anterior são exibidos no painel lateral

---

### Requirement: Layout da tela do editor

A tela `/editor` SHALL exibir no topo os controles de navegação e exportação, e dividir a área principal em editor (2/3) e painel lateral (1/3), ambos com altura total disponível.

#### Scenario: Estrutura do topo

- **WHEN** a tela do editor carrega
- **THEN** o topo exibe o botão "Gerar Novo Currículo" à esquerda
- **AND** os botões "Exportar PDF" e "Exportar DOCX" à direita

#### Scenario: Divisão da área principal

- **WHEN** a tela do editor carrega
- **THEN** a área principal está dividida em editor de currículo ocupando 2/3 da largura à esquerda
- **AND** painel lateral ocupando 1/3 da largura à direita
- **AND** ambas as áreas são visíveis simultaneamente sem necessidade de scroll horizontal

---

### Requirement: Redirecionamento automático após geração

O sistema SHALL redirecionar automaticamente o usuário para `/editor` após a conclusão bem-sucedida da geração de currículo (F-03).

#### Scenario: Redirecionamento pós-geração

- **WHEN** a geração do currículo pela IA é concluída com sucesso
- **THEN** sistema navega automaticamente para `/editor`
- **AND** o editor está pré-carregado com o currículo recém-gerado

---

### Requirement: Navegação "Gerar Novo Currículo" com confirmação

O sistema SHALL exibir um diálogo de confirmação ao clicar em "Gerar Novo Currículo" quando o currículo ainda não foi exportado na sessão atual.

#### Scenario: Clicar em "Gerar Novo Currículo" sem exportação prévia

- **WHEN** usuário clica em "Gerar Novo Currículo"
- **AND** nenhuma exportação foi realizada na sessão atual
- **THEN** sistema exibe diálogo: "Você ainda não exportou este currículo. Deseja sair mesmo assim?"
- **AND** diálogo oferece as opções "Sair sem exportar" e "Cancelar"

#### Scenario: Confirmar saída sem exportação

- **WHEN** usuário clica em "Sair sem exportar" no diálogo
- **THEN** sistema navega para `/gerar`
- **AND** o estado do editor é descartado

#### Scenario: Cancelar saída

- **WHEN** usuário clica em "Cancelar" no diálogo
- **THEN** diálogo é fechado e o editor permanece ativo com o conteúdo intacto

#### Scenario: Navegar após ter exportado

- **WHEN** usuário clica em "Gerar Novo Currículo"
- **AND** ao menos uma exportação foi realizada na sessão atual
- **THEN** sistema navega diretamente para `/gerar` sem exibir diálogo

---

### Requirement: Persistência do currículo editado entre sessões

O sistema SHALL persistir automaticamente o conteúdo do editor no banco SQLite para que o currículo seja recuperado ao reabrir o app.

#### Scenario: Preservação ao navegar para outra tela e retornar

- **WHEN** usuário edita o currículo no editor
- **AND** navega para outra rota (ex: `/curriculo-base`)
- **AND** retorna para `/editor`
- **THEN** todas as edições feitas estão preservadas no editor

#### Scenario: Preservação ao fechar e reabrir o app

- **WHEN** usuário edita o currículo e fecha o app
- **AND** reabre o app e navega para `/editor`
- **THEN** editor exibe o currículo com o conteúdo salvo no banco SQLite
- **AND** as edições feitas antes de fechar estão preservadas
