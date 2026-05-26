## ADDED Requirements

### Requirement: Banco SQLite criado automaticamente
O backend SHALL criar automaticamente o arquivo de banco SQLite na pasta do backend e aplicar todas as migrations pendentes na primeira inicialização, sem intervenção manual.

#### Scenario: Primeira inicialização sem banco existente
- **WHEN** o desenvolvedor inicializa o backend pela primeira vez e o arquivo de banco SQLite ainda não existe
- **THEN** o arquivo de banco é criado automaticamente na pasta do backend
- **AND** todas as migrations pendentes são aplicadas automaticamente

#### Scenario: Reinicialização sem perda de dados
- **WHEN** o backend é reiniciado e o banco SQLite já existe com migrations aplicadas
- **THEN** nenhuma migration é reaplicada
- **AND** o banco permanece no estado anterior sem perda de dados

### Requirement: Tabela BaseResume com registro único
O banco SHALL conter a tabela `BaseResume`, preparada para armazenar no máximo um registro contendo todas as seções do currículo base. Operações de salvar SHALL substituir o registro existente, sem manter histórico.

#### Scenario: Tabela BaseResume criada
- **WHEN** as migrations são aplicadas na primeira inicialização do backend
- **THEN** a tabela `BaseResume` existe no banco
- **AND** está preparada para armazenar um único registro com todas as seções do currículo

### Requirement: Tabela GeneratedResume com registro único
O banco SHALL conter a tabela `GeneratedResume`, preparada para armazenar no máximo um registro contendo o currículo otimizado, score ATS, skill gaps e idioma usado na geração. Cada nova geração bem-sucedida SHALL sobrescrever o registro anterior.

#### Scenario: Tabela GeneratedResume criada
- **WHEN** as migrations são aplicadas na primeira inicialização do backend
- **THEN** a tabela `GeneratedResume` existe no banco
- **AND** está preparada para armazenar um único registro com o currículo otimizado, score ATS, skill gaps e idioma usado na geração

#### Scenario: Nova geração sobrescreve a anterior
- **WHEN** uma nova geração é concluída com sucesso e já existe um registro em `GeneratedResume`
- **THEN** o registro anterior é sobrescrito
- **AND** apenas o currículo mais recente permanece armazenado
