# Monitoramento por fazenda e piloto

**Atualizado em:** 12 de junho de 2026

## Monitoramento disponível hoje

### Fazenda

A aba de fazendas carrega todas as fazendas e aplicações no navegador. Ao selecionar uma fazenda, calcula:

- total de aplicações;
- área aplicada;
- última aplicação;
- quantidade de drones vinculados;
- quantidade de pilotos vinculados;
- últimas cinco aplicações.

Também permite buscar fazendas por nome, cidade, estado, contato e telefone.

### Piloto

A aba de pilotos atualmente é um cadastro simples. Exibe nome, telefone e licença CAAR, com criação e edição.

Não existem KPIs, ranking, histórico individual ou filtros de desempenho por piloto.

### Relatórios

A rota de relatórios permite filtrar aplicações por período, piloto, fazenda e drone. Os totais filtrados são calculados no navegador.

## Limitações atuais

- Consultas carregam conjuntos completos de dados; a paginação atual ocorre somente na interface.
- Agregações são feitas no cliente.
- Não há filtro por cultura ou serviço.
- Não há visão comparativa entre fazendas ou pilotos.
- Não há detecção de inatividade.
- Não há consultas agregadas ou views analíticas na migration atual.
- O isolamento depende do estado remoto das políticas RLS.

## Evolução recomendada

### Por fazenda

- Ranking por hectares e aplicações.
- Período configurável.
- Horas totais, rendimento e culturas.
- Alertas de fazenda sem atividade.
- Paginação do histórico.

### Por piloto

- Total de aplicações, hectares e horas.
- Fazendas atendidas e drones utilizados.
- Rendimento médio.
- Registros pendentes ou com erro.
- Última atividade.

### Implementação

Criar consultas agregadas no banco ou RPCs protegidas por RLS. Evitar carregar todas as aplicações para calcular indicadores no navegador.

## Critérios de confiabilidade

- Todo indicador deve respeitar `enterprise_id`.
- Filtros devem ser aplicados no banco.
- Totais devem excluir registros inválidos conforme regra explícita.
- Alterações retroativas devem refletir nos indicadores.
- Resultados devem ser comparados com consultas diretas no Supabase.
