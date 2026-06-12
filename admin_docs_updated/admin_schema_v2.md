# Schema atual do banco

**Fonte:** migrations em `supabase/migrations`

## Tabelas

| Tabela | Finalidade |
|---|---|
| `enterprises` | Empresa/tenant |
| `profiles` | Administradores e pilotos |
| `fazendas` | Propriedades rurais |
| `drones` | Equipamentos |
| `auxiliary_lists` | Culturas, produtos, serviços, classes e unidades |
| `aplicacoes` | Registros operacionais |
| `aplicacao_produtos` | Produtos e totais vinculados a cada aplicação |
| `audit_logs` | Auditoria administrativa planejada |

## Aplicações

Campos principais:

- `enterprise_id`
- `user_id`
- `fazenda_id`
- `drone_id`
- `data_aplicacao`
- `cultura`
- `area_ha`
- `horas_voo`
- `rendimento_ha_h`
- `tipo_servico`
- `classe_produto`
- `produto_nome`
- `dosagem`
- `unidade`
- `num_art`
- campos de edição e timestamps

O trigger `calc_rendimento()` calcula automaticamente `rendimento_ha_h`.

## Produtos por aplicação

A migration `20260612_add_aplicacao_produtos.sql` cria a relação de múltiplos
produtos por aplicação. Cada produto armazena classe, nome, dosagem por hectare,
unidade, total aplicado e número ART opcional.

A função transacional `save_aplicacao_com_produtos()` garante que a aplicação e
seus produtos sejam salvos juntos. Os campos legados de produto em `aplicacoes`
continuam recebendo o primeiro produto para manter compatibilidade com telas
antigas.

A migration `20260612_clean_auxiliary_catalog.sql` remove opções duplicadas,
impede novas duplicações por empresa/tipo/nome e torna ART opcional. O frontend
combina as listas do Supabase com um catálogo base de culturas referenciadas pela
PAM/IBGE e oferece acesso à consulta oficial do AGROFIT/MAPA.

A migration `20260612_fix_aplicacao_produtos_rls.sql` permite o salvamento
transacional pelo painel atual, que ainda opera sem sessão autenticada. A RPC usa
`SECURITY DEFINER`, restringe a operação ao tenant demo e valida os vínculos de
piloto, fazenda e drone antes de gravar.

## Remoções

A migration `20260611_remove_sheets_white_label.sql` remove estruturas legadas que não fazem parte do produto:

- tabelas de integração externa;
- configuração de personalização por cliente;
- campos legados de sincronização;
- bucket legado de logos.

## Atualizações de fazendas

A migration `20260612_add_fazenda_details.sql` adiciona os campos usados pelo cadastro:

- `area_total` para a área da propriedade em hectares;
- `observacoes` para informações complementares.

## Divergências pendentes

- O frontend ainda usa tenant fixo em novos registros.

## Segurança

RLS precisa ser completada e validada. O diagnóstico atual identificou dados visíveis sem sessão autenticada.
