# Visão geral do PulviOn Admin

**Atualizado em:** 12 de junho de 2026

O PulviOn Admin é um painel web para consultar aplicações agrícolas, manter cadastros operacionais e analisar resultados. Toda inserção e atualização de informações ocorre exclusivamente no banco PostgreSQL do Supabase.

## Navegação

- `/dashboard`
- `/dashboard/cadastros`
- `/dashboard/relatorios`

O menu lateral contém somente Dashboard, Cadastros e Relatórios.

## Módulos

| Módulo | Estado |
|---|---|
| Login | Supabase Auth |
| Dashboard | KPIs, registros e clima operacional |
| Cadastros | Tabelas e CRUD de fazendas, drones, pilotos e aplicações |
| Relatórios | Filtros, indicadores e edição de aplicações |
| Banco | Supabase PostgreSQL acessado pelo frontend |

## Estado atual da interface

- Layout responsivo para desktop, tablet e celular.
- Sidebar fixa no desktop, recolhível e transformada em drawer no mobile.
- Header contextual por rota, com saudação, data e logout.
- Footer compartilhado em todas as páginas administrativas.
- Tabelas com busca, paginação local, scroll horizontal e cards compactos no mobile.
- Modais responsivos com scroll vertical, ícones semânticos e badges de status.
- Dashboard, Cadastros e Relatórios usam a mesma estrutura resumida de aplicações.
- Detalhes de aplicação mostram todos os dados gerais e a lista completa de produtos.

## Documentos

- `admin_prd.md`: produto atual.
- `admin_prd_v2.md`: backlog de evolução.
- `admin_stack_v2.md`: arquitetura e stack.
- `admin_schema_v2.md`: schema atual.
- `admin_database_audit.md`: comunicação com o banco e testes.
- `admin_remediation_plan.md`: plano priorizado de correções.
- `admin_monitoring_farm_pilot.md`: monitoramento por fazenda e piloto.
- `admin_design_system.md`: padrões visuais.

## Prioridades

1. Proteger rotas administrativas.
2. Substituir as policies temporárias do tenant demo por RLS baseada em `auth.uid()`.
3. Remover tenant fixo do frontend.
4. Implementar convites reais de usuários.
5. Migrar filtros e paginação para consultas server-side.
