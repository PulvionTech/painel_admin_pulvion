"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';

interface AplicacaoForm {
  id?: string;
  data_aplicacao: string;
  user_id: string;
  fazenda_id: string;
  drone_id: string;
  cultura: string;
  area_ha: number;
  horas_voo?: number;
  tipo_servico?: string;
  classe_produto?: string;
  produto_nome?: string;
  dosagem?: number;
  unidade?: string;
  num_art?: string;
}

interface Piloto {
  id: string;
  nome: string;
}

interface Fazenda {
  id: string;
  nome: string;
}

interface Drone {
  id: string;
  identificador: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export default function AplicacaoTab() {
  const [aplicacoes, setAplicacoes] = useState<AplicacaoForm[]>([]);
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selected, setSelected] = useState<AplicacaoForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { register, handleSubmit, reset } = useForm<AplicacaoForm>({
    defaultValues: {
      data_aplicacao: new Date().toISOString().split('T')[0],
      user_id: '',
      fazenda_id: '',
      drone_id: '',
      cultura: '',
      area_ha: 0,
      horas_voo: 0,
      tipo_servico: '',
      classe_produto: '',
      produto_nome: '',
      dosagem: 0,
      unidade: '',
      num_art: '',
    },
  });
  const [status, setStatus] = useState<string | null>(null);

  const TEST_ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: pilotsData, error: pilotsError },
          { data: farmsData, error: farmsError },
          { data: dronesData, error: dronesError },
        ] = await Promise.all([
          supabase.from('profiles').select('id, full_name'),
          supabase.from('fazendas').select('id, nome'),
          supabase.from('drones').select('id, identificador').eq('ativo', true),
        ]);

        if (pilotsError) throw pilotsError;
        if (farmsError) throw farmsError;
        if (dronesError) throw dronesError;

        setPilotos((pilotsData || []).map(p => ({ id: p.id, nome: (p as any).full_name })));
        setFazendas((farmsData || []).map(f => ({ id: f.id, nome: f.nome })));
        setDrones((dronesData || []).map(d => ({ id: d.id, identificador: d.identificador })));

        await loadAplicacoes();
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }
    loadData();
  }, []);

  const loadAplicacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('aplicacoes')
        .select('*')
        .order('data_aplicacao', { ascending: false });
      if (error) throw error;
      if (data) setAplicacoes(data as any);
    } catch (err) {
      console.error('Erro ao carregar aplicações:', err);
    }
  };

  const onSubmit = async (values: AplicacaoForm) => {
    setStatus(null);
    try {
      const dataToSave = {
        ...values,
        enterprise_id: TEST_ENTERPRISE_ID,
        sync_status: 'pending',
        sheets_status: 'pending',
      };

      if (selected?.id && isEditing) {
        const { error } = await supabase
          .from('aplicacoes')
          .update(dataToSave)
          .eq('id', selected.id);
        if (error) throw error;
        setStatus('✓ Aplicação atualizada com sucesso');
      } else {
        const { error } = await supabase.from('aplicacoes').insert(dataToSave);
        if (error) throw error;
        setStatus('✓ Aplicação criada com sucesso');
      }

      await loadAplicacoes();
      reset({
        data_aplicacao: new Date().toISOString().split('T')[0],
        user_id: '',
        fazenda_id: '',
        drone_id: '',
        cultura: '',
        area_ha: 0,
        horas_voo: 0,
        tipo_servico: '',
        classe_produto: '',
        produto_nome: '',
        dosagem: 0,
        unidade: '',
        num_art: '',
      });
      setSelected(null);
      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error('Erro completo:', err);
      setStatus(`✗ Erro ao salvar dados: ${(err as any)?.message || 'Erro desconhecido'}`);
    }
  };

  const handleSelect = (aplicacao: AplicacaoForm) => {
    setSelected(aplicacao);
    setIsEditing(false);
    setIsAdding(false);
    setStatus(null);
  };

  const handleStartEdit = () => {
    if (!selected) return;
    setIsEditing(true);
    reset({
      id: selected.id,
      data_aplicacao: selected.data_aplicacao.split('T')[0],
      user_id: selected.user_id,
      fazenda_id: selected.fazenda_id,
      drone_id: selected.drone_id,
      cultura: selected.cultura,
      area_ha: selected.area_ha,
      horas_voo: selected.horas_voo || 0,
      tipo_servico: selected.tipo_servico || '',
      classe_produto: selected.classe_produto || '',
      produto_nome: selected.produto_nome || '',
      dosagem: selected.dosagem || 0,
      unidade: selected.unidade || '',
      num_art: selected.num_art || '',
    });
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelected(null);
    setIsEditing(false);
    reset({
      data_aplicacao: new Date().toISOString().split('T')[0],
      user_id: '',
      fazenda_id: '',
      drone_id: '',
      cultura: '',
      area_ha: 0,
      horas_voo: 0,
      tipo_servico: '',
      classe_produto: '',
      produto_nome: '',
      dosagem: 0,
      unidade: '',
      num_art: '',
    });
    setStatus(null);
  };

  const handleCancel = () => {
    setSelected(null);
    setIsEditing(false);
    setIsAdding(false);
    reset({
      data_aplicacao: new Date().toISOString().split('T')[0],
      user_id: '',
      fazenda_id: '',
      drone_id: '',
      cultura: '',
      area_ha: 0,
      horas_voo: 0,
      tipo_servico: '',
      classe_produto: '',
      produto_nome: '',
      dosagem: 0,
      unidade: '',
      num_art: '',
    });
    setStatus(null);
  };

  const getPilotoNome = (id: string) => pilotos.find(p => p.id === id)?.nome || '—';
  const getFazendaNome = (id: string) => fazendas.find(f => f.id === id)?.nome || '—';
  const getDroneIdentificador = (id: string) => drones.find(d => d.id === id)?.identificador || '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6">
      {/* Lista de Aplicações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            ✈️ Aplicações ({aplicacoes.length})
          </h3>
          <button
            onClick={handleStartAdd}
            className="bg-pulvion-green text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-500 transition flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova
          </button>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 max-h-[600px] overflow-y-auto border border-gray-200">
          {aplicacoes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma aplicação cadastrada</p>
          ) : (
            <ul className="space-y-2">
              {aplicacoes.map((aplicacao) => {
                const isSelected = selected?.id === aplicacao.id;
                return (
                  <li
                    key={aplicacao.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-pulvion-green/20 border border-pulvion-green'
                        : 'bg-white border border-gray-200 hover:border-pulvion-green/50'
                    }`}
                    onClick={() => handleSelect(aplicacao)}
                  >
                    <p className="font-medium text-slate-900">{aplicacao.cultura}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(aplicacao.data_aplicacao)} • {getPilotoNome(aplicacao.user_id)}
                    </p>
                    {aplicacao.area_ha && (
                      <p className="text-xs text-slate-400">{Number(aplicacao.area_ha).toFixed(2)} ha</p>
                    )}
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
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selected.cultura}</h3>
                <p className="text-sm text-slate-500">{formatDate(selected.data_aplicacao)}</p>
              </div>
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
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Piloto</p>
                <p className="text-sm font-medium text-slate-900">{getPilotoNome(selected.user_id)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Fazenda</p>
                <p className="text-sm font-medium text-slate-900">{getFazendaNome(selected.fazenda_id)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Drone</p>
                <p className="text-sm font-medium text-slate-900">{getDroneIdentificador(selected.drone_id)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Cultura</p>
                <p className="text-sm font-medium text-slate-900">{selected.cultura}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Dados da Operação</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-500 mb-1">Área (ha)</p>
                  <p className="text-xl font-semibold text-pulvion-teal">
                    {Number(selected.area_ha).toFixed(2)}
                  </p>
                </div>
                {selected.horas_voo && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Horas de Voo</p>
                    <p className="text-xl font-semibold text-pulvion-teal">
                      {Number(selected.horas_voo).toFixed(1)}
                    </p>
                  </div>
                )}
                {selected.tipo_servico && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Tipo de Serviço</p>
                    <p className="text-xl font-semibold text-pulvion-teal">{selected.tipo_servico}</p>
                  </div>
                )}
              </div>
            </div>

            {((selected.produto_nome && selected.produto_nome !== '') || selected.classe_produto || selected.dosagem) && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Produto Aplicado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.classe_produto && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Classe</p>
                      <p className="text-sm font-medium text-slate-900">{selected.classe_produto}</p>
                    </div>
                  )}
                  {selected.produto_nome && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Produto</p>
                      <p className="text-sm font-medium text-slate-900">{selected.produto_nome}</p>
                    </div>
                  )}
                  {selected.dosagem && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Dosagem</p>
                      <p className="text-sm font-medium text-slate-900">
                        {Number(selected.dosagem).toFixed(2)} {selected.unidade || ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selected.num_art && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Número ART</p>
                <p className="text-sm font-medium text-slate-900">{selected.num_art}</p>
              </div>
            )}
          </div>
        )}

        {/* Edit/Add Form */}
        {(isEditing || isAdding) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {isAdding ? 'Nova Aplicação' : 'Editar Aplicação'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data *</label>
                  <input
                    type="date"
                    {...register('data_aplicacao', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Piloto *</label>
                  <select
                    {...register('user_id', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {pilotos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fazenda *</label>
                  <select
                    {...register('fazenda_id', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {fazendas.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Drone *</label>
                  <select
                    {...register('drone_id', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {drones.map(d => (
                      <option key={d.id} value={d.id}>{d.identificador}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cultura *</label>
                  <input
                    type="text"
                    {...register('cultura', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="Soja, Milho, Algodão..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Área (ha) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('area_ha', { required: true })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="10.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Horas de voo</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('horas_voo')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de serviço</label>
                  <input
                    type="text"
                    {...register('tipo_servico')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="Pulverização, Mapeamento..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Classe do produto</label>
                  <input
                    type="text"
                    {...register('classe_produto')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="Herbicida, Fungicida..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Produto</label>
                  <input
                    type="text"
                    {...register('produto_nome')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="Nome do produto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dosagem</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('dosagem')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
                  <input
                    type="text"
                    {...register('unidade')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="L/ha, kg/ha..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Número ART</label>
                  <input
                    type="text"
                    {...register('num_art')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                    placeholder="ART-XXXXXX"
                  />
                </div>
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
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecione uma aplicação</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Escolha uma aplicação da lista para ver os detalhes ou clique em "Nova" para adicionar uma nova.
            </p>
            <button
              onClick={handleStartAdd}
              className="bg-pulvion-green text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-500 transition"
            >
              Adicionar Aplicação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
