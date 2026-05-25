# PRD — Geração com IA

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-03 — Geração com IA
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

A Geração com IA é o núcleo do ManyVagas. O usuário informa a descrição da vaga desejada, escolhe o idioma do currículo a ser gerado (PT-BR ou EN), e o sistema combina essas informações com o currículo base salvo para produzir um currículo otimizado para ATS via Azure OpenAI (modelo gpt-4o).

O processo aplica a **fórmula XYZ** nos bullet points de experiência (*Accomplished X, measured by Y, by doing Z*), injeta as palavras-chave relevantes da vaga e adapta toda a linguagem ao idioma escolhido. O resultado é um currículo estruturado, pronto para edição e exportação.

Ao concluir a geração, o sistema redireciona automaticamente para o editor (F-06), onde o usuário pode revisar e ajustar antes de exportar. Junto com o currículo otimizado, o sistema retorna a análise de skills (quais batem com a vaga e quais estão faltando), consumida pelas features F-04 e F-05.

---

## Funcionalidade 1 — Tela de Geração

A tela de geração é o ponto de entrada do fluxo principal do produto. O usuário cola a descrição da vaga, seleciona o idioma e dispara a geração.

---

### 1.1 Campo de descrição da vaga

```gherkin
Dado que o usuário acessa a tela de Geração
Quando a tela carrega
Então exibe um campo de texto grande para colar a descrição da vaga
E um placeholder explicativo: "Cole aqui a descrição completa da vaga..."
E um seletor de idioma com as opções PT-BR e EN
E o botão "Gerar Currículo" visível e habilitado
```

---

### 1.2 Seletor de idioma

O idioma define em qual língua o currículo otimizado será gerado. A seleção é obrigatória e afeta todo o conteúdo produzido pela IA.

```gherkin
Dado que o usuário está na tela de Geração
Quando visualiza o seletor de idioma
Então as opções disponíveis são: "Português (PT-BR)" e "Inglês (EN)"
E nenhuma opção está pré-selecionada inicialmente

Dado que o usuário não selecionou um idioma
Quando clica em "Gerar Currículo"
Então o seletor de idioma fica destacado
E exibe a mensagem: "Selecione o idioma do currículo antes de gerar."
E a geração não é iniciada
```

---

### 1.3 Geração sem currículo base salvo

Quando o currículo base não foi preenchido, a geração ainda é permitida. A IA utiliza exclusivamente as informações da vaga para produzir o currículo, sem dados pessoais ou experiências pré-existentes.

```gherkin
Dado que o usuário não salvou nenhum currículo base (F-02)
Quando acessa a tela de Geração
Então a tela exibe um aviso informativo (não bloqueante):
"Você ainda não preencheu seu Currículo Base. O currículo será gerado apenas com as informações da vaga."
E o botão "Gerar Currículo" permanece habilitado
E o usuário pode prosseguir normalmente
```

---

## Funcionalidade 2 — Processamento pela IA

Após disparar a geração, o sistema envia o currículo base (quando disponível), a descrição da vaga e o idioma ao Azure OpenAI. O processamento pode levar entre 10 e 30 segundos.

---

### 2.1 Estado de loading com mensagens animadas

Durante o processamento, o usuário acompanha o progresso por meio de mensagens que se alternam em sequência, comunicando as etapas da otimização.

```gherkin
Dado que o usuário clicou em "Gerar Currículo" com idioma selecionado
Quando a requisição é enviada ao backend
Então o botão "Gerar Currículo" é desabilitado imediatamente
E a tela exibe as seguintes mensagens em sequência animada:
  1. "Analisando a vaga..."
  2. "Aplicando fórmula XYZ..."
  3. "Otimizando keywords..."
E o usuário não consegue editar o campo da vaga nem o seletor de idioma durante o processamento
```

---

### 2.2 O que a IA produz

A IA recebe o currículo base estruturado + a descrição da vaga + o idioma, e retorna:
- O currículo otimizado com a mesma estrutura do currículo base, com bullets reescritos na fórmula XYZ, keywords da vaga injetadas e linguagem adaptada ao idioma
- A lista `matchedSkills`: skills do currículo base que aparecem na vaga
- A lista `missingSkills`: skills exigidas na vaga que não estão no currículo base

> ⚠️ Observação: O conteúdo exato dos campos gerados pela IA depende da qualidade da descrição da vaga fornecida. Descrições muito curtas podem resultar em currículos menos otimizados — comportamento esperado, não um erro do sistema.

---

### 2.3 Geração concluída com sucesso

```gherkin
Dado que o processamento pela IA foi concluído com sucesso
Quando o backend retorna o currículo otimizado
Então o usuário é redirecionado automaticamente para a tela do Editor (F-06)
E o editor é pré-carregado com o currículo gerado
E o score ATS (F-04) e os skill gaps (F-05) ficam disponíveis na tela do editor
```

---

## Funcionalidade 3 — Tratamento de Erros

A geração pode falhar por timeout ou por indisponibilidade da API do Azure OpenAI. Em ambos os casos, o usuário recebe feedback claro sem perder o conteúdo digitado.

---

### 3.1 Timeout da requisição

```gherkin
Dado que o usuário iniciou a geração
Quando o backend não recebe resposta da IA dentro do tempo limite configurado
Então o loading é encerrado
E a tela exibe a mensagem de erro: "A geração demorou mais que o esperado. Tente novamente."
E o botão "Gerar Currículo" é reabilitado
E o campo da vaga e o seletor de idioma retornam ao estado editável com os valores anteriores preservados
```

---

### 3.2 Falha na API do Azure OpenAI

```gherkin
Dado que o usuário iniciou a geração
Quando o backend retorna um erro da API do Azure OpenAI (ex: quota excedida, serviço indisponível)
Então o loading é encerrado
E a tela exibe a mensagem de erro: "Não foi possível gerar o currículo. Verifique a configuração da API e tente novamente."
E o botão "Gerar Currículo" é reabilitado
E os dados do formulário são preservados
```

---

### 3.3 Falha de conectividade com o backend

```gherkin
Dado que o usuário iniciou a geração
E o backend não está acessível
Quando o frontend tenta enviar a requisição
Então o loading é encerrado imediatamente
E a tela exibe: "Erro de conexão. Verifique se o servidor está rodando e tente novamente."
E o botão "Gerar Currículo" é reabilitado
```

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Botão desabilitado durante geração** | O botão "Gerar Currículo" fica desabilitado do clique até o redirecionamento ou erro |
| **Campos bloqueados durante geração** | Campo da vaga e seletor de idioma ficam desabilitados durante o processamento |
| **Preservação em caso de erro** | Em qualquer cenário de falha, o conteúdo do campo de vaga e a seleção de idioma são mantidos |
| **Redirecionamento automático** | O sucesso sempre resulta em redirecionamento para F-06 — o usuário não permanece na tela de geração após o sucesso |
| **Aviso de currículo base ausente** | Informativo e não bloqueante — o usuário decide se quer prosseguir mesmo assim |

---

## Resumo das Seções

```
┌────────────────────────────────────────────────────────┐
│              Gerar Novo Currículo                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│   ┌──────────────────────────────────────────────┐     │
│   │  Cole aqui a descrição completa da vaga...   │     │
│   │                                              │     │
│   │  (textarea grande, sem limite mínimo)        │     │
│   └──────────────────────────────────────────────┘     │
│                                                        │
│   Idioma do currículo:  [ PT-BR ]  [ EN ]              │
│                                                        │
│   ⚠️ [aviso se currículo base não preenchido]          │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│   Estado de loading:                                   │
│   ⟳  "Analisando a vaga..."                            │
│   ⟳  "Aplicando fórmula XYZ..."                        │
│   ⟳  "Otimizando keywords..."                          │
│                                                        │
├────────────────────────────────────────────────────────┤
│             [ Gerar Currículo ]                        │
│   (desabilitado durante processamento)                 │
└────────────────────────────────────────────────────────┘
```
