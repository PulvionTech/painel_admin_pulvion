# 🔗 Integração Google Sheets — PulviOn
**Versão 2.0**

---

## 1. Visão Geral do Pipeline

```
[Piloto sincroniza no app mobile]
         │
         ▼
[INSERT / UPDATE em `aplicacoes` no Supabase]
         │
         ▼
[Database Webhook dispara → Edge Function `sync-to-sheets`]
         │
         ├── Busca sheets_config da empresa
         ├── Resolve nomes (piloto, fazenda, drone) via JOIN
         ├── Formata dados conforme column_mapping
         │
         ▼
[Google Sheets API — spreadsheets.values.append / update]
         │
         ├── Sucesso → sheets_status = 'synced', sheets_row = N
         │             → INSERT em sheets_sync_logs (success)
         │
         └── Erro    → sheets_status = 'error'
                       → INSERT em sheets_sync_logs (error)
                       → Badge de alerta no painel admin
```

---

## 2. Pré-requisitos

### 2.1 Google Cloud — Service Account

1. Acesse [console.cloud.google.com](https://console.cloud.google.com).
2. Crie projeto `pulvion-sheets` (ou use existente).
3. Ative a **Google Sheets API**.
4. Crie uma **Service Account** em IAM & Admin → Service Accounts.
   - Nome sugerido: `pulvion-sync`
   - Baixe a chave JSON.
5. Anote o campo `client_email` da chave.

### 2.2 Permissão na planilha do cliente

O administrador da empresa deve:
1. Abrir a planilha Google Sheets da empresa.
2. Clicar em **Compartilhar**.
3. Adicionar o `client_email` da Service Account como **Editor**.
4. Copiar o ID da planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
5. Inserir o ID no painel admin → Integração Sheets.

### 2.3 Secrets no Supabase

No dashboard do Supabase → Edge Functions → Secrets:

```
GOOGLE_CLIENT_EMAIL    = pulvion-sync@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY     = -----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
```

> ⚠️ Representar quebras de linha como `\n` literais. Nunca commitar a chave no repositório.

---

## 3. Configuração do Database Webhook

No Supabase → Database → Webhooks:

| Campo | Valor |
|:---|:---|
| **Nome** | `on_aplicacao_change` |
| **Tabela** | `public.aplicacoes` |
| **Eventos** | `INSERT`, `UPDATE` |
| **Tipo** | Supabase Edge Function |
| **Edge Function** | `sync-to-sheets` |

---

## 4. Edge Function: `sync-to-sheets`

**Localização:** `supabase/functions/sync-to-sheets/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ─── JWT para Google API ─────────────────────────────────────────────
async function getGoogleAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL")!
  const privateKey   = Deno.env.get("GOOGLE_PRIVATE_KEY")!.replace(/\\n/g, "\n")

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const header   = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const body     = btoa(JSON.stringify(payload))
  const input    = `${header}.${body}`

  const key = await crypto.subtle.importKey(
    "pkcs8", pemToBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  )

  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(input))
  const jwt = `${input}.${bufToBase64url(sig)}`

  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const { access_token } = await res.json()
  return access_token
}

// ─── Handler principal ───────────────────────────────────────────────
serve(async (req) => {
  try {
    const { record, type } = await req.json()
    if (!record?.id) return json({ error: "Payload inválido" }, 400)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 1. Config da empresa
    const { data: config } = await supabase
      .from("sheets_config")
      .select("*, enterprises(google_sheet_id, sheet_tab_name)")
      .eq("enterprise_id", record.enterprise_id)
      .single()

    if (!config?.enterprises?.google_sheet_id) {
      await supabase.from("aplicacoes")
        .update({ sheets_status: "skipped" }).eq("id", record.id)
      return json({ skipped: true })
    }

    // 2. Resolver relações
    const [piloto, fazenda, drone] = await Promise.all([
      supabase.from("profiles").select("nome").eq("id", record.user_id).single(),
      supabase.from("fazendas").select("nome, municipio, uf").eq("id", record.fazenda_id).single(),
      supabase.from("drones").select("identificador").eq("id", record.drone_id).single(),
    ])

    // 3. Montar linha conforme mapeamento
    const mapping = config.column_mapping as Record<string, string>
    const values: Record<string, string> = {
      data_aplicacao: new Date(record.data_aplicacao).toLocaleDateString("pt-BR"),
      piloto_nome:    piloto.data?.nome ?? "",
      fazenda_nome:   fazenda.data?.nome ?? "",
      municipio:      fazenda.data?.municipio ?? "",
      uf:             fazenda.data?.uf ?? "",
      drone:          drone.data?.identificador ?? "",
      cultura:        record.cultura ?? "",
      area_ha:        String(record.area_ha ?? ""),
      horas_voo:      String(record.horas_voo ?? ""),
      tipo_servico:   record.tipo_servico ?? "",
      classe_produto: record.classe_produto ?? "",
      produto_nome:   record.produto_nome ?? "",
      dosagem:        String(record.dosagem ?? ""),
      unidade:        record.unidade ?? "",
      num_art:        record.num_art ?? "",
    }

    const row = Object.entries(mapping)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([field]) => values[field] ?? "")

    // 4. Inserir / atualizar no Sheets
    const token    = await getGoogleAccessToken()
    const sheetId  = config.enterprises.google_sheet_id
    const tabName  = config.enterprises.sheet_tab_name ?? "Registros"

    let sheetsRes: Response
    if (type === "UPDATE" && record.sheets_row) {
      // UPDATE: sobrescreve a linha existente
      const range = `${tabName}!A${record.sheets_row}`
      sheetsRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [row] }) }
      )
    } else {
      // INSERT: append nova linha
      sheetsRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tabName}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [row] }) }
      )
    }

    if (!sheetsRes.ok) {
      throw new Error(`Sheets API ${sheetsRes.status}: ${await sheetsRes.text()}`)
    }

    // Capturar o número da linha inserida (apenas em INSERT)
    let sheetsRow = record.sheets_row
    if (type !== "UPDATE") {
      const resBody = await sheetsRes.json()
      const range   = resBody.updates?.updatedRange ?? ""
      const match   = range.match(/!A(\d+)/)
      if (match) sheetsRow = parseInt(match[1])
    }

    // 5. Atualizar status
    await supabase.from("aplicacoes").update({
      sheets_status: "synced",
      sheets_row: sheetsRow
    }).eq("id", record.id)

    await supabase.from("sheets_sync_logs").insert({
      enterprise_id: record.enterprise_id,
      aplicacao_id:  record.id,
      piloto_nome:   piloto.data?.nome,
      fazenda_nome:  fazenda.data?.nome,
      area_ha:       record.area_ha,
      status:        "success",
    })

    return json({ success: true, sheetsRow })

  } catch (err) {
    const error = err as Error
    console.error("[sync-to-sheets] Erro:", error.message)

    try {
      const { record } = await req.clone().json()
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      )
      if (record?.id) {
        await supabase.from("aplicacoes")
          .update({ sheets_status: "error" }).eq("id", record.id)
        await supabase.from("sheets_sync_logs").insert({
          enterprise_id: record.enterprise_id,
          aplicacao_id:  record.id,
          status:        "error",
          error_message: error.message,
        })
      }
    } catch (_) {}

    return json({ error: error.message }, 500)
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────
function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" }
  })
}

function pemToBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "")
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

function bufToBase64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}
```

---

## 5. Reprocessamento de Erros (Painel Admin)

```typescript
// app/api/sheets/retry/route.ts
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: erros } = await supabase
    .from('aplicacoes')
    .select('id, enterprise_id')
    .eq('sheets_status', 'error')
    .limit(50)

  if (!erros?.length) {
    return NextResponse.json({ message: 'Nenhum erro pendente' })
  }

  const resultados = await Promise.allSettled(
    erros.map(({ id }) =>
      supabase.functions.invoke('sync-to-sheets', {
        body: { type: 'RETRY', record: { id } }
      })
    )
  )

  return NextResponse.json({
    sucesso: resultados.filter(r => r.status === 'fulfilled').length,
    falha:   resultados.filter(r => r.status === 'rejected').length,
    total:   erros.length
  })
}
```

---

## 6. Estrutura Padrão da Planilha

| Col | Campo | Exemplo |
|:---|:---|:---|
| A | Data | 28/06/2025 |
| B | Piloto | João Silva |
| C | Fazenda | Faz. Boa Vista |
| D | Município | Uberaba |
| E | UF | MG |
| F | Drone | Drone 01 |
| G | Cultura | Soja |
| H | Área (ha) | 45,50 |
| I | Horas Voo | 1,8 |
| J | Tipo Serviço | Pulverização |
| K | Classe Produto | Fungicida |
| L | Produto | Priori Xtra |
| M | Dosagem | 0,30 |
| N | Unidade | L/ha |
| O | Nº ART | (vazio) |

O mapeamento é configurável pelo admin no painel → Integração Sheets.

---

## 7. Estados de `sheets_status`

| Status | Significado | Ação no painel |
|:---|:---|:---|
| `pending` | Aguardando Edge Function | Estado transitório (< 5s) — nenhuma |
| `synced` | Linha inserida/atualizada com sucesso | Nenhuma — badge verde |
| `error` | Falha na API do Sheets | Badge vermelho + botão "Re-tentar" |
| `skipped` | Empresa sem Sheets configurado | Orientar admin a configurar o ID |

---

## 8. Alertas no Painel Admin

Quando `sheets_status = 'error'` existir em qualquer registro da empresa:

1. **Sidebar:** badge numérico amarelo no item "Integração Sheets".
2. **Dashboard:** banner de alerta no topo com piloto, fazenda e data do registro afetado.
3. **KPI "Erros Sheets":** valor > 0 com fundo amarelo e texto "reprocessar".
4. **Tabela de Relatórios:** linha com erro tem fundo #FFFDE7.

---

## 9. Troubleshooting

| Erro | Causa | Solução |
|:---|:---|:---|
| `The caller does not have permission` | Service Account não adicionada à planilha | Compartilhar a planilha com `client_email` como Editor |
| `Requested entity was not found` | ID da planilha incorreto ou planilha deletada | Verificar e corrigir o ID no painel |
| `Unable to parse range` | Nome da aba não existe | Verificar nome exato da aba (case-sensitive) |
| Status preso em `pending` | Webhook ou Edge Function não deployada | Verificar no Supabase se o webhook e a função estão ativos |
| `Invalid JWT` | `GOOGLE_PRIVATE_KEY` com quebras de linha erradas | Confirmar que `\n` estão corretos nos Secrets |

---

## 10. Deploy da Edge Function

```bash
# Instalar CLI
npm install -g supabase

# Login e link
supabase login
supabase link --project-ref <project-ref>

# Configurar secrets
supabase secrets set GOOGLE_CLIENT_EMAIL="agroregistro-sync@projeto.iam.gserviceaccount.com"
supabase secrets set GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Deploy
supabase functions deploy sync-to-sheets --no-verify-jwt
```

O flag `--no-verify-jwt` é necessário porque o webhook do Supabase não envia JWT de usuário — a autenticação é pela chave interna do projeto.

---

## 11. Limites e Volume Estimado

| Dimensão | Limite | Estimativa de uso |
|:---|:---|:---|
| Google Sheets API — req/min | 300/projeto | ~5 req/min (pico) |
| Google Sheets — linhas/planilha | ~5 milhões | ~2.400 linhas/ano por empresa |
| Supabase Edge Functions — invocações | 500k/mês (free) | ~2k/mês (10 empresas) |
| Supabase Webhooks | Sem limite documentado | 1 webhook por tabela |

Com o volume atual estimado (200 registros/mês/empresa), o sistema opera confortavelmente dentro dos limites gratuitos mesmo com 10+ empresas ativas.
