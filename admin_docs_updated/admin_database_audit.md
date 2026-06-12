# Auditoria funcional e comunicação com o banco

## Como executar

```bash
npm run db:diagnostic
```

O diagnóstico é somente leitura e testa o acesso às tabelas usadas pelo painel.

## Comunicação atual

| Funcionalidade | Operação no Supabase |
|---|---|
| Login e logout | Supabase Auth |
| Dashboard | Leitura de aplicações, profiles, fazendas e drones |
| Fazendas | Leitura, criação, edição e exclusão |
| Drones | Leitura, criação, edição e exclusão |
| Pilotos | Leitura, criação, edição e exclusão de profiles |
| Aplicações | Leitura, criação, edição e exclusão; produtos salvos por RPC transacional |
| Produtos da aplicação | Leitura e gravação vinculada à aplicação |
| Relatórios | Leitura, edição e exclusão de aplicações |

Toda persistência ocorre exclusivamente no PostgreSQL do Supabase.

## Resultado conhecido

A migration `20260612_enforce_demo_tenant_isolation.sql` habilita RLS nas tabelas
operacionais e limita as operações ao UUID do tenant demo. Esse é um isolamento
temporário entre tenants, mas não bloqueia o uso anônimo dentro do tenant demo.

A RPC `save_aplicacao_com_produtos()` usa `SECURITY DEFINER`, valida tenant,
piloto, fazenda e drone, e salva aplicação e produtos na mesma transação.

## Testes obrigatórios

1. Abrir `/dashboard` sem login.
2. Confirmar que o acesso não consegue ler ou gravar outro `enterprise_id`.
3. Criar e editar cada tipo de cadastro.
4. Recarregar a página e confirmar persistência.
5. Validar que empresa A não acessa dados da empresa B.
6. Validar erros de exclusão quando existirem relacionamentos.
7. Validar que aplicações com múltiplos produtos são salvas integralmente.

## Problemas prioritários

- Rotas administrativas sem proteção.
- Tenant fixo no frontend.
- Policies ainda não vinculadas a `auth.uid()`.
- Profile criado sem vínculo real com Auth.
- Tenant demo fixo no frontend e na RPC temporária.
