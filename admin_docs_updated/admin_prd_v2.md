# PRD — Painel Administrativo PulviOn
**Versão 2.0 — Documentação completa pós-prototipagem**

---

## 1. Visão Geral

O Painel Administrativo é a interface web centralizada para o **Gestor/Administrador** da empresa de pulverização. Permite acompanhar operações em tempo real, gerenciar cadastros, corrigir registros dos pilotos e garantir que os dados fluam corretamente para o Google Sheets.

Hospedado no Vercel, consome a API do Supabase com autenticação por perfil `admin`. A versão 2.0 adotou a nova identidade visual da **PulviOn**, com paleta baseada em verde e teal e tipografia **Inter**, proporcionando uma experiência mais limpa e moderna.

---

## 2. Estrutura de Navegação

### Menu lateral (sidebar — fundo Teal PulviOn #0E5162)

```
Principal
  ├── Dashboard
  └── Relatórios

Cadastros
  ├── Cadastros       (Fazendas / Drones / Pilotos via abas)
  ├── Integração Sheets
  └── White Label
```

**Regras do menu:**
- Item ativo: fundo Verde PulviOn (#5EC680), texto branco.
- Badge de alerta em amarelo claro (#FEEEB4) no item "Integração Sheets" quando houver erros pendentes.
- Rodapé da sidebar: chip do usuário logado com avatar, nome e role.

---

## 3. Tela de Login

### Layout
Split horizontal: painel esquerdo (480 px, fundo Teal PulviOn) + painel direito (flex, branco).

### Painel esquerdo
- Logo + nome da plataforma no topo.
- Headline impactante: *"Cada voo registrado. Cada dado seguro."*
- Descrição curta da proposta de valor.
- Decoração visual: camadas de círculos concêntricos em verde claro com baixa opacidade + linhas diagonais sutis.
- Rodapé com 3 stats: `200+ registros/mês`, `100% offline-ready`, `MAPA compliance`.

### Painel direito — formulário
- Separador decorativo "acesso restrito" com pontos verdes.
- Título "Boas-vindas" + subtítulo.
- Campo e-mail com ícone de envelope.
- Campo senha com toggle mostrar/ocultar.
- Checkbox "Manter conectado" + link "Esqueci minha senha".
- Botão **Entrar no painel** (Verde PulviOn, com seta →).
- Link "Solicite seu acesso" para novos usuários.
- Nota de segurança discreta no rodapé.

### Fluxos implementados

| Estado | Gatilho | Comportamento |
|:---|:---|:---|
| Login correto | `admin@exemplo.com` + senha | Spinner → tela de sucesso com botão "Ir para o dashboard" |
| Login incorreto | Credenciais erradas | Erro com contador de tentativas restantes |
| Bloqueio | 3 erros consecutivos | Botão travado por 5 segundos |
| Esqueci senha | Link no formulário | Tela com campo de e-mail + botão enviar |
| E-mail enviado | Após envio | Confirmação com ícone e link de volta |

### Validações
- Campos vazios: borda vermelha + mensagem.
- Foco: borda Verde PulviOn + sombra suave.
- Estado de loading: ícone giratório + texto "Verificando…".

---

## 4. Dashboard

### Topbar
- Saudação personalizada: "Bom dia, [Nome] 👋".
- Data atual por extenso.
- Seletor de período: Este mês / Mês anterior / Últimos 30 dias / Este ano.
- Badge "Sheets: ativo" em verde.

### Banner de alerta
Aparece **apenas** quando há erros no Sheets. Fundo amarelo claro (#FEEEB4) conforme a paleta de estado de alerta, ícone na mesma cor, descrição do erro específico (piloto + fazenda + data) e botão "Ver no Sheets →".

### KPIs (6 cards)
Cada card tem: ícone colorido, label em uppercase, valor grande, subtítulo e delta de comparação com mês anterior.

| KPI | Cor da barra | Ícone | Delta |
|:---|:---|:---|:---|
| Aplicações | Verde PulviOn | documento | ↑ ↓ percentual |
| Hectares | Verde PulviOn | casa/fazenda | ↑ ↓ percentual |
| Horas de voo | Teal PulviOn | relógio | ↑ ↓ percentual |
| Pilotos ativos | Teal PulviOn | pessoas | — igual / ↑ ↓ |
| Fazendas | Teal PulviOn | casa | ↑ ↓ quantidade |
| Erros Sheets | Amarelo Alerta | triângulo alerta | texto "reprocessar" |

### Seção principal (grid 2:1)
**Coluna larga:** Tabela "Últimos registros" com colunas Data, Piloto, Fazenda, Cultura, Área e Sheets. Linhas com erro Sheets ficam com fundo amarelo claro (#FFFBEA). Botão "Ver todos →" leva aos Relatórios.

**Coluna estreita (empilhados):**
1. Card "Por cultura" — barras horizontais com %. Cores padrão: **Verde PulviOn** para Soja, **Teal PulviOn** para Milho, **Amarelo Alerta** para Cana e **cinza** para Outras.
2. Card "Google Sheets" — 3 últimos eventos do log com status (ícone verde ok / vermelho erro).

### Seção inferior (grid 1:1)
- **Desempenho por piloto** — avatar com iniciais, nome, stats (aplic. + horas), barra de progresso relativa ao top piloto, total de ha à direita.
- **Top fazendas** — ícone verde, nome, cidade/UF, total de ha à direita. Botão "Ver todas →".

---

## 5. Relatórios

### Cards de resumo (3 colunas)
- **Operação do período:** total de aplicações, hectares, horas, média ha/aplicação.
- **Cultura predominante:** lista com badges coloridos por cultura.
- **Status Google Sheets:** contagem de sincronizados, erros, pendentes e taxa de sucesso.

### Filtros
Linha de selects e inputs de data com chips reativos:
- Período (com opção de intervalo customizado que abre dois date inputs).
- Fazenda, Piloto, Cultura, Drone, Status Sheets.
- Chips aparecem abaixo dos filtros com "×" para remover individualmente + "Limpar todos".
- Botões: **Exportar CSV** e **+ Novo registro** (abre drawer lateral).

### Tabela de registros
Colunas completas:

| # | Coluna | Observação |
|:---|:---|:---|
| 1 | Checkbox | Seleção em massa |
| 2 | Data | Ordenável |
| 3 | Piloto | Ordenável |
| 4 | Fazenda | Ordenável |
| 5 | Município / UF | Cinza, informativo |
| 6 | Drone | |
| 7 | Cultura | Ordenável |
| 8 | Área (ha) | Ordenável, negrito |
| 9 | Horas voo | |
| 10 | Tipo serviço | Cinza |
| 11 | Produto | |
| 12 | Classe | Cinza |
| 13 | Dosagem | |
| 14 | Sheets | Badge colorido |
| 15 | Ações | **Ver** (abre modal), Editar, Excluir |

**Comportamentos da tabela:**
- Linhas com `sheets_status = 'erro'` → fundo amarelo claro (#FFFBEA).
- Hover → fundo #FAFAFA.
- Colunas marcadas com ↕ são ordenáveis.
- Clicar em **Ver** abre um modal centralizado com todos os dados do registro, conforme padrão definido no design system.
- Confirmação de exclusão: bloco inline em vermelho (não modal), com botão "Sim, excluir permanentemente" e "Cancelar".

### Paginação
Rodapé com info "Página X de Y" + botões de página.

### Modal e Drawer de edição

**Modo visualização:** abre um **modal** centralizado com dados somente leitura dispostos em pares chave/valor. O rodapé contém botões para "Editar registro", "Excluir" e "Fechar".

**Modo edição:** formulários preenchidos com aviso amarelo de re-envio ao Sheets. Botões "Cancelar" e "Salvar alterações".

**Modo novo registro:** formulário em branco com todos os campos obrigatórios.

---

## 6. Visualização de Registro (página dedicada)

### Topbar
Breadcrumb: Relatórios › Registro #XXXX. Botões: Imprimir, Exportar, **Editar registro** (Teal PulviOn).

### Strip de navegação entre registros
"← Registro anterior (#N)" — total do período — "Próximo registro (#N) →"

### Hero card (fundo Teal PulviOn)
4 métricas em destaque: Área aplicada (ha), Horas de voo, Rendimento (ha/h), Data.

### Blocos de detalhe (grid de campos)

**Identificação da operação:**
- Piloto (com avatar colorido + e-mail)
- Fazenda (nome + cidade/UF)
- Drone (identificador + modelo + prefixo)

**Dados da operação (grid 4 colunas):**
Cultura, Tipo serviço, Área, Horas, Rendimento, Município, UF, Nº ART.

**Produto aplicado (grid 4 colunas):**
Nome comercial, Classe (tag estilizada), Dosagem (em azul), Unidade.

### Sidebar direita (4 cards)
1. **Informações do registro** — ID, criado por, data criação, última edição, status Sheets.
2. **Google Sheets** — planilha, aba, número da linha, data da última sync.
3. **Histórico** — timeline de eventos (criação, sync, edições).
4. **Contexto da fazenda** — total de aplic. e ha no mês, pilotos ativos, última aplicação, botão "Ver todos os registros da fazenda".

Nota de impressão discreta no rodapé.

---

## 7. Edição de Registro (página dedicada)

### Topbar
Breadcrumb: Relatórios › Editar registro #XXXX. Indicador "Alterações não salvas" aparece ao modificar qualquer campo. Badge "Salvo com sucesso" após save.

### Banner de aviso
Amarelo, informando que edições pelo admin substituem o registro original e são re-enviadas ao Sheets automaticamente.

### Blocos do formulário

**Bloco 1 — Identificação:** Data da aplicação, Piloto, Fazenda, Drone.

**Bloco 2 — Dados da operação:** Cultura, Tipo serviço, Área (ha), Horas de voo, Média calculada (automática, readonly), Nº da ART.

**Bloco 3 — Produto aplicado:** Nome comercial, Classe, Dosagem, Unidade.

**Bloco 4 — Observações do administrador:** Textarea para motivo da edição (registrado no log de auditoria).

### Comportamentos dos campos
- Campo alterado: borda amarela (#FFB300) + fundo #FFFDE7.
- Média calculada: recalcula automaticamente ao alterar horas de voo.
- Todos os selects pré-preenchidos com o valor atual do registro.

### Exclusão
Botão "Excluir registro" no header. Ao clicar, revela bloco de confirmação inline (fundo vermelho) com aviso de permanência e opções "Sim, excluir permanentemente" / "Cancelar".

### Sidebar direita (3 cards)
1. **Informações do registro** — ID, criado por, datas, status Sheets.
2. **Google Sheets** — planilha, linha, última sync + aviso de re-envio.
3. **Histórico** — atualizado em tempo real após cada save (nova entrada "Editado pelo administrador").

### Rodapé de ações
Botões: Cancelar | Salvar e fechar | **Salvar alterações**.

---

## 8. Cadastros (Fazendas / Drones / Pilotos)

### Layout geral
Abas superiores com ícone + label (Fazendas / Drones / Pilotos). Cada aba tem layout de duas colunas: formulário à esquerda + lista à direita.

### Aba Fazendas

**Formulário:**
- Nome da fazenda (obrigatório)
- Estado/UF (select com todos os estados)
- Município
- **Nome do contato/cliente** (opcional): nome da pessoa responsável pela propriedade
- **Telefone** (opcional): campo com máscara `(xx) xxxxx‑xxxx` para facilitar o contato
- Observações (textarea)
- Toggle Ativa/Inativa (com explicação: inativas não aparecem no app)

**Lista lateral:**
- Ícone + nome + cidade/UF + **contato** (em cinza) + badge ativo/inativo.
- Fazendas inativas: opacidade 60%, badge cinza.
- Ações: editar (lápis) / excluir (lixeira) por item.

### Aba Drones

**Formulário:**
- Identificador (obrigatório — nome que o piloto vê)
- Modelo (select com principais do mercado: DJI Agras T40, T30, T20P, Mavic 3M, XAG P100, P40, Outro)
- Prefixo / Registro ANAC (opcional)
- Nº de série
- Toggle Ativo/Inativo

**Lista lateral:**
- Ícone azul + identificador + modelo + prefixo + badge.
- Aviso de plano: "X de 3 drones incluídos. Drone adicional: +R$ 20,00/mês."

### Aba Pilotos

**Formulário (convite por e-mail):**
- Banner explicando o fluxo de convite (piloto recebe e-mail para definir senha).
- Nome completo, e-mail.
- Perfil de acesso: Piloto / Administrador.
- Toggles de módulos disponíveis no app: Pulverização, Mapeamento, Cotesia.

**Lista lateral:**
- Avatar colorido com iniciais + nome + e-mail + role.
- Badge "convite pend." em amarelo para pilotos não confirmados.

---

## 9. Integração Google Sheets

### Card de configuração
- Campo ID da planilha.
- Campo nome da aba (tab name).
- Botão "Testar conexão" + botão "Salvar".

### Card de mapeamento de colunas
Grid 4 colunas mostrando: campo do sistema → letra da coluna na planilha. 12 campos mapeados por padrão.

### Log de sincronização
Lista dos últimos eventos com:
- Ícone de status (círculo verde check / círculo vermelho X).
- Título (piloto + ação), metadado (fazenda + ha), tempo relativo.
- Linhas de erro: fundo amarelo claro (#FEEEB4) + borda, alinhado à paleta de estados do design system.
- Botão "Re‑tentar erros" no header do card.

---

## 10. White Label

### Layout
Formulários à esquerda + preview do celular à direita (sticky).

### Card — Logotipo
- Zona de upload com estado "vazio" (tracejado, ícone de upload) e estado "com logo" (borda verde sólida, preview da imagem + nome + tamanho).
- Botão "Remover logotipo".
- Aceita PNG e SVG, máximo 2MB.

### Card — Identidade da empresa
- Nome da empresa (reflete em tempo real no preview).
- Slogan / tagline (reflete em tempo real).

### Card — Paleta de cores
- Cor primária e secundária com swatch + hex + botão "Alterar".
- Paletas pré-definidas em grids de 6 cores:
  - Paleta Agro (tons de verde).
  - Paleta Tecnologia (azuis, verde-azulado, roxo, chumbo).
- Ao clicar em qualquer cor, o preview atualiza instantaneamente.

### Card — Selo "Powered by"
Toggle que mostra/oculta "Powered by PulviOn" no rodapé do app.

### Preview do celular (sticky, lado direito)
Frame de smartphone com tela do app atualizada em tempo real:
- Topbar com logo + nome + tagline.
- Card de métricas do dia.
- Grid de módulos (ícones com a cor primária/secundária).
- Botão "Novo registro" (cor primária) + "Sincronizar" (cor secundária).
- Tab bar inferior.
- Rodapé "Powered by" (condicional).

### Publicar
Botão "Publicar alterações" com spinner de loading e feedback "Publicado com sucesso" na topbar.

---

## 11. Requisitos Não-Funcionais

| Requisito | Detalhe |
|:---|:---|
| **Multi‑tenant / RLS** | Admin só acessa dados do seu `enterprise_id`. |
| **Performance** | Dashboard carrega em < 3 s com até 5 000 registros. |
| **Responsividade** | Layout funcional em ≥ 1280 px, com fallback de consulta em tablet. |
| **Autenticação** | Supabase Auth, JWT, sessão de 24 h. |
| **Auditoria** | Toda edição/exclusão pelo admin gera entrada em `audit_logs`. |
| **Identidade visual** | Uso da fonte **Inter** em todos os textos e aplicação da paleta de cores PulviOn (verde `#5EC680` e teal `#0E5162`). |
| **Exportação** | CSV gerado no cliente via API Route (sem Edge Function) para < 10 k linhas. |
| **Realtime** | Supabase Realtime invalida queries de KPI ao chegar novo registro. |

---

## 12. Fora de Escopo (V2+)

- Geração do .xlsx no modelo oficial do MAPA.
- Assinatura digital de registros.
- Mapa geoespacial com polígonos de talhões.
- Notificações push/e-mail automáticas para pilotos.
- Relatório de conformidade automático por fazenda.
- Painel financeiro (horas cobradas, faturamento por cliente).
- Módulo de suporte / abertura de tickets.
