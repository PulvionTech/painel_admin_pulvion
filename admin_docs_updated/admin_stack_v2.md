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
