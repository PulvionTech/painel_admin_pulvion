# Backlog de evolução do PulviOn Admin

## Prioridade crítica

- Criar administrador vinculado ao Supabase Auth.
- Proteger todas as rotas `/dashboard`.
- Substituir policies temporárias do tenant demo por RLS baseada em `auth.uid()`.
- Remover `TEST_ENTERPRISE_ID`.
- Garantir isolamento por empresa.

## Prioridade alta

- Criar fluxo real de convite de pilotos.
- Melhorar validações e mensagens de erro.
- Adicionar auditoria administrativa.
- Aplicar filtros e paginação no banco.

## Prioridade média

- Dashboard com agregações server-side.
- Monitoramento comparativo por fazenda e piloto.
- Atualizações em tempo real quando justificadas.
- Testes automatizados.

## Fora de escopo

- Integrações com planilhas.
- Personalização White Label.
- BI geoespacial.
- Painel financeiro.
- Aplicativo móvel administrativo.

## Entregas concluídas em 12 de junho de 2026

- Responsividade das páginas administrativas.
- Sidebar fixa, recolhível e drawer mobile.
- Header contextual e footer compartilhado.
- Paginação local nas tabelas.
- Padronização visual de tabelas, cards e modais.
- Detalhes completos e produtos vinculados às aplicações.
- Múltiplos produtos por aplicação, cálculo de totais e ART opcional.
- Catálogo agrícola sem duplicidades.
- Isolamento temporário das operações no tenant demo.
