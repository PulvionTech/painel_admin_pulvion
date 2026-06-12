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
| Aplicações | Leitura, criação, edição e exclusão |
| Relatórios | Leitura e edição de aplicações |

Toda persistência ocorre exclusivamente no PostgreSQL do Supabase.

## Resultado conhecido

Sem sessão autenticada, a anon key conseguiu visualizar registros operacionais. Isso indica RLS desabilitada ou permissiva no banco remoto.

## Testes obrigatórios

1. Abrir `/dashboard` sem login.
2. Confirmar que acesso anônimo ao banco retorna zero registros.
3. Criar e editar cada tipo de cadastro.
4. Recarregar a página e confirmar persistência.
5. Validar que empresa A não acessa dados da empresa B.
6. Validar erros de exclusão quando existirem relacionamentos.

## Problemas prioritários

- Rotas administrativas sem proteção.
- Tenant fixo no frontend.
- RLS incompleta.
- Profile criado sem vínculo real com Auth.
- Divergências entre formulário e schema.
