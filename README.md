# Recicla Mais

## Descrição do Projeto

O Recicla Mais é uma plataforma multiplataforma (web e mobile) que conecta cidadãos aos órgãos de gestão ambiental para reportar e monitorar denúncias de lixo em áreas urbanas de Fortaleza.

## Problema Abordado e Justificativa

O descarte irregular de lixo em áreas urbanas de Fortaleza gera graves problemas ambientais, de saúde pública e de qualidade de vida, especialmente em bairros mais vulneráveis. Atualmente, não há um canal de comunicação direto e eficiente que conecte a comunidade aos órgãos de gestão ambiental para a resolução ágil desses problemas.

A plataforma contribui diretamente para o **ODS 11: Cidades e Comunidades Sustentáveis**, ao auxiliar na criação de cidades mais limpas, seguras e resilientes.

## Funcionalidades Implementadas

### ✅ Funcionalidades Completas

#### Usuário Cidadão (Web):
- ✅ Cadastro e login de usuário
- ✅ Envio de denúncia com foto e geolocalização
- ✅ Visualização de denúncias próprias e de outros no mapa interativo
- ✅ Acompanhamento do status de suas denúncias (Enviada, Em Análise, Resolvida)
- ✅ Detecção automática de localização GPS
- ✅ Upload de múltiplas fotos (até 5 por denúncia)

#### Usuário Gestor Público (Web):
- ✅ Login seguro para gestores da prefeitura
- ✅ Painel de controle com estatísticas das denúncias
- ✅ Visualização de todas as denúncias com filtros
- ✅ Filtros e busca por status, data e localização
- ✅ Atualização do status das denúncias (Enviada → Em Análise → Resolvida)

### 📱 Status de Implementação Mobile

- ⏳ Frontend Mobile (React Native) - Em desenvolvimento

### 🔄 Funcionalidades Pendentes/Futuras

- Sistema de notificações push
- Recuperação de senha por email
- Exportação de relatórios em PDF
- Sistema de comentários nas denúncias

## Screenshots das Telas Principais

### Tela de Login
![Login](prototypes/web/Captura%20de%20tela%202025-09-04%20103618.png)

### Tela de Mapa
![Mapa](prototypes/web/Captura%20de%20tela%202025-09-04%20103638.png)

### Painel de Gestão
![Dashboard](prototypes/web/Captura%20de%20tela%202025-09-04%20103654.png)

## Tecnologias Utilizadas

### Frontend Web
- **React.js** 18.2.0 - Framework JavaScript para interfaces
- **React Router** 6.20.0 - Roteamento de páginas
- **Vite** 5.0.8 - Build tool e dev server
- **Axios** 1.6.2 - Cliente HTTP
- **React Leaflet** 4.2.1 - Mapas interativos
- **React Toastify** 9.1.3 - Notificações
- **React Hook Form** 7.48.2 - Gerenciamento de formulários

### Backend
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** 4.18.2 - Framework web
- **Supabase** 2.38.4 - Backend as a Service (Database, Auth, Storage)
- **PostgreSQL** (via Supabase) - Banco de dados relacional
- **PostGIS** - Extensão geoespacial do PostgreSQL
- **Multer** 1.4.5 - Upload de arquivos
- **JWT** - Autenticação
- **bcryptjs** 2.4.3 - Hash de senhas

### Banco de Dados
- **Supabase** (PostgreSQL)
  - Tabelas: users, complaints, complaint_photos, complaint_logs
  - Row Level Security (RLS) para controle de acesso
  - Triggers para atualização automática de timestamps
  - Índices geoespaciais para consultas de proximidade

### Ferramentas de Desenvolvimento
- **Git** - Controle de versão
- **GitHub** - Repositório remoto
- **Nodemon** - Hot reload para desenvolvimento
- **ESLint** - Linter para JavaScript

## Arquitetura do Sistema

O sistema adota uma **Arquitetura em Camadas** com separação clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Supabase      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Web       │ │◄──►│ │   API       │ │◄──►│ │  Database   │ │
│ │ (React.js)  │ │    │ │  REST       │ │    │ │ (PostgreSQL)│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Mobile     │ │    │ │  Express.js │ │    │ │  Auth       │ │
│ │(React Native)│ │    │ └─────────────┘ │    │ │  Storage    │ │
│ └─────────────┘ │    └─────────────────┘    │ └─────────────┘ │
└─────────────────┘                           └─────────────────┘
```

### Componentes Principais

1. **Frontend Web (React.js)**
   - Páginas: Login, Register, Home, Map, MyComplaints, CreateComplaint, ManagerDashboard
   - Context API para gerenciamento de estado de autenticação
   - Integração com API REST via Axios

2. **Backend API (Node.js + Express.js)**
   - Rotas: `/api/v1/auth`, `/api/v1/users`, `/api/v1/complaints`
   - Middleware de autenticação JWT
   - Serviços de negócio separados
   - Validação de dados com express-validator

3. **Banco de Dados (Supabase/PostgreSQL)**
   - Modelo relacional com 4 tabelas principais
   - Políticas RLS para segurança
   - Triggers para auditoria e logs

### Integrações Realizadas

- ✅ Supabase Auth - Autenticação de usuários
- ✅ Supabase Database - Armazenamento de dados
- ✅ Supabase Storage - Armazenamento de imagens
- ✅ Leaflet/OpenStreetMap - Mapas interativos
- ✅ Geolocation API - Detecção de localização GPS

## Instruções de Instalação e Execução

### Pré-requisitos

- **Node.js** 18.0.0 ou superior
- **npm** ou **yarn**
- Conta no **Supabase** (gratuita)
- **Git** (opcional, para clonar o repositório)

### Passo a Passo para Instalação

#### 1. Clone o repositório

```bash
git clone https://github.com/Gustavoposss/Recicla-Mais.git
cd Recicla-Mais
```

#### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

#### 3. Configure o Banco de Dados

1. Acesse o painel do Supabase
2. Vá em SQL Editor
3. Execute o script `database/schema.sql` para criar as tabelas

#### 4. Configure o Storage no Supabase

1. No painel do Supabase, vá em Storage
2. Crie um bucket chamado `complaint-photos`
3. Configure as políticas de acesso (público para leitura)

#### 5. Configure o Frontend Web

```bash
cd ../frontend/web
npm install
```

Crie um arquivo `.env` (opcional, se usar variáveis de ambiente):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

#### 6. Execute o Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

O backend estará rodando em: `http://localhost:3000`

**Terminal 2 - Frontend Web:**
```bash
cd frontend/web
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

### Comandos Disponíveis

#### Backend
- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento (com hot reload)
- `npm test` - Executa os testes

#### Frontend Web
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção

## Acesso ao Sistema

### URLs de Acesso

**Local (Desenvolvimento):**
- **Frontend Web:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Health Check:** http://localhost:3000/health

**Produção:**
- **Backend API:** https://recicla-mais.onrender.com/api/v1
- **Health Check:** https://recicla-mais.onrender.com/health

### Credenciais de Teste

Para criar credenciais de teste:

1. Acesse o frontend em `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Crie uma conta de cidadão
4. Para criar um gestor, você precisará alterar o `user_type` diretamente no banco de dados:

```sql
UPDATE users SET user_type = 'manager' WHERE email = 'seu@email.com';
```

### Deploy em Produção

O sistema está deployado em:

- **Backend:** Render - https://recicla-mais.onrender.com
- **Frontend:** [A ser configurado]
- **Banco de Dados:** Supabase (já está em produção)

**URLs de Produção:**
- **Backend API:** https://recicla-mais.onrender.com/api/v1
- **Health Check:** https://recicla-mais.onrender.com/health

## Validação com Público-Alvo

### Definição do Público-Alvo

**Status:** Em processo de identificação e contato

O público-alvo específico será identificado e documentado na pasta `validation/` conforme os requisitos da atividade. O processo de validação incluirá:

1. Identificação específica do público-alvo (nome, localização, contexto)
2. Contato e apresentação do projeto
3. Coleta de feedback sobre funcionalidades
4. Implementação de ajustes baseados no feedback
5. Documentação completa do processo

### Resumo do Processo de Validação

[Este conteúdo será atualizado após a realização da validação com o público-alvo]

### Principais Feedbacks Recebidos

[Este conteúdo será atualizado após a coleta de feedback]

### Ajustes Implementados

[Este conteúdo será atualizado conforme ajustes forem implementados baseados no feedback]

**Documentação completa:** Consulte os arquivos em `validation/`:
- `validation/target_audience.md` - Definição do público-alvo
- `validation/validation_report.md` - Relatório completo da validação
- `validation/evidence/` - Evidências fotográficas/vídeo
- `validation/feedback/` - Feedback detalhado coletado

## Equipe de Desenvolvimento

### Membros da Equipe

- **Gustavo de Sousa Possidonio** - Matrícula: 217353
  - Papel: Desenvolvedor Full Stack
  - Contribuições:
    - Planejamento e arquitetura do sistema
    - Implementação do backend completo
    - Implementação do frontend web
    - Configuração do banco de dados
    - Documentação técnica

## Estrutura do Projeto

```
Recicla-Mais/
├── README.md                    # Documentação principal
├── docs/                        # Documentação técnica
│   ├── requirements/
│   ├── architecture/
│   ├── api/
│   └── database/
├── validation/                  # Validação com público-alvo
│   ├── target_audience.md
│   ├── validation_report.md
│   ├── evidence/
│   └── feedback/
├── frontend/                    # Frontend
│   ├── web/                    # Aplicação web (React.js)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── mobile/                 # Aplicação mobile (React Native - em desenvolvimento)
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── tests/
│   └── package.json
└── database/                   # Scripts de banco de dados
    └── schema.sql
```

## Testes

### Testes Implementados

- ⏳ Testes unitários (em desenvolvimento)
- ⏳ Testes de integração (em desenvolvimento)

### Como Executar os Testes

```bash
cd backend
npm test
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto foi desenvolvido como parte da disciplina **Projeto Aplicado Multiplataforma Etapa 2 (N708)** da Universidade de Fortaleza (UNIFOR).

## Links Úteis

- [Documentação da API](docs/api/api_documentation.md)
- [Especificação da Arquitetura](docs/architecture/architecture.md)
- [Modelo de Banco de Dados](docs/database/database_model.md)
- [Repositório no GitHub](https://github.com/Gustavoposss/Recicla-Mais)

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório do GitHub.

---

**Recicla Mais** - Contribuindo para o ODS 11: Cidades e Comunidades Sustentáveis

© 2025 - Todos os direitos reservados
