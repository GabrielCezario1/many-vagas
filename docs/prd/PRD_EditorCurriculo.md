# PRD — Editor de Currículo Gerado

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-06 — Editor de Currículo Gerado
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

O Editor de Currículo Gerado é a tela principal de revisão e ajuste do currículo otimizado pela IA. Após a geração (F-03), o usuário é redirecionado automaticamente para esta tela, onde encontra o currículo pré-carregado em seções estruturadas editáveis — as mesmas seções do Currículo Base (F-02).

O editor ocupa dois terços da tela. O terço restante, à direita, é um painel lateral permanente com o Score ATS comparativo (F-04) e a Análise de Skill Gaps (F-05). Essa configuração permite ao usuário editar o conteúdo e monitorar o impacto das mudanças no score sem perder contexto.

Ao finalizar a revisão, o usuário exporta o currículo em PDF ou DOCX diretamente da mesma tela. O currículo gerado é persistido no SQLite, garantindo que fechar e reabrir o app preserve o conteúdo do editor.

A tela é acessível pela rota `/editor`.

---

## Pré-requisitos

### Pré-requisito — Currículo gerado disponível

O editor só é acessível quando existe um currículo gerado salvo no banco SQLite — seja da sessão atual ou de uma sessão anterior.

```gherkin
Dado que o usuário tenta acessar /editor diretamente
E não existe nenhum currículo gerado salvo no banco
Então o sistema redireciona para /gerar
E exibe a mensagem: "Gere um currículo primeiro para acessar o editor."

Dado que o usuário tenta acessar /editor diretamente
E existe um currículo gerado salvo no banco de uma sessão anterior
Quando o editor carrega
Então o editor é pré-carregado com o currículo salvo anteriormente
E o score ATS e skill gaps do currículo anterior são exibidos no painel lateral
```

---

## Funcionalidade 1 — Layout da Tela

A tela do editor é dividida em duas áreas fixas: o editor de currículo (2/3 da largura) e o painel lateral com score e skill gaps (1/3 da largura).

---

### 1.1 Estrutura geral da tela

```gherkin
Dado que o usuário é redirecionado para o editor após a geração
Quando a tela carrega
Então exibe no topo:
  - Botão "Gerar Novo Currículo" (esquerda)
  - Botões "Exportar PDF" e "Exportar DOCX" (direita)
E a área principal é dividida em:
  - Editor de currículo (2/3 à esquerda), com as seções pré-carregadas
  - Painel lateral (1/3 à direita), com Score ATS e Skill Gaps
```

---

## Funcionalidade 2 — Editor de Seções

O editor exibe as mesmas seções do Currículo Base (dados pessoais, resumo, experiências, educação, skills, idiomas, projetos), pré-preenchidas com o conteúdo otimizado pela IA.

---

### 2.1 Pré-carregamento com o currículo gerado

```gherkin
Dado que a geração foi concluída com sucesso
Quando o editor carrega
Então todas as seções são pré-preenchidas com o conteúdo retornado pela IA
E os campos estão imediatamente editáveis (sem modo "somente leitura" inicial)
```

---

### 2.2 Edição de campos de texto

```gherkin
Dado que o editor está carregado
Quando o usuário clica em qualquer campo de texto (nome, cargo, bullet point, etc.)
Então o campo fica ativo para edição inline
E o usuário pode digitar, apagar e reformatar o conteúdo livremente
```

---

### 2.3 Campos dinâmicos

O editor mantém o comportamento dinâmico de todas as seções: o usuário pode adicionar e remover experiências, bullet points, skills, idiomas e projetos, com o mesmo comportamento do formulário de Currículo Base (F-02).

```gherkin
Dado que o usuário está no editor
Quando clica em "Adicionar bullet point" em uma experiência
Então um novo campo de texto vazio é inserido na lista de bullets daquela experiência

Dado que o usuário está no editor
Quando clica no ícone de remover ao lado de qualquer item dinâmico
Então aquele item é removido da lista
```

---

### 2.4 Persistência entre sessões

```gherkin
Dado que o usuário editou o currículo no editor
Quando navega para outra tela (ex: /curriculo-base) e retorna para /editor
Então todas as edições feitas estão preservadas
E o editor exibe o mesmo conteúdo que estava antes da navegação

Dado que o usuário editou o currículo no editor e fechou o app
Quando reabre o app e navega para /editor
Então o editor exibe o currículo com o conteúdo salvo no banco SQLite
E as edições feitas antes de fechar estão preservadas
```

---

## Funcionalidade 3 — Painel Lateral

O painel lateral permanente exibe o Score ATS comparativo (antes e depois) e a Análise de Skill Gaps. Ele está sempre visível durante a edição.

---

### 3.1 Botão "Atualizar Score"

O score não é recalculado automaticamente a cada edição. O usuário decide quando quer ver o score atualizado com suas modificações.

```gherkin
Dado que o usuário editou o conteúdo do currículo no editor
Quando clica no botão "Atualizar Score" no painel lateral
Então o sistema envia o conteúdo atual do editor ao backend para recálculo
E o score "Depois" é atualizado com o novo valor
E o breakdown das dimensões é atualizado
E o botão exibe estado de loading durante o recálculo
```

```gherkin
Dado que o usuário não realizou nenhuma edição
Quando visualiza o painel lateral
Então o botão "Atualizar Score" está visível mas indica que o score já está atualizado
```

---

## Funcionalidade 4 — Navegação de Volta

---

### 4.1 Botão "Gerar Novo Currículo"

```gherkin
Dado que o usuário está no editor
E não realizou nenhuma exportação
Quando clica em "Gerar Novo Currículo"
Então um diálogo de confirmação é exibido:
"Você ainda não exportou este currículo. Deseja sair mesmo assim?"
Com as opções: "Sair sem exportar" e "Cancelar"
```

```gherkin
Dado que o usuário clicou em "Sair sem exportar" no diálogo de confirmação
Quando a ação é confirmada
Então o sistema navega para a tela de Geração (F-03)
E o estado do editor é descartado
```

```gherkin
Dado que o usuário já exportou o currículo ao menos uma vez na sessão
Quando clica em "Gerar Novo Currículo"
Então o sistema navega diretamente para a tela de Geração (F-03)
E nenhum diálogo de confirmação é exibido
```

---

## Funcionalidade 5 — Botões de Exportação

Os botões de exportação ficam no topo da tela e disparam os fluxos de geração de PDF (F-07) e DOCX (F-08) com o conteúdo atual do editor.

---

### 5.1 Exportar PDF e DOCX

```gherkin
Dado que o editor está carregado com o currículo
Quando o usuário clica em "Exportar PDF"
Então o conteúdo atual do editor é enviado ao backend
E o download do arquivo PDF é iniciado automaticamente
E o botão exibe estado de loading durante a geração do arquivo

Dado que o usuário clica em "Exportar DOCX"
Então o mesmo fluxo ocorre para o formato DOCX
```

> ⚠️ Observação: Os detalhes completos do comportamento de exportação (nome do arquivo, loading, erros) estão definidos nos PRDs F-07 e F-08.

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Acesso sem geração** | Redireciona para `/gerar` com mensagem explicativa |
| **Persistência entre sessões** | Currículo gerado persiste no SQLite — fechar e reabrir o app não apaga o conteúdo do editor |
| **Score manual** | Score só recalcula ao clicar em "Atualizar Score" — nunca em tempo real |
| **Confirmação ao sair** | Diálogo de confirmação aparece ao tentar sair sem ter exportado |
| **Painel lateral fixo** | Score e Skill Gaps sempre visíveis durante a edição — sem colapsar |

---

## Resumo das Seções

```
┌──────────────────────────────────────────────────────────────────┐
│  [ Gerar Novo Currículo ]         [ Exportar PDF ] [ Exportar DOCX ]│
├────────────────────────────────────┬─────────────────────────────┤
│                                    │   Score ATS                 │
│   EDITOR DE CURRÍCULO (2/3)        │   Antes: 42  Depois: 78     │
│                                    │   ████████░░  🟡 Bom        │
│   Dados Pessoais                   │                             │
│   ─────────────────────            │   Keyword Match  ████  32/40│
│   João Silva | joao@email.com      │   Verbos Ação    ████  18/25│
│                                    │   Quantificação  ███   12/20│
│   Resumo Profissional              │   Completude     ████  15/15│
│   ─────────────────────            │                             │
│   [texto editável...]              │   [ Atualizar Score ]       │
│                                    │─────────────────────────────│
│   Experiências                     │   Skill Gaps                │
│   ─────────────────────            │   Você tem 5 de 8 pedidas   │
│   • Bullet 1 [editável]            │                             │
│   • Bullet 2 [editável]            │   ✅ Angular  ✅ .NET        │
│   [+ Adicionar bullet]             │   ✅ SQL  ✅ Git  ✅ REST     │
│                                    │                             │
│   Skills | Idiomas | Projetos...   │   ❌ Docker  ❌ Kubernetes   │
└────────────────────────────────────┴─────────────────────────────┘
```
