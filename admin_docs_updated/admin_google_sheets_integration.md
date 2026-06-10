# Documento Técnico — Integração Supabase ↔ Google Sheets

## 1. Objetivo
A integração com o Google Sheets tem como finalidade espelhar os registros consolidados no Supabase para uma planilha operacional do cliente, mantendo a planilha como ambiente de conferência, exportação e continuidade do processo administrativo.

---

## 2. Papel de cada camada
- **App de Campo:** coleta os dados e envia para o Supabase.
- **Supabase:** base central e fonte principal da verdade operacional.
- **Google Sheets:** camada de visualização, conferência, exportação e adaptação ao fluxo já usado pelas empresas.
- **Painel ADM:** interface de gestão e acompanhamento em tempo real.

---

## 3. Fluxo proposto
### 3.1 Fluxo de ida
1. O piloto registra a aplicação no app.
2. O app salva localmente e, quando possível, sincroniza com o Supabase.
3. O Supabase grava o registro na tabela principal.
4. Um evento de banco (webhook/trigger) aciona uma Edge Function.
5. A Edge Function identifica a empresa (`enterprise_id`) e sua planilha vinculada.
6. A função insere ou atualiza a linha correspondente no Google Sheets.

### 3.2 Fluxo de volta
1. O administrador atualiza fazendas, drones ou listas auxiliares no painel ou na planilha.
2. O Supabase recebe a versão válida desses cadastros.
3. O app sincroniza as listas atualizadas ao iniciar com internet.

---

## 4. Estratégia de sincronização
### Fonte primária
O **Supabase deve ser a fonte primária** dos registros.

### Fonte secundária
O **Google Sheets deve funcionar como espelho operacional**, não como banco principal.

Isso evita conflitos de edição, perda de integridade e duplicação de regras de negócio.

---

## 5. Estrutura mínima da planilha
Abas sugeridas:
- `Registros`
- `Fazendas`
- `Drones`
- `Produtos`
- `Usuarios`
- `Logs_Sync`

### Colunas mínimas da aba Registros
- id
- enterprise_id
- user_id
- piloto_nome
- fazenda_id
- fazenda_nome
- drone_id
- drone_identificador
- data_aplicacao
- municipio
- uf
- cultura
- area_ha
- horas_voo
- tipo_servico
- classe_produto
- produto_nome
- dosagem
- unidade
- num_art
- created_at
- updated_at
- sync_status
- synced_to_sheets_at

---

## 6. Regras técnicas recomendadas
- Usar chave única por registro (`id`) para evitar duplicidade.
- Operar com `upsert` lógico: se o `id` já existir na planilha, atualizar; se não existir, inserir.
- Registrar logs de tentativa, sucesso e erro.
- Registrar data/hora da última sincronização.
- Salvar mensagens de erro em aba ou tabela de logs.

---

## 7. Tratamento de falhas
O sistema deve prever:
- falha de autenticação com Google API;
- planilha removida ou sem permissão;
- erro de quota da API;
- colunas alteradas manualmente;
- registros enviados parcialmente.

### Ação recomendada
Quando ocorrer falha:
1. marcar o registro com status `sheet_error`;
2. salvar o motivo do erro;
3. permitir reprocessamento manual no painel ADM.

---

## 8. Segurança
- Cada empresa deve ter seu `google_sheet_id` próprio.
- Credenciais da Google API devem ficar apenas no backend.
- O frontend nunca deve expor tokens sensíveis.
- A sincronização deve respeitar isolamento por tenant.

---

## 9. Benefícios esperados
- Continuidade do processo já conhecido pelas empresas.
- Menor resistência de adoção.
- Facilidade para auditoria e exportação.
- Visão unificada entre operação, gestão e planilha.

---

## 10. Próximos passos técnicos
- Definir contrato de colunas do Sheets.
- Criar Edge Function de envio.
- Criar tabela de logs de sincronização.
- Criar botão de reprocessamento no painel ADM.
- Criar indicador visual de saúde da integração.
