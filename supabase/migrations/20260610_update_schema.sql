-- Migration: Atualiza/Cria schema compatível com o painel PulviOn
-- Gerado: 2026-06-10

BEGIN;

-- 1) enterprises
CREATE TABLE IF NOT EXISTS enterprises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE,
  is_active         BOOLEAN DEFAULT TRUE,
  plan              TEXT DEFAULT 'base' CHECK (plan IN ('base','pro')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2) profiles
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  telefone      TEXT,
  licenca_caar  TEXT,
  role          TEXT NOT NULL DEFAULT 'pilot' CHECK (role IN ('admin','pilot')),
  modulo_pulverizacao BOOLEAN DEFAULT TRUE,
  modulo_mapeamento   BOOLEAN DEFAULT TRUE,
  modulo_cotesia      BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  invite_status TEXT DEFAULT 'pending' CHECK (invite_status IN ('pending','accepted')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3) fazendas
CREATE TABLE IF NOT EXISTS fazendas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  nome          TEXT NOT NULL,
  estado        CHAR(2),
  cidade        TEXT,
  contato_nome  TEXT,
  telefone      TEXT,
  area_total    NUMERIC(12,2),
  observacoes   TEXT,
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4) drones
CREATE TABLE IF NOT EXISTS drones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  identificador TEXT NOT NULL,
  modelo        TEXT,
  registro_anac TEXT,
  numero_serie  TEXT,
  status        TEXT DEFAULT 'Em operação',
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5) auxiliary_lists
CREATE TABLE IF NOT EXISTS auxiliary_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  type          TEXT NOT NULL CHECK (type IN ('cultura','produto','servico','classe_produto','unidade')),
  label         TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6) aplicacoes
CREATE TABLE IF NOT EXISTS aplicacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id   UUID NOT NULL REFERENCES enterprises(id),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  fazenda_id      UUID NOT NULL REFERENCES fazendas(id),
  drone_id        UUID NOT NULL REFERENCES drones(id),
  data_aplicacao  TIMESTAMPTZ NOT NULL,
  cultura         TEXT NOT NULL,
  area_ha         NUMERIC(10,4) NOT NULL,
  horas_voo       NUMERIC(6,2),
  rendimento_ha_h NUMERIC(8,2),
  tipo_servico    TEXT,
  classe_produto  TEXT,
  produto_nome    TEXT NOT NULL,
  dosagem         NUMERIC(10,4),
  unidade         TEXT,
  num_art         TEXT,
  edited_by       UUID REFERENCES profiles(id),
  edited_at       TIMESTAMPTZ,
  edit_reason     TEXT,
  watermelon_id   TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 7) aplicacao_produtos
CREATE TABLE IF NOT EXISTS aplicacao_produtos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id   UUID NOT NULL REFERENCES enterprises(id),
  aplicacao_id    UUID NOT NULL REFERENCES aplicacoes(id) ON DELETE CASCADE,
  classe_produto  TEXT NOT NULL,
  produto_nome    TEXT NOT NULL,
  dosagem_ha      NUMERIC(10,4) NOT NULL CHECK (dosagem_ha > 0),
  unidade         TEXT NOT NULL,
  total_aplicado  NUMERIC(14,4) NOT NULL CHECK (total_aplicado >= 0),
  num_art         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8) audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  actor_id      UUID NOT NULL REFERENCES profiles(id),
  action        TEXT NOT NULL,
  target_table  TEXT NOT NULL,
  target_id     UUID,
  before_data   JSONB,
  after_data    JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_profiles_enterprise') THEN
    CREATE INDEX idx_profiles_enterprise ON profiles(enterprise_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_profiles_role') THEN
    CREATE INDEX idx_profiles_role ON profiles(enterprise_id, role);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_fazendas_enterprise') THEN
    CREATE INDEX idx_fazendas_enterprise ON fazendas(enterprise_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_fazendas_active') THEN
    CREATE INDEX idx_fazendas_active ON fazendas(enterprise_id, ativo);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_drones_enterprise') THEN
    CREATE INDEX idx_drones_enterprise ON drones(enterprise_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_drones_active') THEN
    CREATE INDEX idx_drones_active ON drones(enterprise_id, ativo);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_enterprise') THEN
    CREATE INDEX idx_aplic_enterprise ON aplicacoes(enterprise_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_user') THEN
    CREATE INDEX idx_aplic_user ON aplicacoes(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_fazenda') THEN
    CREATE INDEX idx_aplic_fazenda ON aplicacoes(fazenda_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_drone') THEN
    CREATE INDEX idx_aplic_drone ON aplicacoes(drone_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_data') THEN
    CREATE INDEX idx_aplic_data ON aplicacoes(data_aplicacao DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_aplic_cultura') THEN
    CREATE INDEX idx_aplic_cultura ON aplicacoes(cultura);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_audit_enterprise') THEN
    CREATE INDEX idx_audit_enterprise ON audit_logs(enterprise_id, created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_audit_actor') THEN
    CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
  END IF;
END$$;

-- Enable RLS on relevant tables (idempotent)
ALTER TABLE enterprises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE auxiliary_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION current_enterprise_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT enterprise_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION current_role_is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid()
$$;

-- Policies (drop if exist then create to be idempotent)
DROP POLICY IF EXISTS tenant_isolation ON aplicacoes;
CREATE POLICY tenant_isolation ON aplicacoes
  USING (enterprise_id = current_enterprise_id());

DROP POLICY IF EXISTS pilot_own_records ON aplicacoes;
CREATE POLICY pilot_own_records ON aplicacoes
  FOR SELECT USING (
    user_id = auth.uid() OR current_role_is_admin()
  );

DROP POLICY IF EXISTS admin_write_fazendas ON fazendas;
CREATE POLICY admin_write_fazendas ON fazendas
  FOR ALL USING (current_role_is_admin());

DROP POLICY IF EXISTS admin_write_drones ON drones;
CREATE POLICY admin_write_drones ON drones
  FOR ALL USING (current_role_is_admin());

DROP POLICY IF EXISTS admin_write_aux ON auxiliary_lists;
CREATE POLICY admin_write_aux ON auxiliary_lists
  FOR ALL USING (current_role_is_admin());

DROP POLICY IF EXISTS admin_edit_aplicacoes ON aplicacoes;
CREATE POLICY admin_edit_aplicacoes ON aplicacoes
  FOR UPDATE USING (current_role_is_admin());

DROP POLICY IF EXISTS admin_delete_aplicacoes ON aplicacoes;
CREATE POLICY admin_delete_aplicacoes ON aplicacoes
  FOR DELETE USING (current_role_is_admin());

-- Trigger: update_updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop if exist then create)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_enterprises_updated_at') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_enterprises_updated_at
      BEFORE UPDATE ON enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_profiles_updated_at
      BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_fazendas_updated_at') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_fazendas_updated_at
      BEFORE UPDATE ON fazendas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_drones_updated_at') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_drones_updated_at
      BEFORE UPDATE ON drones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_aplicacoes_updated_at') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_aplicacoes_updated_at
      BEFORE UPDATE ON aplicacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END$$;

-- Trigger: calc_rendimento
CREATE OR REPLACE FUNCTION calc_rendimento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.horas_voo IS NOT NULL AND NEW.horas_voo > 0 THEN
    NEW.rendimento_ha_h := ROUND((NEW.area_ha / NEW.horas_voo)::NUMERIC, 2);
  ELSE
    NEW.rendimento_ha_h := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calc_rendimento') THEN
    PERFORM 1;
  ELSE
    CREATE TRIGGER trg_calc_rendimento
      BEFORE INSERT OR UPDATE ON aplicacoes
      FOR EACH ROW EXECUTE FUNCTION calc_rendimento();
  END IF;
END$$;

COMMIT;

-- Fim da migration
