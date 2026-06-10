# PRD — Plataforma Administrativa PulviOn

## 1. Visão Geral
A Plataforma Administrativa da **PulviOn** é o ambiente web usado pelo gestor para acompanhar os registros enviados pelos pilotos, validar a consistência das informações, manter os cadastros operacionais e consultar indicadores por fazenda, piloto, drone e período. Ela implementa a nova identidade visual com fonte **Inter** e cores mais leves conforme o design system atualizado.

Ela complementa o app de campo offline‑first: o app coleta e sincroniza os registros, enquanto o painel administrativo centraliza, monitora e organiza essas informações em nível gerencial.

---

## 2. Objetivo do Módulo ADM
- Permitir acompanhamento centralizado de todos os registros sincronizados.
- Exibir indicadores operacionais por fazenda, piloto e equipamento.
- Facilitar auditoria, conferência e exportação dos dados.
- Servir como ponte de gestão entre o Supabase e o Google Sheets do cliente.
- Reduzir retrabalho manual na consolidação de informações para relatórios e conferências internas.

---

## 3. Persona Principal
### Administrador / Gestor Operacional
Responsável por:
- acompanhar a produção dos pilotos;
- validar se os registros chegaram corretamente;
- manter cadastro de fazendas, drones, usuários e listas auxiliares;
- consultar histórico operacional;
- filtrar desempenho por fazenda, piloto, período e status de sincronização.

---

## 4. Requisitos Funcionais

### RF01 — Login administrativo
O sistema deve permitir acesso apenas a usuários com perfil administrativo.

### RF02 — Dashboard geral
O painel deve exibir uma visão consolidada com:
- total de registros;
- total de hectares registrados;
- total de horas de voo;
- registros pendentes ou com falha de sincronização;
- quantidade de pilotos ativos;
- quantidade de fazendas com atividade no período.

### RF03 — Monitoramento de registros
O administrador deve visualizar todos os registros em tabela com filtros por:
- período;
- fazenda;
- piloto;
- drone;
- cultura;
- status de sincronização.

### RF04 — Monitoramento por fazenda
O sistema deve agrupar os registros por fazenda, mostrando:
- número total de aplicações;
- área total aplicada;
- horas de voo acumuladas;
- pilotos que atuaram na fazenda;
- produtos e serviços mais recorrentes.

### RF05 — Monitoramento por piloto
O sistema deve agrupar os registros por piloto, mostrando:
- total de registros lançados;
- área aplicada;
- horas de voo;
- fazendas atendidas;
- drone mais utilizado;
- histórico por período.

### RF06 — Gestão de cadastros
O administrador deve cadastrar, editar e inativar os principais objetos do sistema. Ao cadastrar **fazendas**, além de nome, UF, município e observações, deve ser possível registrar também o **nome do contato (cliente)** e o **telefone** no formato `(xx) xxxxx‑xxxx` (opcionais). Esses campos facilitam o contato direto com o responsável pela propriedade. As categorias de cadastro são:
- usuários;
- fazendas (nome, UF, município, observações, contato_nome, telefone);
- drones;
- listas auxiliares (culturas, produtos, tipos de serviço, unidades).

### RF07 — Detalhe do registro
Cada registro deve possuir um detalhe completo exibido em **modal** ao clicar em uma linha da tabela. O modal apresenta todos os campos técnicos do registro em pares chave/valor, além de:
- data de criação;
- data de atualização;
- responsável pelo lançamento;
- origem do dado;
- status de sincronização;
- botões de ação (editar / excluir / fechar).
O modal facilita a consulta sem navegação para outra página e segue os padrões de tamanho e estilo definidos no design system.

### RF08 — Exportação
O painel deve permitir exportar dados filtrados para:
- CSV/XLSX;
- impressão;
- eventual espelhamento para Google Sheets.

### RF09 — Auditoria operacional
O sistema deve permitir identificar:
- registros duplicados;
- registros incompletos;
- falhas de sincronização;
- diferenças entre Supabase e Google Sheets.

### RF10 — Multiempresa / White Label
O painel deve respeitar isolamento por empresa, carregando apenas dados vinculados ao `enterprise_id` do administrador autenticado.

---

## 5. Requisitos Não Funcionais
* Aplicação web responsiva.
* Interface limpa, objetiva e orientada a dados, com tipografia unificada usando a fonte **Inter** e paleta de cores atualizada da PulviOn.
* Boa performance em consultas com filtros.
* Segurança baseada em autenticação e RLS.
* Consistência entre painel, Supabase e Google Sheets.

---

## 6. Métricas de Sucesso
- Redução do tempo de conferência manual.
- Visualização completa dos registros sem depender de WhatsApp.
- Alta confiabilidade entre dado lançado, dado sincronizado e dado espelhado em planilha.
- Acompanhamento rápido por fazenda e por piloto.

---

## 7. Fora de Escopo Inicial
- BI avançado com mapas.
- Alertas automáticos por WhatsApp.
- Previsões estatísticas.
- Aplicativo móvel do admin.
