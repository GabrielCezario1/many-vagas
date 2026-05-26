## ADDED Requirements

### Requirement: Formulário reativo com 7 seções estruturadas
O sistema SHALL renderizar a página `/curriculo-base` com um formulário reativo Angular contendo as seções: Dados Pessoais, Resumo Profissional, Experiências Profissionais, Educação, Habilidades Técnicas, Idiomas e Projetos.

#### Scenario: Primeiro acesso ao formulário
- **WHEN** o usuário acessa `/curriculo-base` pela primeira vez (sem dados salvos)
- **THEN** todos os campos estão vazios com placeholders explicativos
- **AND** o formulário exibe um estado de loading enquanto verifica a existência de dados salvos

#### Scenario: Acesso com dados já salvos
- **WHEN** o usuário acessa `/curriculo-base` com currículo previamente salvo
- **THEN** todos os campos são pré-preenchidos com os dados salvos
- **AND** os FormArrays (Experiências, Educação, Idiomas, Projetos) exibem todos os itens persistidos

---

### Requirement: Campos de Dados Pessoais com validação
O sistema SHALL exibir os campos Nome Completo (obrigatório), Email (obrigatório, formato válido), Telefone (opcional), Cidade (opcional), LinkedIn (opcional, URL válida quando preenchida) e GitHub (opcional, URL válida quando preenchida).

#### Scenario: Email com formato inválido bloqueando salvamento
- **WHEN** o usuário informa um email com formato inválido e tenta salvar
- **THEN** o campo Email fica destacado com borda vermelha
- **AND** exibe a mensagem "Informe um email válido" abaixo do campo
- **AND** nenhuma requisição HTTP é enviada ao backend

#### Scenario: LinkedIn com URL inválida bloqueando salvamento
- **WHEN** o usuário informa um valor não-URL no campo LinkedIn e tenta salvar
- **THEN** o campo LinkedIn fica destacado com borda vermelha
- **AND** exibe a mensagem "Informe uma URL válida (ex: https://linkedin.com/in/seu-perfil)"

#### Scenario: Nome obrigatório ausente
- **WHEN** o usuário tenta salvar sem preencher o Nome Completo
- **THEN** o campo Nome Completo fica destacado com borda vermelha
- **AND** exibe mensagem de campo obrigatório
- **AND** nenhuma requisição HTTP é enviada

---

### Requirement: Seção de Experiências com FormArray dinâmico
O sistema SHALL permitir adicionar e remover múltiplas experiências profissionais, cada uma com Empresa (obrigatório), Cargo (obrigatório), Data de Início, Data de Fim (ou "Atualmente") e lista de bullet points.

#### Scenario: Adicionar nova experiência
- **WHEN** o usuário clica em "Adicionar Experiência"
- **THEN** um novo bloco de experiência vazio é inserido na lista com seus campos e placeholders

#### Scenario: Remover experiência existente
- **WHEN** o usuário clica no botão de remover de uma experiência
- **THEN** aquela experiência é removida do FormArray
- **AND** as demais experiências permanecem intactas

#### Scenario: Campo "Atualmente" desabilita data de fim
- **WHEN** o usuário marca a opção "Atualmente" na data de fim de uma experiência
- **THEN** o campo de data de fim fica desabilitado e exibe o texto "Atualmente"

#### Scenario: Salvar sem nenhuma experiência
- **WHEN** o usuário tenta salvar com FormArray de experiências vazio
- **THEN** a seção Experiências exibe "Adicione ao menos uma experiência profissional para salvar."
- **AND** o salvamento é bloqueado

---

### Requirement: Bullet points dinâmicos por experiência
O sistema SHALL permitir adicionar e remover bullet points dentro de cada experiência profissional.

#### Scenario: Adicionar bullet point
- **WHEN** o usuário clica em "Adicionar bullet point" dentro de uma experiência
- **THEN** um novo campo de texto é inserido na lista de bullets daquela experiência

#### Scenario: Remover bullet point
- **WHEN** o usuário clica no botão de remover ao lado de um bullet
- **THEN** aquele bullet é removido
- **AND** os demais bullets da mesma experiência permanecem

---

### Requirement: Seções opcionais com FormArray (Educação, Idiomas, Projetos)
O sistema SHALL permitir adicionar e remover itens nas seções de Educação (Instituição, Curso, Grau, Período), Idiomas (Idioma, Nível com opções: Básico/Intermediário/Avançado/Fluente/Nativo) e Projetos (Nome, Descrição, Tecnologias como tags, Link URL opcional).

#### Scenario: Adicionar formação acadêmica
- **WHEN** o usuário clica em "Adicionar Formação"
- **THEN** um novo bloco de educação com campos vazios e placeholders é inserido

#### Scenario: Adicionar idioma com seletor de nível
- **WHEN** o usuário clica em "Adicionar Idioma"
- **THEN** um novo bloco com campo de texto do idioma e seletor de nível é inserido
- **AND** o seletor exibe as opções: Básico, Intermediário, Avançado, Fluente, Nativo

#### Scenario: Adicionar projeto com link opcional
- **WHEN** o usuário clica em "Adicionar Projeto"
- **THEN** um novo bloco de projeto com campos vazios e placeholders é inserido

---

### Requirement: Habilidades Técnicas como lista de tags
O sistema SHALL permitir ao usuário adicionar habilidades técnicas via campo de texto + Enter (ou botão "Adicionar"), exibidas como tags removíveis.

#### Scenario: Adicionar skill via Enter
- **WHEN** o usuário digita uma skill e pressiona Enter ou clica em "Adicionar"
- **THEN** a skill é adicionada como tag na lista
- **AND** o campo de entrada é limpo

#### Scenario: Remover skill existente
- **WHEN** o usuário clica no ícone de remover de uma tag
- **THEN** aquela skill é removida da lista

---

### Requirement: Salvamento com feedback visual
O sistema SHALL persistir o currículo via `POST /api/base-resume` ao clicar em "Salvar Currículo", exibindo estado de loading durante a requisição e toast de resultado ao concluir.

#### Scenario: Salvar com sucesso
- **WHEN** todos os campos obrigatórios estão válidos e o usuário clica em "Salvar Currículo"
- **THEN** o botão exibe estado de loading enquanto a requisição é processada
- **AND** ao concluir, um toast de sucesso exibe "Currículo salvo com sucesso!"
- **AND** o toast desaparece após 3 segundos
- **AND** o sistema redireciona automaticamente para `/gerar`

#### Scenario: Falha de conectividade ao salvar
- **WHEN** o backend está inacessível e o usuário tenta salvar
- **THEN** o botão retorna ao estado normal após o timeout
- **AND** um toast de erro exibe "Erro ao salvar. Verifique sua conexão e tente novamente."
- **AND** os dados preenchidos no formulário são preservados

---

### Requirement: Indisponibilidade do backend no carregamento
O sistema SHALL detectar falha de conectividade no carregamento inicial da página e exibir mensagem de erro ao invés do formulário.

#### Scenario: Backend inacessível ao carregar a tela
- **WHEN** o usuário acessa `/curriculo-base` e o backend não está acessível
- **THEN** a tela exibe mensagem de erro de conectividade
- **AND** o formulário não é exibido
- **AND** nenhuma ação de salvar está disponível
