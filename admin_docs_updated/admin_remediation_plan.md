# Plano de correção do PulviOn Admin

## Fase 1: segurança

1. Criar ou confirmar administrador no Supabase Auth.
2. Garantir `profiles.id = auth.users.id`.
3. Completar e ativar RLS.
4. Bloquear acesso anônimo.
5. Proteger rotas `/dashboard`.

## Fase 2: multiempresa

1. Remover todos os `TEST_ENTERPRISE_ID`.
2. Derivar empresa do usuário autenticado.
3. Validar empresa via políticas `WITH CHECK`.
4. Testar isolamento entre duas empresas.

## Fase 3: contratos de dados

1. Definir `area_total` e `observacoes` em fazendas.
2. Padronizar o campo `ativo`.
3. Alinhar obrigatoriedade de `produto_nome`.
4. Melhorar validações e mensagens de erro.

## Fase 4: usuários

1. Criar convite de piloto em backend seguro.
2. Vincular profile ao Auth.
3. Remover geração de UUID e e-mail de demonstração no navegador.

## Fase 5: operação

1. Criar auditoria administrativa.
2. Aplicar paginação e filtros no banco.
3. Adicionar testes automatizados.

## Decisões definitivas

- PostgreSQL/Supabase é a única fonte de dados.
- Integrações com planilhas não fazem parte do produto.
- White Label não faz parte do produto.
