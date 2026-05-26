## ADDED Requirements

### Requirement: Pré-carregamento do currículo gerado no editor

O sistema SHALL pré-preencher todas as seções do editor com o conteúdo retornado pela IA após a geração, com todos os campos imediatamente editáveis — sem modo "somente leitura" inicial.

#### Scenario: Carregamento após geração bem-sucedida

- **WHEN** o editor carrega após geração concluída
- **THEN** todas as seções estão pré-preenchidas com o conteúdo otimizado pela IA
- **AND** os campos estão imediatamente disponíveis para edição inline

---

### Requirement: Seções editáveis do currículo

O editor SHALL exibir as mesmas seções do Currículo Base (F-02): dados pessoais, resumo profissional, experiências, educação, skills, idiomas e projetos — todas editáveis inline.

#### Scenario: Edição de campo de texto

- **WHEN** usuário clica em qualquer campo de texto (nome, cargo, bullet point, etc.)
- **THEN** o campo fica ativo para edição inline
- **AND** usuário pode digitar, apagar e reformatar o conteúdo livremente

---

### Requirement: Campos dinâmicos — adicionar itens

O editor SHALL permitir adicionar novos itens dinâmicos (bullet points, experiências, educações, skills, idiomas, projetos) com o mesmo comportamento do formulário do Currículo Base (F-02).

#### Scenario: Adicionar bullet point em experiência

- **WHEN** usuário clica em "Adicionar bullet point" em uma experiência
- **THEN** um novo campo de texto vazio é inserido na lista de bullets daquela experiência

#### Scenario: Adicionar nova experiência

- **WHEN** usuário clica em "Adicionar experiência"
- **THEN** um novo bloco de experiência vazio é inserido na seção de experiências

#### Scenario: Adicionar skill

- **WHEN** usuário clica em "Adicionar skill" na seção de skills
- **THEN** um novo campo de skill vazio é inserido na lista

---

### Requirement: Campos dinâmicos — remover itens

O editor SHALL permitir remover qualquer item dinâmico (bullet points, experiências, educações, skills, idiomas, projetos) através de um ícone de remoção ao lado do item.

#### Scenario: Remover item dinâmico

- **WHEN** usuário clica no ícone de remover ao lado de qualquer item dinâmico
- **THEN** aquele item é removido da lista imediatamente
