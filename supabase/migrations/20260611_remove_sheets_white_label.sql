-- Remove integrações Google Sheets, White Label e campos legados de sincronização.
-- A aplicação passa a usar exclusivamente o PostgreSQL/Supabase como fonte de dados.

BEGIN;

DROP TABLE IF EXISTS sheets_sync_logs CASCADE;
DROP TABLE IF EXISTS sheets_config CASCADE;
DROP TABLE IF EXISTS white_label_config CASCADE;

ALTER TABLE enterprises
  DROP COLUMN IF EXISTS logo_url,
  DROP COLUMN IF EXISTS primary_color,
  DROP COLUMN IF EXISTS secondary_color,
  DROP COLUMN IF EXISTS tagline,
  DROP COLUMN IF EXISTS show_powered_by,
  DROP COLUMN IF EXISTS google_sheet_id,
  DROP COLUMN IF EXISTS sheet_tab_name;

ALTER TABLE aplicacoes
  DROP COLUMN IF EXISTS sync_status,
  DROP COLUMN IF EXISTS sheets_status,
  DROP COLUMN IF EXISTS sheets_row;

DELETE FROM storage.objects WHERE bucket_id = 'logos';
DELETE FROM storage.buckets WHERE id = 'logos';

COMMIT;
