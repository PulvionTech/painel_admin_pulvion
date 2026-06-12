"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AGRICULTURAL_CATALOG, uniqueCatalogValues } from '@/lib/agriculturalCatalog';
import CadastroTable from './CadastroTable';
import CadastroModal, { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './CadastroModal';
import ApplicationDetailsPanel, { ApplicationProduct, legacyProduct, ProductSummary } from './ApplicationPresentation';

const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
interface Option { id: string; nome: string; }
interface FazendaOption extends Option { contato?: string; }
interface CatalogOption { type: string; label: string; }
interface ProdutoAplicacao extends ApplicationProduct { classe_produto: string; produto_nome: string; dosagem_ha: number; unidade: string; num_art: string; }
interface Aplicacao { id?: string; data_aplicacao: string; user_id: string; fazenda_id: string; drone_id: string; cultura: string; area_ha: number; horas_voo: number; tipo_servico: string; classe_produto?: string; produto_nome?: string; dosagem?: number; unidade?: string; num_art?: string; produtos?: ProdutoAplicacao[]; }

const defaults = (): Aplicacao => ({ data_aplicacao: new Date().toISOString().split('T')[0], user_id: '', fazenda_id: '', drone_id: '', cultura: '', area_ha: 0, horas_voo: 0, tipo_servico: '' });
const emptyProduct = (): ProdutoAplicacao => ({ classe_produto: '', produto_nome: '', dosagem_ha: 0, unidade: '', num_art: '' });
const date = (value: string) => new Date(value.includes('T') ? value : `${value}T00:00:00`).toLocaleDateString('pt-BR');
const total = (product: ProdutoAplicacao, area: number) => Number(product.dosagem_ha || 0) * Number(area || 0);
const totalUnit = (unit: string) => unit.replace(/\s*\/\s*ha$/i, '') || unit;

export default function AplicacaoTab() {
  const [rows, setRows] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<Option[]>([]); const [fazendas, setFazendas] = useState<FazendaOption[]>([]); const [drones, setDrones] = useState<Option[]>([]);
  const [catalog, setCatalog] = useState<CatalogOption[]>([]);
  const [products, setProducts] = useState<ProdutoAplicacao[]>([]);
  const [selected, setSelected] = useState<Aplicacao | null>(null); const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view'); const [open, setOpen] = useState(false); const [status, setStatus] = useState(''); const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<Aplicacao>({ defaultValues: defaults() });
  const area = watch('area_ha') || 0;
  const name = (items: Option[], id: string) => items.find((item) => item.id === id)?.nome || '—';
  const options = (type: string) => uniqueCatalogValues(
    AGRICULTURAL_CATALOG[type] || [],
    catalog.filter((item) => item.type === type).map((item) => item.label),
  );

  const load = async () => {
    const [apps, productRows, ps, fs, ds, lists] = await Promise.all([
      supabase.from('aplicacoes').select('*').eq('enterprise_id', ENTERPRISE_ID).order('data_aplicacao', { ascending: false }),
      supabase.from('aplicacao_produtos').select('*').eq('enterprise_id', ENTERPRISE_ID).order('created_at'),
      supabase.from('profiles').select('id, full_name').eq('enterprise_id', ENTERPRISE_ID),
      supabase.from('fazendas').select('id, nome, contato_nome, telefone').eq('enterprise_id', ENTERPRISE_ID),
      supabase.from('drones').select('id, identificador').eq('enterprise_id', ENTERPRISE_ID),
      supabase.from('auxiliary_lists').select('type, label').eq('enterprise_id', ENTERPRISE_ID).eq('is_active', true).order('sort_order'),
    ]);
    if (apps.error) setStatus(apps.error.message);
    else {
      const allProducts = productRows.data || [];
      setRows((apps.data || []).map((app: Aplicacao) => ({ ...app, produtos: allProducts.filter((product: any) => product.aplicacao_id === app.id) })));
    }
    setPilotos((ps.data || []).map((row: any) => ({ id: row.id, nome: row.full_name }))); setFazendas((fs.data || []).map((row: any) => ({ id: row.id, nome: row.nome, contato: [row.contato_nome, row.telefone].filter(Boolean).join(' · ') || '—' }))); setDrones((ds.data || []).map((row: any) => ({ id: row.id, nome: row.identificador }))); setCatalog((lists.data || []) as CatalogOption[]);
  };
  useEffect(() => { void load(); }, []);

  const show = (row: Aplicacao) => { setSelected(row); setMode('view'); setOpen(true); setStatus(''); };
  const add = () => { setSelected(null); reset(defaults()); setProducts([emptyProduct()]); setMode('add'); setOpen(true); setStatus(''); };
  const edit = () => {
    if (!selected) return;
    reset({ ...selected, data_aplicacao: selected.data_aplicacao.split('T')[0] });
    setProducts(selected.produtos?.length ? selected.produtos : [{ classe_produto: selected.classe_produto || '', produto_nome: selected.produto_nome || '', dosagem_ha: selected.dosagem || 0, unidade: selected.unidade || '', num_art: selected.num_art || '' }]);
    setMode('edit');
  };
  const close = () => { setOpen(false); setStatus(''); };
  const updateProduct = (index: number, field: keyof ProdutoAplicacao, value: string | number) => setProducts((current) => current.map((product, productIndex) => productIndex === index ? { ...product, [field]: value } : product));
  const removeProduct = (index: number) => setProducts((current) => current.filter((_, productIndex) => productIndex !== index));

  const save = async (values: Aplicacao) => {
    setStatus('');
    if (!products.length) return setStatus('Adicione pelo menos um produto.');
    if (products.some((product) => !product.classe_produto || !product.produto_nome || !(Number(product.dosagem_ha) > 0) || !product.unidade)) return setStatus('Preencha todos os campos obrigatórios dos produtos.');

    setSaving(true);
    const applicationId = mode === 'edit' && selected?.id ? selected.id : crypto.randomUUID();
    const applicationPayload = { id: applicationId, enterprise_id: ENTERPRISE_ID, data_aplicacao: values.data_aplicacao, user_id: values.user_id, fazenda_id: values.fazenda_id, drone_id: values.drone_id, cultura: values.cultura, area_ha: values.area_ha, horas_voo: values.horas_voo, tipo_servico: values.tipo_servico };
    const result = await supabase.rpc('save_aplicacao_com_produtos', { p_aplicacao: applicationPayload, p_produtos: products.map(({ classe_produto, produto_nome, dosagem_ha, unidade, num_art }) => ({ classe_produto, produto_nome, dosagem_ha, unidade, num_art })) });
    if (result.error) { setSaving(false); return setStatus(result.error.message); }
    setSaving(false); await load(); close();
  };
  const remove = async () => { if (!selected?.id || !confirm('Excluir esta aplicação e seus produtos?')) return; const { error } = await supabase.from('aplicacoes').delete().eq('id', selected.id); if (error) return setStatus(error.message); await load(); close(); };

  const summary = useMemo(() => products.reduce<Record<string, number>>((result, product) => { const unit = totalUnit(product.unidade) || 'un'; result[unit] = (result[unit] || 0) + total(product, area); return result; }, {}), [products, area]);

  return <>
    <CadastroTable title="Aplicações" rows={rows} onAdd={add} onRowClick={show} searchText={(row) => `${date(row.data_aplicacao)} ${name(fazendas, row.fazenda_id)} ${fazendas.find((item) => item.id === row.fazenda_id)?.contato} ${name(pilotos, row.user_id)} ${name(drones, row.drone_id)} ${row.cultura} ${row.tipo_servico} ${row.produtos?.map((product) => product.produto_nome).join(' ')}`} emptyText="Nenhuma aplicação cadastrada." columns={[
      { key: 'data', label: 'Data', render: (row) => date(row.data_aplicacao) }, { key: 'fazenda', label: 'Fazenda', render: (row) => name(fazendas, row.fazenda_id) }, { key: 'contato', label: 'Contato da Fazenda', render: (row) => fazendas.find((item) => item.id === row.fazenda_id)?.contato || '—' }, { key: 'piloto', label: 'Piloto', render: (row) => name(pilotos, row.user_id) }, { key: 'drone', label: 'Drone', render: (row) => name(drones, row.drone_id) }, { key: 'cultura', label: 'Cultura', render: (row) => row.cultura }, { key: 'area', label: 'Área (ha)', render: (row) => Number(row.area_ha).toFixed(2) }, { key: 'servico', label: 'Serviço', render: (row) => row.tipo_servico || '—' }, { key: 'produtos', label: 'Produtos', render: (row) => <ProductSummary products={row.produtos?.length ? row.produtos : legacyProduct(row)} /> },
    ]} />
    <CadastroModal open={open} mode={mode} title={mode === 'add' ? 'Adicionar Aplicação' : selected ? `${selected.cultura} - ${date(selected.data_aplicacao)}` : 'Aplicação'} onClose={close} onEdit={edit} onDelete={remove}>
      {mode === 'view' && selected ? <ApplicationDetailsPanel data={{ data: date(selected.data_aplicacao), fazenda: name(fazendas, selected.fazenda_id), contato: fazendas.find((item) => item.id === selected.fazenda_id)?.contato || '—', piloto: name(pilotos, selected.user_id), drone: name(drones, selected.drone_id), cultura: selected.cultura, area_ha: selected.area_ha, horas_voo: selected.horas_voo, tipo_servico: selected.tipo_servico, produtos: selected.produtos?.length ? selected.produtos : legacyProduct(selected) }} /> : <form onSubmit={handleSubmit(save)} className="space-y-5">
        <section><h3 className="mb-3 text-sm font-semibold text-gray-900">Dados gerais</h3><div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data"><input type="date" {...register('data_aplicacao', { required: true })} className={inputClass} /></Field><SelectField label="Piloto" name="user_id" options={pilotos} register={register} /><SelectField label="Fazenda" name="fazenda_id" options={fazendas} register={register} /><SelectField label="Drone" name="drone_id" options={drones} register={register} />
          <Field label="Cultura"><CatalogInput listId="culturas" values={options('cultura')} inputProps={register('cultura', { required: true })} /></Field><Field label="Área (ha)"><input type="number" min="0.01" step="0.01" {...register('area_ha', { required: true, min: 0.01, valueAsNumber: true })} className={inputClass} /></Field>
          <Field label="Horas de voo"><input type="number" min="0.1" step="0.1" {...register('horas_voo', { required: true, min: 0.1, valueAsNumber: true })} className={inputClass} /></Field><Field label="Tipo de serviço"><CatalogInput listId="servicos" values={options('servico')} inputProps={register('tipo_servico', { required: true })} /></Field>
        </div></section>
        <ProductEditor products={products} area={area} classes={options('classe_produto')} productNames={options('produto')} units={options('unidade')} onChange={updateProduct} onRemove={removeProduct} onAdd={() => setProducts((current) => [...current, emptyProduct()])} />
        <div className="rounded-xl border border-[#39B54A]/20 bg-[#39B54A]/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#0F5A6B]">Resumo total aplicado</p><div className="mt-2 flex flex-wrap gap-2">{Object.entries(summary).map(([unit, value]) => <span key={unit} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-800">{value.toFixed(2)} {unit}</span>)}</div></div>
        {status && <p className="text-sm text-red-600">{status}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={close} className={secondaryButtonClass}>Cancelar</button><button disabled={saving} className={primaryButtonClass}>{saving ? 'Salvando...' : 'Salvar'}</button></div>
      </form>}
    </CadastroModal>
  </>;
}

function ProductEditor({ products, area, classes, productNames, units, onChange, onRemove, onAdd }: { products: ProdutoAplicacao[]; area: number; classes: string[]; productNames: string[]; units: string[]; onChange: (index: number, field: keyof ProdutoAplicacao, value: string | number) => void; onRemove: (index: number) => void; onAdd: () => void; }) {
  return <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-gray-900">Produtos da aplicação</h3><p className="text-xs text-gray-500">A dosagem é calculada por hectare. Também é possível digitar um produto que não esteja na lista.</p><a href="https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-agricolas/agrotoxicos/agrofit" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0F5A6B] hover:underline">Consultar produtos registrados no AGROFIT/MAPA <ExternalLink className="h-3 w-3" /></a></div><button type="button" onClick={onAdd} className={secondaryButtonClass}><span className="flex items-center gap-2"><Plus className="h-4 w-4" />Adicionar Produto</span></button></div>
    <div className="space-y-3">{products.map((product, index) => <div key={product.id || index} className="rounded-xl border border-gray-200 p-3"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Classe *"><CatalogInput listId={`classes-${index}`} values={classes} value={product.classe_produto} onChange={(value) => onChange(index, 'classe_produto', value)} /></Field><Field label="Produto *"><CatalogInput listId={`produtos-${index}`} values={productNames} value={product.produto_nome} onChange={(value) => onChange(index, 'produto_nome', value)} /></Field><Field label="Dosagem por ha *"><input type="number" min="0.0001" step="0.0001" value={product.dosagem_ha || ''} onChange={(event) => onChange(index, 'dosagem_ha', Number(event.target.value))} className={inputClass} /></Field>
      <Field label="Unidade *"><CatalogInput listId={`unidades-${index}`} values={units} value={product.unidade} onChange={(value) => onChange(index, 'unidade', value)} /></Field><Field label="Número ART (opcional)"><input value={product.num_art} onChange={(event) => onChange(index, 'num_art', event.target.value)} className={inputClass} /></Field><div className="flex items-end justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-xs text-gray-500">Total aplicado</p><p className="mt-1 font-semibold text-[#0F5A6B]">{total(product, area).toFixed(2)} {totalUnit(product.unidade)}</p></div><button type="button" onClick={() => onRemove(index)} aria-label="Remover produto" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>
    </div></div>)}</div>
  </section>;
}

function CatalogInput({ listId, values, inputProps, value, onChange }: { listId: string; values: string[]; inputProps?: any; value?: string; onChange?: (value: string) => void }) { return <><input list={listId} {...inputProps} value={value} onChange={onChange ? (event) => onChange(event.target.value) : inputProps?.onChange} className={inputClass} /><datalist id={listId}>{values.map((item) => <option key={item} value={item} />)}</datalist></>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className={labelClass}>{label}</label>{children}</div>; }
function SelectField({ label, name, options, register }: { label: string; name: 'user_id' | 'fazenda_id' | 'drone_id'; options: Option[]; register: any }) { return <Field label={label}><select {...register(name, { required: true })} className={inputClass}><option value="">Selecione</option>{options.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select></Field>; }
