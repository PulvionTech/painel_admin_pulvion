# Atualização consolidada do PulviOn Admin

**Data:** 12 de junho de 2026

## Interface e navegação

- Layout administrativo responsivo em desktop, tablet e celular.
- Sidebar fixa no desktop, recolhível e drawer no mobile.
- Destaque da rota ativa e scroll interno da navegação.
- Header contextual por página com saudação, data e logout.
- Footer institucional compartilhado.

## Tabelas e visualização

- Estrutura resumida de aplicações padronizada no Dashboard, Cadastros e Relatórios.
- Busca e paginação local reutilizável.
- Tabelas desktop com scroll horizontal e linhas alternadas.
- Cards compactos para registros em telas menores.
- Modais responsivos com scroll, ícones, badges e ações visíveis.
- Detalhes completos de aplicações e produtos aplicados.

## Cadastros e aplicações

- CRUD em tabela para fazendas, drones, pilotos e aplicações.
- Formatação de telefone para fazendas e pilotos.
- Campos de área total e observações das fazendas alinhados ao schema.
- Aplicações suportam múltiplos produtos.
- Total aplicado calculado por dosagem por hectare multiplicada pela área.
- Número ART opcional.
- Catálogos auxiliares deduplicados e combinados com catálogo agrícola base.

## Supabase

- Supabase PostgreSQL permanece como única fonte de dados.
- Aplicação e produtos são salvos juntos pela RPC `save_aplicacao_com_produtos()`.
- RLS habilitada com isolamento temporário no tenant demo.
- Todas as consultas operacionais alteradas incluem filtro de `enterprise_id`.

## Componentes adicionados

- `ApplicationPresentation`
- `Footer`
- `Pagination`
- `VisualTokens`

## Validação

- Build de produção executado com sucesso usando `npm run build`.

## Relatórios

- Filtros funcionais por período, piloto, fazenda, drone, cultura e produto.
- Modal inicialmente somente leitura, com edição acessada pelo ícone de lápis.
- Exportação CSV compatível com Excel.
- PDF profissional com marca PulviOn, contexto dos filtros, totais e paginação.
- Pré-visualização do PDF e geração para uma única aplicação ou resultado filtrado.
- Compartilhamento por API nativa quando disponível e fallback para WhatsApp/e-mail.

## Login

- Página responsiva alinhada ao design system PulviOn.
- Painel institucional com benefícios operacionais do produto.
- Inputs com ícones, foco visual e exibição de senha.
- Recuperação e atualização de senha integradas ao Supabase Auth.
- Solicitação de acesso por e-mail.

## Pendências para produção

- Proteger rotas `/dashboard`.
- Vincular policies RLS ao usuário autenticado.
- Remover UUID fixo do tenant demo.
- Criar fluxo seguro de convite de pilotos.
- Migrar paginação, filtros e agregações para consultas server-side.
- Adicionar testes automatizados.
