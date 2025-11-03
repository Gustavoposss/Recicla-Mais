# Backend - Recicla Mais

API REST desenvolvida com Node.js, Express.js e Supabase.

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Preencha com suas credenciais do Supabase

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Testes

```bash
npm test
```

## Estrutura

```
src/
├── config/          # Configurações (Supabase, etc.)
├── controllers/     # Controllers das rotas
├── middleware/      # Middlewares (auth, error handler, etc.)
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
└── server.js        # Arquivo principal do servidor
```

## Endpoints

- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/users/profile` - Perfil do usuário
- `PUT /api/v1/users/profile` - Atualizar perfil
- `POST /api/v1/complaints` - Criar denúncia
- `GET /api/v1/complaints` - Listar denúncias
- `GET /api/v1/complaints/my` - Minhas denúncias
- `GET /api/v1/complaints/:id` - Detalhes da denúncia
- `PUT /api/v1/complaints/:id/status` - Atualizar status (gestor)
- `GET /api/v1/complaints/stats` - Estatísticas (gestor)

