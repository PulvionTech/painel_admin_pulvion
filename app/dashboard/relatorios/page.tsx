"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChevronRight, ClipboardList, Pencil, Save, Trash2, X } from 'lucide-react';
import ApplicationDetailsPanel, { ApplicationProduct, legacyProduct, ProductSummary } from '@/components/ApplicationPresentation';
import Pagination from '@/components/Pagination';

interface Piloto {
  id: string;
  full_name: string;
}

interface Fazenda {
  id: string;
  nome: string;
  contato_nome?: string;
  telefone?: string;
}

interface Drone {
  id: string;
  identificador: string;
}

interface Aplicacao {
  id: string;
  data_aplicacao: string;
  user_id: string;
  fazenda_id: string;
  drone_id: string;
  cultura: string;
  area_ha: number;
  horas_voo: number;
  tipo_servico: string;
  classe_produto: string;
  produto_nome: string;
  dosagem: number;
  unidade: string;
  num_art: string;
  produtos?: ApplicationProduct[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};
const ENTERPRISE_ID = '00000000-0000-0000-0000-000000000001';
const PAGE_SIZE = 8;

export default function RelatoriosPage() {
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [filtradas, setFiltradas] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroPiloto, setFiltroPiloto] = useState('');
  const [filtroFazenda, setFiltroFazenda] = useState('');
  const [filtroDrone, setFiltroDrone] = useState('');

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [aplicacaoSelecionada, setAplicacaoSelecionada] = useState<Aplicacao | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [
          { data: pilotsData },
          { data: farmsData },
          { data: dronesData },
          { data: appsData },
          { data: productRows },
        ] = await Promise.all([
          supabase.from('profiles').select('id, full_name').eq('enterprise_id', ENTERPRISE_ID),
          supabase.from('fazendas').select('id, nome, contato_nome, telefone').eq('enterprise_id', ENTERPRISE_ID),
          supabase.from('drones').select('id, identificador').eq('enterprise_id', ENTERPRISE_ID).eq('ativo', true),
          supabase.from('aplicacoes').select('*').eq('enterprise_id', ENTERPRISE_ID).order('data_aplicacao', { ascending: false }),
          supabase.from('aplicacao_produtos').select('*').eq('enterprise_id', ENTERPRISE_ID).order('created_at')
        ]);
        setPilotos((pilotsData || []) as Piloto[]);
        setFazendas((farmsData || []) as Fazenda[]);
        setDrones((dronesData || []) as Drone[]);
        const applications = (appsData || []).map((application: Aplicacao) => ({ ...application, produtos: (productRows || []).filter((product: any) => product.aplicacao_id === application.id) }));
        setAplicacoes(applications);
        setFiltradas(applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  useEffect(() => {
    let filtrados = [...aplicacoes];
    
    if (filtroDataInicio) {
      filtrados = filtrados.filter(app => 
        new Date(app.data_aplicacao) >= new Date(filtroDataInicio)
      );
    }
    
    if (filtroDataFim) {
      filtrados = filtrados.filter(app => 
        new Date(app.data_aplicacao) <= new Date(filtroDataFim)
      );
    }
    
    if (filtroPiloto) {
      filtrados = filtrados.filter(app => app.user_id === filtroPiloto);
    }
    
    if (filtroFazenda) {
      filtrados = filtrados.filter(app => app.fazenda_id === filtroFazenda);
    }
    
    if (filtroDrone) {
      filtrados = filtrados.filter(app => app.drone_id === filtroDrone);
    }
    
    setFiltradas(filtrados);
    setPage(1);
  }, [
    aplicacoes,
    filtroDataInicio,
    filtroDataFim,
    filtroPiloto,
    filtroFazenda,
    filtroDrone
  ]);
  const paginatedApplications = filtradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAbrirModal = (app: Aplicacao) => {
    setAplicacaoSelecionada(app);
    setEditForm({ ...app });
    setModalAberto(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editForm || !aplicacaoSelecionada) return;
    setSalvando(true);
    try {
      const { produtos: _produtos, ...payload } = editForm;
      const { error } = await supabase
        .from('aplicacoes')
        .update(payload)
        .eq('id', aplicacaoSelecionada.id);
      if (error) throw error;
      
      setAplicacoes(
        aplicacoes.map(a => 
          a.id === aplicacaoSelecionada.id ? editForm : a
        )
      );
      
      setModalAberto(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  const handleLimparFiltros = () => {
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroPiloto('');
    setFiltroFazenda('');
    setFiltroDrone('');
  };

  const handleExcluir = async () => {
    if (!aplicacaoSelecionada || !confirm('Excluir esta aplicação e seus produtos?')) return;
    const { error } = await supabase.from('aplicacoes').delete().eq('id', aplicacaoSelecionada.id);
    if (error) return console.error(error);
    setAplicacoes((current) => current.filter((item) => item.id !== aplicacaoSelecionada.id));
    setModalAberto(false);
  };

  const totalArea = filtradas.reduce((sum, app) => sum + (Number(app.area_ha) || 0), 0);
  const totalHoras = filtradas.reduce((sum, app) => sum + (Number(app.horas_voo) || 0), 0);
  const totalAplicacoes = filtradas.length;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Total de Aplicações</p>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900 sm:mt-4 sm:text-3xl">
            {totalAplicacoes}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            No período selecionado
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Área Total Aplicada</p>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900 sm:mt-4 sm:text-3xl">
            {totalArea.toFixed(2)} ha
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Soma de todas as áreas
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Total de Horas</p>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900 sm:mt-4 sm:text-3xl">
            {totalHoras.toFixed(1)}h
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Horas de voo totais
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Média Área/Aplicação</p>
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900 sm:mt-4 sm:text-3xl">
            {totalAplicacoes > 0 ? (totalArea / totalAplicacoes).toFixed(2) : '0.00'} ha
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Por aplicação
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Piloto</label>
            <select
              value={filtroPiloto}
              onChange={(e) => setFiltroPiloto(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {pilotos.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Fazenda</label>
            <select
              value={filtroFazenda}
              onChange={(e) => setFiltroFazenda(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {fazendas.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Drone</label>
            <select
              value={filtroDrone}
              onChange={(e) => setFiltroDrone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {drones.map(d => (
                <option key={d.id} value={d.id}>{d.identificador}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleLimparFiltros}
          className="text-sm text-pulvion-teal hover:text-pulvion-green font-medium"
        >
          Limpar todos os filtros
        </button>
      </div>

      {/* Table */}
      <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pulvion-teal/10 text-pulvion-teal"><ClipboardList className="h-5 w-5" /></span>
          Listagem de Aplicações
        </h3>
        <div className="space-y-2 md:hidden">
          {loading ? <p className="py-8 text-center text-sm text-gray-500">Carregando...</p> : filtradas.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Nenhuma aplicação encontrada com os filtros selecionados</p> : paginatedApplications.map((app) => {
            const piloto = pilotos.find((item) => item.id === app.user_id);
            const fazenda = fazendas.find((item) => item.id === app.fazenda_id);
            return (
              <button key={app.id} type="button" onClick={() => handleAbrirModal(app)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-left active:bg-gray-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-900">{formatDate(app.data_aplicacao)}</span><span className="truncate text-sm text-slate-500">{app.cultura}</span></div>
                  <p className="mt-1 truncate text-xs text-slate-500">{fazenda?.nome || '—'} · {[fazenda?.contato_nome, fazenda?.telefone].filter(Boolean).join(' · ') || '—'}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{piloto?.full_name || '—'} · {drones.find((item) => item.id === app.drone_id)?.identificador || '—'}</p>
                  <p className="mt-1 text-xs font-semibold text-pulvion-teal">{Number(app.area_ha).toFixed(2)} ha · {app.tipo_servico || '—'} · {app.produtos?.length || (app.produto_nome ? 1 : 0)} produto(s)</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </button>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fazenda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contato da Fazenda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Piloto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Drone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cultura
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Área (ha)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Produtos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : filtradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma aplicação encontrada com os filtros selecionados
                </td>
              </tr>
            ) : (
              paginatedApplications.map(app => {
                const piloto = pilotos.find(p => p.id === app.user_id);
                const fazenda = fazendas.find(f => f.id === app.fazenda_id);
                const drone = drones.find(d => d.id === app.drone_id);
                
                return (
                  <tr
                    key={app.id}
                    className="cursor-pointer odd:bg-white even:bg-slate-50/60 hover:bg-[#39B54A]/5"
                    onClick={() => handleAbrirModal(app)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {formatDate(app.data_aplicacao)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {fazenda?.nome || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {[fazenda?.contato_nome, fazenda?.telefone].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {piloto?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {drone?.identificador || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {app.cultura}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {Number(app.area_ha).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {app.tipo_servico || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      <ProductSummary products={app.produtos?.length ? app.produtos : legacyProduct(app)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        <div className="mt-3">
          <Pagination page={page} totalItems={filtradas.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal */}
      {modalAberto && aplicacaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="max-h-[96dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-h-[90vh] sm:rounded-3xl sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pulvion-teal/10 text-pulvion-teal"><Pencil className="h-4 w-4" /></span>
                Visualizar/Editar Aplicação
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
                title="Fechar"
                className="rounded-xl border border-transparent p-2 text-slate-400 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editForm && (
              <div className="space-y-4">
                <ApplicationDetailsPanel data={{
                  data: formatDate(aplicacaoSelecionada.data_aplicacao),
                  fazenda: fazendas.find((item) => item.id === aplicacaoSelecionada.fazenda_id)?.nome || '—',
                  contato: [fazendas.find((item) => item.id === aplicacaoSelecionada.fazenda_id)?.contato_nome, fazendas.find((item) => item.id === aplicacaoSelecionada.fazenda_id)?.telefone].filter(Boolean).join(' · ') || '—',
                  piloto: pilotos.find((item) => item.id === aplicacaoSelecionada.user_id)?.full_name || '—',
                  drone: drones.find((item) => item.id === aplicacaoSelecionada.drone_id)?.identificador || '—',
                  cultura: aplicacaoSelecionada.cultura,
                  area_ha: aplicacaoSelecionada.area_ha,
                  horas_voo: aplicacaoSelecionada.horas_voo,
                  tipo_servico: aplicacaoSelecionada.tipo_servico,
                  produtos: aplicacaoSelecionada.produtos?.length ? aplicacaoSelecionada.produtos : legacyProduct(aplicacaoSelecionada),
                }} />
                <h4 className="border-t border-gray-100 pt-4 text-sm font-semibold text-slate-900">Editar dados gerais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={editForm.data_aplicacao?.split('T')[0] || ''}
                      onChange={(e) => setEditForm({...editForm, data_aplicacao: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Cultura</label>
                    <input
                      type="text"
                      value={editForm.cultura || ''}
                      onChange={(e) => setEditForm({...editForm, cultura: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Área (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.area_ha || ''}
                      onChange={(e) => setEditForm({...editForm, area_ha: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Horas de Voo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.horas_voo || ''}
                      onChange={(e) => setEditForm({...editForm, horas_voo: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Tipo de Serviço</label>
                    <input
                      type="text"
                      value={editForm.tipo_servico || ''}
                      onChange={(e) => setEditForm({...editForm, tipo_servico: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Classe do Produto</label>
                    <input
                      type="text"
                      value={editForm.classe_produto || ''}
                      onChange={(e) => setEditForm({...editForm, classe_produto: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Produto</label>
                    <input
                      type="text"
                      value={editForm.produto_nome || ''}
                      onChange={(e) => setEditForm({...editForm, produto_nome: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Dosagem</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.dosagem || ''}
                      onChange={(e) => setEditForm({...editForm, dosagem: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Unidade</label>
                    <input
                      type="text"
                      value={editForm.unidade || ''}
                      onChange={(e) => setEditForm({...editForm, unidade: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Nº ART</label>
                    <input
                      type="text"
                      value={editForm.num_art || ''}
                      onChange={(e) => setEditForm({...editForm, num_art: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <button onClick={handleExcluir} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Excluir</button>
                  <button
                    onClick={() => setModalAberto(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-slate-700 font-semibold hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarEdicao}
                    disabled={salvando}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pulvion-green px-4 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
