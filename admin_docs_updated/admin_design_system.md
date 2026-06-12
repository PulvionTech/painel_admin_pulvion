# Design system atual do PulviOn Admin

**Atualizado em:** 11 de junho de 2026

## Identidade base

| Token | Valor |
|---|---|
| `pulvion-green` | `#5EC680` |
| `pulvion-teal` | `#0E5162` |
| `alert-yellow` | `#FEEEB4` |
| `error-red` | `#E75757` |
| Verde alternativo usado diretamente | `#39B54A` |
| Teal alternativo usado diretamente | `#0F5A6B` |

A fonte global é Inter, carregada por `next/font/google`.

## Estado real dos estilos

O painel usa Tailwind CSS diretamente. Não existe biblioteca interna formal de componentes nem shadcn/ui. Há mistura entre os tokens do Tailwind e cores hexadecimais escritas diretamente nos componentes.

Padrões predominantes:

- Fundo geral `slate-100`/`gray-50`.
- Cards brancos com bordas suaves, sombra leve e raio entre `rounded-2xl` e `rounded-3xl`.
- Inputs e botões com `rounded-xl` ou `rounded-2xl`.
- Sidebar teal, expansível/recolhível e com menu móvel.
- Ícones principalmente via Lucide React.

## Layout

### Dashboard

- Sidebar fixa no desktop e drawer no mobile.
- Header simples com “Dashboard Operacional” e data.
- Conteúdo com quatro KPIs.
- Área principal em proporção aproximada 70/30: tabela e widget climático.

### Cadastros

- Abas horizontais para fazendas, drones, pilotos e aplicações.
- Fazendas usam lista à esquerda e detalhes/formulário à direita.
- Outros cadastros seguem variações de lista e painel de edição.

### Relatórios

- Cabeçalho, quatro cards de resumo, filtros, tabela e modal de edição.

### Login

- Layout dividido em telas grandes.
- Painel institucional teal à esquerda.
- Formulário em card branco à direita.

## Componentes compartilhados existentes

- `Sidebar`
- `Header`
- `KpiCard`
- `RecordsTable`
- `RecordModal`

Parte das páginas implementa cards, tabelas e modais localmente, portanto ainda há duplicação visual e comportamental.

## Responsividade

- Sidebar possui comportamento móvel e recolhimento automático abaixo de 1200 px.
- Grids usam breakpoints Tailwind.
- Tabelas usam rolagem horizontal.
- O painel é utilizável em telas menores, mas formulários densos são orientados a desktop.

## Acessibilidade e UX conhecidas

- Há labels em formulários e alguns `aria-label`.
- Modais não implementam focus trap nem fechamento consistente por `Esc`.
- Confirmações de exclusão usam `window.confirm`.
- Feedback de erro/sucesso varia entre módulos.
- Vários botões visuais ainda não possuem ação funcional.

## Direção de padronização

1. Consolidar as cores em tokens e remover hexadecimais duplicados.
2. Criar componentes compartilhados para card, botão, input, badge, modal e estado vazio.
3. Padronizar loading, erro, sucesso e confirmação.
4. Corrigir textos com codificação incorreta.
5. Garantir foco, teclado e atributos ARIA em modais e menus.
