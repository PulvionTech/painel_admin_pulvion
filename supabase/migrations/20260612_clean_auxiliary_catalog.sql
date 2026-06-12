BEGIN;

ALTER TABLE aplicacao_produtos
  ALTER COLUMN num_art DROP NOT NULL;

DELETE FROM auxiliary_lists duplicate
USING auxiliary_lists original
WHERE duplicate.enterprise_id = original.enterprise_id
  AND duplicate.type = original.type
  AND LOWER(TRIM(duplicate.label)) = LOWER(TRIM(original.label))
  AND duplicate.id > original.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_auxiliary_lists_unique_label
  ON auxiliary_lists (enterprise_id, type, LOWER(TRIM(label)));

NOTIFY pgrst, 'reload schema';

COMMIT;
