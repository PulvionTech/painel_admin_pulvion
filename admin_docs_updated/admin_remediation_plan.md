# Plano de correção do PulviOn Admin

## Fase 1: segurança

1. Criar ou confirmar administrador no Supabase Auth.
2. Garantir `profiles.id = auth.users.id`.
3. Substituir as policies temporárias do tenant demo por policies baseadas em `auth.uid()`.
4. Bloquear acesso anônimo.
5. Proteger rotas `/dashboard`.

## Fase 2: multiempresa

1. Remover todos os `TEST_ENTERPRISE_ID`.
2. Derivar empresa do usuário autenticado.
3. Validar empresa via políticas `WITH CHECK`.
4. Testar isolamento entre duas empresas.

## Fase 3: contratos de dados

1. Padronizar o campo `ativo`.
2. Melhorar validações e mensagens de erro.
3. Remover campos legados de produto em `aplicacoes` após migração completa.

## Fase 4: usuários

1. Criar convite de piloto em backend seguro.
2. Vincular profile ao Auth.
3. Remover geração de UUID e e-mail de demonstração no navegador.

## Fase 5: operação

1. Criar auditoria administrativa.
2. Migrar paginação e filtros atuais do navegador para o banco.
3. Adicionar testes automatizados.

## Correções concluídas em 12 de junho de 2026

- Campos `area_total` e `observacoes` adicionados às fazendas.
- Telefone formatado nos cadastros de fazendas e pilotos.
- Aplicações com múltiplos produtos e cálculo automático do total aplicado.
- Número ART tornou-se opcional.
- Catálogos auxiliares sem duplicidades.
- RPC transacional para salvar aplicação e produtos.
- Isolamento temporário do tenant demo por RLS.
- Responsividade, paginação local e padronização visual das páginas.
- Sidebar, header contextual e footer compartilhados.

## Decisões definitivas

- PostgreSQL/Supabase é a única fonte de dados.
- Integrações com planilhas não fazem parte do produto.
- White Label não faz parte do produto.
