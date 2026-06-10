# 🎨 Design System — Painel Administrativo PulviOn
**Versão 1.1 — Atualizado para refletir a identidade visual e interface da PulviOn**

Este documento registra as decisões de design tomadas durante a prototipagem do painel admin, servindo de referência para o desenvolvimento e futuras iterações.

---

## 1. Identidade Visual

### Paleta de Cores

| Nome | HEX | Uso principal |
|:---|:---|:---|
| **Verde PulviOn** | `#5EC680` | Cor primária: botões principais, indicadores de sucesso, badge de sincronização |
| **Teal PulviOn** | `#0E5162` | Cor secundária: sidebar, cabeçalhos escuros, ícones neutros |
| **Cinza Claro** | `#F5F7FA` | Fundo geral das páginas e cartões |
| **Amarelo Alerta** | `#FEEEB4` | Alertas e avisos de integração |
| **Vermelho Erro** | `#E75757` | Estados de erro, exclusão |
| **Branco** | `#FFFFFF` | Cartões, formulários, modais |

### Cores de Estado

| Estado | Background | Texto | Borda | Uso |
|:---|:---|:---|:---|:---|
| Sucesso | `#F2FBF6` | `#5EC680` | `#D5F0E2` | Sincronizações bem‑sucedidas, status ativo |
| Erro | `#FDECEA` | `#E75757` | `#F6D1D1` | Erros na planilha, falhas de sincronização |
| Alerta | `#FFF8E9` | `#D1A70A` | `#F5E6A1` | Pendências e avisos |
| Info | `#EAF4F7` | `#0E5162` | `#C9E4EC` | Informações e notas |
| Inativo | `#F0F4F5` | `#9BAFB8` | — | Itens desativados ou suspensos |

### Cores de Texto

| Variável | HEX | Uso |
|:---|:---|:---|
| `text-primary` | `#0E2A33` | Títulos e valores principais |
| `text-secondary` | `#42545E` | Labels de formulário e subtítulos |
| `text-muted` | `#7A8C95` | Metadados e informações secundárias |
| `text-hint` | `#9BACB3` | Hints, placeholders, timestamps |
| `text-disabled` | `#B6C5CB` | Campos readonly, estados inativos |

---

## 2. Tipografia

Para harmonizar com a nova identidade visual, todos os textos usam a fonte **Inter** (sans‑serif) com pesos variando de regular (400) a semibold (600). A escolha de apenas uma família simplifica a leitura e reduz ruído visual.

| Elemento | Tamanho | Peso | Observação |
|:---|:---|:---|:---|
| Título de página | 20px | 600 | `letter-spacing: -0.3px` |
| Cabeçalho de card | 14px | 600 | |
| Rótulo de campo | 12px | 600 | `uppercase`, `letter-spacing: 0.05em` |
| Valor de KPI | 28px | 600 | `line-height: 1` |
| Corpo de tabela | 13px | 400 | |
| Badge / tag | 12px | 600 | |
| Metadado / hint | 12px | 400 | |
| Breadcrumb | 14px | 400/600 | Link em muted, atual em primary |

O título do app "PulviOn" no sidebar pode usar uma fonte marca personalizada ou variação pesada da Inter para reforçar a marca.

---

## 3. Componentes

### Sidebar

```
Largura: 220px
Background: #0E5162
Padding logo: 20px 20px 16px
Nav group padding: 16px 12px 6px
Nav label: 11px, uppercase, rgba(255,255,255,0.4)
Nav item: 10px 14px, border-radius 10px
Nav item ativo: background #5EC680
Nav item hover: background rgba(255,255,255,0.08)
```

### Topbar

```
Altura: 60px
Background: #FFFFFF
Border-bottom: 1px solid #E5E9EB
Padding: 0 32px
```

### Cards

```
Background: #FFFFFF
Border: 1px solid #E5E9EB
Border-radius: 12px
Card header: padding 16px 20px, border-bottom 1px solid #F1F4F6
Card body: padding 20px 24px
```

### KPI Cards

```
Background: #FFFFFF
Border: 1px solid #E5E9EB
Border-radius: 12px
Padding: 20px 18px 16px
Barra de cor no topo: height 3px, border-radius 12px 12px 0 0
  Verde (Primário): #5EC680
  Teal (Secundário): #0E5162
  Amarelo (Alerta): #FEEEB4
Ícone: 32×32px, border-radius 8px, fundo com 15% de opacidade da cor principal
Label: 11px, uppercase, letter-spacing .06em
Valor: 28px, font-weight 600
Delta: 12px, font-weight 500 (up=#5EC680, dn=#E75757, neu=#7A8C95)
```

### Botões

| Variante | Background | Texto | Uso |
|:---|:---|:---|:---|
| Primary | `#5EC680` | `#FFFFFF` | Salvar, confirmar, publicar |
| Secondary | `#0E5162` | `#FFFFFF` | Editar, ações secundárias |
| Outline | `#FFFFFF`, border `#E5E9EB` | `#42545E` | Cancelar, exportar, voltar |
| Danger | `#FFFFFF`, border `#F6D1D1` | `#E75757` | Excluir |
| Confirm delete | `#E75757` | `#FFFFFF` | Confirmação de exclusão |

```
Border-radius: 8px
Padding: 9px 18–20px
Font-size: 13px
Font-weight: 500
Ícone: 14px, gap 7px
```

### Badges

```
Border-radius: 20px (pílula)
Padding: 3px 9px
Font-size: 11px
Font-weight: 500
Ponto de status: 5×5px, border-radius 50%, background currentColor
```

### Campos de Formulário

```
Border: 1px solid #E5E9EB
Border-radius: 8px
Padding: 9–12px 12px
Font-size: 13–14px
Background: #FFFFFF (ou #F7F8FA no login)
Focus: border-color #0E5162 (ou #5EC680 no login), box-shadow 0 0 0 3–4px rgba()
Campo alterado: border-color #FEEEB4, background #FFFBEA
Campo com erro: border-color #E75757
```

### Toggles

```
Largura: 40–42px
Altura: 24px
Border-radius: 11px
Ativo: background #5EC680
Inativo: background #CCD9DF / #E5E9EB
Bolinha: 16×16px, background #FFFFFF, box-shadow sutil
Transição: 0.2s
```

---

## 4. Padrões de Layout

### Tabela de dados (Relatórios)

- Header: `background #F5F7FA`, `font-size 12px`, `color #7A8C95`.
- Linha: `border-bottom 1px solid #E5E9EB`, hover `background #F5F7FA`.
- Linha com erro Sheets: `background #FFFBEA`.
- Última linha: sem border-bottom.
- Colunas de ação: 3 ícones (ver / editar / excluir), 28×28px, hover colorido.

### Formulários de cadastro (Cadastros)

- Layout: formulário à esquerda (flex 1) + lista à direita (width fixo ~360px).
- Formulário em card com header colorido.
- Lista com itens em card individual por registro.
- Toggles inline no formulário para status ativo/inativo.

### Visualização de registro

- Hero card escuro (Teal PulviOn) com métricas-chave em destaque.
- Strip de navegação entre registros.
- Grid de campos com borders internos (não cards separados).
- Sidebar direita com 4 cards empilhados (info, Sheets, histórico, contexto).

### Edição de registro

- Campos alterados: feedback visual amarelo imediato.
- Barra de "Alterações não salvas" na topbar.
- Aviso de re-envio ao Sheets no topo do formulário.
- Confirmação de exclusão inline (não modal flutuante).
- Sidebar com histórico atualizado em tempo real após save.

### White Label — Preview do celular

- Frame: `background #0E5162`, `border-radius 36px`, `padding 12px`.
- Tela: `border-radius 26px`, `overflow hidden`.
- Notch: 24px de altura com barra decorativa.
- Todos os elementos do app refletem em tempo real as configurações.

### Login (split)

- Painel esquerdo: 480px, fundo Teal PulviOn com decoração geométrica.
- Decoração: círculos concêntricos em verde baixa opacidade + linhas diagonais.
- Headline impactante, stats no rodapé.
- Painel direito: flex 1, branco, formulário centralizado.
- Separador decorativo "acesso restrito" com pontos verdes.

---

## 5. Regras de Feedback Visual

| Ação | Feedback |
|:---|:---|
| Hover em nav item | `background rgba(255,255,255,0.08)` |
| Hover em botão primary | `#4DB56D` (variação mais escura do verde) |
| Hover em ação de tabela (editar) | `color #0E5162, background #EAF4F7` |
| Hover em ação de tabela (excluir) | `color #E75757, background #FDECEA` |
| Campo em foco | borda colorida + sombra suave |
| Campo alterado | borda e fundo amarelo |
| Loading de botão | spinner giratório + texto "Salvando…" + desabilitado |
| Sucesso de save | badge "Salvo com sucesso" na topbar (desaparece em 3s) |
| Erro de login | borda vermelha nos campos + strip de erro com mensagem |
| Bloqueio por tentativas | botão travado + mensagem de tempo |

---

## 6. Ícones

Todos os ícones são SVG inline (sem biblioteca externa) com `stroke="currentColor"`, `stroke-width="2"`, `fill="none"`. Tamanhos:

| Contexto | Tamanho |
|:---|:---|
| Nav da sidebar | 15×15px |
| Ícone de card header | 14×14px |
| Ícone de KPI | 15×15px |
| Ícone de botão | 14×14px |
| Ícone de campo | 16×16px |
| Ícone de ação na tabela | 13×13px |

---

## 7. Animações e Transições

| Elemento | Transição |
|:---|:---|
| Hover de botão | `background 0.15s` |
| Hover de campo | `border-color 0.15s` |
| Toggle | `background 0.2s`, `left 0.2s` |
| Spinner de loading | `animation: spin 0.8s–1s linear infinite` |
| Nav item | `background 0.15s, color 0.15s` |
| Dot do sync-badge | `animation: pulse 2s infinite` (opacidade) |

---

## 8. Responsividade

O painel é projetado para **desktop (≥ 1280px)**. Em tablets (≥ 768px), a sidebar pode ser colapsada. Não há versão mobile do painel admin — consultas rápidas podem ser feitas pelo mobile web mas a experiência completa é desktop.

---

## 9. Padrões de Texto

### Mensagens de estado vazios
- "Nenhum registro encontrado para os filtros selecionados."
- "Nenhuma fazenda cadastrada ainda."
- "Sem edições anteriores."

### Confirmações de exclusão
- Sempre descrever a consequência permanente.
- Mencionar explicitamente o impacto no Google Sheets.
- Usar o verbo "permanentemente" para reforçar a irreversibilidade.

### Labels de campos obrigatórios
- Asterisco vermelho `*` após o label.
- Nunca usar "obrigatório" por extenso.

### Hints e dicas
- Curtos, descritivos, em cinza muted.
- Ex: "Nome que o piloto verá no app ao selecionar o equipamento."

---

## 10. Modal de Detalhes de Registro

Para melhorar a experiência de consulta, as tabelas e listas do dashboard agora permitem abrir um **modal** com os dados completos do registro ao clicar na linha. O modal deve seguir os princípios de simplicidade e legibilidade do design system:

- **Tamanho:** largura ~600‑700 px em telas grandes (max-width 90% em telas menores); altura adaptativa com scroll interno se necessário.
- **Estrutura:** cabeçalho com título e botão de fechar (ícone ×), corpo com pares chave/valor em duas colunas e rodapé com ação de edição ou exclusão.
- **Estilo:** fundo branco (`#FFFFFF`), borda sutil (`1px solid #E5E9EB`), borda‑radius 12px; sombra leve para destacar sobre a página.
- **Tipografia:** use os mesmos tamanhos e pesos definidos na seção de tipografia; destaque os valores com `text-primary` e os rótulos com `text-muted`.
- **Comportamento:** o modal fecha ao clicar fora dele, pressionar `Esc` ou no botão de fechar; o foco deve permanecer dentro do modal até ser fechado (acessibilidade).

Exemplo de layout do modal:

```
┌─────────────────────────────────────────────┐
│ Registro #000123        ×                 │
├─────────────────────────────────────────────┤
│ Data da aplicação      | 10/06/2026       │
│ Piloto                 | Bruno            │
│ Fazenda                | Sítio Três Irmãos│
│ Drone                  | Drone 01         │
│ Cultura                | Algodão          │
│ Área (ha)              | 156,9            │
│ Horas de voo           | 1,2              │
│ Tipo de serviço        | Pulverização     │
│ Classe do produto      | Fungicida        │
│ Produto                | Priori Xtra      │
│ Dosagem                | 0,30             │
│ Unidade                | L/ha             │
│ Nº ART                 | —                │
├─────────────────────────────────────────────┤
│ Botões: Editar • Excluir • Fechar         │
└─────────────────────────────────────────────┘
```

Esse modal torna a consulta de registros mais rápida sem navegação para outra página, contribuindo para uma dashboard mais limpa.
