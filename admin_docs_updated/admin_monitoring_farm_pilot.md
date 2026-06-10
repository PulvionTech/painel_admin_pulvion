# Documento Funcional — Monitoramento de Registros por Fazenda e por Piloto

## 1. Objetivo
Criar um módulo administrativo que permita ao gestor acompanhar a operação de forma simples e confiável, com leitura rápida do desempenho por fazenda e por piloto.

---

## 2. Visão do módulo
O módulo deve transformar os registros brutos em visão gerencial, permitindo responder perguntas como:
- Qual fazenda teve mais atividade no período?
- Qual piloto lançou mais registros?
- Quem aplicou mais hectares?
- Onde houve falha de sincronização?
- Quais fazendas ou pilotos estão sem movimentação?

---

## 3. Monitoramento por fazenda
### Indicadores principais
- total de registros;
- área total aplicada;
- horas totais de voo;
- quantidade de pilotos atuantes;
- quantidade de drones utilizados;
- culturas registradas;
- produtos mais usados.

### Visualizações sugeridas
- cards de resumo;
- tabela com ranking de fazendas;
- gráfico por área aplicada;
- linha do tempo por dia/semana/mês;
- detalhe expandido da fazenda.

### Filtros
- período;
- unidade/empresa;
- cultura;
- piloto;
- drone;
- status de sincronização.

---

## 4. Monitoramento por piloto
### Indicadores principais
- número total de registros;
- área aplicada acumulada;
- horas de voo acumuladas;
- média de hectares por registro;
- fazendas atendidas;
- drone mais utilizado;
- registros com erro ou pendência.

### Visualizações sugeridas
- ranking de pilotos;
- gráfico comparativo de área aplicada;
- tabela detalhada;
- histórico por período;
- visão individual do piloto.

### Filtros
- período;
- fazenda;
- drone;
- cultura;
- tipo de serviço;
- status de sincronização.

---

## 5. Regras de negócio
- Todo indicador deve considerar apenas registros da empresa autenticada.
- Registros excluídos ou inválidos não entram nos totais oficiais.
- O agrupamento deve usar IDs relacionais, não apenas nomes textuais.
- Alterações retroativas devem refletir automaticamente nos indicadores.

---

## 6. Estrutura de dados mínima para o módulo
Campos essenciais:
- `aplicacoes.id`
- `aplicacoes.enterprise_id`
- `aplicacoes.user_id`
- `aplicacoes.fazenda_id`
- `aplicacoes.drone_id`
- `aplicacoes.data_aplicacao`
- `aplicacoes.area_ha`
- `aplicacoes.horas_voo`
- `aplicacoes.tipo_servico`
- `aplicacoes.produto_nome`
- `aplicacoes.created_at`
- `aplicacoes.updated_at`
- `users.nome`
- `fazendas.nome`
- `fazendas.contato_nome`   # Nome do contato/cliente da fazenda (opcional)
- `fazendas.telefone`       # Telefone de contato no formato (xx) xxxxx‑xxxx (opcional)
- `drones.identificador`

---

## 7. Layout sugerido do painel
### Aba 1 — Visão Geral
- cards com totais;
- gráfico por período;
- alertas de pendências.

### Aba 2 — Por Fazenda
- ranking de fazendas;
- filtro lateral;
- tabela com métricas;
- botão para ver detalhe.

### Aba 3 — Por Piloto
- ranking de pilotos;
- comparativo de performance;
- detalhamento individual.

### Aba 4 — Registros
- tabela bruta com busca e filtros;
- ação de exportar;
- ação de reprocessar sincronização.

---

## 8. Alertas úteis
- fazendas sem movimentação no período;
- piloto sem registro recente;
- registros pendentes de sincronização;
- divergência entre Supabase e Sheets;
- aumento abrupto ou queda de atividade.

---

## 9. Critérios de sucesso
- o gestor consegue localizar registros rapidamente;
- o acompanhamento por fazenda e por piloto reduz conferência manual;
- os números do painel batem com Supabase e planilha;
- o módulo ajuda na tomada de decisão diária.
