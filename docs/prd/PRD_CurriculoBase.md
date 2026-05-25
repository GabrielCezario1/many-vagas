# PRD — Currículo Base

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-02 — Currículo Base
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

O Currículo Base é a funcionalidade central de entrada de dados do ManyVagas. O usuário preenche suas informações profissionais uma única vez — organizadas em seções estruturadas — e essas informações ficam salvas para serem reutilizadas em todas as gerações futuras de currículos otimizados.

O objetivo é eliminar o retrabalho de redigitar o currículo a cada geração. O usuário cadastra nome, contato, experiências, educação, habilidades, idiomas e projetos; a partir daí, basta informar a descrição de uma nova vaga para obter um currículo customizado.

A tela apresenta um formulário com seções expansíveis e campos dinâmicos, permitindo adicionar e remover itens livremente. Ao salvar, os dados são persistidos e recarregados automaticamente nas próximas visitas.

---

## Pré-requisitos

### Pré-requisito — Ambiente configurado

O Currículo Base depende do backend ASP.NET Core em execução em `localhost:5000` com o banco SQLite inicializado (F-01).

```gherkin
Dado que o usuário acessa a tela de Currículo Base
E o backend não está acessível
Então a tela exibe uma mensagem de erro de conectividade
E o formulário não é exibido
E nenhuma ação de salvar está disponível
```

---

## Funcionalidade 1 — Dados Pessoais

A seção de Dados Pessoais reúne as informações de identificação e contato do usuário. É a primeira seção do formulário e contém os campos fundamentais para qualquer currículo.

---

### 1.1 Campos da seção

Os campos disponíveis são: **Nome Completo** (obrigatório), **Email** (obrigatório), **Telefone** (opcional), **Cidade** (opcional), **LinkedIn** (opcional) e **GitHub** (opcional).

```gherkin
Dado que o usuário acessa a tela de Currículo Base pela primeira vez
Quando a tela carrega
Então todos os campos de Dados Pessoais estão vazios
E cada campo exibe um placeholder explicativo
Exemplo: Nome Completo exibe "Ex: João da Silva", Email exibe "Ex: joao@email.com"
```

```gherkin
Dado que o usuário já salvou o currículo anteriormente
Quando acessa a tela de Currículo Base
Então todos os campos são pré-preenchidos com os dados salvos
```

---

### 1.2 Validação dos campos

```gherkin
Dado que o usuário tenta salvar o currículo
E o campo Email contém um valor com formato inválido
Então o campo Email fica destacado com borda vermelha
E exibe a mensagem: "Informe um email válido"
E o salvamento é bloqueado até a correção
```

```gherkin
Dado que o usuário preencheu o campo LinkedIn ou GitHub
E o valor informado não é uma URL válida
Quando tenta salvar
Então o campo inválido fica destacado com borda vermelha
E exibe a mensagem: "Informe uma URL válida (ex: https://linkedin.com/in/seu-perfil)"
```

---

## Funcionalidade 2 — Resumo Profissional

O Resumo Profissional é um campo de texto livre onde o usuário descreve brevemente sua trajetória, principais competências e objetivos profissionais. É opcional, mas utilizado pela IA para contextualizar a geração do currículo otimizado.

---

### 2.1 Campo de texto

```gherkin
Dado que o usuário acessa a seção Resumo Profissional
Quando a tela carrega sem dados salvos
Então o campo exibe um placeholder explicativo
Exemplo: "Ex: Desenvolvedor Backend com 5 anos de experiência em .NET e APIs REST, focado em sistemas de alta disponibilidade."
```

---

## Funcionalidade 3 — Experiências Profissionais

A seção de Experiências permite ao usuário cadastrar múltiplas experiências de trabalho. Cada experiência contém empresa, cargo, período e bullet points descrevendo as atividades e conquistas. Esta seção é obrigatória — ao menos uma experiência deve ser cadastrada para salvar o currículo.

---

### 3.1 Adicionar e remover experiências

```gherkin
Dado que o usuário está na seção de Experiências
Quando clica no botão "Adicionar Experiência"
Então um novo bloco de experiência é inserido abaixo dos existentes
E os campos do novo bloco estão vazios com placeholders
```

```gherkin
Dado que o usuário tem mais de uma experiência cadastrada
Quando clica no botão de remover de uma experiência específica
Então aquela experiência é removida da lista
E as demais permanecem intactas
```

```gherkin
Dado que o usuário tem apenas uma experiência cadastrada
Quando tenta removê-la
Então a experiência é removida normalmente
E ao tentar salvar sem nenhuma experiência, o sistema exibe a mensagem:
"Adicione ao menos uma experiência profissional para salvar."
```

---

### 3.2 Campos de cada experiência

Cada bloco de experiência contém: **Empresa** (obrigatório dentro do bloco), **Cargo** (obrigatório dentro do bloco), **Data de início** (mês e ano), **Data de fim** (mês e ano ou "Atualmente") e **Bullet points** (lista dinâmica, opcional).

```gherkin
Dado que o usuário está preenchendo uma experiência
Quando marca o campo "Data de fim" como "Atualmente"
Então o campo de data de fim é desabilitado e exibe o texto "Atualmente"
E ao salvar, o período é representado como "Jan 2023 — Atualmente"
```

```gherkin
Dado que o usuário preencheu data de início e data de fim
Quando ambas estão definidas
Então o sistema exibe o período formatado como "Mês Ano — Mês Ano"
Exemplo: "Mar 2021 — Dez 2023"
```

---

### 3.3 Bullet points de cada experiência

Cada experiência possui uma lista dinâmica de bullet points onde o usuário descreve atividades e conquistas. Esses bullets são a principal matéria-prima da otimização pela IA com a fórmula XYZ.

```gherkin
Dado que o usuário está em um bloco de experiência
Quando clica em "Adicionar bullet point"
Então um novo campo de texto é adicionado à lista de bullets daquela experiência
```

```gherkin
Dado que o usuário tem múltiplos bullet points em uma experiência
Quando clica no botão de remover ao lado de um bullet
Então aquele bullet é removido
E os demais permanecem
```

---

## Funcionalidade 4 — Educação

A seção de Educação permite cadastrar múltiplas formações acadêmicas. Cada entrada contém instituição, curso, grau e período. A seção é opcional.

---

### 4.1 Campos de cada formação

Cada bloco de educação contém: **Instituição**, **Curso**, **Grau** (ex: Bacharelado, Tecnólogo, MBA, Pós-graduação) e **Período** (mês/ano início — mês/ano fim ou "Atualmente").

```gherkin
Dado que o usuário está na seção Educação
Quando clica em "Adicionar Formação"
Então um novo bloco de educação é inserido com campos vazios e placeholders
Exemplo: Instituição exibe "Ex: Universidade de São Paulo", Curso exibe "Ex: Ciência da Computação"
```

---

## Funcionalidade 5 — Habilidades Técnicas

A seção de Habilidades Técnicas é uma lista dinâmica de tags onde o usuário cadastra suas competências. Esses itens são comparados com as exigências da vaga na análise de skill gaps (F-05). A seção é opcional.

---

### 5.1 Adicionar e remover skills

```gherkin
Dado que o usuário está na seção de Habilidades Técnicas
Quando digita uma skill e confirma (Enter ou botão "Adicionar")
Então a skill é adicionada à lista como uma tag
Exemplo: O usuário digita "Angular" → aparece a tag "Angular" na lista
```

```gherkin
Dado que o usuário tem skills cadastradas
Quando clica no ícone de remover de uma tag
Então aquela skill é removida da lista
```

---

## Funcionalidade 6 — Idiomas

A seção de Idiomas permite cadastrar múltiplos idiomas com seus respectivos níveis de proficiência. A seção é opcional.

---

### 6.1 Campos de cada idioma

Cada entrada de idioma contém: **Idioma** (texto livre, ex: "Inglês") e **Nível** (seleção entre: Básico, Intermediário, Avançado, Fluente, Nativo).

```gherkin
Dado que o usuário está na seção Idiomas
Quando clica em "Adicionar Idioma"
Então um novo bloco é inserido com campo de texto para o idioma e seletor de nível
E o seletor de nível exibe as opções: Básico, Intermediário, Avançado, Fluente, Nativo
```

---

## Funcionalidade 7 — Projetos

A seção de Projetos é opcional e permite cadastrar projetos pessoais ou relevantes para o portfólio. Cada projeto contém nome, descrição, tecnologias utilizadas e link.

---

### 7.1 Campos de cada projeto

Cada bloco de projeto contém: **Nome do projeto**, **Descrição**, **Tecnologias** (lista de tags, igual a skills) e **Link** (URL opcional).

```gherkin
Dado que o usuário está na seção Projetos
Quando clica em "Adicionar Projeto"
Então um novo bloco de projeto é inserido com campos vazios e placeholders
Exemplo: Nome exibe "Ex: App de controle financeiro", Link exibe "Ex: https://github.com/usuario/projeto"
```

---

## Funcionalidade 8 — Salvamento do Currículo

O botão "Salvar Currículo" persiste todos os dados do formulário no backend. O usuário recebe feedback imediato sobre o resultado da operação.

---

### 8.1 Salvar com sucesso

```gherkin
Dado que o usuário preencheu os campos obrigatórios (nome, email e ao menos 1 experiência)
Quando clica em "Salvar Currículo"
Então o botão exibe um estado de carregamento (loading) enquanto a requisição é processada
E ao concluir, um toast de sucesso aparece no canto da tela com a mensagem: "Currículo salvo com sucesso!"
E o toast desaparece após 3 segundos
```

---

### 8.2 Salvar com campos obrigatórios ausentes

```gherkin
Dado que o usuário não preencheu o nome completo ou o email
Quando clica em "Salvar Currículo"
Então o salvamento é bloqueado
E os campos obrigatórios ausentes ficam destacados com borda vermelha
E cada campo inválido exibe uma mensagem descritiva abaixo dele
E nenhuma requisição é enviada ao backend
```

```gherkin
Dado que o usuário não cadastrou nenhuma experiência
Quando clica em "Salvar Currículo"
Então o salvamento é bloqueado
E a seção de Experiências exibe a mensagem: "Adicione ao menos uma experiência profissional para salvar."
```

---

### 8.3 Falha de comunicação com o backend

```gherkin
Dado que o usuário clica em "Salvar Currículo"
E o backend não está acessível
Então o botão retorna ao estado normal após o timeout
E um toast de erro aparece com a mensagem: "Erro ao salvar. Verifique sua conexão e tente novamente."
E os dados preenchidos no formulário são preservados
```

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Carregamento inicial** | Ao abrir a tela, os dados salvos são carregados automaticamente. Enquanto carrega, o formulário exibe um estado de loading |
| **Primeiro acesso** | Formulário completamente vazio com placeholders explicativos em todos os campos |
| **Preservação de dados** | Ao tentar salvar com erro, nenhum dado preenchido é perdido |
| **Campos dinâmicos** | Experiências, educação, idiomas e projetos suportam quantidade ilimitada de itens |
| **Campos de URL** | LinkedIn, GitHub e link de projeto são validados como URL apenas quando preenchidos (não obrigatórios) |

---

## Resumo das Seções

```
┌────────────────────────────────────────────────────────┐
│                   Currículo Base                       │
├────────────────────────────────────────────────────────┤
│  [1] Dados Pessoais                                    │
│  Nome* │ Email* │ Telefone │ Cidade │ LinkedIn │ GitHub │
├────────────────────────────────────────────────────────┤
│  [2] Resumo Profissional                               │
│  Textarea livre                                        │
├────────────────────────────────────────────────────────┤
│  [3] Experiências Profissionais             [+ Adicionar]│
│  ┌──────────────────────────────────────────────────┐  │
│  │ Empresa* │ Cargo* │ Início │ Fim / Atualmente    │  │
│  │ • Bullet point 1                      [remover]  │  │
│  │ • Bullet point 2                      [remover]  │  │
│  │ [+ Adicionar bullet]                             │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  [4] Educação                               [+ Adicionar]│
│  Instituição │ Curso │ Grau │ Período                  │
├────────────────────────────────────────────────────────┤
│  [5] Habilidades Técnicas                              │
│  [Angular] [.NET] [SQL] [+ Adicionar]                  │
├────────────────────────────────────────────────────────┤
│  [6] Idiomas                                [+ Adicionar]│
│  Idioma │ Nível (Básico...Nativo)                      │
├────────────────────────────────────────────────────────┤
│  [7] Projetos                               [+ Adicionar]│
│  Nome │ Descrição │ Tecnologias │ Link                  │
├────────────────────────────────────────────────────────┤
│              [ Salvar Currículo ]                      │
└────────────────────────────────────────────────────────┘
```
