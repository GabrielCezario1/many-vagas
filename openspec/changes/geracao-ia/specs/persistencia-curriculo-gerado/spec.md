## ADDED Requirements

### Requirement: Currículo gerado é persistido no SQLite após geração bem-sucedida
O backend SHALL salvar o currículo otimizado retornado pela IA na entidade `GeneratedResume` do banco SQLite, sobrescrevendo o registro anterior se existir (upsert).

#### Scenario: Primeiro currículo gerado (sem registro anterior)
- **WHEN** a IA retorna um currículo otimizado com sucesso
- **WHEN** não existe nenhum `GeneratedResume` no banco
- **THEN** o backend insere um novo registro de `GeneratedResume` com os campos do currículo otimizado
- **THEN** o backend confirma a persistência antes de retornar HTTP 200 ao frontend

#### Scenario: Geração sobrescreve currículo gerado anterior
- **WHEN** a IA retorna um currículo otimizado com sucesso
- **WHEN** já existe um `GeneratedResume` no banco
- **THEN** o backend substitui o registro existente pelos novos dados do currículo otimizado
- **THEN** o backend confirma a persistência antes de retornar HTTP 200 ao frontend

### Requirement: Currículo gerado persiste entre sessões
O `GeneratedResume` salvo no SQLite SHALL estar disponível quando o usuário fechar e reabrir a aplicação.

#### Scenario: Usuário reabre o app após geração anterior
- **WHEN** o usuário acessa `/gerar` após ter gerado um currículo em sessão anterior
- **THEN** o sistema detecta a existência do `GeneratedResume` no banco
- **THEN** o sistema exibe o aviso informativo com link para `/editor`

#### Scenario: Usuário acessa o editor após fechar o app
- **WHEN** o usuário navega diretamente para `/editor` após reabrir o app
- **WHEN** existe um `GeneratedResume` salvo no banco
- **THEN** o editor exibe o último currículo gerado sem necessidade de nova geração

### Requirement: Falha de persistência não corrompe dados anteriores
Em caso de erro ao salvar o `GeneratedResume`, o registro anterior SHALL ser mantido intacto.

#### Scenario: Erro ao salvar no banco após geração bem-sucedida da IA
- **WHEN** a IA retorna o currículo com sucesso MAS o banco de dados falha ao persistir
- **THEN** o backend retorna HTTP 500 ao frontend
- **THEN** o registro anterior de `GeneratedResume` (se existia) permanece inalterado no banco
