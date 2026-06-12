BEGIN;

DROP POLICY IF EXISTS demo_read_aplicacao_produtos ON aplicacao_produtos;
CREATE POLICY demo_read_aplicacao_produtos ON aplicacao_produtos
  FOR SELECT
  USING (enterprise_id = '00000000-0000-0000-0000-000000000001'::UUID);

CREATE OR REPLACE FUNCTION save_aplicacao_com_produtos(
  p_aplicacao JSONB,
  p_produtos JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demo_enterprise_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001'::UUID;
  v_aplicacao_id UUID := COALESCE((p_aplicacao->>'id')::UUID, gen_random_uuid());
  v_first_product JSONB;
BEGIN
  IF (p_aplicacao->>'enterprise_id')::UUID <> v_demo_enterprise_id THEN
    RAISE EXCEPTION 'Empresa não autorizada.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = (p_aplicacao->>'user_id')::UUID AND enterprise_id = v_demo_enterprise_id)
    OR NOT EXISTS (SELECT 1 FROM fazendas WHERE id = (p_aplicacao->>'fazenda_id')::UUID AND enterprise_id = v_demo_enterprise_id)
    OR NOT EXISTS (SELECT 1 FROM drones WHERE id = (p_aplicacao->>'drone_id')::UUID AND enterprise_id = v_demo_enterprise_id) THEN
    RAISE EXCEPTION 'Piloto, fazenda ou drone não pertence à empresa.';
  END IF;

  IF EXISTS (SELECT 1 FROM aplicacoes WHERE id = v_aplicacao_id AND enterprise_id <> v_demo_enterprise_id) THEN
    RAISE EXCEPTION 'Aplicação não pertence à empresa.';
  END IF;

  IF jsonb_array_length(p_produtos) = 0 THEN
    RAISE EXCEPTION 'Adicione pelo menos um produto.';
  END IF;

  v_first_product := p_produtos->0;

  INSERT INTO aplicacoes (
    id, enterprise_id, data_aplicacao, user_id, fazenda_id, drone_id,
    cultura, area_ha, horas_voo, tipo_servico, classe_produto,
    produto_nome, dosagem, unidade, num_art
  )
  VALUES (
    v_aplicacao_id, v_demo_enterprise_id,
    (p_aplicacao->>'data_aplicacao')::TIMESTAMPTZ,
    (p_aplicacao->>'user_id')::UUID,
    (p_aplicacao->>'fazenda_id')::UUID,
    (p_aplicacao->>'drone_id')::UUID,
    p_aplicacao->>'cultura',
    (p_aplicacao->>'area_ha')::NUMERIC,
    (p_aplicacao->>'horas_voo')::NUMERIC,
    p_aplicacao->>'tipo_servico',
    v_first_product->>'classe_produto',
    v_first_product->>'produto_nome',
    (v_first_product->>'dosagem_ha')::NUMERIC,
    v_first_product->>'unidade',
    NULLIF(v_first_product->>'num_art', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    data_aplicacao = EXCLUDED.data_aplicacao,
    user_id = EXCLUDED.user_id,
    fazenda_id = EXCLUDED.fazenda_id,
    drone_id = EXCLUDED.drone_id,
    cultura = EXCLUDED.cultura,
    area_ha = EXCLUDED.area_ha,
    horas_voo = EXCLUDED.horas_voo,
    tipo_servico = EXCLUDED.tipo_servico,
    classe_produto = EXCLUDED.classe_produto,
    produto_nome = EXCLUDED.produto_nome,
    dosagem = EXCLUDED.dosagem,
    unidade = EXCLUDED.unidade,
    num_art = EXCLUDED.num_art
  WHERE aplicacoes.enterprise_id = v_demo_enterprise_id;

  DELETE FROM aplicacao_produtos
  WHERE aplicacao_id = v_aplicacao_id
    AND enterprise_id = v_demo_enterprise_id;

  INSERT INTO aplicacao_produtos (
    enterprise_id, aplicacao_id, classe_produto, produto_nome,
    dosagem_ha, unidade, total_aplicado, num_art
  )
  SELECT
    v_demo_enterprise_id,
    v_aplicacao_id,
    product->>'classe_produto',
    product->>'produto_nome',
    (product->>'dosagem_ha')::NUMERIC,
    product->>'unidade',
    (product->>'dosagem_ha')::NUMERIC * (p_aplicacao->>'area_ha')::NUMERIC,
    NULLIF(product->>'num_art', '')
  FROM jsonb_array_elements(p_produtos) AS product;

  RETURN v_aplicacao_id;
END;
$$;

REVOKE ALL ON FUNCTION save_aplicacao_com_produtos(JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_aplicacao_com_produtos(JSONB, JSONB) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
