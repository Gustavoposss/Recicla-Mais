# Documentação da API - Recicla Mais

> **Nota:** Esta documentação descreve a API implementada do sistema Recicla Mais. Para a especificação completa original, consulte `api_specification.md`.

## Visão Geral

A API do Recicla Mais é uma API REST que fornece endpoints para:
- Autenticação e gestão de usuários
- Criação e consulta de denúncias
- Gestão de status (para gestores)
- Upload e gerenciamento de fotos

### Base URL

```
http://localhost:3000/api/v1  (Desenvolvimento)
https://api.reciclamais.com.br/v1  (Produção)
```

### Autenticação

A API utiliza autenticação JWT através do Supabase Auth. Todos os endpoints protegidos requerem o header:

```
Authorization: Bearer <token>
```

## Endpoints Implementados

### Autenticação

#### POST /auth/register
Registra um novo usuário no sistema.

**Parâmetros:**
```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "phone": "string (opcional)",
  "user_type": "citizen"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "full_name": "string",
      "phone": "string",
      "user_type": "citizen",
      "created_at": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Autentica um usuário existente.

**Parâmetros:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token"
  }
}
```

#### POST /auth/logout
Encerra a sessão do usuário.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Usuários

#### GET /users/profile
Obtém o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "user_type": "citizen|manager",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /users/profile
Atualiza o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Parâmetros:**
```json
{
  "full_name": "string (opcional)",
  "phone": "string (opcional)"
}
```

### Denúncias

#### POST /complaints
Cria uma nova denúncia.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Parâmetros (FormData):**
- `description`: string (obrigatório)
- `latitude`: number (obrigatório)
- `longitude`: number (obrigatório)
- `photos`: file[] (obrigatório, máximo 5 arquivos)

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "status": "sent",
    "photos": [
      {
        "id": "uuid",
        "photo_url": "string"
      }
    ],
    "created_at": "timestamp"
  }
}
```

#### GET /complaints
Lista denúncias com filtros opcionais.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: string (opcional) - sent, analyzing, resolved
- `latitude`: number (opcional)
- `longitude`: number (opcional)
- `radius`: number (opcional) - em metros, padrão: 5000
- `page`: number (opcional) - padrão: 1
- `limit`: number (opcional) - padrão: 20

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### GET /complaints/:id
Obtém detalhes de uma denúncia específica.

**Headers:** `Authorization: Bearer <token>`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "status": "string",
    "photos": [...],
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user": {
      "id": "uuid",
      "full_name": "string"
    },
    "logs": [...]
  }
}
```

#### GET /complaints/my
Lista denúncias do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: string (opcional)
- `page`: number (opcional)
- `limit`: number (opcional)

### Gestão (Apenas Gestores)

#### PUT /complaints/:id/status
Atualiza o status de uma denúncia. **Apenas gestores.**

**Headers:** `Authorization: Bearer <token>`

**Parâmetros:**
```json
{
  "status": "analyzing|resolved",
  "notes": "string (opcional)"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "string",
    "updated_at": "timestamp"
  }
}
```

#### GET /complaints/stats
Obtém estatísticas das denúncias. **Apenas gestores.**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`: string (opcional) - YYYY-MM-DD
- `end_date`: string (opcional) - YYYY-MM-DD

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "by_status": {
      "sent": 45,
      "analyzing": 30,
      "resolved": 75
    },
    "by_period": {
      "today": 5,
      "week": 25,
      "month": 100
    }
  }
}
```

## Códigos de Status HTTP

- **200:** Sucesso
- **201:** Criado com sucesso
- **400:** Erro de validação
- **401:** Não autorizado
- **403:** Acesso negado (sem permissão)
- **404:** Recurso não encontrado
- **422:** Erro de processamento
- **500:** Erro interno do servidor

## Formato de Erros

Todos os erros seguem o formato padrão:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descrição do erro",
  "details": {}
}
```

### Códigos de Erro Comuns

- `VALIDATION_ERROR`: Erro de validação dos dados
- `AUTHENTICATION_ERROR`: Erro de autenticação (token inválido/expirado)
- `AUTHORIZATION_ERROR`: Erro de autorização (sem permissão)
- `NOT_FOUND`: Recurso não encontrado
- `INTERNAL_ERROR`: Erro interno do servidor

## Limitações e Rate Limiting

- **Endpoints públicos:** 100 requisições por minuto
- **Endpoints autenticados:** 1000 requisições por minuto
- **Upload de arquivos:** 10 uploads por minuto por usuário

## Exemplos de Uso

### Criar uma Denúncia (JavaScript)

```javascript
const formData = new FormData();
formData.append('description', 'Lixo acumulado na rua');
formData.append('latitude', -3.7319);
formData.append('longitude', -38.5267);
formData.append('photos', photoFile1);
formData.append('photos', photoFile2);

const response = await fetch('/api/v1/complaints', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

### Buscar Denúncias Próximas

```javascript
const response = await fetch(
  `/api/v1/complaints?latitude=-3.7319&longitude=-38.5267&radius=1000`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

## Versionamento

A API utiliza versionamento semântico (MAJOR.MINOR.PATCH):
- **v1:** Versão inicial implementada
- Mudanças incompatíveis requerem nova versão major
- Novas funcionalidades compatíveis incrementam minor
- Correções de bugs incrementam patch

## Changelog

### v1.0.0 (Data da implementação)
- Implementação inicial da API
- Endpoints de autenticação
- Endpoints de usuários
- Endpoints de denúncias
- Endpoints de gestão (gestores)

