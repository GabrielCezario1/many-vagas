# PRD — Exportação DOCX

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-08 — Exportação DOCX
> **Versão:** 1.0
> **Data:** 2026-05-25

---

> [!WARNING]
> **Sem Testes:** Este projeto não implementa testes automatizados de nenhum tipo (unitários, integração, e2e, spec). Nenhuma task, seção ou artefato de testes deve ser criado ou planejado para este módulo.

## Visão Geral

A Exportação DOCX permite ao usuário baixar o currículo otimizado e editado em formato Word (.docx), possibilitando edições futuras fora do sistema. O arquivo é gerado com o conteúdo atual do editor no momento da exportação, aplicando um template profissional e limpo equivalente ao do PDF (F-07).

O download é iniciado automaticamente pelo navegador após o processamento. O template é fixo e padronizado — o usuário não configura layout ou estilo. O formato DOCX é especialmente útil quando a vaga exige envio do currículo como documento editável.

A funcionalidade é acessada exclusivamente pela barra superior do Editor de Currículo (F-06), por meio do botão "Exportar DOCX". O nome do arquivo gerado é automático, seguindo o padrão `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx`.

---

## Pré-requisitos

### Pré-requisito — Currículo gerado na sessão

A exportação só está disponível quando há um currículo gerado e carregado no editor (F-06). Não existe exportação independente do fluxo de geração.

```gherkin
Dado que o usuário tenta acessar a Exportação DOCX diretamente
E não há currículo gerado na sessão atual
Então o sistema redireciona para a tela de Geração (F-03)
E exibe a mensagem: "Gere um currículo primeiro para exportar."
```

---

## Funcionalidade 1 — Botão de Exportação DOCX

O botão "Exportar DOCX" está localizado na barra superior do Editor de Currículo (F-06), à direita, ao lado do botão "Exportar PDF". Ao ser clicado, inicia o processo de geração e download do arquivo DOCX com o conteúdo atual do editor.

---

### 1.1 Estado inicial do botão

```gherkin
Dado que o usuário está na tela do Editor (F-06) com um currículo carregado
Quando a tela é exibida
Então o botão "Exportar DOCX" está habilitado e visível na barra superior à direita
E o botão exibe o ícone de documento Word com o rótulo "Exportar DOCX"
```

---

### 1.2 Clique no botão — início da geração

```gherkin
Dado que o usuário está na tela do Editor com o currículo preenchido
Quando o usuário clica em "Exportar DOCX"
Então o botão "Exportar DOCX" exibe um spinner em substituição ao ícone
E o botão "Exportar DOCX" é desabilitado
E o botão "Exportar PDF" é desabilitado
E o sistema envia o conteúdo atual do editor para geração do arquivo
```

---

## Funcionalidade 2 — Geração e Download do Arquivo

O sistema processa o conteúdo do currículo, aplica o template DOCX profissional e retorna o arquivo binário para download automático pelo navegador.

---

### 2.1 Download bem-sucedido

```gherkin
Dado que o usuário clicou em "Exportar DOCX" e o sistema processou com sucesso
Quando o arquivo DOCX é gerado
Então o navegador inicia o download automaticamente
E o nome do arquivo segue o padrão: curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx
E um toast verde é exibido: "Arquivo baixado com sucesso!"
E o botão "Exportar DOCX" volta ao estado habilitado com o ícone original
E o botão "Exportar PDF" volta ao estado habilitado
Exemplo: "curriculo-Desenvolvedor-Frontend-2026-05-25.docx"
```

---

### 2.2 Falha na geração

```gherkin
Dado que o usuário clicou em "Exportar DOCX"
Quando ocorre um erro durante a geração do arquivo no sistema
Então nenhum download é iniciado
E um toast vermelho é exibido: "Erro ao gerar o arquivo. Tente novamente."
E o botão "Exportar DOCX" volta ao estado habilitado com o ícone original
E o botão "Exportar PDF" volta ao estado habilitado
```

---

## Funcionalidade 3 — Template do DOCX

O template DOCX é fixo, profissional e limpo — equivalente em estrutura ao template PDF (F-07). O usuário não tem opções de customização. O conteúdo do currículo é distribuído nas seções do template na ordem definida pelo sistema, preservando a hierarquia visual com títulos de seção e bullets de experiência editáveis no Word.

---

### 3.1 Estrutura do cabeçalho

```gherkin
Dado que o DOCX é gerado com sucesso
Quando o usuário abre o arquivo no Word ou editor compatível
Então o topo do documento exibe o cabeçalho com:
  - Nome completo em destaque (estilo Título 1)
  - Cargo Desejado abaixo do nome
  - Email, Telefone e Localidade na linha seguinte
E o cabeçalho ocupa a faixa superior do documento
Exemplo: "João Silva | Desenvolvedor Frontend | joao@email.com | +55 11 99999-9999 | São Paulo, SP"
```

---

### 3.2 Ordem das seções no documento

```gherkin
Dado que o DOCX é gerado com o conteúdo do editor
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
E cada seção tem um título de seção formatado para manter a estrutura ao editar no Word
```

---

### 3.3 Seção sem conteúdo

```gherkin
Dado que o usuário não preencheu a seção "Projetos" no editor
Quando o DOCX é gerado
Então a seção "Projetos" não aparece no documento
E as demais seções são exibidas normalmente
```

---

## Comportamentos Gerais

| Comportamento | Regra |
|---|---|
| **Bloqueio durante geração** | Ambos os botões de exportação (PDF e DOCX) são desabilitados enquanto qualquer geração estiver em andamento |
| **Nomeação automática** | O nome do arquivo usa o campo "Cargo Desejado" — espaços são substituídos por hífens |
| **Seções vazias** | Seções sem conteúdo são omitidas do DOCX gerado |
| **Template fixo** | Não há opções de customização de layout, fonte ou cores para o usuário |
| **Conteúdo capturado** | O DOCX reflete o conteúdo do editor no momento do clique — edições posteriores no sistema não alteram o arquivo já baixado |
| **Editabilidade** | O arquivo .docx gerado é totalmente editável em Word e editores compatíveis |

---

## Resumo das Seções

```
┌──────────────────────────────────────────────────────────────┐
│  [Gerar Novo Currículo]    [Exportar PDF] [Exportar DOCX ⊙]  │  ← Barra superior F-06
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   (conteúdo do editor — F-06)                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Arquivo gerado (estrutura do DOCX):
┌────────────────────────────────────────────┐
│  João Silva                [Título 1]      │
│  Desenvolvedor Frontend                    │
│  joao@email.com · +55 11 99999 · SP        │
├────────────────────────────────────────────┤
│  Resumo Profissional       [Título 2]      │
│  ...                                       │
├────────────────────────────────────────────┤
│  Experiências              [Título 2]      │
│  ...                                       │
├────────────────────────────────────────────┤
│  Educação · Skills · Idiomas · Projetos    │
└────────────────────────────────────────────┘
```
