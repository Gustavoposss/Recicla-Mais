-- ============================================
-- Correção Completa - Adicionar Políticas Faltantes
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar função is_manager() se não existir
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND user_type = 'manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Adicionar políticas faltantes para users
-- Usuários podem ver seus próprios dados
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Gestores podem ver todos os usuários
DROP POLICY IF EXISTS "Managers can view all users" ON users;
CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        auth.uid() = id OR is_manager()
    );

-- 3. Verificar se todas as políticas foram criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'complaints', 'complaint_photos')
ORDER BY tablename, policyname;

-- 4. Verificar se a função foi criada
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'is_manager';

