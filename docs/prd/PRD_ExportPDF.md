# PRD — Exportação PDF

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-07 — Exportação PDF
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

A Exportação PDF permite ao usuário baixar o currículo otimizado e editado em formato PDF com um único clique. O arquivo é gerado pelo sistema com um template profissional e limpo, usando o conteúdo atual do editor no momento da exportação.

O download é iniciado automaticamente pelo navegador após o processamento. O usuário não precisa configurar nenhum layout, fonte ou estilo — o template é fixo e padronizado para garantir um resultado visualmente consistente e adequado para candidaturas.

A funcionalidade é acessada exclusivamente pela barra superior do Editor de Currículo (F-06), por meio do botão "Exportar PDF". O nome do arquivo gerado é automático, seguindo o padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf`.

---

## Pré-requisitos

### Pré-requisito — Currículo gerado na sessão

A exportação só está disponível quando há um currículo gerado e carregado no editor (F-06). Não existe exportação independente do fluxo de geração.

```gherkin
Dado que o usuário acessa a tela de Exportação PDF diretamente
E não há currículo gerado na sessão atual
Então o sistema redireciona para a tela de Geração (F-03)
E exibe a mensagem: "Gere um currículo primeiro para exportar."
```

---

## Funcionalidade 1 — Botão de Exportação PDF

O botão "Exportar PDF" está localizado na barra superior do Editor de Currículo (F-06), à direita, ao lado do botão "Exportar DOCX". Ao ser clicado, inicia o processo de geração e download do arquivo PDF com o conteúdo atual do editor.

---

### 1.1 Estado inicial do botão

```gherkin
Dado que o usuário está na tela do Editor (F-06) com um currículo carregado
Quando a tela é exibida
Então o botão "Exportar PDF" está habilitado e visível na barra superior à direita
E o botão exibe o ícone de PDF com o rótulo "Exportar PDF"
```

---

### 1.2 Clique no botão — início da geração

```gherkin
Dado que o usuário está na tela do Editor com o currículo preenchido
Quando o usuário clica em "Exportar PDF"
Então o botão "Exportar PDF" exibe um spinner em substituição ao ícone
E o botão "Exportar PDF" é desabilitado
E o botão "Exportar DOCX" é desabilitado
E o sistema envia o conteúdo atual do editor para geração do arquivo
```

---

## Funcionalidade 2 — Geração e Download do Arquivo

O sistema processa o conteúdo do currículo, aplica o template PDF profissional e retorna o arquivo binário para download automático pelo navegador.

---

### 2.1 Download bem-sucedido

```gherkin
Dado que o usuário clicou em "Exportar PDF" e o sistema processou com sucesso
Quando o arquivo PDF é gerado
Então o navegador inicia o download automaticamente
E o nome do arquivo segue o padrão: curriculo-{CargoDesejado}-{YYYY-MM-DD}.pdf
E um toast verde é exibido: "Arquivo baixado com sucesso!"
E o botão "Exportar PDF" volta ao estado habilitado com o ícone original
E o botão "Exportar DOCX" volta ao estado habilitado
Exemplo: "curriculo-Desenvolvedor-Frontend-2026-05-25.pdf"
```

---

### 2.2 Falha na geração

```gherkin
Dado que o usuário clicou em "Exportar PDF"
Quando ocorre um erro durante a geração do arquivo no sistema
Então nenhum download é iniciado
E um toast vermelho é exibido: "Erro ao gerar o arquivo. Tente novamente."
E o botão "Exportar PDF" volta ao estado habilitado com o ícone original
E o botão "Exportar DOCX" volta ao estado habilitado
```

---

## Funcionalidade 3 — Template do PDF

O template PDF é fixo, profissional e limpo. O usuário não tem opções de customização de layout, fonte ou cores. O conteúdo do currículo é distribuído nas seções do template na ordem definida pelo sistema.

---

### 3.1 Estrutura do cabeçalho

```gherkin
Dado que o PDF é gerado com sucesso
Quando o usuário abre o arquivo
Então o topo do documento exibe o cabeçalho com:
  - Nome completo em destaque (fonte grande)
  - Cargo Desejado abaixo do nome
  - Email, Telefone e Localidade na linha seguinte
E o cabeçalho ocupa a faixa superior da primeira página
Exemplo: "João Silva | Desenvolvedor Frontend | joao@email.com | +55 11 99999-9999 | São Paulo, SP"
```

---

### 3.2 Ordem das seções no documento

```gherkin
Dado que o PDF é gerado com o conteúdo do editor
Quando o usuário visualiza o arquivo
Então as seções aparecem na seguinte ordem:
  1. Cabeçalho (Dados Pessoais)
  2. Resumo Profissional
  3. Experiências Profissionais
  4. Educação
  5. Habilidades (Skills)
  6. Idiomas
  7. Projetos
E seções sem conteúdo preenchido são omitidas do documento
```

---

### 3.3 Seção sem conteúdo

```gherkin
Dado que o usuário não preencheu a seção "Projetos" no editor
Quando o PDF é gerado
Então a seção "Projetos" não aparece no documento
E as demais seções são exibidas normalmente
```

---

## Comportamentos Gerais

| Comportamento | Regra |
|---|---|
| **Bloqueio durante geração** | Ambos os botões de exportação (PDF e DOCX) são desabilitados enquanto qualquer geração estiver em andamento |
| **Nomeação automática** | O nome do arquivo usa o campo "Cargo Desejado" — espaços são substituídos por hífens |
| **Seções vazias** | Seções sem conteúdo são omitidas do PDF gerado |
| **Template fixo** | Não há opções de customização de layout, fonte ou cores para o usuário |
| **Conteúdo capturado** | O PDF reflete o conteúdo do editor no momento do clique — edições posteriores não alteram o arquivo já baixado |

---

## Resumo das Seções

```
┌──────────────────────────────────────────────────────────────┐
│  [Gerar Novo Currículo]    [Exportar PDF ⊙] [Exportar DOCX]  │  ← Barra superior F-06
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   (conteúdo do editor — F-06)                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Arquivo gerado (visualização do PDF):
┌────────────────────────────────────────────┐
│  João Silva                                │
│  Desenvolvedor Frontend                    │
│  joao@email.com · +55 11 99999 · SP        │
├────────────────────────────────────────────┤
│  Resumo Profissional                       │
│  ...                                       │
├────────────────────────────────────────────┤
│  Experiências                              │
│  ...                                       │
├────────────────────────────────────────────┤
│  Educação · Skills · Idiomas · Projetos    │
└────────────────────────────────────────────┘
```
