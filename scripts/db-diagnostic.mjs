import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadLocalEnv() {
  for (const filename of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), filename);
    if (!existsSync(path)) continue;

    const content = readFileSync(path, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function formatResult(status, target, detail) {
  const labels = {
    pass: 'OK',
    warn: 'AVISO',
    fail: 'FALHA',
  };
  return `${labels[status].padEnd(6)} | ${target.padEnd(22)} | ${detail}`;
}

loadLocalEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(formatResult('fail', 'configuracao', 'NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente.'));
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = [
  'enterprises',
  'profiles',
  'fazendas',
  'drones',
  'auxiliary_lists',
  'aplicacoes',
  'aplicacao_produtos',
  'audit_logs',
];

let failures = 0;
let warnings = 0;

console.log('Diagnostico somente leitura do Supabase');
console.log(`Projeto: ${new URL(url).hostname}`);
console.log('Status | Alvo                   | Resultado');
console.log('-'.repeat(90));

const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
const hasSession = Boolean(sessionData?.session);

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    failures += 1;
    console.log(formatResult('fail', table, `${error.code || 'sem codigo'}: ${error.message}`));
  } else if (!hasSession && Number(count) > 0) {
    warnings += 1;
    console.log(formatResult('warn', table, `anonimo sem sessao enxerga ${count} linha(s); revisar RLS/politicas.`));
  } else {
    console.log(formatResult('pass', table, `consulta aceita; linhas visiveis com anon atual: ${count ?? 'indeterminado'}`));
  }
}

if (sessionError) {
  failures += 1;
  console.log(formatResult('fail', 'auth.getSession', sessionError.message));
} else if (hasSession) {
  console.log(formatResult('pass', 'auth.getSession', `sessao ativa para ${sessionData.session.user.email || sessionData.session.user.id}`));
} else {
  warnings += 1;
  console.log(formatResult('warn', 'auth.getSession', 'sem sessao; esperado em diagnostico executado no terminal.'));
}

console.log('-'.repeat(90));
console.log(`Resumo: ${failures} falha(s), ${warnings} aviso(s). Nenhum dado foi alterado.`);

if (failures > 0) process.exitCode = 1;
