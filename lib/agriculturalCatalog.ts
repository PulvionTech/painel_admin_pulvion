// Catálogo base para autocomplete. Produtos específicos continuam aceitando digitação livre.
// Referências: culturas pesquisadas pela PAM/IBGE e consulta aberta de produtos no AGROFIT/MAPA.
export const AGRICULTURAL_CATALOG: Record<string, string[]> = {
  cultura: [
    'Abacate', 'Abacaxi', 'Açaí', 'Algodão', 'Alho', 'Amendoim', 'Arroz', 'Aveia',
    'Banana', 'Batata-doce', 'Batata-inglesa', 'Borracha', 'Cacau', 'Café', 'Cana-de-açúcar',
    'Castanha-de-caju', 'Cebola', 'Centeio', 'Cevada', 'Coco-da-baía', 'Dendê', 'Erva-mate',
    'Feijão', 'Figo', 'Fumo', 'Girassol', 'Goiaba', 'Guaraná', 'Laranja', 'Limão', 'Maçã',
    'Malva', 'Mamão', 'Mamona', 'Mandioca', 'Manga', 'Maracujá', 'Melancia', 'Melão',
    'Milho', 'Palmito', 'Pera', 'Pêssego', 'Pimenta-do-reino', 'Rami', 'Sisal', 'Soja',
    'Sorgo', 'Tangerina', 'Tomate', 'Trigo', 'Triticale', 'Uva',
  ],
  servico: [
    'Aplicação de defensivos', 'Aplicação de fertilizantes', 'Aplicação de herbicidas',
    'Aplicação de inseticidas', 'Aplicação de fungicidas', 'Aplicação de produtos biológicos',
    'Aplicação de sementes', 'Controle de plantas daninhas', 'Dessecação', 'Distribuição de sólidos',
    'Mapeamento', 'Monitoramento', 'Pulverização foliar',
  ],
  classe_produto: [
    'Adjuvante', 'Acaricida', 'Agente biológico de controle', 'Bactericida', 'Espalhante adesivo',
    'Fertilizante foliar', 'Feromônio', 'Fungicida', 'Herbicida', 'Inseticida', 'Inoculante',
    'Nematicida', 'Regulador de crescimento', 'Tratamento biológico',
  ],
  produto: [
    '2,4-D', 'Abamectina', 'Atrazina', 'Bacillus amyloliquefaciens', 'Bacillus subtilis',
    'Beauveria bassiana', 'Clorantraniliprole', 'Clorpirifós', 'Diquat', 'Fipronil',
    'Glifosato', 'Glufosinato de amônio', 'Imidacloprido', 'Lambda-cialotrina',
    'Mancozebe', 'Metarhizium anisopliae', 'Paraquat', 'Tebuconazol', 'Tiametoxam',
    'Trichoderma harzianum',
  ],
  unidade: ['L/ha', 'mL/ha', 'kg/ha', 'g/ha', 'un/ha'],
};

const normalize = (value: string) =>
  value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function uniqueCatalogValues(...groups: string[][]): string[] {
  const values = new Map<string, string>();
  groups.flat().forEach((value) => {
    const clean = value.trim();
    if (clean && !values.has(normalize(clean))) values.set(normalize(clean), clean);
  });
  return [...values.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
