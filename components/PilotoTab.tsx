"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/utils';

interface PilotoForm {
  id?: string;
  nome: string;
  telefone?: string;
  licenca_caar?: string;
}

export default function PilotoTab() {
  const [pilotos, setPilotos] = useState<PilotoForm[]>([]);
  const [selected, setSelected] = useState<PilotoForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { register, handleSubmit, reset } = useForm<PilotoForm>({
    defaultValues: { nome: '', telefone: '', licenca_caar: '' },
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadPilotos() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, telefone, licenca_caar')
          .order('full_name', { ascending: true });
        if (error) throw error;
        if (data) {
          const mapped = (data || []).map((u) => ({
            id: u.id,
            nome: (u as any).full_name,
            telefone: (u as any).telefone,
            licenca_caar: (u as any).licenca_caar,
          }));
          setPilotos(mapped as any);
        }
      } catch (err) {
        console.error('Erro ao carregar pilotos:', err);
      }
    }
    loadPilotos();
  }, []);

  const TEST_ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';

  const onSubmit = async (values: PilotoForm) => {
    setStatus(null);
    try {
      const dataToSave = {
        full_name: values.nome,
        enterprise_id: TEST_ENTERPRISE_ID,
        email: `${values.nome.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
        telefone: unformatPhoneNumber(values.telefone || ''),
        licenca_caar: values.licenca_caar,
        role: 'pilot',
        modulo_pulverizacao: true,
        modulo_mapeamento: true,
        modulo_cotesia: false,
        is_active: true,
        invite_status: 'accepted',
      };

      if (selected?.id && isEditing) {
        const { error } = await supabase
          .from('profiles')
          .update(dataToSave)
          .eq('id', selected.id);
        if (error) throw error;
        setStatus('✓ Piloto atualizado com sucesso');
      } else {
        const { error } = await supabase.from('profiles').insert({ ...dataToSave, id: crypto.randomUUID() });
        if (error) throw error;
        setStatus('✓ Piloto cadastrado com sucesso');
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, telefone, licenca_caar')
        .order('full_name', { ascending: true });
      if (data) {
        const mapped = (data || []).map((u) => ({
          id: u.id,
          nome: (u as any).full_name,
          telefone: (u as any).telefone,
          licenca_caar: (u as any).licenca_caar,
        }));
        setPilotos(mapped as any);
      }
      reset();
      setSelected(null);
      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setStatus('✗ Erro ao salvar dados');
    }
  };

  const handleSelect = (piloto: PilotoForm) => {
    setSelected(piloto);
    setIsEditing(false);
    setIsAdding(false);
    setStatus(null);
  };

  const handleStartEdit = () => {
    if (!selected) return;
    setIsEditing(true);
    reset({
      nome: selected.nome,
      telefone: selected.telefone ? formatPhoneNumber(selected.telefone) : '',
      licenca_caar: selected.licenca_caar,
    });
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelected(null);
    setIsEditing(false);
    reset({
      nome: '',
      telefone: '',
      licenca_caar: '',
    });
    setStatus(null);
  };

  const handleCancel = () => {
    setSelected(null);
    setIsEditing(false);
    setIsAdding(false);
    reset();
    setStatus(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6">
      {/* Lista de Pilotos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            👤 Pilotos ({pilotos.length})
          </h3>
          <button
            onClick={handleStartAdd}
            className="bg-pulvion-green text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-500 transition flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo
          </button>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 max-h-[600px] overflow-y-auto border border-gray-200">
          {pilotos.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhum piloto cadastrado</p>
          ) : (
            <ul className="space-y-2">
              {pilotos.map((piloto) => {
                const isSelected = selected?.id === piloto.id;
                return (
                  <li
                    key={piloto.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-pulvion-green/20 border border-pulvion-green'
                        : 'bg-white border border-gray-200 hover:border-pulvion-green/50'
                    }`}
                    onClick={() => handleSelect(piloto)}
                  >
                    <p className="font-medium text-slate-900">{piloto.nome}</p>
                    {piloto.licenca_caar && <p className="text-xs text-slate-500 font-mono">{piloto.licenca_caar}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Painel Principal (View/Edit) */}
      <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
        {/* View Mode */}
        {selected && !isEditing && !isAdding && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">{selected.nome}</h3>
              <button
                onClick={handleStartEdit}
                className="bg-pulvion-green/10 text-pulvion-green px-4 py-2 rounded-xl text-sm font-semibold hover:bg-pulvion-green/20 transition flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-slate-900">
                  {selected.telefone ? formatPhoneNumber(selected.telefone) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Licença CAAR</p>
                <p className="text-sm font-medium text-slate-900">{selected.licenca_caar || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Add Form */}
        {(isEditing || isAdding) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {isAdding ? 'Novo Piloto' : 'Editar Piloto'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome do piloto *</label>
                <input
                  type="text"
                  {...register('nome', { required: true })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                <input
                  type="text"
                  {...register('telefone', {
                    onChange: (e) => {
                      e.target.value = formatPhoneNumber(e.target.value);
                    },
                  })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="(34) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Licença (CAAR)</label>
                <input
                  type="text"
                  {...register('licenca_caar')}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="CAAR-XXXXXX"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pulvion-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-500 transition text-sm"
                >
                  {isAdding ? 'Cadastrar' : 'Salvar'}
                </button>
              </div>
              {status && (
                <p className={`text-sm font-medium ${status.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {status}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Empty State */}
        {!selected && !isAdding && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecione um piloto</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Escolha um piloto da lista para ver os detalhes ou clique em "Novo" para adicionar um novo.
            </p>
            <button
              onClick={handleStartAdd}
              className="bg-pulvion-green text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-500 transition"
            >
              Adicionar Piloto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
