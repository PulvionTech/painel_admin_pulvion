# PRD atual do PulviOn Admin

**Atualizado em:** 11 de junho de 2026

## Proposta

Centralizar a gestão operacional de aplicações agrícolas em uma interface web conectada diretamente ao banco Supabase.

## Funcionalidades

### Dashboard

- KPIs de aplicações, área, horas e fazendas.
- Tabela pesquisável de registros.
- Modal de detalhes.
- Card climático operacional.

### Cadastros

- Abas de Fazendas, Drones, Pilotos e Aplicações.
- Listagem em tabela, busca, criação, visualização, edição e exclusão.
- Modais responsivos com scroll.

### Relatórios

- Indicadores operacionais.
- Filtros por período, piloto, fazenda e drone.
- Tabela e edição de aplicações.

### Autenticação

- Login e logout com Supabase Auth.

## Persistência

O Supabase PostgreSQL é a única fonte de dados. O painel não possui integração com planilhas nem personalização de marca por cliente.

## Requisitos pendentes

- Proteger rotas e validar role administrativa.
- Aplicar isolamento real por empresa.
- Completar políticas RLS.
- Remover tenant fixo.
- Alinhar campos de fazendas e aplicações ao schema.
- Criar convites reais de pilotos.
