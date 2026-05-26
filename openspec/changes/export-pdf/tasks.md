## 1. Backend — Dependência e DTO

- [x] 1.1 Adicionar pacote QuestPDF ao projeto: `dotnet add package QuestPDF`
- [x] 1.2 Registrar `QuestPDF.Infrastructure.QuestPDF.Settings.LicenseType.Community` no `Program.cs` (obrigatório para QuestPDF v2+)
- [x] 1.3 Criar `PdfExportRequest` DTO em `Data/` — mesmos campos de `BaseResumeContentDto` acrescidos de `CargoDesejado` (string)

## 2. Backend — Serviço de Geração de PDF

- [x] 2.1 Criar `PdfGenerationService.cs` em `Services/` com método `GeneratePdf(PdfExportRequest request): byte[]`
- [x] 2.2 Implementar cabeçalho do template: nome em destaque, cargo desejado, email + telefone + localidade
- [x] 2.3 Implementar seção Resumo Profissional (omite se vazio)
- [x] 2.4 Implementar seção Experiências Profissionais com bullets (omite se lista vazia)
- [x] 2.5 Implementar seção Educação (omite se lista vazia)
- [x] 2.6 Implementar seção Habilidades como lista separada por vírgula ou tags (omite se lista vazia)
- [x] 2.7 Implementar seção Idiomas (omite se lista vazia)
- [x] 2.8 Implementar seção Projetos com descrição e tecnologias (omite se lista vazia)
- [x] 2.9 Implementar utilitário de sanitização do nome do arquivo: espaços → hífens, remover acentos/cedilha

## 3. Backend — Endpoint

- [x] 3.1 Criar endpoint `POST /api/resume/export/pdf` em `Program.cs`
- [x] 3.2 Injetar `PdfGenerationService` e retornar `File(pdfBytes, "application/pdf", nomeArquivo)` com Content-Disposition `attachment`
- [x] 3.3 Retornar HTTP 400 para body inválido ou `CargoDesejado` ausente

## 4. Frontend — Serviço e integração

- [x] 4.1 Adicionar método `exportPdf(content: ResumeContent): Observable<Blob>` no `ApiService`, usando `responseType: 'blob'`
- [x] 4.2 Implementar utilitário de download de Blob: criar `<a>` programático, `URL.createObjectURL`, `click()`, `revokeObjectURL()`

## 5. Frontend — Componente do Editor

- [x] 5.1 Adicionar signal `isExporting = signal(false)` no componente do editor (ou reutilizar o existente se já criado no F-08)
- [x] 5.2 Implementar handler `onExportPdf()`: setar `isExporting(true)`, chamar `apiService.exportPdf()`, disparar download via utilitário, exibir toast de sucesso, setar `isExporting(false)`
- [x] 5.3 Tratar erro no handler: exibir toast vermelho "Erro ao gerar o arquivo. Tente novamente." e setar `isExporting(false)`
- [x] 5.4 Vincular `[disabled]="isExporting()"` nos botões "Exportar PDF" e "Exportar DOCX" no template do editor
- [x] 5.5 Substituir ícone do botão "Exportar PDF" por spinner enquanto `isExporting()` for `true`
