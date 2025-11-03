-- ============================================
-- Correção do campo password_hash
-- O Supabase Auth gerencia as senhas, então não precisamos deste campo
-- ============================================

-- 1. Tornar o campo password_hash nullable
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Atualizar registros existentes para NULL (ao invés de string vazia)
UPDATE users 
SET password_hash = NULL 
WHERE password_hash = '' OR password_hash IS NULL;

-- 3. Verificar se a alteração foi aplicada
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'password_hash';

