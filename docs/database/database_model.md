# Modelo de Banco de Dados - Recicla Mais

## 1. Visão Geral

O banco de dados do Recicla Mais utiliza o Supabase (PostgreSQL) como solução principal, aproveitando recursos nativos como PostGIS para dados geoespaciais, Row Level Security (RLS) para controle de acesso, e autenticação integrada.

## 2. Entidades e Relacionamentos

### 2.1 Diagrama ER

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     users       │         │   complaints    │         │ complaint_logs  │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ user_id (FK)    │         │ id (PK)         │
│ email           │         │ id (PK)         │◄────────┤ complaint_id(FK)│
│ password_hash   │         │ description     │         │ status          │
│ full_name       │         │ latitude        │         │ changed_by      │
│ phone           │         │ longitude       │         │ created_at      │
│ user_type       │         │ status          │         │ notes           │
│ created_at      │         │ created_at      │         └─────────────────┘
│ updated_at      │         │ updated_at      │
└─────────────────┘         └─────────────────┘
         │                           │
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │ complaint_photos│
         │                  ├─────────────────┤
         └─────────────────►│ id (PK)         │
                            │ complaint_id(FK)│
                            │ photo_url       │
                            │ created_at      │
                            └─────────────────┘
```

### 2.2 Tabelas Principais

#### 2.2.1 Tabela `users`
Armazena informações dos usuários do sistema (cidadãos e gestores).

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | UUID | Identificador único | PK, NOT NULL, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | Email do usuário | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | Hash da senha | NOT NULL |
| full_name | VARCHAR(255) | Nome completo | NOT NULL |
| phone | VARCHAR(20) | Telefone | NULL |
| user_type | ENUM | Tipo de usuário | 'citizen' ou 'manager', NOT NULL |
| created_at | TIMESTAMP | Data de criação | DEFAULT NOW() |
| updated_at | TIMESTAMP | Data de atualização | DEFAULT NOW() |

#### 2.2.2 Tabela `complaints`
Armazena as denúncias enviadas pelos cidadãos.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | UUID | Identificador único | PK, NOT NULL, DEFAULT gen_random_uuid() |
| user_id | UUID | ID do usuário que criou | FK para users.id, NOT NULL |
| description | TEXT | Descrição da denúncia | NOT NULL |
| latitude | DECIMAL(10,8) | Latitude da localização | NOT NULL |
| longitude | DECIMAL(11,8) | Longitude da localização | NOT NULL |
| status | ENUM | Status atual | 'sent', 'analyzing', 'resolved', NOT NULL |
| created_at | TIMESTAMP | Data de criação | DEFAULT NOW() |
| updated_at | TIMESTAMP | Data de atualização | DEFAULT NOW() |

#### 2.2.3 Tabela `complaint_photos`
Armazena as fotos associadas às denúncias.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | UUID | Identificador único | PK, NOT NULL, DEFAULT gen_random_uuid() |
| complaint_id | UUID | ID da denúncia | FK para complaints.id, NOT NULL |
| photo_url | VARCHAR(500) | URL da foto no storage | NOT NULL |
| created_at | TIMESTAMP | Data de criação | DEFAULT NOW() |

#### 2.2.4 Tabela `complaint_logs`
Registra o histórico de mudanças de status das denúncias.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | UUID | Identificador único | PK, NOT NULL, DEFAULT gen_random_uuid() |
| complaint_id | UUID | ID da denúncia | FK para complaints.id, NOT NULL |
| status | ENUM | Novo status | 'sent', 'analyzing', 'resolved', NOT NULL |
| changed_by | UUID | ID do usuário que alterou | FK para users.id, NOT NULL |
| created_at | TIMESTAMP | Data da alteração | DEFAULT NOW() |
| notes | TEXT | Observações da alteração | NULL |

## 3. Índices e Otimizações

### 3.1 Índices Principais

```sql
-- Índice para busca por email (usuários)
CREATE INDEX idx_users_email ON users(email);

-- Índice para busca por tipo de usuário
CREATE INDEX idx_users_type ON users(user_type);

-- Índice geoespacial para denúncias
CREATE INDEX idx_complaints_location ON complaints USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Índice para busca por status
CREATE INDEX idx_complaints_status ON complaints(status);

-- Índice para busca por usuário
CREATE INDEX idx_complaints_user ON complaints(user_id);

-- Índice para busca por data
CREATE INDEX idx_complaints_created ON complaints(created_at);

-- Índice para fotos por denúncia
CREATE INDEX idx_photos_complaint ON complaint_photos(complaint_id);

-- Índice para logs por denúncia
CREATE INDEX idx_logs_complaint ON complaint_logs(complaint_id);
```

### 3.2 Índices Geoespaciais

```sql
-- Extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Índice espacial para consultas de proximidade
CREATE INDEX idx_complaints_spatial ON complaints USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
```

## 4. Políticas de Segurança (RLS)

### 4.1 Política para Tabela `users`

```sql
-- Usuários só podem ver e editar seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Gestores podem ver todos os usuários
CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND user_type = 'manager'
        )
    );
```

### 4.2 Política para Tabela `complaints`

```sql
-- Cidadãos podem ver todas as denúncias
CREATE POLICY "Citizens can view all complaints" ON complaints
    FOR SELECT USING (true);

-- Cidadãos só podem criar denúncias
CREATE POLICY "Citizens can create complaints" ON complaints
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND user_type = 'citizen'
        )
    );

-- Gestores podem atualizar status
CREATE POLICY "Managers can update complaints" ON complaints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND user_type = 'manager'
        )
    );
```

### 4.3 Política para Tabela `complaint_photos`

```sql
-- Todos podem ver fotos das denúncias
CREATE POLICY "Anyone can view photos" ON complaint_photos
    FOR SELECT USING (true);

-- Apenas cidadãos podem inserir fotos
CREATE POLICY "Citizens can insert photos" ON complaint_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND user_type = 'citizen'
        )
    );
```

## 5. Triggers e Funções

### 5.1 Trigger para Atualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Trigger para Log de Mudanças de Status

```sql
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO complaint_logs (complaint_id, status, changed_by)
        VALUES (NEW.id, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_complaint_status_change
    AFTER UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION log_status_change();
```

## 6. Dicionário de Dados

### 6.1 Enums

```sql
-- Tipo de usuário
CREATE TYPE user_type AS ENUM ('citizen', 'manager');

-- Status da denúncia
CREATE TYPE complaint_status AS ENUM ('sent', 'analyzing', 'resolved');
```

### 6.2 Constraints

```sql
-- Validação de coordenadas (Fortaleza)
ALTER TABLE complaints ADD CONSTRAINT check_fortaleza_bounds
CHECK (
    latitude BETWEEN -3.8 AND -3.6 AND
    longitude BETWEEN -38.7 AND -38.4
);

-- Validação de email
ALTER TABLE users ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Validação de telefone (formato brasileiro)
ALTER TABLE users ADD CONSTRAINT check_phone_format
CHECK (phone ~* '^\+55\s?\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$');
```

## 7. Scripts de Criação

### 7.1 Script Completo de Criação

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_type AS ENUM ('citizen', 'manager');
CREATE TYPE complaint_status AS ENUM ('sent', 'analyzing', 'resolved');

-- Tabela users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type user_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela complaints
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    status complaint_status DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela complaint_photos
CREATE TABLE complaint_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id),
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela complaint_logs
CREATE TABLE complaint_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id),
    status complaint_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_complaints_location ON complaints USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_created ON complaints(created_at);
CREATE INDEX idx_photos_complaint ON complaint_photos(complaint_id);
CREATE INDEX idx_logs_complaint ON complaint_logs(complaint_id);

-- Triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER log_complaint_status_change
    AFTER UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_logs ENABLE ROW LEVEL SECURITY;
```

## 8. Considerações de Performance

### 8.1 Particionamento
- Tabela `complaints` pode ser particionada por data para melhor performance
- Tabela `complaint_logs` pode ser particionada por ano

### 8.2 Cache
- Implementar cache Redis para consultas frequentes
- Cache de coordenadas geográficas para consultas de proximidade

### 8.3 Backup
- Backup automático diário via Supabase
- Retenção de 30 dias de backups
- Backup de teste mensal
