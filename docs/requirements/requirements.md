# Documento de Requisitos - Recicla Mais

## 1. Requisitos Funcionais (RF)

### RF01 - Gestão de Usuários
- **RF01.1:** O sistema deve permitir o cadastro de usuários cidadãos com nome, email, senha e telefone
- **RF01.2:** O sistema deve permitir o cadastro de gestores públicos com credenciais específicas
- **RF01.3:** O sistema deve permitir login de usuários com email e senha
- **RF01.4:** O sistema deve permitir logout de usuários
- **RF01.5:** O sistema deve permitir recuperação de senha por email

### RF02 - Gestão de Denúncias
- **RF02.1:** O sistema deve permitir que cidadãos enviem denúncias com foto, descrição e geolocalização
- **RF02.2:** O sistema deve permitir que cidadãos visualizem suas próprias denúncias
- **RF02.3:** O sistema deve permitir que cidadãos visualizem todas as denúncias no mapa
- **RF02.4:** O sistema deve permitir que gestores visualizem todas as denúncias
- **RF02.5:** O sistema deve permitir que gestores atualizem o status das denúncias

### RF03 - Sistema de Status
- **RF03.1:** O sistema deve gerenciar os seguintes status para denúncias:
  - Enviada
  - Em Análise
  - Resolvida
- **RF03.2:** O sistema deve registrar data e hora de cada mudança de status
- **RF03.3:** O sistema deve notificar cidadãos sobre mudanças de status

### RF04 - Visualização em Mapa
- **RF04.1:** O sistema deve exibir denúncias em um mapa interativo
- **RF04.2:** O sistema deve permitir filtros por status, data e localização
- **RF04.3:** O sistema deve permitir busca por endereço ou coordenadas

## 2. Requisitos Não-Funcionais (RNF)

### RNF01 - Performance
- **RNF01.1:** O sistema deve responder em menos de 3 segundos para operações básicas
- **RNF01.2:** O sistema deve suportar pelo menos 100 usuários simultâneos
- **RNF01.3:** O sistema deve processar uploads de imagem em menos de 10 segundos

### RNF02 - Segurança
- **RNF02.1:** O sistema deve implementar autenticação segura via JWT
- **RNF02.2:** O sistema deve criptografar senhas dos usuários
- **RNF02.3:** O sistema deve validar permissões de acesso baseadas em perfis
- **RNF02.4:** O sistema deve implementar HTTPS para todas as comunicações

### RNF03 - Usabilidade
- **RNF03.1:** O sistema deve ser intuitivo para usuários com diferentes níveis de conhecimento tecnológico
- **RNF03.2:** O sistema deve ser responsivo para diferentes tamanhos de tela
- **RNF03.3:** O sistema deve seguir padrões de acessibilidade WCAG 2.1

### RNF04 - Disponibilidade
- **RNF04.1:** O sistema deve estar disponível 99% do tempo
- **RNF04.2:** O sistema deve implementar backup automático dos dados
- **RNF04.3:** O sistema deve ter tempo de recuperação máximo de 4 horas

## 3. Regras de Negócio

### RN01 - Usuários
- Apenas usuários autenticados podem enviar denúncias
- Gestores públicos não podem enviar denúncias
- Usuários cidadãos não podem alterar status de denúncias

### RN02 - Denúncias
- Cada denúncia deve ter pelo menos uma foto
- A geolocalização é obrigatória para todas as denúncias
- Denúncias não podem ser editadas após o envio
- Denúncias não podem ser excluídas

### RN03 - Status
- Apenas gestores podem alterar o status das denúncias
- O status "Resolvida" só pode ser aplicado por gestores
- Todas as mudanças de status devem ser registradas com timestamp

### RN04 - Localização
- Denúncias devem estar dentro dos limites geográficos de Fortaleza
- Coordenadas GPS devem ter precisão mínima de 10 metros

## 4. Histórias de Usuário

### Como Cidadão:
- **HU01:** Como um cidadão, eu quero enviar uma denúncia com foto e localização, para que a prefeitura possa agir no local
- **HU02:** Como um cidadão, eu quero ver as denúncias no mapa, para que eu possa acompanhar o status dos problemas no meu bairro
- **HU03:** Como um cidadão, eu quero acompanhar o status das minhas denúncias, para que eu saiba se o problema foi resolvido

### Como Gestor Ambiental:
- **HU04:** Como um gestor ambiental, eu quero acessar um painel com todas as denúncias no mapa, para que eu possa visualizar os pontos críticos e planejar a coleta
- **HU05:** Como um gestor ambiental, eu quero mudar o status de uma denúncia para "Resolvida", para que a comunidade saiba que o problema foi solucionado
- **HU06:** Como um gestor ambiental, eu quero filtrar denúncias por status e localização, para que eu possa priorizar as ações

## 5. Perfis de Usuários

### Cidadão Consciente
- **Descrição:** Usuário final que utiliza o aplicativo para denunciar pontos de lixo
- **Características:**
  - Idade: 18-65 anos
  - Conhecimento tecnológico: Básico a intermediário
  - Motivação: Preocupação com o meio ambiente e qualidade de vida
- **Necessidades:**
  - Interface simples e intuitiva
  - Feedback rápido sobre suas denúncias
  - Visualização clara do mapa

### Gestor Ambiental
- **Descrição:** Representante do órgão público responsável por analisar e gerenciar as denúncias
- **Características:**
  - Idade: 25-55 anos
  - Conhecimento tecnológico: Intermediário a avançado
  - Motivação: Eficiência na gestão pública
- **Necessidades:**
  - Painel de controle organizado
  - Ferramentas de filtro e busca avançadas
  - Capacidade de gerenciar múltiplas denúncias simultaneamente
