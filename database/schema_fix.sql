-- ============================================
-- Correção do Erro de Recursão Infinita RLS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover políticas problemáticas existentes
DROP POLICY IF EXISTS "Managers can view all users" ON users;
DROP POLICY IF EXISTS "Citizens can create complaints" ON complaints;
DROP POLICY IF EXISTS "Citizens can view own complaints" ON complaints;
DROP POLICY IF EXISTS "Managers can update complaints" ON complaints;
DROP POLICY IF EXISTS "Citizens can insert photos" ON complaint_photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- 2. Remover função antiga se existir
DROP FUNCTION IF EXISTS is_manager();

-- 3. Criar função auxiliar para evitar recursão
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND user_type = 'manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Política para INSERT em users (permite Supabase Auth criar usuários)
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 5. Política corrigida para gestores verem todos os usuários
CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        auth.uid() = id OR is_manager()
    );

-- 6. Política corrigida para criar denúncias
CREATE POLICY "Citizens can create complaints" ON complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Política corrigida para ver denúncias
CREATE POLICY "Citizens can view own complaints" ON complaints
    FOR SELECT USING (
        user_id = auth.uid() OR is_manager()
    );

-- 8. Política corrigida para atualizar denúncias
CREATE POLICY "Managers can update complaints" ON complaints
    FOR UPDATE USING (is_manager());

-- 9. Política corrigida para inserir fotos
CREATE POLICY "Citizens can insert photos" ON complaint_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM complaints c
            WHERE c.id = complaint_id AND c.user_id = auth.uid()
        )
    );

-- ============================================
-- Fim da Correção
-- ============================================

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'complaints', 'complaint_photos')
ORDER BY tablename, policyname;

