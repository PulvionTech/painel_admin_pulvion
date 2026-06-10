"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { formatPhoneNumber, unformatPhoneNumber, ESTADOS_BR, getCidadesByEstadoIBGE } from '@/lib/utils';

interface FazendaForm {
  id?: string;
  nome: string;
  estado?: string;
  cidade?: string;
  contato_nome?: string;
  telefone?: string;
}

export default function FazendaTab() {
  const [fazendas, setFazendas] = useState<FazendaForm[]>([]);
  const [selected, setSelected] = useState<FazendaForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cidades, setCidades] = useState<string[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<FazendaForm>({
    defaultValues: {
      nome: '',
      estado: '',
      cidade: '',
      contato_nome: '',
      telefone: '',
    },
  });
  const [status, setStatus] = useState<string | null>(null);
  const estadoWatch = watch('estado');
  const cidadeWatch = watch('cidade');

  const TEST_ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';

  // Carregar fazendas
  useEffect(() => {
    async function loadFazendas() {
      try {
        const { data, error } = await supabase
          .from('fazendas')
          .select('*')
          .order('nome', { ascending: true });
        if (error) throw error;
        if (data) setFazendas(data as any);
      } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
      }
    }
    loadFazendas();
  }, []);

  // Carregar cidades do IBGE quando o estado mudar
  useEffect(() => {
    async function loadCidades() {
      if (estadoWatch) {
        setLoadingCidades(true);
        const cidadesIBGE = await getCidadesByEstadoIBGE(estadoWatch);
        setCidades(cidadesIBGE);
        setLoadingCidades(false);
      } else {
        setCidades([]);
      }
    }
    loadCidades();
  }, [estadoWatch]);

  // Filtrar cidades com base no termo de busca
  const filteredCidades = useMemo(() => {
    if (!searchTerm) return cidades;
    return cidades.filter(cidade =>
      cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cidades, searchTerm]);

  // Quando uma cidade é selecionada
  const handleSelectCidade = (cidade: string) => {
    setValue('cidade', cidade);
    setSearchTerm(cidade);
    setShowDropdown(false);
  };

  const onSubmit = async (values: FazendaForm) => {
    setStatus(null);
    try {
      const dataToSave = {
        ...values,
        enterprise_id: TEST_ENTERPRISE_ID,
        telefone: unformatPhoneNumber(values.telefone || ''),
      };

      if (selected?.id && isEditing) {
        const { error } = await supabase
          .from('fazendas')
          .update(dataToSave)
          .eq('id', selected.id);
        if (error) throw error;
        setStatus('✓ Fazenda atualizada com sucesso');
      } else {
        const { error } = await supabase.from('fazendas').insert(dataToSave);
        if (error) throw error;
        setStatus('✓ Fazenda criada com sucesso');
      }
      const { data } = await supabase
        .from('fazendas')
        .select('*')
        .order('nome', { ascending: true });
      if (data) setFazendas(data as any);
      reset();
      setSelected(null);
      setIsEditing(false);
      setIsAdding(false);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
      setStatus('✗ Erro ao salvar dados');
    }
  };

  const handleSelect = (fazenda: FazendaForm) => {
    setSelected(fazenda);
    setIsEditing(false);
    setIsAdding(false);
    setStatus(null);
  };

  const handleStartEdit = () => {
    if (!selected) return;
    setIsEditing(true);
    reset({
      ...selected,
      telefone: selected.telefone ? formatPhoneNumber(selected.telefone) : '',
    });
    if (selected.cidade) {
      setSearchTerm(selected.cidade);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelected(null);
    setIsEditing(false);
    reset({
      nome: '',
      estado: '',
      cidade: '',
      contato_nome: '',
      telefone: '',
    });
    setSearchTerm('');
    setStatus(null);
  };

  const handleCancel = () => {
    setSelected(null);
    setIsEditing(false);
    setIsAdding(false);
    reset();
    setSearchTerm('');
    setStatus(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6">
      {/* Lista de Fazendas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            📋 Fazendas ({fazendas.length})
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
          {fazendas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma fazenda cadastrada</p>
          ) : (
            <ul className="space-y-2">
              {fazendas.map((f) => {
                const isSelected = selected?.id === f.id;
                return (
                  <li
                    key={f.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-pulvion-green/20 border border-pulvion-green'
                        : 'bg-white border border-gray-200 hover:border-pulvion-green/50'
                    }`}
                    onClick={() => handleSelect(f)}
                  >
                    <p className="font-medium text-slate-900">{f.nome}</p>
                    {f.cidade && <p className="text-xs text-slate-500">{f.cidade}, {f.estado}</p>}
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
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Cidade</p>
                <p className="text-sm font-medium text-slate-900">
                  {selected.cidade && selected.estado ? `${selected.cidade}, ${selected.estado}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Contato</p>
                <p className="text-sm font-medium text-slate-900">{selected.contato_nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-slate-900">
                  {selected.telefone ? formatPhoneNumber(selected.telefone) : '—'}
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
                {isAdding ? 'Nova Fazenda' : 'Editar Fazenda'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome da fazenda *</label>
                <input
                  type="text"
                  {...register('nome', { required: true })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  placeholder="Fazenda Primavera"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    {...register('estado')}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {ESTADOS_BR.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setValue('cidade', e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    disabled={!estadoWatch}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm disabled:bg-gray-100"
                    placeholder={estadoWatch ? 'Digite o nome da cidade' : 'Selecione um estado primeiro'}
                  />
                  {loadingCidades && (
                    <div className="absolute right-3 top-10 text-xs text-slate-500">Carregando...</div>
                  )}
                  {showDropdown && !loadingCidades && filteredCidades.length > 0 && estadoWatch && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {filteredCidades.map((cidade) => (
                        <li
                          key={cidade}
                          className="px-3 py-2 text-sm hover:bg-pulvion-green/10 cursor-pointer transition"
                          onClick={() => handleSelectCidade(cidade)}
                        >
                          {cidade}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showDropdown && !loadingCidades && filteredCidades.length === 0 && estadoWatch && searchTerm && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 px-3 py-2 text-sm text-slate-500 shadow-lg">
                      Nenhuma cidade encontrada
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contato</label>
                <input
                  type="text"
                  {...register('contato_nome')}
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
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Selecione uma fazenda</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Escolha uma fazenda da lista para ver os detalhes ou clique em "Nova" para adicionar uma nova.
            </p>
            <button
              onClick={handleStartAdd}
              className="bg-pulvion-green text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-500 transition"
            >
              Adicionar Fazenda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
