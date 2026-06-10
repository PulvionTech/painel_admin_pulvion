-- Script de dados de teste para o painel Pulvion
-- Execute este SQL no painel do Supabase (SQL Editor)

-- 1. Desabilitar RLS temporariamente para facilitar os testes
ALTER TABLE enterprises        DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           DISABLE ROW LEVEL SECURITY;
ALTER TABLE fazendas           DISABLE ROW LEVEL SECURITY;
ALTER TABLE drones             DISABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE auxiliary_lists    DISABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_config      DISABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_sync_logs   DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         DISABLE ROW LEVEL SECURITY;

-- 2. Remover temporariamente a restrição de chave estrangeira (se existir)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Inserir uma empresa de teste
INSERT INTO enterprises (id, name, slug, primary_color, secondary_color, show_powered_by, is_active, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pulvion Demo',
  'pulvion-demo',
  '#5EC680',
  '#0E5162',
  true,
  true,
  'pro'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir um perfil de administrador de teste
INSERT INTO profiles (id, enterprise_id, full_name, email, telefone, licenca_caar, role, modulo_pulverizacao, modulo_mapeamento, modulo_cotesia, is_active, invite_status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Administrador Demo',
  'admin@demo.com',
  '34999999999',
  'CAAR-123456',
  'admin',
  true,
  true,
  false,
  true,
  'accepted'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir listas auxiliares
INSERT INTO auxiliary_lists (enterprise_id, type, label, is_active, sort_order)
VALUES
  -- Culturas
  ('00000000-0000-0000-0000-000000000001', 'cultura', 'Soja', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'cultura', 'Milho', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'cultura', 'Algodão', true, 3),
  ('00000000-0000-0000-0000-000000000001', 'cultura', 'Café', true, 4),
  -- Produtos
  ('00000000-0000-0000-0000-000000000001', 'produto', 'Roundup', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'produto', 'Gramoxone', true, 2),
  -- Classes de produto
  ('00000000-0000-0000-0000-000000000001', 'classe_produto', 'Herbicida', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'classe_produto', 'Inseticida', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'classe_produto', 'Fungicida', true, 3),
  -- Unidades
  ('00000000-0000-0000-0000-000000000001', 'unidade', 'L/ha', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'unidade', 'kg/ha', true, 2),
  -- Serviços
  ('00000000-0000-0000-0000-000000000001', 'servico', 'Aplicação Aérea', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'servico', 'Mapeamento', true, 2)
ON CONFLICT DO NOTHING;

-- Confirmar sucesso
SELECT 'Dados de teste inseridos com sucesso!' AS status;
SELECT * FROM enterprises;
SELECT * FROM profiles;
