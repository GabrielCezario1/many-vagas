# 🗺️ ManyVagas — Features & Ordem de Construção

> Cada feature é uma unidade entregável e testável. A ordem respeita dependências técnicas.

---

## F-01 · Setup do Monorepo

**Objetivo:** Estrutura base do projeto funcionando localmente.

**Entregáveis:**
- [ ] Estrutura de pastas do monorepo (`/frontend`, `/backend`, `/docs`)
- [ ] Projeto Angular criado (`ng new`)
- [ ] Projeto ASP.NET Core Web API criado (`dotnet new webapi`)
- [ ] SQLite configurado com EF Core no backend
- [ ] Health check endpoint (`GET /health`) respondendo
- [ ] Angular rodando em `localhost:4200` consumindo o backend em `localhost:5000`
- [ ] CORS configurado no backend para o frontend local
- [ ] README atualizado com instruções de setup

**Dependências:** nenhuma

---

## F-02 · Currículo Base (CRUD)

**Objetivo:** Usuário preenche e salva seu currículo base uma única vez.

**Entregáveis:**

_Backend:_
- [ ] Entidade `ResumeProfile` com seções:
  - Dados pessoais (nome, email, telefone, LinkedIn, GitHub, cidade)
  - Resumo profissional
  - Experiências (empresa, cargo, período, bullet points — lista dinâmica)
  - Educação (instituição, curso, período — lista dinâmica)
  - Habilidades técnicas (lista dinâmica)
  - Idiomas (idioma + nível — lista dinâmica)
  - Projetos (nome, descrição, tecnologias, link — lista dinâmica)
- [ ] Migrations EF Core para SQLite
- [ ] Endpoints REST:
  - `GET /api/resume` — retorna o currículo salvo
  - `PUT /api/resume` — salva/atualiza o currículo completo

_Frontend:_
- [ ] Formulário Angular com todas as seções
- [ ] Campos dinâmicos (adicionar/remover itens) em Experiências, Educação, Skills, Idiomas, Projetos
- [ ] Salvar e carregar do backend
- [ ] Validação dos campos obrigatórios

**Dependências:** F-01

---

## F-03 · Integração com Azure OpenAI

**Objetivo:** Backend consegue chamar o Azure OpenAI com o prompt estruturado.

**Entregáveis:**

_Backend:_
- [ ] Serviço `AzureOpenAIService` isolado e configurável via `appsettings.json`
- [ ] Prompt de sistema com:
  - Fórmula XYZ para bullet points
  - Instrução de injeção de keywords da vaga
  - Instrução de idioma (PT-BR ou EN)
- [ ] Input estruturado: currículo base (JSON) + descrição da vaga + idioma
- [ ] Output estruturado (JSON) com:
  - Currículo otimizado (mesma estrutura do currículo base)
  - Lista de `matchedSkills` (skills do currículo que batem com a vaga)
  - Lista de `missingSkills` (skills da vaga que faltam no currículo)
- [ ] Endpoint `POST /api/generate` recebendo `{ jobDescription, language }`
- [ ] Tratamento de erros e timeout

_Frontend:_
- [ ] Tela de geração: campo para colar a descrição da vaga + seletor de idioma (PT-BR / EN)
- [ ] Botão "Gerar Currículo" com loading state
- [ ] Exibição de erro amigável em caso de falha

**Dependências:** F-02

---

## F-04 · Score ATS

**Objetivo:** Calcular e exibir a pontuação ATS do currículo (antes e depois da geração).

**Entregáveis:**

_Backend:_
- [ ] Serviço `ATSScorerService` com algoritmo heurístico (sem chamada à IA):
  - **Keyword Match (40%):** keywords da vaga presentes no currículo
  - **Verbos de Ação (25%):** bullet points começam com verbos fortes
  - **Quantificação (20%):** presença de números, percentuais, métricas
  - **Completude (15%):** seções obrigatórias preenchidas
- [ ] Score calculado para o currículo base E para o currículo gerado
- [ ] Breakdown retornado por dimensão (não só o total)
- [ ] Score incluído na resposta do `POST /api/generate`

_Frontend:_
- [ ] Exibição do score (0–100) com visual de gauge/barra
- [ ] Breakdown das 4 dimensões
- [ ] Comparação lado a lado: score antes vs depois

**Dependências:** F-03

---

## F-05 · Análise de Skill Gaps

**Objetivo:** Exibir visualmente o que o currículo tem e o que falta para a vaga.

**Entregáveis:**

_Backend:_
- [ ] `matchedSkills` e `missingSkills` já retornados pelo `POST /api/generate` (F-03)
- [ ] (Sem novo endpoint necessário)

_Frontend:_
- [ ] Seção "Skill Gap" na tela de resultado
- [ ] Skills com match exibidas em verde ✅
- [ ] Skills faltando exibidas em vermelho ❌
- [ ] Contagem resumida: "Você tem X de Y skills pedidas"

**Dependências:** F-03

---

## F-06 · Editor de Currículo Gerado

**Objetivo:** Usuário edita o currículo otimizado em seções estruturadas antes de exportar.

**Entregáveis:**

_Frontend:_
- [ ] Tela de edição com as mesmas seções do currículo base (mesma estrutura)
- [ ] Pré-carregada com o currículo gerado pela IA
- [ ] Campos dinâmicos (adicionar/remover bullet points, skills, etc.)
- [ ] Botões "Exportar PDF" e "Exportar DOCX"
- [ ] Estado do editor persistido na sessão (não perde ao navegar)

_Backend:_
- [ ] Nenhum endpoint novo — o currículo editado é enviado diretamente nos endpoints de export

**Dependências:** F-03

---

## F-07 · Exportação PDF

**Objetivo:** Gerar e baixar o currículo em PDF com template profissional.

**Entregáveis:**

_Backend:_
- [ ] Dependência `QuestPDF` adicionada ao projeto
- [ ] Template PDF profissional e limpo implementado com QuestPDF
- [ ] Endpoint `POST /api/export/pdf` recebendo o currículo editado (JSON)
- [ ] Nome do arquivo gerado automaticamente: `curriculo-{cargo}-{YYYY-MM-DD}.pdf`
- [ ] Retorna o arquivo binário para download

_Frontend:_
- [ ] Botão "Exportar PDF" chama o endpoint e faz download automático

**Dependências:** F-06

---

## F-08 · Exportação DOCX

**Objetivo:** Gerar e baixar o currículo em DOCX.

**Entregáveis:**

_Backend:_
- [ ] Dependência `DocumentFormat.OpenXml` adicionada ao projeto
- [ ] Template DOCX implementado com a mesma estrutura do PDF
- [ ] Endpoint `POST /api/export/docx` recebendo o currículo editado (JSON)
- [ ] Nome do arquivo gerado automaticamente: `curriculo-{cargo}-{YYYY-MM-DD}.docx`
- [ ] Retorna o arquivo binário para download

_Frontend:_
- [ ] Botão "Exportar DOCX" chama o endpoint e faz download automático

**Dependências:** F-06

---

## 📊 Visão Geral

```
F-01 Setup
  └── F-02 Currículo Base
        └── F-03 Integração Azure OpenAI
              ├── F-04 Score ATS
              ├── F-05 Skill Gaps
              └── F-06 Editor
                    ├── F-07 Export PDF
                    └── F-08 Export DOCX
```

| Feature | Complexidade | Esforço estimado | Depende de |
|---------|-------------|-----------------|------------|
| F-01 Setup            | 🟢 Baixa   | 0,5 dia  | —          |
| F-02 Currículo Base   | 🟡 Média   | 2 dias   | F-01       |
| F-03 Azure OpenAI     | 🟡 Média   | 1,5 dias | F-02       |
| F-04 Score ATS        | 🟡 Média   | 1 dia    | F-03       |
| F-05 Skill Gaps       | 🟢 Baixa   | 0,5 dia  | F-03       |
| F-06 Editor           | 🟡 Média   | 1,5 dias | F-03       |
| F-07 Export PDF       | 🟡 Média   | 1 dia    | F-06       |
| F-08 Export DOCX      | 🟡 Média   | 1 dia    | F-06       |
| **TOTAL**             |            | **~9 dias** |         |
