# PRD — Análise de Skill Gaps

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-05 — Análise de Skill Gaps
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

A Análise de Skill Gaps exibe ao usuário, de forma visual e imediata, quais competências exigidas pela vaga ele já possui e quais ainda faltam no seu perfil. Essa comparação é o principal insight de autoconhecimento do ManyVagas — permite que o usuário entenda suas lacunas antes mesmo de enviar o currículo.

A análise é apresentada no painel lateral do editor (F-06), logo abaixo do breakdown do Score ATS (F-04). Os dados são fornecidos diretamente pelo output da geração com IA (F-03) — sem chamada adicional ao backend — nas listas `matchedSkills` (skills que batem com a vaga) e `missingSkills` (skills que a vaga pede e não estão no currículo).

---

## Pré-requisitos

### Pré-requisito — Geração concluída

A análise depende da geração ter sido executada (F-03), pois os dados de skill gap são retornados como parte do output da IA.

```gherkin
Dado que o usuário acessa o editor (F-06) após uma geração bem-sucedida
Quando o painel lateral carrega
Então a seção de Skill Gaps é exibida abaixo do breakdown de Score ATS
```

---

## Funcionalidade 1 — Contagem Resumida

O topo da seção exibe uma frase de resumo que comunica de forma rápida o posicionamento do usuário em relação à vaga.

---

### 1.1 Resumo numérico

```gherkin
Dado que a geração retornou matchedSkills e missingSkills
Quando o painel lateral exibe a seção de Skill Gaps
Então a primeira linha da seção exibe:
"Você tem X de Y skills pedidas"
Onde X = total de matchedSkills e Y = total de matchedSkills + missingSkills
Exemplo: "Você tem 5 de 8 skills pedidas"
```

---

## Funcionalidade 2 — Skills com Match

As skills que o usuário possui e que a vaga exige são exibidas como tags verdes, indicando compatibilidade.

---

### 2.1 Exibição das skills que batem

```gherkin
Dado que a geração retornou matchedSkills com ao menos um item
Quando o painel lateral exibe a seção
Então cada skill da lista matchedSkills é exibida como uma tag verde com ícone ✅
Exemplo: ✅ Angular  ✅ .NET  ✅ SQL Server
```

```gherkin
Dado que a geração retornou matchedSkills vazia
E o currículo base tem skills cadastradas
Quando o painel exibe a seção
Então abaixo do rótulo "Você tem" exibe a mensagem: "Nenhuma skill do seu currículo foi identificada na vaga."
```

---

## Funcionalidade 3 — Skills Faltando

As skills que a vaga exige mas que não estão no currículo do usuário são exibidas como tags vermelhas, indicando lacunas a desenvolver.

---

### 3.1 Exibição das skills ausentes

```gherkin
Dado que a geração retornou missingSkills com ao menos um item
Quando o painel lateral exibe a seção
Então cada skill da lista missingSkills é exibida como uma tag vermelha com ícone ❌
Exemplo: ❌ Docker  ❌ Kubernetes  ❌ Azure DevOps
```

```gherkin
Dado que a geração retornou missingSkills vazia
Quando o painel exibe a seção
Então abaixo do rótulo "Faltam" exibe a mensagem: "Você tem todas as skills identificadas na vaga! 🎉"
```

---

## Funcionalidade 4 — Estados Especiais

---

### 4.1 Sem currículo base salvo

```gherkin
Dado que a geração foi feita sem currículo base (F-02 não preenchido)
Quando o painel exibe a seção de Skill Gaps
Então exibe a mensagem informativa:
"Preencha o Currículo Base para ver as skills que você já tem."
E um link "Preencher agora" leva à tela de Currículo Base (F-02)
E a lista de missingSkills (extraída da vaga) é exibida normalmente como tags vermelhas
```

---

### 4.2 Vaga sem skills identificáveis

```gherkin
Dado que a descrição da vaga não continha skills identificáveis pela IA
Quando o painel exibe a seção de Skill Gaps
Então exibe a mensagem: "Nenhuma skill identificada na vaga."
E nenhuma tag é exibida
```

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Sem endpoint adicional** | Os dados de skill gap são parte do output da geração (F-03) — nenhuma requisição extra é feita |
| **Posição no painel** | Seção imediatamente abaixo do breakdown de Score ATS (F-04), no mesmo painel lateral |
| **Tags responsivas** | As tags se ajustam ao espaço disponível no painel (wrap automático para múltiplas linhas) |
| **Não editável** | O usuário não edita a lista de skill gaps — ela é puramente informativa |

---

## Resumo das Seções

```
┌────────────────────────────────────────────────────────┐
│         Painel Lateral — Skill Gaps                    │
│         (abaixo do Score ATS)                          │
├────────────────────────────────────────────────────────┤
│  Você tem 5 de 8 skills pedidas                        │
├────────────────────────────────────────────────────────┤
│  Você já tem:                                          │
│  ✅ Angular   ✅ .NET   ✅ SQL Server                   │
│  ✅ Git        ✅ REST APIs                             │
├────────────────────────────────────────────────────────┤
│  Faltam:                                               │
│  ❌ Docker   ❌ Kubernetes   ❌ Azure DevOps            │
└────────────────────────────────────────────────────────┘
```
