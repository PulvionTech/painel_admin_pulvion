"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  MapPin,
  Phone,
  User,
  Calendar,
  FileText,
  MapPinned,
  CheckCircle2,
  XCircle,
  LandPlot,
  ClipboardList,
  Plane,
  UserRound,
  ChevronRight,
  ArrowUpDown,
  Warehouse
} from 'lucide-react';
import { formatPhoneNumber, unformatPhoneNumber, ESTADOS_BR, getCidadesByEstadoIBGE } from '@/lib/utils';

interface Fazenda {
  id: string;
  nome: string;
  estado?: string;
  cidade?: string;
  contato_nome?: string;
  telefone?: string;
  created_at?: string;
  observacoes?: string;
  area_total?: number;
  ativa?: boolean;
}

interface Aplicacao {
  id: string;
  data_aplicacao: string;
  fazenda_id: string;
  talhao?: string;
  produto_nome?: string;
  drone_id?: string;
  user_id?: string;
  area_ha?: number;
}

export default function FazendaTab() {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<any[]>([]);
  const [drones, setDrones] = useState<any[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, watch, setValue } = useForm<Fazenda>({
    defaultValues: {
      nome: '',
      estado: '',
      cidade: '',
      contato_nome: '',
      telefone: '',
      observacoes: '',
      area_total: 0,
      ativa: true,
    },
  });

  const TEST_ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
  const estadoWatch = watch('estado');

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: fazendasData, error: fazendasError },
          { data: aplicacoesData, error: appsError },
          { data: pilotosData, error: pilotsError },
          { data: dronesData, error: dronesError }
        ] = await Promise.all([
          supabase.from('fazendas').select('*').order('nome', { ascending: true }),
          supabase.from('aplicacoes').select('*').order('data_aplicacao', { ascending: false }),
          supabase.from('profiles').select('id, full_name'),
          supabase.from('drones').select('id, identificador'),
        ]);

        if (fazendasError) throw fazendasError;
        if (appsError) throw appsError;

        setFazendas(fazendasData || []);
        setAplicacoes(aplicacoesData || []);
        setPilotos(pilotosData || []);
        setDrones(dronesData || []);

        // Auto selecionar a primeira fazenda
        if (fazendasData && fazendasData.length > 0) {
          setSelectedFazenda(fazendasData[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrar fazendas
  const filteredFazendas = useMemo(() => {
    if (!searchTerm) return fazendas;
    const term = searchTerm.toLowerCase();
    return fazendas.filter(fazenda =>
      fazenda.nome?.toLowerCase().includes(term) ||
      fazenda.cidade?.toLowerCase().includes(term) ||
      fazenda.estado?.toLowerCase().includes(term) ||
      fazenda.contato_nome?.toLowerCase().includes(term) ||
      fazenda.telefone?.toLowerCase().includes(term)
    );
  }, [fazendas, searchTerm]);

  // KPIs da fazenda selecionada
  const fazendaKPIs = useMemo(() => {
    if (!selectedFazenda) return {
      totalAplicacoes: 0,
      areaAplicada: 0,
      ultimaAplicacao: null,
      dronesVinculados: 0,
      pilotosVinculados: 0
    };

    const fazendaApps = aplicacoes.filter(app => app.fazenda_id === selectedFazenda.id);
    const totalAplicacoes = fazendaApps.length;
    const areaAplicada = fazendaApps.reduce((sum, app) => sum + (Number(app.area_ha) || 0), 0);
    const ultimaAplicacao = fazendaApps[0]?.data_aplicacao || null;

    const droneIds = new Set(fazendaApps.map(app => app.drone_id).filter(Boolean));
    const pilotoIds = new Set(fazendaApps.map(app => app.user_id).filter(Boolean));

    return {
      totalAplicacoes,
      areaAplicada,
      ultimaAplicacao,
      dronesVinculados: droneIds.size,
      pilotosVinculados: pilotoIds.size
    };
  }, [selectedFazenda, aplicacoes]);

  // Últimas aplicações da fazenda selecionada
  const ultimasAplicacoes = useMemo(() => {
    if (!selectedFazenda) return [];
    return aplicacoes
      .filter(app => app.fazenda_id === selectedFazenda.id)
      .slice(0, 5);
  }, [selectedFazenda, aplicacoes]);

  const onSubmit = async (data: Fazenda) => {
    setStatus(null);
    try {
      const dataToSave = {
        ...data,
        enterprise_id: TEST_ENTERPRISE_ID,
        telefone: unformatPhoneNumber(data.telefone || ''),
      };

      if (isEditing && selectedFazenda?.id) {
        const { error } = await supabase
          .from('fazendas')
          .update(dataToSave)
          .eq('id', selectedFazenda.id);
        if (error) throw error;
        setStatus('✓ Fazenda atualizada com sucesso');
        
        // Atualizar lista
        const { data: updatedData } = await supabase.from('fazendas').select('*').order('nome', { ascending: true });
        if (updatedData) {
          setFazendas(updatedData);
          setSelectedFazenda(updatedData.find(f => f.id === selectedFazenda.id) || null);
        }
      } else {
        const { error } = await supabase.from('fazendas').insert(dataToSave);
        if (error) throw error;
        setStatus('✓ Fazenda criada com sucesso');
        
        const { data: newData } = await supabase.from('fazendas').select('*').order('nome', { ascending: true });
        if (newData) {
          setFazendas(newData);
          setSelectedFazenda(newData[newData.length - 1] || null);
        }
      }

      setIsAdding(false);
      setIsEditing(false);
      reset();
    } catch (err) {
      console.error(err);
      setStatus('✗ Erro ao salvar dados');
    }
  };

  const handleDelete = async () => {
    if (!selectedFazenda) return;
    if (!confirm(`Tem certeza que deseja excluir a fazenda "${selectedFazenda.nome}"?`)) return;

    try {
      const { error } = await supabase
        .from('fazendas')
        .delete()
        .eq('id', selectedFazenda.id);
      if (error) throw error;

      const { data } = await supabase.from('fazendas').select('*').order('nome', { ascending: true });
      if (data) {
        setFazendas(data);
        setSelectedFazenda(data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    reset({
      nome: '',
      estado: '',
      cidade: '',
      contato_nome: '',
      telefone: '',
      observacoes: '',
      area_total: 0,
      ativa: true,
    });
  };

  const handleStartEdit = () => {
    if (!selectedFazenda) return;
    setIsEditing(true);
    setIsAdding(false);
    reset({
      ...selectedFazenda,
      telefone: selectedFazenda.telefone ? formatPhoneNumber(selectedFazenda.telefone) : '',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    reset();
    setStatus(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
      {/* Coluna esquerda - Lista de fazendas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar fazenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none bg-white"
            />
          </div>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#39B54A] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#39B54A]/90 transition"
          >
            <Plus className="h-4 w-4" />
            Nova fazenda
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {filteredFazendas.length} fazenda{filteredFazendas.length !== 1 ? 's' : ''} encontrada{filteredFazendas.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <ArrowUpDown className="h-3 w-3" />
              Ordenar: A-Z
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Carregando...
              </div>
            ) : filteredFazendas.length === 0 ? (
              <div className="p-8 text-center">
                <Warehouse className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Nenhuma fazenda encontrada' : 'Nenhuma fazenda cadastrada'}
                </p>
              </div>
            ) : (
              filteredFazendas.map((fazenda) => {
                const isSelected = selectedFazenda?.id === fazenda.id;
                return (
                  <button
                    key={fazenda.id}
                    onClick={() => setSelectedFazenda(fazenda)}
                    className={`
                      w-full text-left p-4 transition-all hover:bg-gray-50
                      ${isSelected ? 'bg-[#39B54A]/10 border-l-4 border-[#39B54A]' : 'border-l-4 border-transparent'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate">
                            {fazenda.nome}
                          </span>
                          {fazenda.ativa !== false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              <XCircle className="h-3 w-3" />
                              Inativa
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {fazenda.cidade && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{fazenda.cidade}, {fazenda.estado}</span>
                            </div>
                          )}
                          {fazenda.contato_nome && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{fazenda.contato_nome}</span>
                            </div>
                          )}
                          {fazenda.telefone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{formatPhoneNumber(fazenda.telefone)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="h-4 w-4 text-[#39B54A] flex-shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Coluna direita - Detalhes */}
      <div className="space-y-4">
        {isAdding || isEditing ? (
          // Formulário de edição/criação
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {isAdding ? 'Nova Fazenda' : 'Editar Fazenda'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome da Fazenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nome', { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
                  placeholder="Ex: Fazenda Primavera"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Estado
                  </label>
                  <select
                    {...register('estado')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none bg-white"
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    {...register('cidade')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
                    placeholder="Ex: Uberaba"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    {...register('contato_nome')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    {...register('telefone', {
                      onChange: (e) => {
                        e.target.value = formatPhoneNumber(e.target.value);
                      }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
                    placeholder="(99) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Área total (ha)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('area_total')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
                  placeholder="Ex: 200.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Observações
                </label>
                <textarea
                  {...register('observacoes')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none resize-none"
                  placeholder="Observações sobre a fazenda..."
                />
              </div>

              {status && (
                <div className={`text-sm font-medium ${status.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {status}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#39B54A] text-white font-medium hover:bg-[#39B54A]/90 transition text-sm"
                >
                  {isAdding ? 'Cadastrar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        ) : selectedFazenda ? (
          // Detalhes da fazenda
          <div className="space-y-4">
            {/* Cabeçalho dos detalhes */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-4 rounded-xl bg-[#39B54A]/10">
                      <MapPinned className="h-6 w-6 text-[#39B54A]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedFazenda.nome}
                        </h2>
                        {selectedFazenda.ativa !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            <XCircle className="h-3.5 w-3.5" />
                            Inativa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                  <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Grid de informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Cidade / Estado
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedFazenda.cidade && selectedFazenda.estado
                      ? `${selectedFazenda.cidade}, ${selectedFazenda.estado}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Contato
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedFazenda.contato_nome || '—'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Telefone
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedFazenda.telefone ? formatPhoneNumber(selectedFazenda.telefone) : '—'}
                  </p>
                </div>
                {selectedFazenda.area_total && selectedFazenda.area_total > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <LandPlot className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Área total
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {Number(selectedFazenda.area_total).toFixed(2)} ha
                    </p>
                  </div>
                )}
                {selectedFazenda.created_at && (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Criada em
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedFazenda.created_at)}
                    </p>
                  </div>
                )}
                {selectedFazenda.observacoes && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Observações
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {selectedFazenda.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Resumo da Fazenda
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <ClipboardList className="h-4 w-4 text-[#39B54A]" />
                    <span className="text-xs text-gray-500">Total realizadas</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{fazendaKPIs.totalAplicacoes}</p>
                  <p className="text-xs text-gray-500">Aplicações</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <LandPlot className="h-4 w-4 text-[#39B54A]" />
                    <span className="text-xs text-gray-500">Total aplicado</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{fazendaKPIs.areaAplicada.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Área aplicada</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-4 w-4 text-[#39B54A]" />
                    <span className="text-xs text-gray-500">Data</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {fazendaKPIs.ultimaAplicacao ? formatDate(fazendaKPIs.ultimaAplicacao) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Última aplicação</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Plane className="h-4 w-4 text-[#39B54A]" />
                    <span className="text-xs text-gray-500">Total de drones</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{fazendaKPIs.dronesVinculados}</p>
                  <p className="text-xs text-gray-500">Drones vinculados</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <UserRound className="h-4 w-4 text-[#39B54A]" />
                    <span className="text-xs text-gray-500">Total de pilotos</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{fazendaKPIs.pilotosVinculados}</p>
                  <p className="text-xs text-gray-500">Pilotos vinculados</p>
                </div>
              </div>
            </div>

            {/* Últimas aplicações */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Últimas aplicações
              </h3>

              {ultimasAplicacoes.length === 0 ? (
                <div className="text-center py-10">
                  <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Nenhuma aplicação registrada para esta fazenda.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="pb-3 font-semibold text-gray-500">Data</th>
                        <th className="pb-3 font-semibold text-gray-500">Talhão</th>
                        <th className="pb-3 font-semibold text-gray-500">Produto</th>
                        <th className="pb-3 font-semibold text-gray-500">Drone</th>
                        <th className="pb-3 font-semibold text-gray-500">Piloto</th>
                        <th className="pb-3 font-semibold text-gray-500">Área (ha)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ultimasAplicacoes.map((app) => {
                        const drone = drones.find(d => d.id === app.drone_id);
                        const piloto = pilotos.find(p => p.id === app.user_id);
                        
                        return (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="py-3 text-gray-900">
                              {formatDate(app.data_aplicacao)}
                            </td>
                            <td className="py-3 text-gray-600">
                              {app.talhao || '—'}
                            </td>
                            <td className="py-3 text-gray-600">
                              {app.produto_nome || '—'}
                            </td>
                            <td className="py-3 text-gray-600">
                              {drone?.identificador || '—'}
                            </td>
                            <td className="py-3 text-gray-600">
                              {piloto?.full_name || '—'}
                            </td>
                            <td className="py-3 text-gray-900 font-medium">
                              {app.area_ha ? Number(app.area_ha).toFixed(2) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {ultimasAplicacoes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="text-sm font-medium text-[#39B54A] hover:text-[#0F5A6B] flex items-center gap-1 transition">
                    Ver todas as aplicações
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Estado vazio
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
            <Warehouse className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma fazenda selecionada
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Selecione uma fazenda da lista ou crie uma nova para começar.
            </p>
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-2 bg-[#39B54A] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#39B54A]/90 transition"
            >
              <Plus className="h-4 w-4" />
              Nova fazenda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
