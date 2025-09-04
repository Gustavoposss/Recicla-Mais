# Documento de Arquitetura - Recicla Mais

## 1. Descrição da Arquitetura

O sistema Recicla Mais adota uma **Arquitetura em Camadas (Layered Architecture)** com separação clara de responsabilidades entre frontend, backend e banco de dados. Esta arquitetura foi escolhida por sua simplicidade, manutenibilidade e escalabilidade, sendo ideal para projetos com equipes pequenas e requisitos bem definidos.

### Princípios Arquiteturais
- **Separação de Responsabilidades:** Cada camada tem uma responsabilidade específica
- **Baixo Acoplamento:** As camadas se comunicam através de interfaces bem definidas
- **Alta Coesão:** Cada camada agrupa funcionalidades relacionadas
- **Testabilidade:** Facilita a criação de testes unitários e de integração

## 2. Componentes do Sistema

### 2.1 Frontend (Camada de Apresentação)

#### 2.1.1 Aplicação Web (React.js)
- **Responsabilidades:**
  - Interface do usuário cidadão
  - Interface do gestor público
  - Renderização de mapas interativos
  - Formulários de denúncia e gestão
- **Tecnologias:** React.js, HTML5, CSS3, JavaScript ES6+
- **Bibliotecas:** React Router, Axios, Leaflet/Mapbox

#### 2.1.2 Aplicação Mobile (React Native)
- **Responsabilidades:**
  - Interface mobile para cidadãos
  - Captura de fotos e geolocalização
  - Visualização de denúncias no mapa
- **Tecnologias:** React Native, JavaScript ES6+
- **Bibliotecas:** React Native Maps, React Native Camera, Axios

### 2.2 Backend (Camada de Lógica de Negócio)

#### 2.2.1 API REST (Node.js + Express.js)
- **Responsabilidades:**
  - Processamento de requisições HTTP
  - Validação de dados
  - Lógica de negócio
  - Integração com banco de dados
- **Tecnologias:** Node.js, Express.js, JavaScript ES6+
- **Middleware:** CORS, Helmet, Morgan, Express Validator

#### 2.2.2 Serviços de Negócio
- **Serviço de Usuários:**
  - Autenticação e autorização
  - Gestão de perfis
  - Validação de credenciais
- **Serviço de Denúncias:**
  - Criação e atualização de denúncias
  - Gestão de status
  - Processamento de imagens
- **Serviço de Geolocalização:**
  - Validação de coordenadas
  - Cálculo de distâncias
  - Filtros geográficos

### 2.3 Banco de Dados (Camada de Dados)

#### 2.3.1 Supabase (PostgreSQL)
- **Responsabilidades:**
  - Armazenamento persistente de dados
  - Consultas SQL otimizadas
  - Suporte a dados geoespaciais
- **Tecnologias:** PostgreSQL, PostGIS
- **Recursos:** RLS (Row Level Security), Triggers, Functions

#### 2.3.2 Supabase Auth
- **Responsabilidades:**
  - Autenticação de usuários
  - Gerenciamento de sessões
  - Controle de acesso baseado em perfis
- **Tecnologias:** Supabase Auth, JWT

#### 2.3.3 Supabase Storage
- **Responsabilidades:**
  - Armazenamento de imagens
  - Gerenciamento de arquivos
  - CDN para distribuição de conteúdo
- **Tecnologias:** Supabase Storage, CDN

## 3. Padrões Arquiteturais Utilizados

### 3.1 Padrão MVC (Model-View-Controller)
- **Model:** Representa os dados e a lógica de negócio
- **View:** Interface do usuário (React/React Native)
- **Controller:** Controla o fluxo de dados entre Model e View

### 3.2 Padrão Repository
- **Objetivo:** Abstrair a camada de acesso a dados
- **Benefícios:** Facilita testes e troca de implementações
- **Implementação:** Interfaces para operações de CRUD

### 3.3 Padrão Service Layer
- **Objetivo:** Centralizar a lógica de negócio
- **Benefícios:** Reutilização de código e manutenibilidade
- **Implementação:** Serviços para cada domínio do sistema

### 3.4 Padrão Middleware
- **Objetivo:** Processar requisições de forma modular
- **Benefícios:** Flexibilidade e reutilização
- **Implementação:** Autenticação, validação, logging

## 4. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                    ┌─────────────┐            │
│  │   Web App   │                    │ Mobile App  │            │
│  │ (React.js)  │                    │(React Native)│            │
│  └─────────────┘                    └─────────────┘            │
│           │                                │                   │
│           └────────────────────────────────┘                   │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Express   │    │   Services  │    │  Validation │        │
│  │   Server    │◄──►│   Layer     │◄──►│  Middleware │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│           │                                 │                  │
│           └─────────────────────────────────┘                  │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ PostgreSQL  │    │     Auth    │    │   Storage   │        │
│  │  Database   │    │   Service   │    │   Service   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│           │                                 │                  │
│           └─────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Decisões Técnicas e Justificativas

### 5.1 Escolha do Supabase
- **Justificativa:** Familiaridade da equipe, recursos integrados (auth, storage, database)
- **Alternativas Consideradas:** MongoDB, Firebase, AWS
- **Benefícios:** Desenvolvimento mais rápido, menos configuração, custo-benefício

### 5.2 Arquitetura em Camadas
- **Justificativa:** Simplicidade, manutenibilidade, adequada para equipes pequenas
- **Alternativas Consideradas:** Microserviços, Arquitetura Hexagonal
- **Benefícios:** Fácil de entender, testar e manter

### 5.3 React.js + React Native
- **Justificativa:** Reutilização de código, conhecimento da equipe, ecossistema rico
- **Alternativas Consideradas:** Flutter, Vue.js + Capacitor
- **Benefícios:** Desenvolvimento multiplataforma eficiente

### 5.4 Node.js + Express.js
- **Justificativa:** JavaScript em todo o stack, performance adequada, ecossistema maduro
- **Alternativas Consideradas:** Python + Django, Java + Spring
- **Benefícios:** Desenvolvimento mais rápido, equipe com conhecimento JavaScript

## 6. Considerações de Segurança

### 6.1 Autenticação e Autorização
- JWT tokens para sessões
- Row Level Security (RLS) no Supabase
- Validação de permissões por perfil de usuário

### 6.2 Validação de Dados
- Validação no frontend e backend
- Sanitização de inputs
- Proteção contra SQL injection

### 6.3 Segurança de API
- Rate limiting
- CORS configurado adequadamente
- Headers de segurança (Helmet)

## 7. Considerações de Escalabilidade

### 7.1 Banco de Dados
- Índices otimizados para consultas geoespaciais
- Particionamento por data para tabelas grandes
- Connection pooling configurado

### 7.2 API
- Cache de respostas frequentes
- Paginação de resultados
- Compressão de respostas

### 7.3 Frontend
- Lazy loading de componentes
- Code splitting
- Otimização de imagens
