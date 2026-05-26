## ADDED Requirements

### Requirement: Tela de geração exibe formulário de geração
A tela SHALL exibir um campo de texto (textarea) para colar a descrição da vaga, um seletor de idioma (PT-BR / EN) e o botão "Gerar Currículo" ao ser acessada em `/gerar`.

#### Scenario: Carregamento inicial da tela
- **WHEN** o usuário navega para `/gerar`
- **THEN** o sistema exibe um textarea com placeholder "Cole aqui a descrição completa da vaga..."
- **THEN** o sistema exibe um seletor de idioma com opções "Português (PT-BR)" e "Inglês (EN)" sem nenhuma pré-selecionada
- **THEN** o botão "Gerar Currículo" está visível e habilitado

### Requirement: Seletor de idioma é obrigatório
O sistema SHALL impedir o início da geração caso nenhum idioma esteja selecionado.

#### Scenario: Tentativa de gerar sem selecionar idioma
- **WHEN** o usuário clica em "Gerar Currículo" sem ter selecionado um idioma
- **THEN** o seletor de idioma fica destacado visualmente
- **THEN** o sistema exibe a mensagem "Selecione o idioma do currículo antes de gerar."
- **THEN** a requisição de geração NÃO é enviada ao backend

### Requirement: Aviso informativo quando currículo base não existe
A tela SHALL exibir um aviso não-bloqueante quando o usuário não possui currículo base salvo.

#### Scenario: Acesso sem currículo base preenchido
- **WHEN** o usuário acessa `/gerar` e não existe nenhum `BaseResume` salvo no banco
- **THEN** o sistema exibe o aviso: "Você ainda não preencheu seu Currículo Base. O currículo será gerado apenas com as informações da vaga."
- **THEN** o botão "Gerar Currículo" permanece habilitado

### Requirement: Aviso informativo quando existe currículo gerado anterior
A tela SHALL exibir um aviso não-bloqueante com link para o editor quando há currículo gerado de sessão anterior.

#### Scenario: Acesso com currículo gerado anterior disponível
- **WHEN** o usuário acessa `/gerar` e existe um `GeneratedResume` salvo no banco
- **THEN** o sistema exibe o aviso: "Você tem um currículo gerado anteriormente. Acesse o editor para continuar."
- **THEN** o aviso contém um link navegável para `/editor`
- **THEN** o usuário pode ignorar o aviso e preencher o formulário normalmente

### Requirement: Estado de loading durante o processamento
A tela SHALL desabilitar o formulário e exibir mensagens animadas em sequência durante o processamento da IA.

#### Scenario: Início do processamento
- **WHEN** o usuário clica em "Gerar Currículo" com idioma selecionado
- **THEN** o botão "Gerar Currículo" é desabilitado imediatamente
- **THEN** o textarea e o seletor de idioma são desabilitados
- **THEN** a tela exibe mensagens em sequência animada: "Analisando a vaga..." → "Aplicando fórmula XYZ..." → "Otimizando keywords..."

### Requirement: Redirecionamento automático após sucesso
Após geração bem-sucedida, o sistema SHALL redirecionar automaticamente para `/editor`.

#### Scenario: Geração concluída com sucesso
- **WHEN** o backend retorna o currículo otimizado com sucesso
- **THEN** o sistema redireciona o usuário para `/editor`
- **THEN** o editor é pré-carregado com o currículo recém-gerado

### Requirement: Tratamento de erro de timeout
A tela SHALL exibir mensagem de erro e reabilitar o formulário quando ocorrer timeout.

#### Scenario: Timeout da requisição de geração
- **WHEN** o backend não responde dentro do tempo limite
- **THEN** o loading é encerrado
- **THEN** o sistema exibe: "A geração demorou mais que o esperado. Tente novamente."
- **THEN** o botão "Gerar Currículo" é reabilitado
- **THEN** o campo de vaga e o seletor de idioma retornam ao estado editável com os valores anteriores preservados

### Requirement: Tratamento de erro de falha na API do Azure OpenAI
A tela SHALL exibir mensagem de erro específica quando o backend retornar falha da API de IA.

#### Scenario: Falha na API do Azure OpenAI
- **WHEN** o backend retorna erro originado da API do Azure OpenAI (ex: quota excedida, serviço indisponível)
- **THEN** o loading é encerrado
- **THEN** o sistema exibe: "Não foi possível gerar o currículo. Verifique a configuração da API e tente novamente."
- **THEN** o botão "Gerar Currículo" é reabilitado
- **THEN** os dados do formulário são preservados

### Requirement: Tratamento de erro de conectividade com o backend
A tela SHALL exibir mensagem de erro de conexão quando o backend não estiver acessível.

#### Scenario: Backend inacessível
- **WHEN** o frontend tenta enviar a requisição e o backend não está acessível
- **THEN** o loading é encerrado imediatamente
- **THEN** o sistema exibe: "Erro de conexão. Verifique se o servidor está rodando e tente novamente."
- **THEN** o botão "Gerar Currículo" é reabilitado
