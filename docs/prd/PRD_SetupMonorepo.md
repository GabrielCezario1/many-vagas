# PRD — Setup do Monorepo

> **Público:** Desenvolvedores e Área de Negócio
> **Módulo:** F-01 — Setup do Monorepo
> **Versão:** 1.0
> **Data:** 2026-05-25

---

## Visão Geral

O Setup do Monorepo é a feature fundacional do ManyVagas. Ela estabelece a estrutura unificada do projeto, reunindo o frontend Angular e o backend ASP.NET Core em um único repositório, com banco de dados SQLite e todas as configurações necessárias para o desenvolvedor rodar a aplicação localmente com um único comando.

O objetivo central é garantir que qualquer desenvolvedor consiga, a partir do repositório clonado, ter o ambiente completamente funcional sem configurações manuais adicionais. Isso inclui o frontend respondendo em `localhost:4200`, o backend em `localhost:5000`, o banco de dados criado e migrado automaticamente, e a comunicação entre as camadas já estabelecida.

Ao final desta feature, o ambiente está pronto para receber o desenvolvimento de todas as demais funcionalidades do produto.

---

## Pré-requisitos

### Pré-requisito — Ferramentas instaladas

Para rodar o projeto, o desenvolvedor precisa ter instaladas as versões estáveis mais recentes das seguintes ferramentas: **Node.js LTS**, **Angular CLI** e **.NET SDK LTS**. O README documenta essas versões e fornece links de download para cada uma.

```gherkin
Dado que o desenvolvedor tenta executar o script de inicialização
E uma ou mais ferramentas requeridas não estão instaladas
Então o terminal exibe uma mensagem de erro clara indicando qual ferramenta está ausente
E o processo de inicialização é interrompido antes de tentar subir os serviços
```

---

## Funcionalidade 1 — Estrutura de Pastas do Monorepo

O repositório é organizado em três pastas raiz que separam claramente as responsabilidades do projeto. Essa organização facilita a navegação, o entendimento do projeto por novos desenvolvedores e a execução independente de cada camada.

---

### 1.1 Organização das pastas

A estrutura raiz do repositório contém as pastas `/frontend` (aplicação Angular), `/backend` (API ASP.NET Core) e `/docs` (documentação do projeto, incluindo escopo, features e PRDs).

```gherkin
Dado que o desenvolvedor clona o repositório
Quando navega para o diretório raiz
Então encontra exatamente três pastas: frontend, backend e docs
E um arquivo README.md na raiz com instruções de setup
```

---

## Funcionalidade 2 — Frontend Angular

A aplicação Angular é criada na pasta `/frontend` com as configurações padrão da versão estável mais recente do Angular CLI. Ela serve como ponto de entrada visual do ManyVagas e se comunica com o backend via HTTP.

---

### 2.1 Inicialização do frontend

```gherkin
Dado que o desenvolvedor executa o comando de inicialização
Quando o processo de setup do frontend é concluído
Então a aplicação Angular responde em http://localhost:4200
E a página inicial carrega sem erros no console do navegador
```

```gherkin
Dado que o desenvolvedor acessa http://localhost:4200
E o backend não está rodando
Quando a aplicação tenta se comunicar com o backend
Então a aplicação exibe uma mensagem de erro de conectividade
E não apresenta tela em branco ou erro genérico sem contexto
```

---

## Funcionalidade 3 — Backend ASP.NET Core

A API ASP.NET Core é criada na pasta `/backend` com as configurações padrão do .NET SDK na versão estável mais recente. Ela expõe os endpoints que o frontend consome e gerencia a comunicação com o banco de dados SQLite.

---

### 3.1 Inicialização do backend

```gherkin
Dado que o desenvolvedor executa o comando de inicialização
Quando o processo de setup do backend é concluído
Então a API ASP.NET Core responde em http://localhost:5000
E aceita requisições HTTP vindas de http://localhost:4200 (CORS liberado)
```

---

### 3.2 Health check

O endpoint `GET /health` é o indicador de saúde do backend. Ele permite verificar rapidamente se a API está no ar e qual versão está rodando, sem necessidade de acessar qualquer dado da aplicação.

```gherkin
Dado que o backend está rodando
Quando o desenvolvedor acessa GET http://localhost:5000/health
Então recebe uma resposta HTTP 200
E o corpo da resposta é: { "status": "ok", "version": "1.0.0" }
```

```gherkin
Dado que o backend não está rodando
Quando o desenvolvedor tenta acessar GET http://localhost:5000/health
Então recebe um erro de conexão recusada
E nenhuma resposta HTTP é retornada
```

---

### 3.3 Configuração de CORS

O backend está configurado para aceitar requisições cross-origin exclusivamente do frontend local (`localhost:4200`). Qualquer outra origem é bloqueada por padrão.

```gherkin
Dado que o backend está rodando
Quando o frontend em http://localhost:4200 faz uma requisição HTTP ao backend
Então a requisição é processada normalmente
E a resposta inclui os headers de CORS adequados
```

```gherkin
Dado que o backend está rodando
Quando uma requisição chega de uma origem diferente de http://localhost:4200
Então o backend retorna HTTP 403
E a requisição não é processada
```

---

## Funcionalidade 4 — Banco de Dados SQLite com EF Core

O banco de dados SQLite é configurado no backend com EF Core. O arquivo de banco é gerado automaticamente na primeira execução, e as migrations são aplicadas sem intervenção manual do desenvolvedor.

---

### 4.1 Criação automática do banco

```gherkin
Dado que o desenvolvedor inicializa o backend pela primeira vez
E o arquivo de banco SQLite ainda não existe
Quando o backend sobe
Então o arquivo de banco SQLite é criado automaticamente na pasta do backend
E todas as migrations pendentes são aplicadas automaticamente
```

```gherkin
Dado que o banco SQLite já existe com migrations aplicadas
Quando o backend é reiniciado
Então nenhuma migration é reaplicada
E o banco permanece no estado anterior sem perda de dados
```

---

## Funcionalidade 5 — Entidades do Banco de Dados

O banco SQLite contém duas tabelas principais criadas via EF Core. A estrutura é criada automaticamente na primeira execução pelo mecanismo de migrations.

---

### 5.1 Tabela de Currículo Base

A tabela `BaseResume` armazena um único registro — o currículo base do usuário. Não existe histórico; salvar sempre substitui o registro existente.

```gherkin
Dado que o backend sobe pela primeira vez
Quando as migrations são aplicadas
Então a tabela BaseResume é criada no banco
E está preparada para armazenar um único registro com todas as seções do currículo
```

---

### 5.2 Tabela de Currículo Gerado

A tabela `GeneratedResume` armazena um único registro — o currículo otimizado mais recente. Cada nova geração sobrescreve o registro anterior. Isso permite que o usuário feche e reabra o app e encontre o último currículo gerado no editor.

```gherkin
Dado que o backend sobe pela primeira vez
Quando as migrations são aplicadas
Então a tabela GeneratedResume é criada no banco
E está preparada para armazenar um único registro com o currículo otimizado, score ATS, skill gaps e idioma usado na geração

Dado que já existe um currículo gerado salvo no banco
Quando uma nova geração é concluída com sucesso
Então o registro anterior em GeneratedResume é sobrescrito
E apenas o currículo mais recente é armazenado
```

---

## Funcionalidade 6 — Rotas da Aplicação Angular

O Angular é configurado com as rotas que mapeiam as telas do ManyVagas. A rota raiz implementa uma lógica de redirecionamento inteligente baseada no estado do banco.

---

### 6.1 Mapa de rotas

| Rota | Tela |
|---|---|
| `/` | Redirecionamento automático (ver 6.2) |
| `/curriculo-base` | F-02 — Currículo Base |
| `/gerar` | F-03 — Geração com IA |
| `/editor` | F-06 — Editor de Currículo |

---

### 6.2 Redirecionamento da rota raiz

```gherkin
Dado que o usuário abre o app e acessa a rota "/"
E não existe nenhum currículo base salvo no banco
Então o sistema redireciona para /curriculo-base

Dado que o usuário abre o app e acessa a rota "/"
E existe um currículo base salvo no banco
Então o sistema redireciona para /gerar
```

---

### 6.3 Acesso a rotas sem pré-requisitos atendidos

```gherkin
Dado que o usuário tenta acessar /editor diretamente
E não existe nenhum currículo gerado salvo no banco
Então o sistema redireciona para /gerar
E exibe a mensagem: "Gere um currículo primeiro para acessar o editor."

Dado que o usuário tenta acessar /gerar diretamente
E o backend não está acessível
Então a tela de geração exibe mensagem de erro de conectividade
```

---

## Funcionalidade 7 — Configuração de Credenciais

As credenciais do Azure OpenAI são configuradas no arquivo `appsettings.json` do backend. Esse arquivo é incluído no `.gitignore` para evitar exposição acidental das chaves no repositório.

---

### 7.1 Estrutura de configuração

```gherkin
Dado que o desenvolvedor acabou de clonar o repositório
Quando tenta inicializar o backend sem configurar as credenciais
Então o backend inicia normalmente mas a chamada à IA retorna erro de autenticação
E o erro é claramente identificável nos logs do backend

Dado que o desenvolvedor configurou o appsettings.json com as credenciais válidas
Quando o backend sobe
Então a integração com Azure OpenAI está disponível para uso
```

---

### 7.2 Proteção do arquivo de configuração

```gherkin
Dado que o desenvolvedor faz um commit das alterações
Quando o git avalia os arquivos modificados
Então o arquivo appsettings.json não aparece como arquivo rastreável
E o .gitignore contém a entrada para appsettings.json do backend
```

---

## Funcionalidade 8 — Script de Inicialização Unificado

Um único comando na raiz do repositório sobe simultaneamente o frontend Angular e o backend ASP.NET Core, eliminando a necessidade de abrir múltiplos terminais manualmente.

---

### 5.1 Comando único de inicialização

```gherkin
Dado que o desenvolvedor está na raiz do repositório
E todas as ferramentas pré-requisito estão instaladas
Quando executa o script de inicialização
Então o frontend Angular sobe em http://localhost:4200
E o backend ASP.NET Core sobe em http://localhost:5000
E ambos os processos ficam ativos no mesmo terminal (ou em abas/processos filhos)
```

```gherkin
Dado que o desenvolvedor executa o script de inicialização
E uma das dependências (npm install ou dotnet restore) ainda não foi executada
Quando o script detecta a ausência de dependências
Então instala as dependências automaticamente antes de subir os serviços
```

---

## Funcionalidade 9 — README com Instruções de Setup

O README na raiz do repositório documenta tudo que o desenvolvedor precisa para colocar o projeto no ar a partir do zero: pré-requisitos, versões, comandos de instalação e execução.

---

### 9.1 Conteúdo do README

```gherkin
Dado que um novo desenvolvedor acessa o repositório
Quando lê o README.md na raiz
Então encontra as seguintes informações:
  - Nome e descrição do projeto
  - Pré-requisitos com versões mínimas (Node.js LTS, .NET SDK LTS, Angular CLI)
  - Links de download para cada ferramenta
  - Passo a passo de instalação de dependências
  - Comando único para rodar o projeto
  - URLs de acesso ao frontend e ao backend
  - Como verificar se o ambiente está funcionando (health check)
  - Instrução para criar o appsettings.json com as credenciais do Azure OpenAI
```

---

## Comportamentos Gerais

| Comportamento | Descrição |
|---|---|
| **Dependências ausentes** | Se `node_modules` ou pacotes .NET não estiverem instalados, o script de inicialização os instala antes de subir os serviços |
| **Porta ocupada** | Se `localhost:4200` ou `localhost:5000` já estiverem em uso, o terminal exibe mensagem de erro indicando a porta conflitante |
| **Banco inexistente** | O banco SQLite é criado automaticamente na primeira execução — o desenvolvedor não precisa rodar nenhum comando adicional |
| **Rotas inválidas** | Acessar qualquer rota desconhecida redireciona para `/curriculo-base` |
| **Credenciais ausentes** | Backend sobe normalmente mas chamadas à IA falham com erro de autenticação identificável |
| **Reinicialização** | Parar e reiniciar os serviços não apaga dados do banco nem exige reinstalação de dependências |

---

## Resumo das Seções

```
┌─────────────────────────────────────────────────────────┐
│                  Repositório Raiz                       │
│              README.md + Script único                   │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│    /frontend         │    /backend                      │
│    Angular App       │    ASP.NET Core API              │
│    localhost:4200    │    localhost:5000                 │
│                      │                                  │
│                      │  ┌──────────────────────────┐   │
│                      │  │  GET /health              │   │
│                      │  │  { status, version }      │   │
│                      │  ├──────────────────────────┤   │
│                      │  │  SQLite + EF Core         │   │
│                      │  │  Auto-migrado             │   │
│                      │  └──────────────────────────┘   │
├──────────────────────┴──────────────────────────────────┤
│                     /docs                               │
│         scope.md · features.md · prd/                   │
└─────────────────────────────────────────────────────────┘
```
