"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  LandPlot,
  Mail,
  Package,
  Search,
  Send,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ApplicationDetailsPanel, { ApplicationProduct, legacyProduct, ProductSummary } from '@/components/ApplicationPresentation';
import CadastroModal, { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/components/CadastroModal';
import Pagination from '@/components/Pagination';

const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
const PAGE_SIZE = 8;

interface Piloto { id: string; full_name: string; }
interface Fazenda { id: string; nome: string; contato_nome?: string; telefone?: string; }
interface Drone { id: string; identificador: string; }
interface Aplicacao {
  id: string; data_aplicacao: string; user_id: string; fazenda_id: string; drone_id: string;
  cultura: string; area_ha: number; horas_voo: number; tipo_servico: string;
  classe_produto?: string; produto_nome?: string; dosagem?: number; unidade?: string; num_art?: string;
  produtos?: ApplicationProduct[];
}
interface Filters {
  start: string; end: string; pilot: string; farm: string; drone: string; culture: string; product: string;
}

const emptyFilters: Filters = { start: '', end: '', pilot: '', farm: '', drone: '', culture: '', product: '' };
const date = (value: string) => new Date(value.includes('T') ? value : `${value}T00:00:00`).toLocaleDateString('pt-BR');

export default function RelatoriosPage() {
  const [applications, setApplications] = useState<Aplicacao[]>([]);
  const [pilots, setPilots] = useState<Piloto[]>([]);
  const [farms, setFarms] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<Aplicacao | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editForm, setEditForm] = useState<Aplicacao | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; blob: Blob; filename: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState('');
  const [feedback, setFeedback] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => () => {
    if (pdfPreview) URL.revokeObjectURL(pdfPreview.url);
  }, [pdfPreview]);

  const loadData = async () => {
    setLoading(true);
    const [apps, products, pilotRows, farmRows, droneRows] = await Promise.all([
      supabase.from('aplicacoes').select('*').eq('enterprise_id', ENTERPRISE_ID).order('data_aplicacao', { ascending: false }),
      supabase.from('aplicacao_produtos').select('*').eq('enterprise_id', ENTERPRISE_ID).order('created_at'),
      supabase.from('profiles').select('id, full_name').eq('enterprise_id', ENTERPRISE_ID),
      supabase.from('fazendas').select('id, nome, contato_nome, telefone').eq('enterprise_id', ENTERPRISE_ID),
      supabase.from('drones').select('id, identificador').eq('enterprise_id', ENTERPRISE_ID),
    ]);
    const error = apps.error || products.error || pilotRows.error || farmRows.error || droneRows.error;
    if (error) setFeedback(error.message);
    const productRows = products.data || [];
    setApplications((apps.data || []).map((item: Aplicacao) => ({ ...item, produtos: productRows.filter((product: any) => product.aplicacao_id === item.id) })));
    setPilots((pilotRows.data || []) as Piloto[]);
    setFarms((farmRows.data || []) as Fazenda[]);
    setDrones((droneRows.data || []) as Drone[]);
    setLoading(false);
  };

  const filtered = useMemo(() => applications.filter((application) => {
    const products = application.produtos?.length ? application.produtos : legacyProduct(application);
    const applicationDate = application.data_aplicacao.split('T')[0];
    return (!appliedFilters.start || applicationDate >= appliedFilters.start)
      && (!appliedFilters.end || applicationDate <= appliedFilters.end)
      && (!appliedFilters.pilot || application.user_id === appliedFilters.pilot)
      && (!appliedFilters.farm || application.fazenda_id === appliedFilters.farm)
      && (!appliedFilters.drone || application.drone_id === appliedFilters.drone)
      && (!appliedFilters.culture || application.cultura.toLocaleLowerCase('pt-BR').includes(appliedFilters.culture.toLocaleLowerCase('pt-BR')))
      && (!appliedFilters.product || products.some((product) => product.produto_nome?.toLocaleLowerCase('pt-BR').includes(appliedFilters.product.toLocaleLowerCase('pt-BR'))));
  }), [applications, appliedFilters]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalArea = filtered.reduce((total, item) => total + Number(item.area_ha || 0), 0);
  const totalHours = filtered.reduce((total, item) => total + Number(item.horas_voo || 0), 0);
  const productsFor = (application: Aplicacao) => application.produtos?.length ? application.produtos : legacyProduct(application);
  const pilotName = (id: string) => pilots.find((item) => item.id === id)?.full_name || '—';
  const farm = (id: string) => farms.find((item) => item.id === id);
  const droneName = (id: string) => drones.find((item) => item.id === id)?.identificador || '—';
  const contact = (id: string) => [farm(id)?.contato_nome, farm(id)?.telefone].filter(Boolean).join(' · ') || '—';

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    setFeedback(`${applications.length ? 'Filtros aplicados' : 'Consulta preparada'}.`);
  };
  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setFeedback('Filtros removidos.');
  };
  const openDetails = (application: Aplicacao) => {
    setSelected(application);
    setEditForm({ ...application });
    setMode('view');
  };
  const closeDetails = () => {
    setSelected(null);
    setEditForm(null);
    setMode('view');
  };
  const saveEdit = async () => {
    if (!selected || !editForm) return;
    setSaving(true);
    const { produtos: _products, ...payload } = editForm;
    const { data, error } = await supabase.from('aplicacoes').update(payload).eq('enterprise_id', ENTERPRISE_ID).eq('id', selected.id).select().single();
    if (error) setFeedback(error.message);
    else {
      const updated = { ...data, produtos: selected.produtos } as Aplicacao;
      setApplications((current) => current.map((item) => item.id === selected.id ? updated : item));
      setSelected(updated);
      setEditForm(updated);
      setMode('view');
      setFeedback('Aplicação atualizada.');
    }
    setSaving(false);
  };

  const reportRows = (items: Aplicacao[]) => items.map((application) => ({
    Data: date(application.data_aplicacao),
    Fazenda: farm(application.fazenda_id)?.nome || '—',
    'Contato da Fazenda': contact(application.fazenda_id),
    Piloto: pilotName(application.user_id),
    Drone: droneName(application.drone_id),
    Cultura: application.cultura,
    'Área (ha)': Number(application.area_ha || 0).toFixed(2),
    'Horas de voo': Number(application.horas_voo || 0).toFixed(1),
    Serviço: application.tipo_servico || '—',
    Produtos: productsFor(application).map((product) => [
      product.produto_nome || 'Produto não informado',
      product.classe_produto,
      `${Number(product.dosagem_ha || 0).toFixed(4)} ${product.unidade || ''}/ha`,
      `total ${Number(product.total_aplicado || 0).toFixed(2)}`,
      product.num_art ? `ART ${product.num_art}` : '',
    ].filter(Boolean).join(' · ')).join('; ') || '—',
  }));

  const exportCsv = () => {
    const rows = reportRows(filtered);
    const headers = Object.keys(rows[0] || reportRows([emptyApplication()])[0]);
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(';'), ...rows.map((row) => headers.map((header) => escape(row[header as keyof typeof row])).join(';'))].join('\r\n');
    downloadBlob(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), `relatorio-pulvion-${today()}.csv`);
    setFeedback(`${rows.length} registro(s) exportado(s) para Excel/CSV.`);
  };

  const buildPdf = async (items: Aplicacao[]) => {
    setWorking('pdf');
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const logo = await loadImageData('/logos/pulvion-logo-full-light-180w.png');
    const selectedFarm = appliedFilters.farm ? farm(appliedFilters.farm)?.nome : '';
    const period = appliedFilters.start || appliedFilters.end ? `${appliedFilters.start ? date(appliedFilters.start) : 'início'} a ${appliedFilters.end ? date(appliedFilters.end) : 'hoje'}` : 'Todos os registros';
    doc.setFillColor(15, 90, 107);
    doc.rect(0, 0, 297, 30, 'F');
    doc.setTextColor(255, 255, 255);
    if (logo) doc.addImage(logo, 'PNG', 14, 5, 42, 11);
    else {
      doc.setFontSize(20);
      doc.text('PulviOn Admin', 14, 13);
    }
    doc.setFontSize(11);
    doc.text(`Relatório operacional${selectedFarm ? ` · ${selectedFarm}` : ''}`, 64, 13);
    doc.setFontSize(9);
    doc.text(`Período: ${period} | Piloto: ${appliedFilters.pilot ? pilotName(appliedFilters.pilot) : 'Todos'} | Drone: ${appliedFilters.drone ? droneName(appliedFilters.drone) : 'Todos'}`, 64, 20);
    doc.text(`Aplicações: ${items.length} | Área total: ${items.reduce((sum, item) => sum + Number(item.area_ha || 0), 0).toFixed(2)} ha`, 64, 26);
    const rows = reportRows(items);
    autoTable(doc, {
      startY: 36,
      head: [['Data', 'Fazenda', 'Contato', 'Piloto', 'Drone', 'Cultura', 'Área', 'Horas', 'Serviço', 'Produtos']],
      body: rows.map((row) => [row.Data, row.Fazenda, row['Contato da Fazenda'], row.Piloto, row.Drone, row.Cultura, row['Área (ha)'], row['Horas de voo'], row.Serviço, row.Produtos]),
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 90, 107], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    const totalPages = doc.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      doc.setPage(pageNumber);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('© 2026 PulviOn Admin · https://pulvion.com.br/', 14, 204);
      doc.text(`Página ${pageNumber} / ${totalPages}`, 280, 204, { align: 'right' });
    }
    const filename = `relatorio-pulvion-${items.length === 1 ? 'aplicacao-' : ''}${today()}.pdf`;
    const blob = doc.output('blob');
    setWorking('');
    return { blob, filename };
  };

  const previewPdf = async (items = filtered) => {
    if (!items.length) return setFeedback('Não existem registros para gerar o PDF.');
    const result = await buildPdf(items);
    if (pdfPreview) URL.revokeObjectURL(pdfPreview.url);
    setPdfPreview({ ...result, url: URL.createObjectURL(result.blob) });
  };

  const shareReport = async (channel?: 'whatsapp' | 'email') => {
    if (!filtered.length) return setFeedback('Não existem registros para enviar.');
    const result = await buildPdf(filtered);
    const file = new File([result.blob], result.filename, { type: 'application/pdf' });
    const message = `Relatório operacional PulviOn com ${filtered.length} aplicação(ões), área total de ${totalArea.toFixed(2)} ha.`;
    await shareFile(file, message, channel);
    setFeedback(channel ? 'PDF baixado e canal de envio aberto.' : 'Compartilhamento do relatório iniciado.');
  };

  const sharePreview = async (channel: 'whatsapp' | 'email') => {
    if (!pdfPreview) return;
    const file = new File([pdfPreview.blob], pdfPreview.filename, { type: 'application/pdf' });
    await shareFile(file, 'Relatório operacional PulviOn.', channel);
    setFeedback('PDF baixado e canal de envio aberto.');
  };

  return (
    <div className="min-w-0 space-y-5">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard icon={ClipboardList} label="Aplicações" value={String(filtered.length)} detail="No resultado atual" />
        <SummaryCard icon={LandPlot} label="Área total" value={`${totalArea.toFixed(2)} ha`} detail="Soma das aplicações" />
        <SummaryCard icon={Clock3} label="Horas de voo" value={`${totalHours.toFixed(1)} h`} detail="Total operacional" />
        <SummaryCard icon={Package} label="Produtos" value={String(filtered.reduce((total, item) => total + productsFor(item).length, 0))} detail="Itens aplicados" />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2"><Search className="h-5 w-5 text-pulvion-teal" /><h2 className="font-semibold text-slate-900">Filtros do relatório</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Filter label="Data Início"><input type="date" value={filters.start} onChange={(event) => setFilters({ ...filters, start: event.target.value })} className={inputClass} /></Filter>
          <Filter label="Data Fim"><input type="date" value={filters.end} onChange={(event) => setFilters({ ...filters, end: event.target.value })} className={inputClass} /></Filter>
          <Filter label="Piloto"><select value={filters.pilot} onChange={(event) => setFilters({ ...filters, pilot: event.target.value })} className={inputClass}><option value="">Todos</option>{pilots.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></Filter>
          <Filter label="Fazenda"><select value={filters.farm} onChange={(event) => setFilters({ ...filters, farm: event.target.value })} className={inputClass}><option value="">Todas</option>{farms.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></Filter>
          <Filter label="Drone"><select value={filters.drone} onChange={(event) => setFilters({ ...filters, drone: event.target.value })} className={inputClass}><option value="">Todos</option>{drones.map((item) => <option key={item.id} value={item.id}>{item.identificador}</option>)}</select></Filter>
          <Filter label="Cultura"><input value={filters.culture} onChange={(event) => setFilters({ ...filters, culture: event.target.value })} placeholder="Ex.: Soja" className={inputClass} /></Filter>
          <Filter label="Produto"><input value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })} placeholder="Nome do produto" className={inputClass} /></Filter>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton icon={Search} label="Pesquisar" onClick={applyFilters} primary />
          <ActionButton icon={X} label="Limpar filtros" onClick={clearFilters} />
          <ActionButton icon={FileSpreadsheet} label="Exportar Excel" onClick={exportCsv} disabled={!filtered.length} />
          <ActionButton icon={FileText} label={working === 'pdf' ? 'Gerando PDF...' : 'Gerar PDF'} onClick={() => void previewPdf()} disabled={!filtered.length || !!working} />
          <ActionButton icon={Send} label="Enviar" onClick={() => void shareReport()} disabled={!filtered.length || !!working} accent />
        </div>
        {feedback && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{feedback}</p>}
      </section>

      <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><ClipboardList className="h-5 w-5 text-pulvion-teal" />Resultados</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} registro(s) encontrado(s)</p></div>
          <span className="rounded-xl bg-pulvion-teal/10 px-3 py-2 text-xs font-semibold text-pulvion-teal">Área total: {totalArea.toFixed(2)} ha · Horas: {totalHours.toFixed(1)} h</span>
        </div>
        <ReportTable loading={loading} applications={paginated} pilots={pilots} farms={farms} drones={drones} onOpen={openDetails} />
        <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </section>

      <CadastroModal open={!!selected} mode={mode} title={selected ? `${selected.cultura} - ${date(selected.data_aplicacao)}` : 'Aplicação'} subtitle="Relatório operacional" onClose={closeDetails} onEdit={() => setMode('edit')}>
        {selected && mode === 'view' && <>
          <ApplicationDetailsPanel data={details(selected, farms, pilots, drones)} />
          <div className="mt-4 flex justify-end"><ActionButton icon={FileText} label="Gerar PDF desta aplicação" onClick={() => void previewPdf([selected])} /></div>
        </>}
        {editForm && mode === 'edit' && <EditApplicationForm value={editForm} pilots={pilots} farms={farms} drones={drones} saving={saving} onChange={setEditForm} onCancel={() => setMode('view')} onSave={() => void saveEdit()} />}
      </CadastroModal>

      <PdfPreviewModal preview={pdfPreview} onClose={() => setPdfPreview(null)} onWhatsapp={() => void sharePreview('whatsapp')} onEmail={() => void sharePreview('email')} />
    </div>
  );
}

function ReportTable({ loading, applications, pilots, farms, drones, onOpen }: { loading: boolean; applications: Aplicacao[]; pilots: Piloto[]; farms: Fazenda[]; drones: Drone[]; onOpen: (item: Aplicacao) => void }) {
  const farm = (id: string) => farms.find((item) => item.id === id);
  const products = (item: Aplicacao) => item.produtos?.length ? item.produtos : legacyProduct(item);
  if (loading) return <p className="py-10 text-center text-sm text-slate-500">Carregando relatório...</p>;
  if (!applications.length) return <p className="py-10 text-center text-sm text-slate-500">Nenhuma aplicação encontrada.</p>;
  return <>
    <div className="space-y-2 md:hidden">{applications.map((item) => <button key={item.id} onClick={() => onOpen(item)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-left"><div className="min-w-0"><p className="font-semibold text-slate-900">{date(item.data_aplicacao)} · {item.cultura}</p><p className="mt-1 truncate text-xs text-slate-500">{farm(item.fazenda_id)?.nome || '—'} · {pilots.find((pilot) => pilot.id === item.user_id)?.full_name || '—'}</p><p className="mt-1 text-xs font-medium text-pulvion-teal">{Number(item.area_ha).toFixed(2)} ha · {item.tipo_servico}</p></div><ChevronRight className="h-4 w-4 text-slate-400" /></button>)}</div>
    <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block"><table className="min-w-[1250px] divide-y divide-gray-200 text-sm"><thead className="bg-slate-50"><tr>{['Data', 'Fazenda', 'Contato da Fazenda', 'Piloto', 'Drone', 'Cultura', 'Área (ha)', 'Serviço', 'Produtos'].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{applications.map((item) => <tr key={item.id} onClick={() => onOpen(item)} className="cursor-pointer odd:bg-white even:bg-slate-50/60 hover:bg-pulvion-green/5"><td className="px-4 py-3">{date(item.data_aplicacao)}</td><td className="px-4 py-3 font-medium">{farm(item.fazenda_id)?.nome || '—'}</td><td className="px-4 py-3">{[farm(item.fazenda_id)?.contato_nome, farm(item.fazenda_id)?.telefone].filter(Boolean).join(' · ') || '—'}</td><td className="px-4 py-3">{pilots.find((pilot) => pilot.id === item.user_id)?.full_name || '—'}</td><td className="px-4 py-3">{drones.find((drone) => drone.id === item.drone_id)?.identificador || '—'}</td><td className="px-4 py-3">{item.cultura}</td><td className="px-4 py-3">{Number(item.area_ha).toFixed(2)}</td><td className="px-4 py-3">{item.tipo_servico || '—'}</td><td className="px-4 py-3"><ProductSummary products={products(item)} /></td></tr>)}</tbody></table></div>
  </>;
}

function EditApplicationForm({ value, pilots, farms, drones, saving, onChange, onCancel, onSave }: { value: Aplicacao; pilots: Piloto[]; farms: Fazenda[]; drones: Drone[]; saving: boolean; onChange: (value: Aplicacao) => void; onCancel: () => void; onSave: () => void }) {
  const field = (key: keyof Aplicacao, next: string | number) => onChange({ ...value, [key]: next });
  return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Filter label="Data"><input type="date" value={value.data_aplicacao.split('T')[0]} onChange={(event) => field('data_aplicacao', event.target.value)} className={inputClass} /></Filter><Filter label="Piloto"><select value={value.user_id} onChange={(event) => field('user_id', event.target.value)} className={inputClass}>{pilots.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></Filter><Filter label="Fazenda"><select value={value.fazenda_id} onChange={(event) => field('fazenda_id', event.target.value)} className={inputClass}>{farms.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></Filter><Filter label="Drone"><select value={value.drone_id} onChange={(event) => field('drone_id', event.target.value)} className={inputClass}>{drones.map((item) => <option key={item.id} value={item.id}>{item.identificador}</option>)}</select></Filter><Filter label="Cultura"><input value={value.cultura} onChange={(event) => field('cultura', event.target.value)} className={inputClass} /></Filter><Filter label="Área (ha)"><input type="number" step="0.01" value={value.area_ha} onChange={(event) => field('area_ha', Number(event.target.value))} className={inputClass} /></Filter><Filter label="Horas de voo"><input type="number" step="0.1" value={value.horas_voo} onChange={(event) => field('horas_voo', Number(event.target.value))} className={inputClass} /></Filter><Filter label="Serviço"><input value={value.tipo_servico} onChange={(event) => field('tipo_servico', event.target.value)} className={inputClass} /></Filter></div><p className="text-xs text-slate-500">Produtos são editados na aba Cadastros / Aplicações para preservar o salvamento transacional.</p><div className="flex justify-end gap-2"><button onClick={onCancel} className={secondaryButtonClass}>Cancelar</button><button onClick={onSave} disabled={saving} className={primaryButtonClass}>{saving ? 'Salvando...' : 'Salvar alterações'}</button></div></div>;
}

function PdfPreviewModal({ preview, onClose, onWhatsapp, onEmail }: { preview: { url: string; blob: Blob; filename: string } | null; onClose: () => void; onWhatsapp: () => void; onEmail: () => void }) {
  if (!preview) return null;
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"><div className="flex h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"><header className="flex items-center justify-between gap-3 border-b border-gray-200 p-4"><div><h2 className="font-semibold text-slate-900">Pré-visualização do PDF</h2><p className="text-xs text-slate-500">{preview.filename}</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></header><iframe title="Pré-visualização do relatório" src={preview.url} className="min-h-0 flex-1 bg-slate-100" /><footer className="flex flex-wrap justify-end gap-2 border-t border-gray-200 p-3"><ActionButton icon={Download} label="Baixar PDF" onClick={() => downloadBlob(preview.blob, preview.filename)} /><ActionButton icon={Send} label="WhatsApp" onClick={onWhatsapp} /><ActionButton icon={Mail} label="E-mail" onClick={onEmail} accent /></footer></div></div>;
}

function SummaryCard({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><span className="rounded-lg bg-pulvion-teal/10 p-2 text-pulvion-teal"><Icon className="h-4 w-4" /></span>{label}</div><p className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
function Filter({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={labelClass}>{label}</span>{children}</label>; }
function ActionButton({ icon: Icon, label, onClick, primary, accent, disabled }: { icon: React.ElementType; label: string; onClick: () => void; primary?: boolean; accent?: boolean; disabled?: boolean }) {
  const style = primary ? 'bg-pulvion-green text-white hover:bg-[#2fa140]' : accent ? 'bg-pulvion-teal text-white hover:bg-[#0b4755]' : 'border border-gray-200 bg-white text-slate-700 hover:bg-slate-50';
  return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${style}`}><Icon className="h-4 w-4" />{label}</button>;
}
function details(item: Aplicacao, farms: Fazenda[], pilots: Piloto[], drones: Drone[]) {
  const farm = farms.find((row) => row.id === item.fazenda_id);
  return { data: date(item.data_aplicacao), fazenda: farm?.nome || '—', contato: [farm?.contato_nome, farm?.telefone].filter(Boolean).join(' · ') || '—', piloto: pilots.find((row) => row.id === item.user_id)?.full_name || '—', drone: drones.find((row) => row.id === item.drone_id)?.identificador || '—', cultura: item.cultura, area_ha: item.area_ha, horas_voo: item.horas_voo, tipo_servico: item.tipo_servico, produtos: item.produtos?.length ? item.produtos : legacyProduct(item) };
}
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function shareFile(file: File, message: string, channel?: 'whatsapp' | 'email') {
  if (!channel && navigator.share && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ title: 'Relatório PulviOn', text: message, files: [file] }); return; } catch { return; }
  }
  downloadBlob(file, file.name);
  const url = channel === 'email'
    ? `mailto:?subject=${encodeURIComponent('Relatório operacional PulviOn')}&body=${encodeURIComponent(`${message}\n\nO PDF foi baixado e pode ser anexado a este e-mail.`)}`
    : `https://wa.me/?text=${encodeURIComponent(`${message}\n\nO PDF foi baixado e pode ser anexado à conversa.`)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
async function loadImageData(path: string) {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return ''; }
}
function today() { return new Date().toISOString().split('T')[0]; }
function emptyApplication(): Aplicacao { return { id: '', data_aplicacao: today(), user_id: '', fazenda_id: '', drone_id: '', cultura: '', area_ha: 0, horas_voo: 0, tipo_servico: '' }; }
