# Design system atual do PulviOn Admin

**Atualizado em:** 12 de junho de 2026

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

O painel usa Tailwind CSS diretamente e possui componentes compartilhados para
tabelas, modais, paginação, apresentação de aplicações e badges. Não utiliza
shadcn/ui. Ainda há mistura entre tokens do Tailwind e cores hexadecimais escritas
diretamente nos componentes.

Padrões predominantes:

- Fundo geral `slate-100`/`gray-50`.
- Cards brancos com bordas suaves, sombra leve e raio entre `rounded-2xl` e `rounded-3xl`.
- Inputs e botões com `rounded-xl` ou `rounded-2xl`.
- Sidebar teal, expansível/recolhível e com menu móvel.
- Ícones principalmente via Lucide React.

## Layout

### Dashboard

- Sidebar fixa no desktop e drawer no mobile.
- Header contextual com saudação, data, título e descrição da rota atual.
- Conteúdo com quatro KPIs.
- Área principal em proporção aproximada 70/30: tabela e widget climático.

### Cadastros

- Abas horizontais para fazendas, drones, pilotos e aplicações.
- Todas as abas usam tabela no desktop e cards compactos no mobile.
- Detalhes e formulários são exibidos em modais responsivos.
- Busca e paginação local seguem o mesmo padrão entre as abas.

### Relatórios

- Cabeçalho, quatro cards de resumo, filtros, tabela e modal de edição.

### Login

- Layout dividido em telas grandes.
- Painel institucional teal à esquerda com benefícios operacionais reais.
- Formulário em card branco à direita, com inputs iconográficos e feedback visual.
- Logo escuro no mobile e logo claro no painel institucional.
- Fluxos de login, recuperação e atualização de senha no mesmo card.
- Link de solicitação de acesso abre um e-mail endereçado à PulviOn.

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
- Modais longos usam scroll vertical e tabelas densas usam scroll horizontal.

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

## Catálogo de ícones e estados

Todos os ícones devem usar `lucide-react`, com tamanho padrão de `16px` em ações e `20px` em navegação ou títulos. Não usar emojis.

| Contexto | Ícone | Cor/estado recomendado |
|---|---|---|
| Dashboard | `LayoutDashboard` | Branco na aba ativa; neutro nas demais |
| Cadastros | `Database` | Branco na aba ativa; neutro nas demais |
| Relatórios | `BarChart3` | Branco na aba ativa; neutro nas demais |
| Fazenda | `Warehouse` | Teal sobre fundo teal claro |
| Contato | `Contact`, `Phone`, `AtSign` | Teal |
| Piloto | `UserRound` | Teal |
| Drone | `Drone` | Teal |
| Cultura | `Sprout` | Teal |
| Produtos | `Package` | Teal |
| Herbicida | `Leaf` | Teal |
| Fertilizante | `Sprout` | Teal |
| Adjuvante | `Droplets` | Teal |
| Fungicida/inseticida | `FlaskConical` | Teal |
| Serviço | `Wrench`, `Factory` | Teal |
| Adicionar | `Plus` | Branco em botão verde |
| Visualizar | `Eye` | Teal, fundo suave no hover |
| Editar | `Pencil` | Teal, fundo suave no hover |
| Excluir | `Trash2` | Vermelho, fundo vermelho claro no hover |
| Salvar | `Save` | Branco em botão verde |
| Pesquisar | `Search` | Cinza neutro |
| Fechar | `X` | Cinza neutro |
| Exportar | `Download` | Teal, reservado para ações funcionais |
| Imprimir | `Printer` | Teal, reservado para ações funcionais |
| Sucesso/ativo | `CircleCheck` | Verde com fundo verde claro |
| Atenção/manutenção | `CircleAlert` | Âmbar com fundo âmbar claro |
| Erro/inativo crítico | `CircleX` | Vermelho com fundo vermelho claro |

Badges compartilhadas usam os tons `success`, `warning`, `danger`, `info` e `neutral`. Tabelas densas usam linhas alternadas discretas e hover verde suave. Ações reservadas, como exportar e imprimir, só devem aparecer quando tiverem comportamento implementado.
