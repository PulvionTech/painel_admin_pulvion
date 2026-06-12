"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import CadastroTable, { StatusBadge } from './CadastroTable';
import CadastroModal, { DetailGrid, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './CadastroModal';

const MODELOS = ['Agras T40', 'Agras T30', 'Agras T20P', 'Agras T50', 'Agras T25P', 'Agras T100', 'P100', 'P30', 'P40', 'V40', 'HD540 Pro', 'S50'];
const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';

interface Drone {
  id?: string;
  identificador: string;
  modelo: string;
  registro_anac?: string;
  numero_serie?: string;
  status?: string;
  ativo?: boolean;
}

const defaults: Drone = { identificador: '', modelo: '', registro_anac: '', numero_serie: '', status: 'Em operação', ativo: true };

export default function DroneTab() {
  const [rows, setRows] = useState<Drone[]>([]);
  const [selected, setSelected] = useState<Drone | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const { register, handleSubmit, reset } = useForm<Drone>({ defaultValues: defaults });

  const load = async () => {
    const { data, error } = await supabase.from('drones').select('*').order('identificador');
    if (error) setStatus(error.message);
    else setRows((data || []) as Drone[]);
  };
  useEffect(() => { void load(); }, []);

  const show = (row: Drone) => { setSelected(row); setMode('view'); setOpen(true); setStatus(''); };
  const add = () => { setSelected(null); reset(defaults); setMode('add'); setOpen(true); setStatus(''); };
  const edit = () => { if (selected) { reset(selected); setMode('edit'); } };
  const close = () => { setOpen(false); setStatus(''); };

  const save = async (values: Drone) => {
    const payload = { ...values, id: undefined, enterprise_id: ENTERPRISE_ID };
    const result = mode === 'edit' && selected?.id
      ? await supabase.from('drones').update(payload).eq('id', selected.id)
      : await supabase.from('drones').insert(payload);
    if (result.error) return setStatus(result.error.message);
    await load(); close();
  };

  const remove = async () => {
    if (!selected?.id || !confirm(`Excluir o drone "${selected.identificador}"?`)) return;
    const { error } = await supabase.from('drones').delete().eq('id', selected.id);
    if (error) return setStatus(error.message);
    await load(); close();
  };

  return (
    <>
      <CadastroTable
        title="Drones"
        rows={rows}
        onAdd={add}
        onRowClick={show}
        searchText={(row) => `${row.identificador} ${row.modelo} ${row.registro_anac} ${row.numero_serie} ${row.status}`}
        emptyText="Nenhum drone cadastrado."
        columns={[
          { key: 'identificador', label: 'Identificador', render: (r) => <span className="font-semibold text-gray-900">{r.identificador}</span> },
          { key: 'modelo', label: 'Modelo', render: (r) => r.modelo || '—' },
          { key: 'anac', label: 'Registro ANAC', render: (r) => r.registro_anac || '—' },
          { key: 'serie', label: 'Número de série', render: (r) => r.numero_serie || '—' },
          { key: 'status', label: 'Status', render: (r) => r.status || '—' },
          { key: 'ativo', label: 'Ativo', render: (r) => <StatusBadge active={r.ativo !== false} /> },
        ]}
      />
      <CadastroModal open={open} mode={mode} title={mode === 'add' ? 'Adicionar Drone' : selected?.identificador || 'Drone'} onClose={close} onEdit={edit} onDelete={remove}>
        {mode === 'view' && selected ? (
          <DetailGrid items={[
            { label: 'Identificador', value: selected.identificador }, { label: 'Modelo', value: selected.modelo },
            { label: 'Registro ANAC', value: selected.registro_anac }, { label: 'Número de série', value: selected.numero_serie },
            { label: 'Status', value: selected.status }, { label: 'Ativo', value: selected.ativo !== false ? 'Sim' : 'Não' },
          ]} />
        ) : (
          <form onSubmit={handleSubmit(save)} className="space-y-4">
            <Field label="Identificador"><input {...register('identificador', { required: true })} className={inputClass} /></Field>
            <Field label="Modelo"><select {...register('modelo', { required: true })} className={inputClass}><option value="">Selecione</option>{MODELOS.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Registro ANAC"><input {...register('registro_anac')} className={inputClass} /></Field><Field label="Número de série"><input {...register('numero_serie')} className={inputClass} /></Field></div>
            <Field label="Status"><select {...register('status')} className={inputClass}><option>Em operação</option><option>Em manutenção</option><option>Fora de serviço</option></select></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" {...register('ativo')} /> Drone ativo</label>
            {status && <p className="text-sm text-red-600">{status}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={close} className={secondaryButtonClass}>Cancelar</button><button className={primaryButtonClass}>Salvar</button></div>
          </form>
        )}
      </CadastroModal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className={labelClass}>{label}</label>{children}</div>; }
