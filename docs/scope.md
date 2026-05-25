# 📋 ManyVagas — Definição do Projeto

> Documento vivo. Atualizar conforme as decisões forem sendo tomadas.

---

## 🎯 Problema & Propósito

Gerar currículos customizados e otimizados para ATS (Applicant Tracking System) a partir do currículo base do usuário + descrição da vaga desejada. A IA analisa ambos, aplica a fórmula XYZ do Google nos bullet points e fortalece o currículo para aumentar as chances de aprovação.

---

## 👤 Usuário

- Uso **pessoal** (somente o autor)
- Sem necessidade de autenticação ou multi-tenant no MVP

---

## 🏗️ Stack Técnica

| Camada     | Tecnologia                        | Decisão      |
|------------|-----------------------------------|--------------|
| Frontend   | Angular (browser)                 | ✅ Definido   |
| Backend    | .NET (ASP.NET Core)               | ✅ Definido   |
| IA         | Azure OpenAI — modelo **gpt-4o**  | ✅ Definido   |
| Banco      | SQLite (EF Core)                  | ✅ Definido   |
| Export PDF | **QuestPDF** (.NET)               | ✅ Definido   |
| Export DOCX| DocumentFormat.OpenXml (.NET)     | ✅ Definido   |
| Estrutura  | **Monorepo** (frontend + backend) | ✅ Definido   |
| Deploy     | Local (localhost)                 | ✅ Definido   |

---

## ✅ Funcionalidades do MVP

### 1. Currículo Base (formulário estruturado)
- Preenchido uma única vez via formulário com seções:
  - Dados pessoais (nome, contato, LinkedIn, GitHub)
  - Resumo profissional
  - Experiências (empresa, cargo, período, bullet points)
  - Educação
  - Habilidades técnicas (skills)
  - Idiomas
  - Projetos (opcional)
- Salvo no SQLite e reutilizado em todas as gerações

### 2. Geração com IA (Azure OpenAI — gpt-4o)
- Input: currículo base estruturado + descrição da vaga + idioma desejado (PT-BR ou EN)
- Output: currículo otimizado para ATS
- A IA aplica:
  - **Fórmula XYZ** nos bullet points (*Accomplished X, measured by Y, by doing Z*)
  - Injeção de keywords da vaga
  - Adaptação de linguagem ao idioma selecionado

### 3. Score ATS (0–100)
- Calculado via algoritmo heurístico no backend (sem chamada extra à IA)
- Breakdown por dimensão:
  - Keyword match (keywords da vaga presentes no currículo)
  - Verbos de ação (ação, resultado, métricas)
  - Quantificação (números, percentuais, métricas)
  - Completude de seções obrigatórias
- Exibido antes e depois da geração (comparação)

### 4. Análise de Skill Gaps
- Compara as skills da vaga com as skills do currículo base
- Exibe: **skills que você tem ✅** e **skills que faltam ❌**
- Retornado como parte da resposta da IA (JSON estruturado)

### 5. Editor de Currículo (pós-geração)
- Editar o currículo gerado em **seções estruturadas** (cada campo separado)
- Usuário revisa e ajusta antes de exportar
- Fluxo: IA gera → usuário edita → exporta

### 6. Exportação
- Exportar em **PDF** (QuestPDF)
- Exportar em **DOCX** (DocumentFormat.OpenXml)
- Suporte a **PT-BR e EN** (usuário escolhe antes de gerar)

---

## 🚫 Fora do Escopo do MVP

- Autenticação / login
- Multi-usuário / SaaS
- Deploy em cloud
- Histórico de vagas geradas
- Templates visuais de currículo
- Upload de PDF/DOCX como entrada do currículo
- Slider de intensidade de otimização
- AI Chat Editor (conversa com IA para refinar)
- Score em tempo real (antes de submeter)

---

## 🗂️ Estrutura de Pastas (Monorepo)

```
many-vagas/
├── frontend/        # Angular app
├── backend/         # ASP.NET Core API
├── docs/            # Documentação
└── README.md
```

---

## 🔄 Fluxo Principal

```
1. Usuário preenche currículo base (formulário) → salvo no SQLite
2. Usuário cola descrição da vaga + escolhe idioma
3. Backend monta prompt (currículo + vaga + XYZ + idioma) → envia ao gpt-4o
4. IA retorna: currículo otimizado + skill gaps (JSON)
5. Backend calcula score ATS heurístico
6. Frontend exibe: score antes/depois + skill gaps + editor de seções
7. Usuário edita se necessário → exporta PDF ou DOCX
```

---

## ❓ Decisões Pendentes

> Nenhuma decisão pendente para o MVP. ✅

---

## 📌 Histórico de Decisões

| Data       | Decisão                                          | Motivo                                        |
|------------|--------------------------------------------------|-----------------------------------------------|
| 2026-05-25 | Nome: ManyVagas / Repo: many-vagas               | Definido pelo usuário                         |
| 2026-05-25 | SQLite como banco                                | Uso local, sem servidor extra                 |
| 2026-05-25 | Rodar só local (localhost)                       | Projeto pessoal, sem necessidade de cloud     |
| 2026-05-25 | Angular no frontend                              | Preferência do usuário                        |
| 2026-05-25 | .NET no backend                                  | Preferência do usuário                        |
| 2026-05-25 | Azure OpenAI como provedor de IA                 | Preferência do usuário                        |
| 2026-05-25 | Monorepo (frontend + backend na mesma repo)      | Simplicidade para projeto pessoal             |
| 2026-05-25 | Formulário estruturado por seções como entrada   | Melhor para estruturar dados antes de enviar à IA |
| 2026-05-25 | Seções estruturadas no editor pós-geração        | Consistência com a entrada e edição precisa   |
| 2026-05-25 | Modelo gpt-4o                                    | Melhor custo-benefício qualidade/preço        |
| 2026-05-25 | QuestPDF para exportação PDF                     | API moderna, fluent, open source no .NET      |
| 2026-05-25 | Suporte a PT-BR e EN (usuário escolhe)           | Vagas nacionais e internacionais              |
| 2026-05-25 | Score ATS incluído no MVP                        | Feedback objetivo da qualidade do currículo   |
| 2026-05-25 | Análise de skill gaps incluída no MVP            | Insight de alto valor, baixo custo            |
| 2026-05-25 | Fórmula XYZ aplicada nos bullet points           | Principal diferencial de qualidade ATS        |
| 2026-05-25 | Campos dinâmicos no formulário (N experiências)  | Flexibilidade sem limite artificial           |
| 2026-05-25 | Template PDF fixo (limpo e profissional)         | Simplicidade, foco no conteúdo e não no design |
| 2026-05-25 | Nome do arquivo gerado automaticamente           | Ex: `curriculo-dev-senior-2026-05-25.pdf`     |
