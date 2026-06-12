BEGIN;

ALTER TABLE fazendas
  ADD COLUMN IF NOT EXISTS area_total NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

NOTIFY pgrst, 'reload schema';

COMMIT;
