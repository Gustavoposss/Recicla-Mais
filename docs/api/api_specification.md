# Especificação da API - Recicla Mais

## 1. Visão Geral

A API do Recicla Mais é uma API REST que permite a comunicação entre os frontends (web e mobile) e o backend, fornecendo funcionalidades para gestão de usuários, denúncias e sistema de status.

### Base URL
```
https://api.reciclamais.com.br/v1
```

### Autenticação
A API utiliza autenticação baseada em JWT (JSON Web Token) através do Supabase Auth. Todos os endpoints protegidos requerem o header `Authorization: Bearer <token>`.

## 2. Endpoints

### 2.1 Autenticação

#### POST /auth/register
Registra um novo usuário no sistema.

**Parâmetros de Requisição:**
```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "phone": "string",
  "user_type": "citizen"
}
```

**Resposta de Sucesso (201):**
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

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

#### POST /auth/login
Autentica um usuário existente.

**Parâmetros de Requisição:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "full_name": "string",
      "phone": "string",
      "user_type": "citizen"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/logout
Encerra a sessão do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2.2 Usuários

#### GET /users/profile
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "user_type": "citizen",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /users/profile
Atualiza o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros de Requisição:**
```json
{
  "full_name": "string",
  "phone": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "user_type": "citizen",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### 2.3 Denúncias

#### POST /complaints
Cria uma nova denúncia.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parâmetros de Requisição:**
```
description: string (required)
latitude: number (required)
longitude: number (required)
photos: file[] (required, max 5 files)
```

**Resposta de Sucesso (201):**
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

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
status: string (optional) - sent, analyzing, resolved
latitude: number (optional)
longitude: number (optional)
radius: number (optional) - em metros, padrão: 5000
page: number (optional) - padrão: 1
limit: number (optional) - padrão: 20
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "uuid",
        "description": "string",
        "latitude": "number",
        "longitude": "number",
        "status": "string",
        "photos": [
          {
            "id": "uuid",
            "photo_url": "string"
          }
        ],
        "created_at": "timestamp",
        "user": {
          "id": "uuid",
          "full_name": "string"
        }
      }
    ],
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

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "string",
    "latitude": "number",
    "longitude": "number",
    "status": "string",
    "photos": [
      {
        "id": "uuid",
        "photo_url": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user": {
      "id": "uuid",
      "full_name": "string"
    },
    "logs": [
      {
        "status": "string",
        "changed_by": "string",
        "created_at": "timestamp",
        "notes": "string"
      }
    ]
  }
}
```

#### GET /complaints/my
Lista denúncias do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
status: string (optional)
page: number (optional)
limit: number (optional)
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "uuid",
        "description": "string",
        "latitude": "number",
        "longitude": "number",
        "status": "string",
        "photos": [
          {
            "id": "uuid",
            "photo_url": "string"
          }
        ],
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### 2.4 Gestão (Apenas Gestores)

#### PUT /complaints/:id/status
Atualiza o status de uma denúncia.

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros de Requisição:**
```json
{
  "status": "analyzing|resolved",
  "notes": "string (optional)"
}
```

**Resposta de Sucesso (200):**
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
Obtém estatísticas das denúncias.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
start_date: string (optional) - YYYY-MM-DD
end_date: string (optional) - YYYY-MM-DD
```

**Resposta de Sucesso (200):**
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

## 3. Códigos de Status HTTP

- **200:** Sucesso
- **201:** Criado com sucesso
- **400:** Erro de validação
- **401:** Não autorizado
- **403:** Acesso negado
- **404:** Recurso não encontrado
- **422:** Erro de processamento
- **500:** Erro interno do servidor

## 4. Tratamento de Erros

### 4.1 Formato Padrão de Erro
```json
{
  "success": false,
  "error": "string",
  "message": "string",
  "details": "object (optional)"
}
```

### 4.2 Códigos de Erro Comuns
- **VALIDATION_ERROR:** Erro de validação dos dados
- **AUTHENTICATION_ERROR:** Erro de autenticação
- **AUTHORIZATION_ERROR:** Erro de autorização
- **NOT_FOUND:** Recurso não encontrado
- **INTERNAL_ERROR:** Erro interno do servidor

## 5. Exemplos de Uso

### 5.1 Fluxo de Criação de Denúncia

```javascript
// 1. Login do usuário
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'senha123'
  })
});

const { data: { token } } = await loginResponse.json();

// 2. Criação da denúncia
const formData = new FormData();
formData.append('description', 'Lixo acumulado na rua');
formData.append('latitude', -3.7319);
formData.append('longitude', -38.5267);
formData.append('photos', photoFile);

const complaintResponse = await fetch('/complaints', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const complaint = await complaintResponse.json();
```

### 5.2 Consulta de Denúncias por Localização

```javascript
// Buscar denúncias próximas
const nearbyComplaints = await fetch(
  `/complaints?latitude=-3.7319&longitude=-38.5267&radius=1000`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const complaints = await nearbyComplaints.json();
```

## 6. Rate Limiting

- **Endpoints públicos:** 100 requisições por minuto
- **Endpoints autenticados:** 1000 requisições por minuto
- **Upload de arquivos:** 10 uploads por minuto

## 7. Versionamento

A API utiliza versionamento semântico (MAJOR.MINOR.PATCH):
- **MAJOR:** Mudanças incompatíveis
- **MINOR:** Novas funcionalidades compatíveis
- **PATCH:** Correções de bugs compatíveis

## 8. Documentação Interativa

A API inclui documentação interativa via Swagger/OpenAPI disponível em:
```
https://api.reciclamais.com.br/docs
```

## 9. SDKs e Bibliotecas

### 9.1 JavaScript/TypeScript
```bash
npm install @reciclamais/api-client
```

### 9.2 React Native
```bash
npm install @reciclamais/react-native
```

## 10. Suporte e Contato

- **Documentação:** https://docs.reciclamais.com.br
- **Email:** api@reciclamais.com.br
- **Status:** https://status.reciclamais.com.br
