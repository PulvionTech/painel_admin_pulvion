# Especificação técnica atual

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | App Router e páginas |
| React 18 | Interface |
| TypeScript | Tipagem |
| Tailwind CSS | Estilos |
| Supabase JS | Auth e PostgreSQL |
| React Hook Form | Formulários |
| Lucide React | Ícones |

## Rotas

```text
/login
/dashboard
/dashboard/cadastros
/dashboard/relatorios
```

## Arquitetura

```text
Navegador
  -> Next.js Client Components
  -> Supabase JS
  -> Supabase Auth e PostgreSQL
```

Todos os dados administrativos são inseridos e atualizados diretamente no banco Supabase. Não existem API Routes, middleware ou Server Actions no estado atual.

As aplicações com múltiplos produtos são gravadas pela RPC PostgreSQL
`save_aplicacao_com_produtos()`, permitindo persistir aplicação e produtos na
mesma transação.

## Componentes compartilhados

- `Sidebar`: navegação fixa, recolhível e drawer mobile.
- `Header`: contexto da rota, saudação, data e logout.
- `Footer`: rodapé institucional compartilhado.
- `CadastroTable`: busca, paginação local, tabela desktop e cards mobile.
- `CadastroModal`: visualização e ações responsivas.
- `ApplicationPresentation`: detalhes e produtos das aplicações.
- `Pagination`: navegação paginada reutilizável.
- `VisualTokens`: badges e ícones semânticos.
- `WeatherCard`: clima operacional compacto.

## Limites arquiteturais atuais

- A maior parte das páginas usa Client Components.
- Filtros, indicadores e paginação são calculados no navegador.
- O tenant demo ainda está fixo no frontend.
- Não há middleware protegendo `/dashboard`.
- As policies atuais isolam o tenant demo, mas ainda não identificam o usuário autenticado.

## Variáveis usadas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:diagnostic
```
