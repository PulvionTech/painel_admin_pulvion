"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';

const MODELOS_DISPONIVEIS = [
  'Agras T40',
  'Agras T30',
  'Agras T20P',
  'Agras T50',
  'Agras T25P',
  'Agras T100',
  'P100',
  'P30',
  'P40',
  'V40',
  'HD540 Pro',
  'S50',
];

interface DroneForm {
  id?: string;
  identificador: string;
  modelo: string;
  modeloPersonalizado?: boolean;
  registro_anac?: string;
  numero_serie?: string;
  status?: string;
  ativo?: boolean;
}

export default function DroneTab() {
  const [drones, setDrones] = useState<DroneForm[]>([]);
  const [selected, setSelected] = useState<DroneForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<DroneForm>({
    defaultValues: {
      identificador: '',
      modelo: '',
      modeloPersonalizado: false,
      registro_anac: '',
      numero_serie: '',
      status: 'Em operação',
      ativo: true,
    },
  });
  const [status, setStatus] = useState<string | null>(null);
  const modeloPersonalizadoWatch = watch('modeloPersonalizado');

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await supabase
          .from('drones')
          .select('*')
          .order('identificador', { ascending: true });
        if (data) setDrones(data as any);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const onSubmit = async (values: DroneForm) => {
    setStatus(null);
    try {
      const TEST_ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
      const dataToSave = {
        identificador: values.identificador,
        modelo: values.modelo,
        registro_anac: values.registro_anac,
        numero_serie: values.numero_serie,
        status: values.status || 'Em operação',
        ativo: values.ativo ?? true,
        enterprise_id: TEST_ENTERPRISE_ID,
      };

      if (selected?.id && isEditing) {
        const { error } = await supabase
          .from('drones')
          .update(dataToSave)
          .eq('id', selected.id);
        if (error) throw error;
        setStatus('✓ Drone atualizado com sucesso');
      } else {
        const { error } = await supabase.from('drones').insert(dataToSave);
        if (error) throw error;
        setStatus('✓ Drone criado com sucesso');
      }
      const { data } = await supabase
        .from('drones')
        .select('*')
        .order('identificador', { ascending: true });
      if (data) setDrones(data as any);
      reset();
      setSelected(null);
      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error('Erro completo:', err);
      setStatus(`✗ Erro ao salvar dados: ${(err as any)?.message || 'Erro desconhecido'}`);
    }
  };

  const handleSelect = (drone: DroneForm) => {
    setSelected(drone);
    setIsEditing(false);
    setIsAdding(false);
    setStatus(null);
  };

  const handleStartEdit = () => {
    if (!selected) return;
    setIsEditing(true);
    const isModeloPersonalizado = !MODELOS_DISPONIVEIS.includes(selected.modelo);
    reset({
      ...selected,
      modeloPersonalizado: isModeloPersonalizado,
    });
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelected(null);
    setIsEditing(false);
    reset({
      identificador: '',
      modelo: '',
      modeloPersonalizado: false,
      registro_anac: '',
      numero_serie: '',
      status: 'Em operação',
      ativo: true,
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
      {/* Lista de Drones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            🚁 Drones ({drones.length})
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
          {drones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhum drone cadastrado</p>
          ) : (
            <ul className="space-y-2">
              {drones.map((drone) => {
                const isSelected = selected?.id === drone.id;
                return (
                  <li
                    key={drone.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-pulvion-green/20 border border-pulvion-green'
                        : 'bg-white border border-gray-200 hover:border-pulvion-green/50'
                    }`}
                    onClick={() => handleSelect(drone)}
                  >
                    <p className="font-medium text-slate-900">{drone.identificador}</p>
                    {drone.modelo && <p className="text-xs text-slate-500">{drone.modelo}</p>}
                    {drone.status && <p className="text-xs text-slate-400">{drone.status}</p>}
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
              <h3 className="text-xl font-semibold text-slate-900">{selected.identificador}</h3>
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
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Modelo</p>
                <p className="text-sm font-medium text-slate-900">{selected.modelo || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-900">{selected.status || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Registro ANAC</p>
                <p className="text-sm font-medium text-slate-900">{selected.registro_anac || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Número de Série</p>
                <p className="text-sm font-medium text-slate-900">{selected.numero_serie || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Ativo</p>
                <p className="text-sm font-medium text-slate-900">
                  {selected.ativo ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <svg className="h-2 w-2 bg-green-500 rounded-full"></svg>
                      Sim
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700">
                      <svg className="h-2 w-2 bg-red-500 rounded-full"></svg>
                      Não
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Add Form */}
        {(isEditing || isAdding) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {isAdding ? 'Novo Drone' : 'Editar Drone'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Identificador *</label>
                <input
                  type="text"
                  {...register('identificador', { required: true })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="Nome/Identificador do drone"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  {...register('modeloPersonalizado')}
                  id="modeloPersonalizado"
                  className="rounded border-gray-300 text-pulvion-green focus:ring-pulvion-green"
                />
                <label
                  htmlFor="modeloPersonalizado"
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  Modelo não está na lista (personalizado)
                </label>
              </div>

              {!modeloPersonalizadoWatch ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Modelo *</label>
                  <select
                    {...register('modelo', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {MODELOS_DISPONIVEIS.map((modelo) => (
                      <option key={modelo} value={modelo}>
                        {modelo}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Modelo personalizado *</label>
                  <input
                    type="text"
                    {...register('modelo', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="Digite o modelo do drone"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Registro ANAC</label>
                <input
                  type="text"
                  {...register('registro_anac')}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="Registro ANAC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Número de Série</label>
                <input
                  type="text"
                  {...register('numero_serie')}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="Número de série"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                >
                  <option value="Em operação">Em operação</option>
                  <option value="Em manutenção">Em manutenção</option>
                  <option value="Fora de serviço">Fora de serviço</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('ativo')}
                  id="ativo"
                  className="rounded border-gray-300 text-pulvion-green focus:ring-pulvion-green"
                />
                <label
                  htmlFor="ativo"
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  Drone ativo (visível para seleção)
                </label>
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
            <div className="text-6xl mb-4">🚁</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecione um drone</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Escolha um drone da lista para ver os detalhes ou clique em "Novo" para adicionar um novo.
            </p>
            <button
              onClick={handleStartAdd}
              className="bg-pulvion-green text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-500 transition"
            >
              Adicionar Drone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
