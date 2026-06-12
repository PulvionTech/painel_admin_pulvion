"use client";

import { CalendarDays, Clock3, Contact, Drone, Factory, LandPlot, Package, Sprout, UserRound, Warehouse } from 'lucide-react';
import { DetailGrid } from './CadastroModal';
import { Badge, ProductCategoryIcon } from './VisualTokens';

export interface ApplicationProduct {
  id?: string;
  classe_produto?: string;
  produto_nome?: string;
  dosagem_ha?: number;
  unidade?: string;
  total_aplicado?: number;
  num_art?: string;
}

export interface ApplicationSummaryData {
  data: string;
  fazenda: string;
  contato: string;
  piloto: string;
  drone: string;
  cultura: string;
  area_ha: number;
  horas_voo: number;
  tipo_servico: string;
  produtos: ApplicationProduct[];
}

export function ProductSummary({ products }: { products: ApplicationProduct[] }) {
  const names = products.map((product) => product.produto_nome).filter(Boolean).join(', ');
  return (
    <span
      title={names || 'Nenhum produto informado'}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#0F5A6B]/10 px-2.5 py-1 text-xs font-semibold text-[#0F5A6B]"
    >
      <Package className="h-3.5 w-3.5" />
      {products.length} {products.length === 1 ? 'produto' : 'produtos'}
    </span>
  );
}

export default function ApplicationDetailsPanel({ data }: { data: ApplicationSummaryData }) {
  return (
    <div className="space-y-5">
      <DetailGrid items={[
        { label: 'Data', value: data.data, icon: CalendarDays },
        { label: 'Fazenda', value: data.fazenda, icon: Warehouse },
        { label: 'Contato da Fazenda', value: data.contato, icon: Contact },
        { label: 'Piloto', value: data.piloto, icon: UserRound },
        { label: 'Drone', value: data.drone, icon: Drone },
        { label: 'Cultura', value: data.cultura, icon: Sprout },
        { label: 'Área (ha)', value: Number(data.area_ha).toFixed(2), icon: LandPlot },
        { label: 'Horas de voo', value: Number(data.horas_voo).toFixed(1), icon: Clock3 },
        { label: 'Tipo de Serviço', value: data.tipo_servico, icon: Factory },
      ]} />

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Package className="h-4 w-4 text-pulvion-teal" />Produtos aplicados</h3>
          <ProductSummary products={data.produtos} />
        </div>
        <div className="max-h-72 overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-[720px] divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                {['Classe', 'Produto', 'Dosagem/ha', 'Total aplicado', 'Nº ART'].map((label) => (
                  <th key={label} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.produtos.map((product, index) => (
                <tr key={product.id || index} className="odd:bg-white even:bg-slate-50/70">
                  <td className="px-3 py-2 text-gray-700"><span className="flex items-center gap-2"><ProductCategoryIcon category={product.classe_produto} /><Badge label={product.classe_produto || 'Não informada'} tone="info" /></span></td>
                  <td className="px-3 py-2 font-medium text-gray-900">{product.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-gray-700">{Number(product.dosagem_ha || 0).toFixed(4)} {product.unidade || ''}</td>
                  <td className="px-3 py-2 font-semibold text-[#0F5A6B]">{Number(product.total_aplicado || 0).toFixed(2)} {totalUnit(product.unidade || '')}</td>
                  <td className="px-3 py-2 text-gray-700">{product.num_art || '—'}</td>
                </tr>
              ))}
              {data.produtos.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">Nenhum produto informado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function legacyProduct(application: {
  classe_produto?: string;
  produto_nome?: string;
  dosagem?: number;
  unidade?: string;
  num_art?: string;
  area_ha: number;
}): ApplicationProduct[] {
  if (!application.produto_nome) return [];
  return [{
    classe_produto: application.classe_produto,
    produto_nome: application.produto_nome,
    dosagem_ha: application.dosagem,
    unidade: application.unidade,
    total_aplicado: Number(application.dosagem || 0) * Number(application.area_ha || 0),
    num_art: application.num_art,
  }];
}

const totalUnit = (unit: string) => unit.replace(/\s*\/\s*ha$/i, '') || unit;
