-- ============================================
-- Schema do Banco de Dados - Recicla Mais
-- Supabase (PostgreSQL)
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Enums
-- ============================================

-- Tipo de usuário
CREATE TYPE user_type AS ENUM ('citizen', 'manager');

-- Status da denúncia
CREATE TYPE complaint_status AS ENUM ('sent', 'analyzing', 'resolved');

-- ============================================
-- Funções
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para registrar mudanças de status
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

-- ============================================
-- Tabelas
-- ============================================

-- Tabela users
-- NOTA: password_hash é nullable porque o Supabase Auth gerencia as senhas
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable: Supabase Auth gerencia as senhas
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type user_type NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela complaints
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    status complaint_status DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Validação de coordenadas (Fortaleza)
    CONSTRAINT check_fortaleza_bounds CHECK (
        latitude BETWEEN -3.8 AND -3.6 AND
        longitude BETWEEN -38.7 AND -38.4
    )
);

-- Tabela complaint_photos
CREATE TABLE IF NOT EXISTS complaint_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela complaint_logs
CREATE TABLE IF NOT EXISTS complaint_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status complaint_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- ============================================
-- Índices
-- ============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- Índice geoespacial para complaints (PostGIS)
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Índices para complaints
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);

-- Índices para complaint_photos
CREATE INDEX IF NOT EXISTS idx_photos_complaint ON complaint_photos(complaint_id);

-- Índices para complaint_logs
CREATE INDEX IF NOT EXISTS idx_logs_complaint ON complaint_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_logs_changed_by ON complaint_logs(changed_by);

-- ============================================
-- Triggers
-- ============================================

-- Trigger para atualizar updated_at em users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em complaints
DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças de status
DROP TRIGGER IF EXISTS log_complaint_status_change ON complaints;
CREATE TRIGGER log_complaint_status_change
    AFTER UPDATE ON complaints
    FOR EACH ROW 
    EXECUTE FUNCTION log_status_change();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users
-- NOTA: Evitamos recursão infinita não consultando a tabela users dentro das políticas

-- Política para INSERT: Permite que o Supabase Auth insira usuários
-- O Supabase Auth cria o usuário automaticamente, então precisamos permitir isso
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Usuários podem ver e editar seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Gestores podem ver todos os usuários
-- NOTA: Usamos uma função auxiliar para evitar recursão
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND user_type = 'manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        auth.uid() = id OR is_manager()
    );

-- Políticas para complaints
-- Cidadãos podem ver todas as denúncias
CREATE POLICY "Citizens can view all complaints" ON complaints
    FOR SELECT USING (true);

-- Cidadãos podem criar denúncias
-- NOTA: Verificamos apenas se o usuário está autenticado
-- O backend já valida se é cidadão antes de criar
CREATE POLICY "Citizens can create complaints" ON complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cidadãos podem ver suas próprias denúncias
-- Gestores podem ver todas (através da função is_manager)
CREATE POLICY "Citizens can view own complaints" ON complaints
    FOR SELECT USING (
        user_id = auth.uid() OR is_manager()
    );

-- Gestores podem atualizar status
CREATE POLICY "Managers can update complaints" ON complaints
    FOR UPDATE USING (is_manager());

-- Políticas para complaint_photos
-- Todos podem ver fotos das denúncias
CREATE POLICY "Anyone can view photos" ON complaint_photos
    FOR SELECT USING (true);

-- Apenas cidadãos podem inserir fotos (através da criação de denúncia)
-- Verificamos apenas se a denúncia pertence ao usuário autenticado
CREATE POLICY "Citizens can insert photos" ON complaint_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM complaints c
            WHERE c.id = complaint_id AND c.user_id = auth.uid()
        )
    );

-- Políticas para complaint_logs
-- Todos podem ver logs das denúncias
CREATE POLICY "Anyone can view logs" ON complaint_logs
    FOR SELECT USING (true);

-- ============================================
-- Dados de Teste (Opcional)
-- ============================================

-- NOTA: Descomente as linhas abaixo para criar dados de teste
-- Lembre-se de ajustar as senhas antes de usar em produção

/*
-- Usuário gestor de teste
INSERT INTO users (email, password_hash, full_name, user_type) 
VALUES (
    'gestor@teste.com',
    '$2a$10$...', -- Hash bcrypt de uma senha (substitua pelo hash real)
    'Gestor Teste',
    'manager'
);

-- Usuário cidadão de teste
INSERT INTO users (email, password_hash, full_name, user_type) 
VALUES (
    'cidadao@teste.com',
    '$2a$10$...', -- Hash bcrypt de uma senha (substitua pelo hash real)
    'Cidadão Teste',
    'citizen'
);
*/

-- ============================================
-- Fim do Schema
-- ============================================

