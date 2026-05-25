# PRD — Score ATS

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-04 — Score ATS
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

O Score ATS fornece ao usuário um indicador objetivo de quão bem o currículo está alinhado às exigências da vaga sob a perspectiva de sistemas ATS (Applicant Tracking Systems). O score é calculado por um algoritmo heurístico no backend — sem custo adicional de API — em quatro dimensões: keyword match, verbos de ação, quantificação e completude de seções.

O score é apresentado no painel lateral do editor (F-06), exibindo dois valores lado a lado: o score do currículo base (antes da geração) e o score do currículo otimizado (após a geração). Essa comparação permite ao usuário visualizar concretamente o quanto a otimização pela IA melhorou a aderência do currículo à vaga.

Cada score é acompanhado de um rótulo de interpretação por faixa (Crítico, Fraco, Bom, Excelente) e do breakdown detalhado das quatro dimensões com suas respectivas barras de progresso.

---

## Pré-requisitos

### Pré-requisito — Geração concluída

O Score ATS depende da geração ter sido executada (F-03). Sem isso, apenas o score do currículo base é calculável — e somente se houver currículo base salvo.

```gherkin
Dado que o usuário acessa o editor (F-06) após uma geração bem-sucedida
Quando o painel lateral carrega
Então exibe tanto o score do currículo base quanto o score do currículo otimizado
```

```gherkin
Dado que o usuário nunca salvou um currículo base (F-02)
E a geração foi realizada sem currículo base
Quando o painel lateral carrega
Então o score "Antes" exibe "—" (indisponível)
E somente o score do currículo gerado é exibido
```

---

## Funcionalidade 1 — Exibição do Score Principal

O score principal é apresentado como um número de 0 a 100 com uma barra de progresso colorida e um rótulo de interpretação. Dois scores são exibidos lado a lado: antes (currículo base) e depois (currículo otimizado).

---

### 1.1 Score antes e depois

```gherkin
Dado que o editor está carregado com currículo gerado e currículo base disponível
Quando o painel lateral de score é exibido
Então mostra dois blocos lado a lado:
  - Bloco "Antes": score do currículo base (ex: 42/100) com barra e rótulo
  - Bloco "Depois": score do currículo otimizado (ex: 78/100) com barra e rótulo
E a diferença entre os dois é destacada (ex: "+36 pontos")
```

---

### 1.2 Cores e rótulos por faixa

A cor da barra de progresso e o rótulo textual variam conforme a pontuação, indicando visualmente a qualidade do score.

```gherkin
Dado que um score é calculado
Quando o valor está entre 0 e 40
Então a barra é vermelha 🔴 e o rótulo exibe "Crítico"

Dado que um score é calculado
Quando o valor está entre 41 e 60
Então a barra é laranja 🟠 e o rótulo exibe "Fraco"

Dado que um score é calculado
Quando o valor está entre 61 e 80
Então a barra é amarela 🟡 e o rótulo exibe "Bom"

Dado que um score é calculado
Quando o valor está entre 81 e 100
Então a barra é verde 🟢 e o rótulo exibe "Excelente"
```

---

## Funcionalidade 2 — Breakdown por Dimensão

Abaixo do score principal, o painel exibe o detalhamento nas quatro dimensões do algoritmo. Cada dimensão mostra sua pontuação proporcional e uma barra de progresso individual.

---

### 2.1 As quatro dimensões

| Dimensão | Peso | O que mede |
|---|---|---|
| Keyword Match | 40% | Quantas palavras-chave da vaga estão presentes no currículo |
| Verbos de Ação | 25% | Quantos bullet points começam com verbos de ação fortes |
| Quantificação | 20% | Presença de números, percentuais e métricas nos bullet points |
| Completude | 15% | Seções obrigatórias preenchidas (dados pessoais, experiências, skills) |

```gherkin
Dado que o painel lateral está aberto
Quando o usuário visualiza o breakdown
Então vê quatro linhas, cada uma com:
  - Nome da dimensão
  - Barra de progresso proporcional ao score daquela dimensão
  - Valor percentual daquela dimensão (ex: "32/40")
Exemplo:
  Keyword Match    ████████░░  32/40
  Verbos de Ação   ██████░░░░  18/25
  Quantificação    ████░░░░░░  12/20
  Completude       ███████████ 15/15
```

---

### 2.2 Breakdown exibido para os dois scores

```gherkin
Dado que os dois scores (antes e depois) estão disponíveis
Quando o usuário expande o breakdown
Então os valores de cada dimensão são mostrados para ambos os currículos
E o usuário consegue comparar o desempenho por dimensão
```

---

## Funcionalidade 3 — Score Indisponível

Quando não há dados suficientes para calcular uma das pontuações, o sistema exibe um estado de indisponibilidade claro.

---

### 3.1 Currículo base ausente

```gherkin
Dado que a geração foi feita sem currículo base salvo
Quando o painel lateral exibe o bloco "Antes"
Então o score "Antes" exibe "—"
E abaixo exibe a mensagem: "Preencha o Currículo Base para ver a comparação."
E o link "Preencher agora" leva à tela de Currículo Base (F-02)
```

---

### 3.2 Erro no cálculo

```gherkin
Dado que o backend falhou ao calcular o score
Quando o painel lateral tenta exibir o resultado
Então exibe a mensagem: "Não foi possível calcular o score."
E o botão "Tentar novamente" reprocessa o cálculo sem recarregar a página inteira
```

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Cálculo sem chamada à IA** | O score é calculado exclusivamente por algoritmo heurístico no backend — sem custo de API |
| **Atualização após edição** | Se o usuário editar o currículo no editor (F-06) e salvar, o score "Depois" é recalculado automaticamente |
| **Score base fixo** | O score do currículo base (bloco "Antes") não muda com edições no editor — reflete sempre o currículo original |
| **Exibição no painel lateral** | O score não ocupa tela inteira — está no painel lateral do editor, sempre visível durante a edição |

---

## Resumo das Seções

```
┌────────────────────────────────────────────────────────┐
│         Painel Lateral — Score ATS                     │
├──────────────────────┬─────────────────────────────────┤
│   ANTES              │   DEPOIS                        │
│   42 / 100           │   78 / 100                      │
│   ████░░░░░░         │   ████████░░   +36 pts          │
│   🟠 Fraco           │   🟡 Bom                        │
├──────────────────────┴─────────────────────────────────┤
│  Breakdown                                             │
│                                                        │
│  Keyword Match    ████████░░  32/40                    │
│  Verbos de Ação   ██████░░░░  18/25                    │
│  Quantificação    ████░░░░░░  12/20                    │
│  Completude       ███████████ 15/15                    │
└────────────────────────────────────────────────────────┘
```
