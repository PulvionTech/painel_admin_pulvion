-- Script para configurar o bucket de logos no Supabase Storage
-- Execute este SQL no painel do Supabase (SQL Editor)

-- 1. Criar o bucket de logos (caso não exista)
-- IMPORTANTE: Você precisará criar o bucket manualmente na interface do Supabase
-- ou via SQL (se você tiver permissões de admin):
--
-- No painel do Supabase:
-- Storage → New Bucket
-- Name: logos
-- Public bucket: Sim (para que as imagens sejam acessíveis publicamente)
--
-- OU via SQL (se for suportado):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- 2. Políticas de acesso ao bucket
-- Permitir upload de arquivos (para usuários autenticados)
CREATE POLICY "Permitir upload de logos para usuários autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Permitir visualização pública dos logos
CREATE POLICY "Permitir visualização pública de logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Permitir atualização e exclusão de logos (para usuários autenticados)
CREATE POLICY "Permitir atualização de logos para usuários autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Permitir exclusão de logos para usuários autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- 3. Adicionar coluna logo_url na tabela white_label_config (caso não exista)
ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Confirmação
SELECT 'Configuração de storage concluída! Não se esqueça de criar o bucket ''logos'' na interface do Supabase Storage.' AS status;
