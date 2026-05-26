# ManyVagas

Otimizador de currículos para vagas: gere currículos personalizados com IA, calcule seu score ATS e identifique gaps de habilidades.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| Angular CLI | 18+ | `npm install -g @angular/cli` |
| .NET SDK | 10.0 | https://dotnet.microsoft.com/download |

Verifique as dependências antes de prosseguir:

```bash
node scripts/check-prereqs.js
```

---

## Configuração inicial

### 1. Instalar dependências

```bash
# Instala concurrently (raiz) + dependências do frontend
npm run setup
```

### 2. Configurar credenciais do backend

Copie o arquivo de exemplo e preencha os valores:

```bash
cp backend/appsettings.example.json backend/appsettings.json
```

Edite `backend/appsettings.json` com suas credenciais do Azure OpenAI:

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://<seu-recurso>.openai.azure.com/",
    "ApiKey": "<sua-chave>",
    "Deployment": "<nome-do-deployment>"
  }
}
```

> **Importante:** `appsettings.json` está no `.gitignore` e nunca é commitado.

---

## Executar em desenvolvimento

```bash
npm start
```

Isso inicia o frontend e o backend simultaneamente com prefixos de log `[FE]` e `[BE]`:

| Serviço | URL |
|---|---|
| Frontend (Angular) | http://localhost:4200 |
| Backend (ASP.NET Core) | http://localhost:5000 |

### Verificar saúde do backend

```bash
curl http://localhost:5000/health
# → {"status":"ok","version":"1.0.0"}
```

---

## Estrutura do projeto

```
/
├── frontend/          # Aplicação Angular 21
├── backend/           # API ASP.NET Core (.NET 10) com EF Core + SQLite
├── docs/              # PRDs e documentação de produto
├── openspec/          # Especificações de mudanças (OpenSpec)
├── scripts/           # Scripts utilitários (check-prereqs.js)
├── package.json       # Scripts raiz (start, setup, check:prereqs)
└── README.md
```

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia frontend e backend em paralelo |
| `npm run setup` | Instala todas as dependências |
| `npm run check:prereqs` | Verifica pré-requisitos do ambiente |
