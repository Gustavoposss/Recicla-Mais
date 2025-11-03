-- ============================================
-- Correção de Políticas RLS para Denúncias
-- Garante que qualquer usuário autenticado possa criar denúncias
-- ============================================

-- Remove política antiga se existir
DROP POLICY IF EXISTS "Citizens can create complaints" ON complaints;

-- Nova política: Qualquer usuário autenticado pode criar denúncias
CREATE POLICY "Authenticated users can create complaints" ON complaints
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Remove política antiga de fotos se existir
DROP POLICY IF EXISTS "Citizens can insert photos" ON complaint_photos;

-- Nova política: Qualquer usuário autenticado pode inserir fotos de suas denúncias
CREATE POLICY "Authenticated users can insert photos" ON complaint_photos
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM complaints c
            WHERE c.id = complaint_id AND c.user_id = auth.uid()
        )
    );

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('complaints', 'complaint_photos')
ORDER BY tablename, policyname;

