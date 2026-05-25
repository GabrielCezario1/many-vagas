# 📋 ManyVagas — Definição do Projeto

> Documento vivo. Atualizar conforme as decisões forem sendo tomadas.

---

## 🎯 Problema & Propósito

Gerar currículos customizados e otimizados para ATS (Applicant Tracking System) a partir do currículo base do usuário + descrição da vaga desejada. A IA analisa ambos e fortalece o currículo para aumentar as chances de aprovação.

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
| IA         | Azure OpenAI (GPT)                | ✅ Definido   |
| Banco      | SQLite                            | ✅ Recomendado |
| Export     | PDF / DOCX                        | ✅ Definido   |
| Deploy     | Local (localhost)                 | ✅ Definido   |

---

## ✅ Funcionalidades do MVP

### 1. Currículo Base
- Salvar informações técnicas e pessoais uma única vez
- Reutilizar em todas as gerações sem precisar colar novamente

### 2. Geração com IA
- Input: currículo base + descrição da vaga
- Output: currículo otimizado para ATS pelo Azure OpenAI
- A IA deve destacar palavras-chave da vaga e adaptar a linguagem

### 3. Editor de Currículo
- Editar o currículo gerado antes de exportar
- Interface visual amigável

### 4. Exportação
- Exportar em **PDF**
- Exportar em **DOCX**

---

## 🚫 Fora do Escopo do MVP

- Autenticação / login
- Multi-usuário / SaaS
- Deploy em cloud
- Histórico de vagas geradas
- Templates visuais de currículo

---

## ❓ Decisões Pendentes

- [ ] Estrutura de pastas (monorepo ou repos separados?)
- [ ] Modelo GPT a usar (gpt-4o, gpt-4, etc.)
- [ ] Formato de entrada do currículo (texto livre, formulário estruturado, upload de arquivo?)
- [ ] Como será o editor? (campo de texto rico, seções estruturadas?)
- [ ] Biblioteca para exportação PDF/DOCX no .NET

---

## 📌 Histórico de Decisões

| Data       | Decisão                              | Motivo                              |
|------------|--------------------------------------|-------------------------------------|
| 2026-05-25 | Nome: ManyVagas / Repo: many-vagas   | Definido pelo usuário               |
| 2026-05-25 | SQLite como banco                    | Uso local, sem servidor extra       |
| 2026-05-25 | Rodar só local (localhost)           | Projeto pessoal, sem necessidade de cloud |
| 2026-05-25 | Angular no frontend                  | Preferência do usuário              |
| 2026-05-25 | .NET no backend                      | Preferência do usuário              |
| 2026-05-25 | Azure OpenAI como provedor de IA     | Preferência do usuário              |
