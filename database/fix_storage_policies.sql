-- ============================================
-- Configuração Correta de Políticas RLS
-- Seguindo boas práticas do Supabase
-- ============================================

-- 1. Políticas para tabela complaints
-- Remove política antiga se existir
DROP POLICY IF EXISTS "Citizens can create complaints" ON complaints;
DROP POLICY IF EXISTS "Authenticated users can create complaints" ON complaints;

-- Permite que qualquer usuário autenticado crie denúncias
CREATE POLICY "Authenticated users can create complaints" ON complaints
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 2. Políticas para tabela complaint_photos
-- Remove política antiga se existir
DROP POLICY IF EXISTS "Citizens can insert photos" ON complaint_photos;

-- Permite que usuários autenticados insiram fotos de suas denúncias
CREATE POLICY "Authenticated users can insert photos" ON complaint_photos
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM complaints c
            WHERE c.id = complaint_id AND c.user_id = auth.uid()
        )
    );

-- 3. Políticas para Storage (complaint-photos bucket)
-- IMPORTANTE: Execute isso no SQL Editor do Supabase
-- Política para permitir upload de arquivos por usuários autenticados
CREATE POLICY "Enable uploads for authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'complaint-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir leitura de arquivos públicos
CREATE POLICY "Enable public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'complaint-photos');

-- Alternativa mais simples: Permitir upload para qualquer usuário autenticado
-- (mais permissivo, mas funciona para desenvolvimento)
DROP POLICY IF EXISTS "Enable uploads for authenticated users" ON storage.objects;
CREATE POLICY "Enable uploads for authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-photos');

-- 4. Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('complaints', 'complaint_photos')
ORDER BY tablename, policyname;

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

