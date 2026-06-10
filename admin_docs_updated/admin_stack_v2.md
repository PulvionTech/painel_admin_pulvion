# 🛠️ Especificação Técnica — Painel Administrativo PulviOn
**Versão 2.0**

---

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────────┐
│            ADMIN DASHBOARD (Vercel)                  │
│         Next.js 14 + App Router + TypeScript         │
│                                                      │
│  ┌──────────────┐  ┌────────────────────────────┐   │
│  │  Auth Layer  │  │  Páginas / Módulos          │   │
│  │  Middleware  │  │  TanStack Query + shadcn    │   │
│  └──────────────┘  └────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS + Supabase JS v2
          ┌──────────▼──────────┐
          │      SUPABASE        │
          │  PostgreSQL + RLS    │
          │  Auth (JWT)          │
          │  Storage (logos)     │
          │  Realtime            │
          │  Edge Functions      │
          │  Database Webhooks   │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  GOOGLE SHEETS API   │
          │  (via Edge Function) │
          └─────────────────────┘
```

---

## 2. Stack Tecnológica

### Frontend

| Tecnologia | Versão | Uso |
|:---|:---|:---|
| **Next.js** | 14 (App Router) | Framework principal. SSR, middleware de rotas, API Routes. |
| **TypeScript** | 5.x | Tipagem estrita. Tipos gerados via `supabase gen types`. |
| **Tailwind CSS** | 3.x | Utilidades de estilo. Cores do brandbook via CSS variables. |
| **shadcn/ui** | latest | Componentes acessíveis (Radix UI) sem lock-in de versão. |
| **TanStack Query** | v5 | Cache, refetch, invalidação de queries, estado servidor-cliente. |
| **Supabase JS** | v2 | Auth, database, realtime, storage, edge functions. |
| **date-fns** | 3.x | Manipulação de datas sem overhead do moment.js. |
| **react-hook-form + zod** | latest | Validação de formulários com schema tipado. |

### Backend

| Serviço | Uso |
|:---|:---|
| **PostgreSQL (Supabase)** | Banco principal com RLS e multi-tenancy. |
| **Supabase Auth** | Login e-mail/senha + sistema de convites. |
| **Supabase Storage** | Upload e servimento do logotipo (white label). |
| **Supabase Realtime** | Notificações em tempo real de novos registros no dashboard. |
| **Edge Functions (Deno)** | Pipeline sync Supabase → Google Sheets. |
| **Database Webhooks** | Disparam Edge Function em INSERT/UPDATE em `aplicacoes`. |

### Hospedagem e CI/CD

| Serviço | Uso |
|:---|:---|
| **Vercel** | Deploy automático via push no `main`. Preview por PR. |
| **GitHub Actions** | Lint, typecheck e testes antes do merge. |

---

## 3. Estrutura de Rotas (App Router)

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx                  # Tela de login (split layout)
│
├── (dashboard)/
│   ├── layout.tsx                    # Sidebar + Topbar compartilhados
│   ├── page.tsx                      # Dashboard (KPIs + cards)
│   │
│   ├── relatorios/
│   │   ├── page.tsx                  # Tabela completa com filtros
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Visualização do registro
│   │   │   └── editar/page.tsx       # Edição do registro
│   │
│   ├── cadastros/
│   │   └── page.tsx                  # Abas: Fazendas / Drones / Pilotos
│   │
│   ├── integracao/
│   │   └── page.tsx                  # Config Google Sheets + logs
│   │
│   └── white-label/
│       └── page.tsx                  # Config identidade visual + preview
│
└── api/
    ├── export/route.ts               # Exportação CSV
    └── sheets/retry/route.ts         # Reprocessar erros Sheets
```

---

## 4. Componentes Principais

### Layout

```typescript
// Sidebar navigation item
interface NavItem {
  label: string
  href: string
  icon: ReactNode
  badge?: number        // Para alertas (ex: erros Sheets)
}

// Topbar
interface TopbarProps {
  title: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: ReactNode
  showPeriodSelect?: boolean
}
```

### Tabela de Relatórios

```typescript
interface AplicacaoRow {
  id: string
  data_aplicacao: string
  piloto: { nome: string; email: string }
  fazenda: { nome: string; municipio: string; uf: string }
  drone: { identificador: string; modelo?: string }
  cultura: string
  area_ha: number
  horas_voo?: number
  tipo_servico?: string
  produto_nome: string
  classe_produto?: string
  dosagem?: number
  unidade?: string
  sheets_status: 'synced' | 'pending' | 'error' | 'skipped'
}

interface TableFilters {
  fazenda_id?: string
  user_id?: string
  cultura?: string
  drone_id?: string
  sheets_status?: string
  date_from?: string
  date_to?: string
}
```

### Drawer (visualizar / editar / novo registro)

```typescript
type DrawerMode = 'view' | 'edit' | 'new'

interface DrawerProps {
  mode: DrawerMode
  aplicacaoId?: string       // undefined quando mode === 'new'
  onClose: () => void
  onSave: () => void
}
```

---

## 5. Padrão de Fetching (TanStack Query + Supabase)

```typescript
// hooks/useAplicacoes.ts
export function useAplicacoes(filters: TableFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['aplicacoes', filters],
    queryFn: async () => {
      let query = supabase
        .from('aplicacoes')
        .select(`
          *,
          profiles:user_id (nome, email),
          fazendas:fazenda_id (nome, municipio, uf),
          drones:drone_id (identificador, modelo, prefixo)
        `)
        .order('data_aplicacao', { ascending: false })

      if (filters.fazenda_id)    query = query.eq('fazenda_id', filters.fazenda_id)
      if (filters.user_id)       query = query.eq('user_id', filters.user_id)
      if (filters.cultura)       query = query.eq('cultura', filters.cultura)
      if (filters.drone_id)      query = query.eq('drone_id', filters.drone_id)
      if (filters.sheets_status) query = query.eq('sheets_status', filters.sheets_status)
      if (filters.date_from)     query = query.gte('data_aplicacao', filters.date_from)
      if (filters.date_to)       query = query.lte('data_aplicacao', filters.date_to)

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 30_000,
  })
}

// hooks/useDashboardKPIs.ts
export function useDashboardKPIs(periodo: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-kpis', periodo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_kpis')
        .select('*')
        .eq('mes', getCurrentMonthISO(periodo))
        .single()
      if (error) throw error
      return data
    },
    staleTime: 60_000,
  })
}
```

---

## 6. Realtime: Atualização do Dashboard

```typescript
// Invalida queries ao chegar novo registro em tempo real
export function useRealtimeAplicacoes() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('aplicacoes-realtime')
      .on('postgres_changes', {
        event: '*',               // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'aplicacoes'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['aplicacoes'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
        queryClient.invalidateQueries({ queryKey: ['sheets-logs'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, queryClient])
}
```

---

## 7. Middleware de Autenticação e Controle de Acesso

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Sem sessão → login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verifica role admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', session.user.id)
    .single()

  // Piloto ou inativo → sem acesso ao painel admin
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return NextResponse.redirect(new URL('/login?error=acesso-negado', req.url))
  }

  return res
}

export const config = {
  matcher: ['/(dashboard)/:path*', '/api/:path*']
}
```

---

## 8. Upload de Logo (White Label)

```typescript
// Supabase Storage — bucket: 'logos' (público)
async function uploadLogo(file: File, enterpriseId: string) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${enterpriseId}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(path)

  // Atualiza a enterprise com a nova URL
  await supabase
    .from('enterprises')
    .update({ logo_url: publicUrl })
    .eq('id', enterpriseId)

  return publicUrl
}
```

---

## 9. Exportação CSV

```typescript
// app/api/export/route.ts
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const params = req.nextUrl.searchParams

  let query = supabase
    .from('aplicacoes')
    .select(`
      data_aplicacao,
      profiles:user_id (nome),
      fazendas:fazenda_id (nome, municipio, uf),
      drones:drone_id (identificador),
      cultura, area_ha, horas_voo, tipo_servico,
      classe_produto, produto_nome, dosagem, unidade, num_art
    `)
    .order('data_aplicacao', { ascending: true })

  // Aplicar filtros da querystring
  if (params.get('fazenda_id'))    query = query.eq('fazenda_id', params.get('fazenda_id')!)
  if (params.get('user_id'))       query = query.eq('user_id', params.get('user_id')!)
  if (params.get('date_from'))     query = query.gte('data_aplicacao', params.get('date_from')!)
  if (params.get('date_to'))       query = query.lte('data_aplicacao', params.get('date_to')!)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = [
    'Data', 'Piloto', 'Fazenda', 'Município', 'UF', 'Drone',
    'Cultura', 'Área (ha)', 'Horas Voo', 'Tipo Serviço',
    'Classe Produto', 'Produto', 'Dosagem', 'Unidade', 'Nº ART'
  ]

  const rows = (data as any[]).map(r => [
    new Date(r.data_aplicacao).toLocaleDateString('pt-BR'),
    r.profiles?.nome ?? '',
    r.fazendas?.nome ?? '',
    r.fazendas?.municipio ?? '',
    r.fazendas?.uf ?? '',
    r.drones?.identificador ?? '',
    r.cultura, r.area_ha, r.horas_voo ?? '',
    r.tipo_servico ?? '', r.classe_produto ?? '',
    r.produto_nome, r.dosagem ?? '', r.unidade ?? '', r.num_art ?? ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  return new NextResponse('\uFEFF' + csv, {   // BOM para Excel
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="agroregistro-${Date.now()}.csv"`
    }
  })
}
```

---

## 10. Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>     # Apenas Server-side

# App
NEXT_PUBLIC_APP_URL=https://admin.agroregistro.com.br
NEXT_PUBLIC_APP_NAME=PulviOn
```

---

## 11. Cronograma de Desenvolvimento

| Semana | Entrega |
|:---|:---|
| **Semana 1** | Setup Next.js + Supabase + Migrations + RLS + Auth + Middleware |
| **Semana 2** | Layout base (Sidebar + Topbar) + Dashboard + KPIs + Realtime |
| **Semana 3** | Relatórios (tabela, filtros, drawer, exportação CSV) |
| **Semana 4** | Visualização e edição de registro + log de auditoria |
| **Semana 5** | Cadastros (Fazendas, Drones, Pilotos + convite por e-mail) |
| **Semana 6** | Integração Sheets (config + log) + White Label (preview ao vivo) |
| **Semana 7** | Tela de Login + fluxo de recuperação de senha + testes E2E |
| **Semana 8** | QA, ajustes de UX, deploy em produção, onboarding do primeiro cliente |

---

## 12. Decisões Técnicas

| Decisão | Alternativa descartada | Motivo |
|:---|:---|:---|
| Next.js App Router | CRA / Vite SPA | SSR nativo, middleware, melhor DX com Supabase Server Client |
| shadcn/ui | Chakra UI, MUI | Sem lock-in, componentes copiados no projeto, 100% customizáveis |
| TanStack Query | SWR | API mais rica, suporte a mutations otimistas, melhor devtools |
| CSV no cliente (API Route) | Edge Function | Sem custo extra, suficiente para volumes < 10k linhas |
| Realtime via Supabase | Polling a cada 30s | UX melhor para o admin ver novos registros chegando ao vivo |
| Upload de logo no Storage | Cloudinary / S3 | Já incluso no Supabase, sem custo adicional no plano atual |
