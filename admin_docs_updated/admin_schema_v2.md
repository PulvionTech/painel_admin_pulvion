# 🗄️ Schema do Banco de Dados — Painel Administrativo PulviOn
**Versão 2.0**

---

## 1. Diagrama de Relacionamento

```
enterprises
    ├── profiles            (usuários vinculados à empresa)
    ├── fazendas            (propriedades rurais)
    ├── drones              (frota de equipamentos)
    ├── auxiliary_lists     (culturas, produtos, serviços, classes)
    ├── aplicacoes          (registros de campo — tabela principal)
    ├── sheets_config       (mapeamento de colunas do Google Sheets)
    └── white_label_config  (identidade visual do app mobile)

aplicacoes
    ├── → profiles  (user_id)
    ├── → fazendas  (fazenda_id)
    └── → drones    (drone_id)

sheets_sync_logs
    └── → aplicacoes (aplicacao_id)

audit_logs
    └── → profiles (actor_id)
```

---

## 2. Tabelas

### 2.1 `enterprises` — Tenant raiz

```sql
CREATE TABLE enterprises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE,                    -- Ex: "agrovoa"
  logo_url          TEXT,
  primary_color     TEXT DEFAULT '#5EC680',
  secondary_color   TEXT DEFAULT '#0E5162',
  tagline           TEXT,                           -- Slogan exibido no app
  show_powered_by   BOOLEAN DEFAULT TRUE,           -- Selo "Powered by PulviOn"
  google_sheet_id   TEXT,
  sheet_tab_name    TEXT DEFAULT 'Registros',
  is_active         BOOLEAN DEFAULT TRUE,
  plan              TEXT DEFAULT 'base'             -- 'base' | 'pro'
    CHECK (plan IN ('base', 'pro')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.2 `profiles` — Usuários do sistema

Tabela de pilotos e usuários administrativos. Cada profile pertence a uma empresa.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  telefone      TEXT,
  licenca_caar  TEXT,
  role          TEXT NOT NULL DEFAULT 'pilot'
    CHECK (role IN ('admin', 'pilot')),

  -- Módulos habilitados no app mobile
  modulo_pulverizacao BOOLEAN DEFAULT TRUE,
  modulo_mapeamento   BOOLEAN DEFAULT TRUE,
  modulo_cotesia      BOOLEAN DEFAULT FALSE,

  is_active     BOOLEAN DEFAULT TRUE,
  invite_status TEXT DEFAULT 'pending'
    CHECK (invite_status IN ('pending', 'accepted')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_enterprise ON profiles(enterprise_id);
CREATE INDEX idx_profiles_role       ON profiles(enterprise_id, role);
```

---

### 2.3 `fazendas` — Propriedades rurais

```sql
CREATE TABLE fazendas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  nome          TEXT NOT NULL,
  estado        CHAR(2),
  cidade        TEXT,
  contato_nome  TEXT,                -- Nome do contato/cliente (opcional)
  telefone      TEXT,                -- Telefone no formato (xx) xxxxx-xxxx (opcional)
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fazendas_enterprise ON fazendas(enterprise_id);
CREATE INDEX idx_fazendas_active     ON fazendas(enterprise_id, ativo);
```

---

### 2.4 `drones` — Frota de equipamentos

```sql
CREATE TABLE drones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  identificador TEXT NOT NULL,        -- "Drone 01" — exibido no app
  modelo        TEXT,                 -- "DJI Agras T40"
  registro_anac TEXT,                 -- Registro ANAC: "ANAC-XXXXXX"
  numero_serie  TEXT,
  status        TEXT DEFAULT 'Em operação',
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drones_enterprise ON drones(enterprise_id);
CREATE INDEX idx_drones_active     ON drones(enterprise_id, ativo);
```

---

### 2.5 `auxiliary_lists` — Listas de apoio

Tabela polimórfica para dropdowns do app (culturas, produtos, serviços, classes).

```sql
CREATE TABLE auxiliary_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  type          TEXT NOT NULL
    CHECK (type IN ('cultura', 'produto', 'servico', 'classe_produto', 'unidade')),
  label         TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aux_enterprise_type ON auxiliary_lists(enterprise_id, type);
```

---

### 2.6 `aplicacoes` — Registros de aplicação (tabela principal)

```sql
CREATE TABLE aplicacoes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id   UUID NOT NULL REFERENCES enterprises(id),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  fazenda_id      UUID NOT NULL REFERENCES fazendas(id),
  drone_id        UUID NOT NULL REFERENCES drones(id),

  -- Dados de operação
  data_aplicacao  TIMESTAMPTZ NOT NULL,
  cultura         TEXT NOT NULL,
  area_ha         NUMERIC(10, 4) NOT NULL,
  horas_voo       NUMERIC(6, 2),
  rendimento_ha_h NUMERIC(8, 2),             -- Calculado: area_ha / horas_voo

  -- Dados de produto
  tipo_servico    TEXT,
  classe_produto  TEXT,
  produto_nome    TEXT NOT NULL,
  dosagem         NUMERIC(10, 4),
  unidade         TEXT,

  -- Conformidade
  num_art         TEXT,

  -- Edição administrativa
  edited_by       UUID REFERENCES profiles(id),
  edited_at       TIMESTAMPTZ,
  edit_reason     TEXT,                      -- Motivo da edição (auditoria)

  -- Sincronização
  sync_status     TEXT NOT NULL DEFAULT 'synced'
    CHECK (sync_status IN ('synced', 'pending', 'error')),
  sheets_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (sheets_status IN ('pending', 'synced', 'error', 'skipped')),
  sheets_row      INT,                       -- Linha na planilha Google Sheets
  watermelon_id   TEXT UNIQUE,              -- ID local WatermelonDB

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para queries de monitoramento e filtros do painel
CREATE INDEX idx_aplic_enterprise    ON aplicacoes(enterprise_id);
CREATE INDEX idx_aplic_user          ON aplicacoes(user_id);
CREATE INDEX idx_aplic_fazenda       ON aplicacoes(fazenda_id);
CREATE INDEX idx_aplic_drone         ON aplicacoes(drone_id);
CREATE INDEX idx_aplic_data          ON aplicacoes(data_aplicacao DESC);
CREATE INDEX idx_aplic_cultura       ON aplicacoes(cultura);
CREATE INDEX idx_aplic_sheets_error  ON aplicacoes(enterprise_id, sheets_status)
  WHERE sheets_status = 'error';
```

---

### 2.7 `sheets_config` — Configuração de integração com Google Sheets

```sql
CREATE TABLE sheets_config (
  id             INT PRIMARY KEY DEFAULT 1,
  google_sheet_id TEXT,
  header_row      INT DEFAULT 1,
  data_start_row  INT DEFAULT 2,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

> Observação: o painel atual grava as configurações usando `upsert({ id: 1, google_sheet_id })`.


---

### 2.8 `white_label_config` — Identidade visual do app

Configuração de cores usada pela página White Label do painel.

```sql
CREATE TABLE white_label_config (
  id              INT PRIMARY KEY DEFAULT 1,
  primary_color   TEXT DEFAULT '#5EC680',
  secondary_color TEXT DEFAULT '#0E5162',
  logo_url        TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

> Observação: o painel atual grava as configurações usando `upsert({ id: 1, primary_color, secondary_color })`.


---

### 2.9 `sheets_sync_logs` — Log de sincronização

```sql
CREATE TABLE sheets_sync_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  aplicacao_id  UUID REFERENCES aplicacoes(id) ON DELETE SET NULL,
  piloto_nome   TEXT,                        -- Desnormalizado para display no log
  fazenda_nome  TEXT,
  area_ha       NUMERIC(10, 4),
  status        TEXT NOT NULL
    CHECK (status IN ('success', 'error', 'retry', 'skipped')),
  error_message TEXT,
  attempt_count INT DEFAULT 1,
  executed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sheets_logs_enterprise ON sheets_sync_logs(enterprise_id, executed_at DESC);
CREATE INDEX idx_sheets_logs_error      ON sheets_sync_logs(enterprise_id, status)
  WHERE status = 'error';
```

---

### 2.10 `audit_logs` — Log de ações administrativas

```sql
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id),
  actor_id      UUID NOT NULL REFERENCES profiles(id),
  action        TEXT NOT NULL,
  -- Valores possíveis:
  -- CREATE_FAZENDA, UPDATE_FAZENDA, DEACTIVATE_FAZENDA
  -- CREATE_DRONE, UPDATE_DRONE, DEACTIVATE_DRONE
  -- INVITE_PILOT, UPDATE_PILOT, DEACTIVATE_PILOT
  -- UPDATE_APLICACAO, DELETE_APLICACAO
  -- UPDATE_WHITE_LABEL, UPDATE_SHEETS_CONFIG
  target_table  TEXT NOT NULL,
  target_id     UUID,
  before_data   JSONB,
  after_data    JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_enterprise ON audit_logs(enterprise_id, created_at DESC);
CREATE INDEX idx_audit_actor      ON audit_logs(actor_id);
```

---

## 3. Views Analíticas para o Dashboard

### View: KPIs mensais

```sql
CREATE VIEW vw_dashboard_kpis AS
SELECT
  enterprise_id,
  DATE_TRUNC('month', data_aplicacao)              AS mes,
  COUNT(id)                                        AS total_aplicacoes,
  ROUND(SUM(area_ha)::NUMERIC, 2)                  AS total_ha,
  ROUND(SUM(horas_voo)::NUMERIC, 1)                AS total_horas,
  ROUND(AVG(area_ha)::NUMERIC, 2)                  AS media_ha_por_aplicacao,
  COUNT(DISTINCT user_id)                          AS pilotos_ativos,
  COUNT(DISTINCT fazenda_id)                       AS fazendas_atendidas,
  COUNT(*) FILTER (WHERE sheets_status = 'error')  AS erros_sheets
FROM aplicacoes
GROUP BY enterprise_id, DATE_TRUNC('month', data_aplicacao);
```

### View: Resumo por piloto

```sql
CREATE VIEW vw_resumo_por_piloto AS
SELECT
  a.enterprise_id,
  a.user_id,
  p.full_name              AS piloto_nome,
  p.email,
  COUNT(a.id)               AS total_aplicacoes,
  ROUND(SUM(a.area_ha)::NUMERIC, 2)  AS total_ha,
  ROUND(SUM(a.horas_voo)::NUMERIC, 1) AS total_horas,
  MAX(a.data_aplicacao)     AS ultima_aplicacao
FROM aplicacoes a
JOIN profiles p ON p.id = a.user_id
GROUP BY a.enterprise_id, a.user_id, p.full_name, p.email;
```

### View: Resumo por fazenda

```sql
CREATE VIEW vw_resumo_por_fazenda AS
SELECT
  a.enterprise_id,
  a.fazenda_id,
  f.nome                    AS fazenda_nome,
  f.cidade,
  f.estado,
  COUNT(a.id)               AS total_aplicacoes,
  ROUND(SUM(a.area_ha)::NUMERIC, 2)  AS total_ha,
  COUNT(DISTINCT a.user_id) AS pilotos_distintos,
  MAX(a.data_aplicacao)     AS ultima_aplicacao
FROM aplicacoes a
JOIN fazendas f ON f.id = a.fazenda_id
GROUP BY a.enterprise_id, a.fazenda_id, f.nome, f.cidade, f.estado;
```

### View: Distribuição por cultura

```sql
CREATE VIEW vw_distribuicao_cultura AS
SELECT
  enterprise_id,
  DATE_TRUNC('month', data_aplicacao) AS mes,
  cultura,
  COUNT(*)                            AS total_aplicacoes,
  ROUND(SUM(area_ha)::NUMERIC, 2)     AS total_ha,
  ROUND(
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (
      PARTITION BY enterprise_id, DATE_TRUNC('month', data_aplicacao)
    ), 1
  )                                   AS percentual
FROM aplicacoes
GROUP BY enterprise_id, DATE_TRUNC('month', data_aplicacao), cultura;
```

---

## 4. Row Level Security (RLS)

```sql
-- Habilitar em todas as tabelas
ALTER TABLE enterprises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazendas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE auxiliary_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets_sync_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- Função auxiliar
CREATE OR REPLACE FUNCTION current_enterprise_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT enterprise_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION current_role_is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid()
$$;

-- Política base: isolamento por tenant
CREATE POLICY tenant_isolation ON aplicacoes
  USING (enterprise_id = current_enterprise_id());

-- Admin vê tudo da empresa; piloto só vê os próprios
CREATE POLICY pilot_own_records ON aplicacoes
  FOR SELECT USING (
    user_id = auth.uid() OR current_role_is_admin()
  );

-- Apenas admin escreve em fazendas, drones e listas
CREATE POLICY admin_write_fazendas ON fazendas
  FOR ALL USING (current_role_is_admin());

CREATE POLICY admin_write_drones ON drones
  FOR ALL USING (current_role_is_admin());

CREATE POLICY admin_write_aux ON auxiliary_lists
  FOR ALL USING (current_role_is_admin());

-- Apenas admin edita/exclui aplicações
CREATE POLICY admin_edit_aplicacoes ON aplicacoes
  FOR UPDATE USING (current_role_is_admin());

CREATE POLICY admin_delete_aplicacoes ON aplicacoes
  FOR DELETE USING (current_role_is_admin());
```

---

## 5. Triggers

### Atualização automática de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enterprises_updated_at
  BEFORE UPDATE ON enterprises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fazendas_updated_at
  BEFORE UPDATE ON fazendas    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_drones_updated_at
  BEFORE UPDATE ON drones      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_aplicacoes_updated_at
  BEFORE UPDATE ON aplicacoes  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Cálculo automático de rendimento

```sql
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

CREATE TRIGGER trg_calc_rendimento
  BEFORE INSERT OR UPDATE ON aplicacoes
  FOR EACH ROW EXECUTE FUNCTION calc_rendimento();
```

---

## 6. Próximos Passos

- [ ] Criar migration inicial no Supabase CLI com todas as tabelas.
- [ ] Rodar seeds de `auxiliary_lists` com culturas padrão do MAPA e classes de agrotóxicos.
- [ ] Configurar Database Webhook na tabela `aplicacoes` (INSERT + UPDATE) → Edge Function `sync-to-sheets`.
- [ ] Validar isolamento RLS em staging com dois tenants de teste.
- [ ] Popular `sheets_config` com mapeamento padrão para todas as empresas no onboarding.
