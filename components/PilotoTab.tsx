"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/utils';
import CadastroTable, { StatusBadge } from './CadastroTable';
import CadastroModal, { DetailGrid, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './CadastroModal';
import { Badge } from './VisualTokens';

const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
interface Piloto { id?: string; nome: string; email?: string; telefone?: string; licenca_caar?: string; role?: string; is_active?: boolean; invite_status?: string; }
const defaults: Piloto = { nome: '', email: '', telefone: '', licenca_caar: '', role: 'pilot', is_active: true };

export default function PilotoTab() {
  const [rows, setRows] = useState<Piloto[]>([]);
  const [selected, setSelected] = useState<Piloto | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm<Piloto>({ defaultValues: defaults });

  const load = async () => {
    const { data, error } = await supabase.from('profiles').select('id, full_name, email, telefone, licenca_caar, role, is_active, invite_status').order('full_name');
    if (error) setStatus(error.message);
    else setRows((data || []).map((r: any) => ({ ...r, nome: r.full_name })));
  };
  useEffect(() => { void load(); }, []);
  const show = (r: Piloto) => { setSelected(r); setMode('view'); setOpen(true); setStatus(''); };
  const add = () => { setSelected(null); reset(defaults); setMode('add'); setOpen(true); setStatus(''); };
  const edit = () => { if (selected) { reset({ ...selected, telefone: formatPhoneNumber(selected.telefone || '') }); setMode('edit'); } };
  const close = () => { setOpen(false); setStatus(''); };

  const save = async (v: Piloto) => {
    const payload = { full_name: v.nome, email: v.email || `${v.nome.toLowerCase().replace(/\s+/g, '.')}@demo.com`, telefone: unformatPhoneNumber(v.telefone || ''), licenca_caar: v.licenca_caar, role: v.role || 'pilot', is_active: v.is_active ?? true, invite_status: v.invite_status || 'accepted', enterprise_id: ENTERPRISE_ID };
    const result = mode === 'edit' && selected?.id ? await supabase.from('profiles').update(payload).eq('id', selected.id) : await supabase.from('profiles').insert({ ...payload, id: crypto.randomUUID() });
    if (result.error) return setStatus(result.error.message);
    await load(); close();
  };
  const remove = async () => {
    if (!selected?.id || !confirm(`Excluir o piloto "${selected.nome}"?`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', selected.id);
    if (error) return setStatus(error.message);
    await load(); close();
  };

  return <>
    <CadastroTable title="Pilotos" rows={rows} onAdd={add} onRowClick={show} searchText={(r) => `${r.nome} ${r.email} ${r.telefone} ${r.licenca_caar} ${r.role}`} emptyText="Nenhum piloto cadastrado." columns={[
      { key: 'nome', label: 'Nome', render: (r) => <span className="font-semibold text-gray-900">{r.nome}</span> },
      { key: 'email', label: 'E-mail', render: (r) => r.email || '—' }, { key: 'telefone', label: 'Telefone', render: (r) => r.telefone ? formatPhoneNumber(r.telefone) : '—' },
      { key: 'licenca', label: 'Licença CAAR', render: (r) => r.licenca_caar || '—' }, { key: 'perfil', label: 'Perfil', render: (r) => <Badge label={r.role === 'admin' ? 'Administrador' : 'Piloto'} tone="info" /> },
      { key: 'status', label: 'Status', render: (r) => <StatusBadge active={r.is_active !== false} /> },
    ]} />
    <CadastroModal open={open} mode={mode} title={mode === 'add' ? 'Adicionar Piloto' : selected?.nome || 'Piloto'} onClose={close} onEdit={edit} onDelete={remove}>
      {mode === 'view' && selected ? <DetailGrid items={[
        { label: 'Nome', value: selected.nome }, { label: 'E-mail', value: selected.email }, { label: 'Telefone', value: selected.telefone ? formatPhoneNumber(selected.telefone) : '—' },
        { label: 'Licença CAAR', value: selected.licenca_caar }, { label: 'Perfil', value: selected.role }, { label: 'Convite', value: selected.invite_status }, { label: 'Ativo', value: selected.is_active !== false ? 'Sim' : 'Não' },
      ]} /> : <form onSubmit={handleSubmit(save)} className="space-y-4">
        <Field label="Nome"><input {...register('nome', { required: true })} className={inputClass} /></Field>
        <Field label="E-mail"><input type="email" {...register('email')} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Telefone"><input inputMode="tel" maxLength={15} {...register('telefone', { onChange: (event) => setValue('telefone', formatPhoneNumber(event.target.value)) })} className={inputClass} /></Field><Field label="Licença CAAR"><input {...register('licenca_caar')} className={inputClass} /></Field></div>
        <Field label="Perfil"><select {...register('role')} className={inputClass}><option value="pilot">Piloto</option><option value="admin">Administrador</option></select></Field>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" {...register('is_active')} /> Usuário ativo</label>
        {status && <p className="text-sm text-red-600">{status}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={close} className={secondaryButtonClass}>Cancelar</button><button className={primaryButtonClass}>Salvar</button></div>
      </form>}
    </CadastroModal>
  </>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className={labelClass}>{label}</label>{children}</div>; }
