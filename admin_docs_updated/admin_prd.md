# PRD atual do PulviOn Admin

**Atualizado em:** 12 de junho de 2026

## Proposta

Centralizar a gestão operacional de aplicações agrícolas em uma interface web conectada diretamente ao banco Supabase.

## Funcionalidades

### Dashboard

- KPIs de aplicações, área, horas e fazendas.
- Tabela pesquisável e paginada de registros.
- Modal de detalhes com dados gerais e produtos aplicados.
- Card climático operacional.

### Cadastros

- Abas de Fazendas, Drones, Pilotos e Aplicações.
- Listagem responsiva em tabela ou cards mobile, busca, paginação, criação, visualização, edição e exclusão.
- Modais responsivos com scroll, ícones e badges.
- Aplicações com múltiplos produtos, total aplicado automático e ART opcional.

### Relatórios

- Indicadores operacionais.
- Filtros por período, piloto, fazenda e drone.
- Tabela paginada, detalhes completos, edição e exclusão de aplicações.

### Layout compartilhado

- Sidebar com Dashboard, Cadastros e Relatórios.
- Header contextual com logout.
- Footer institucional.
- Design system com Lucide React, badges semânticas e tokens PulviOn.

### Autenticação

- Login e logout com Supabase Auth.

## Persistência

O Supabase PostgreSQL é a única fonte de dados. O painel não possui integração com planilhas nem personalização de marca por cliente.

## Requisitos pendentes

- Proteger rotas e validar role administrativa.
- Substituir isolamento temporário do tenant demo por isolamento baseado no usuário autenticado.
- Remover tenant fixo.
- Criar convites reais de pilotos.
- Aplicar paginação e filtros no banco.
