"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { ESTADOS_BR, formatPhoneNumber, getCidadesByEstadoIBGE, unformatPhoneNumber } from '@/lib/utils';
import CadastroTable, { StatusBadge } from './CadastroTable';
import CadastroModal, { DetailGrid, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './CadastroModal';

const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
interface Fazenda { id?: string; nome: string; estado?: string; cidade?: string; contato_nome?: string; telefone?: string; observacoes?: string; area_total?: number; ativo?: boolean; created_at?: string; }
const defaults: Fazenda = { nome: '', estado: '', cidade: '', contato_nome: '', telefone: '', observacoes: '', area_total: 0, ativo: true };

export default function FazendaTab() {
  const [rows, setRows] = useState<Fazenda[]>([]); const [selected, setSelected] = useState<Fazenda | null>(null); const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view'); const [open, setOpen] = useState(false); const [status, setStatus] = useState('');
  const [cidades, setCidades] = useState<string[]>([]); const [loadingCidades, setLoadingCidades] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<Fazenda>({ defaultValues: defaults });
  const estado = watch('estado');
  const load = async () => { const { data, error } = await supabase.from('fazendas').select('*').order('nome'); if (error) setStatus(error.message); else setRows((data || []) as Fazenda[]); };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!estado) { setCidades([]); return; }
    let active = true;
    setLoadingCidades(true);
    void getCidadesByEstadoIBGE(estado).then((items) => {
      if (active) setCidades(items);
    }).finally(() => {
      if (active) setLoadingCidades(false);
    });
    return () => { active = false; };
  }, [estado]);
  const show = (r: Fazenda) => { setSelected(r); setMode('view'); setOpen(true); setStatus(''); }; const add = () => { setSelected(null); reset(defaults); setMode('add'); setOpen(true); setStatus(''); };
  const edit = () => { if (selected) { reset({ ...selected, telefone: formatPhoneNumber(selected.telefone || '') }); setMode('edit'); } }; const close = () => { setOpen(false); setStatus(''); };
  const save = async (v: Fazenda) => {
    const payload = { ...v, id: undefined, enterprise_id: ENTERPRISE_ID, telefone: unformatPhoneNumber(v.telefone || '') };
    const result = mode === 'edit' && selected?.id ? await supabase.from('fazendas').update(payload).eq('id', selected.id) : await supabase.from('fazendas').insert(payload);
    if (result.error) return setStatus(result.error.message); await load(); close();
  };
  const remove = async () => { if (!selected?.id || !confirm(`Excluir a fazenda "${selected.nome}"?`)) return; const { error } = await supabase.from('fazendas').delete().eq('id', selected.id); if (error) return setStatus(error.message); await load(); close(); };

  return <>
    <CadastroTable title="Fazendas" rows={rows} onAdd={add} onRowClick={show} searchText={(r) => `${r.nome} ${r.cidade} ${r.estado} ${r.contato_nome} ${r.telefone}`} emptyText="Nenhuma fazenda cadastrada." columns={[
      { key: 'nome', label: 'Fazenda', render: (r) => <span className="font-semibold text-gray-900">{r.nome}</span> }, { key: 'cidade', label: 'Cidade', render: (r) => r.cidade || '—' }, { key: 'estado', label: 'UF', render: (r) => r.estado || '—' },
      { key: 'contato', label: 'Contato', render: (r) => r.contato_nome || '—' }, { key: 'telefone', label: 'Telefone', render: (r) => r.telefone ? formatPhoneNumber(r.telefone) : '—' }, { key: 'area', label: 'Área total', render: (r) => r.area_total ? `${Number(r.area_total).toFixed(2)} ha` : '—' },
      { key: 'status', label: 'Status', render: (r) => <StatusBadge active={r.ativo !== false} activeLabel="Ativa" inactiveLabel="Inativa" /> },
    ]} />
    <CadastroModal open={open} mode={mode} title={mode === 'add' ? 'Adicionar Fazenda' : selected?.nome || 'Fazenda'} onClose={close} onEdit={edit} onDelete={remove}>
      {mode === 'view' && selected ? <DetailGrid items={[
        { label: 'Nome', value: selected.nome }, { label: 'Cidade / UF', value: [selected.cidade, selected.estado].filter(Boolean).join(', ') }, { label: 'Contato', value: selected.contato_nome }, { label: 'Telefone', value: selected.telefone ? formatPhoneNumber(selected.telefone) : '—' },
        { label: 'Área total', value: selected.area_total ? `${Number(selected.area_total).toFixed(2)} ha` : '—' }, { label: 'Status', value: selected.ativo !== false ? 'Ativa' : 'Inativa' }, { label: 'Observações', value: selected.observacoes }, { label: 'Criada em', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString('pt-BR') : '—' },
      ]} /> : <form onSubmit={handleSubmit(save)} className="space-y-4">
        <Field label="Nome da fazenda"><input {...register('nome', { required: true })} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Estado"><select {...register('estado', { onChange: () => setValue('cidade', '') })} className={inputClass}><option value="">Selecione</option>{ESTADOS_BR.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}</select></Field><Field label="Cidade"><select {...register('cidade')} disabled={!estado || loadingCidades} className={inputClass}><option value="">{loadingCidades ? 'Carregando cidades...' : 'Selecione'}</option>{cidades.map((cidade) => <option key={cidade} value={cidade}>{cidade}</option>)}</select></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Contato"><input {...register('contato_nome')} className={inputClass} /></Field><Field label="Telefone"><input inputMode="tel" maxLength={15} {...register('telefone', { onChange: (event) => setValue('telefone', formatPhoneNumber(event.target.value)) })} className={inputClass} /></Field></div>
        <Field label="Área total (ha)"><input type="number" step="0.01" {...register('area_total', { valueAsNumber: true })} className={inputClass} /></Field><Field label="Observações"><textarea rows={3} {...register('observacoes')} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" {...register('ativo')} /> Fazenda ativa</label>
        {status && <p className="text-sm text-red-600">{status}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={close} className={secondaryButtonClass}>Cancelar</button><button className={primaryButtonClass}>Salvar</button></div>
      </form>}
    </CadastroModal>
  </>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className={labelClass}>{label}</label>{children}</div>; }
