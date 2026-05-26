## 1. Backend — Dependência e Serviço DOCX

- [x] 1.1 Adicionar pacote `DocumentFormat.OpenXml` ao projeto `ManyVagas.Api.csproj`
- [x] 1.2 Criar classe `DocxExportService` em `backend/Services/` com método `GenerateDocx(AiGeneratedResumeDto content): byte[]`
- [x] 1.3 Implementar a montagem do cabeçalho no template DOCX: nome (Heading 1), cargo desejado, email/telefone/localidade
- [x] 1.4 Implementar a inserção das seções em ordem (Resumo, Experiências, Educação, Habilidades, Idiomas, Projetos) com títulos Heading 2
- [x] 1.5 Implementar a omissão automática de seções sem conteúdo
- [x] 1.6 Registrar `DocxExportService` como scoped no `Program.cs`

## 2. Backend — Endpoint de Exportação DOCX

- [x] 2.1 Criar endpoint `POST /api/resume/export/docx` em `Program.cs` que recebe o DTO do currículo
- [x] 2.2 Chamar `DocxExportService.GenerateDocx()` e retornar `Results.File()` com Content-Type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- [x] 2.3 Retornar 400 quando o body for inválido ou vazio
- [x] 2.4 Retornar 500 em caso de exceção durante a geração, sem vazar detalhes internos

## 3. Frontend — Botão "Exportar DOCX" no Editor

- [x] 3.1 Adicionar botão "Exportar DOCX" na barra superior do componente `EditorPage` à direita do botão "Exportar PDF"
- [x] 3.2 Implementar o método `exportDocx()` no componente que chama `POST /api/resume/export/docx` via `ApiService`
- [x] 3.3 Adicionar sinal/estado `isExportingDocx` que controla o spinner no botão durante a geração
- [x] 3.4 Integrar com o estado compartilhado de bloqueio: desabilitar ambos os botões (PDF e DOCX) enquanto qualquer exportação estiver em andamento
- [x] 3.5 Implementar o download automático do blob recebido com nome `curriculo-{CargoDesejado}-{YYYY-MM-DD}.docx` (espaços substituídos por hífens)
- [x] 3.6 Exibir toast verde "Arquivo baixado com sucesso!" no sucesso e toast vermelho "Erro ao gerar o arquivo. Tente novamente." na falha
- [x] 3.7 Garantir que ambos os botões retornam ao estado habilitado após conclusão (sucesso ou erro)
