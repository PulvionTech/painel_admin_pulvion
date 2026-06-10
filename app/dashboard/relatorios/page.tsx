"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DocumentIcon } from '@/components/Icons';

interface Piloto {
  id: string;
  full_name: string;
}

interface Fazenda {
  id: string;
  nome: string;
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
}

// Helper functions for export
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const downloadCSV = (data: Aplicacao[], pilotos: Piloto[], fazendas: Fazenda[], drones: Drone[]) => {
  const headers = [
    'Data',
    'Piloto',
    'Fazenda',
    'Drone',
    'Cultura',
    'Área (ha)',
    'Horas de Voo',
    'Tipo de Serviço',
    'Classe do Produto',
    'Produto',
    'Dosagem',
    'Unidade',
    'Nº ART'
  ];
  
  const rows = data.map(app => {
    const piloto = pilotos.find(p => p.id === app.user_id);
    const fazenda = fazendas.find(f => f.id === app.fazenda_id);
    const drone = drones.find(d => d.id === app.drone_id);
    
    return [
      formatDate(app.data_aplicacao),
      piloto?.full_name || '',
      fazenda?.nome || '',
      drone?.identificador || '',
      app.cultura,
      app.area_ha,
      app.horas_voo,
      app.tipo_servico,
      app.classe_produto,
      app.produto_nome,
      app.dosagem,
      app.unidade,
      app.num_art
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio_aplicacoes_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function RelatoriosPage() {
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [filtradas, setFiltradas] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);

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
          { data: appsData }
        ] = await Promise.all([
          supabase.from('profiles').select('id, full_name'),
          supabase.from('fazendas').select('id, nome'),
          supabase.from('drones').select('id, identificador').eq('ativo', true),
          supabase.from('aplicacoes').select('*').order('data_aplicacao', { ascending: false })
        ]);
        setPilotos((pilotsData || []) as Piloto[]);
        setFazendas((farmsData || []) as Fazenda[]);
        setDrones((dronesData || []) as Drone[]);
        setAplicacoes((appsData || []) as Aplicacao[]);
        setFiltradas((appsData || []) as Aplicacao[]);
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
  }, [
    aplicacoes,
    filtroDataInicio,
    filtroDataFim,
    filtroPiloto,
    filtroFazenda,
    filtroDrone
  ]);

  const handleAbrirModal = (app: Aplicacao) => {
    setAplicacaoSelecionada(app);
    setEditForm({ ...app });
    setModalAberto(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editForm || !aplicacaoSelecionada) return;
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('aplicacoes')
        .update(editForm)
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

  const totalArea = filtradas.reduce((sum, app) => sum + (Number(app.area_ha) || 0), 0);
  const totalHoras = filtradas.reduce((sum, app) => sum + (Number(app.horas_voo) || 0), 0);
  const totalAplicacoes = filtradas.length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
              Relatórios
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Análises e exportações
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Acompanhe o desempenho das aplicações, exporte dados e identifique
              padrões operacionais com visualizações rápidas e objetivas.
            </p>
          </div>
          <button
            onClick={() => downloadCSV(filtradas, pilotos, fazendas, drones)}
            className="inline-flex items-center gap-2 rounded-2xl bg-pulvion-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
          >
            <DocumentIcon />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Total de Aplicações</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalAplicacoes}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            No período selecionado
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Área Total Aplicada</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalArea.toFixed(2)} ha
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Soma de todas as áreas
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Total de Horas</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalHoras.toFixed(1)}h
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Horas de voo totais
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-pulvion-teal">
            <p className="font-semibold">Média Área/Aplicação</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalAplicacoes > 0 ? (totalArea / totalAplicacoes).toFixed(2) : '0.00'} ha
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Por aplicação
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
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
      <div className="rounded-3xl bg-white p-6 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Listagem de Aplicações</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Piloto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fazenda
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
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : filtradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma aplicação encontrada com os filtros selecionados
                </td>
              </tr>
            ) : (
              filtradas.map(app => {
                const piloto = pilotos.find(p => p.id === app.user_id);
                const fazenda = fazendas.find(f => f.id === app.fazenda_id);
                const drone = drones.find(d => d.id === app.drone_id);
                
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAbrirModal(app)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {formatDate(app.data_aplicacao)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {piloto?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {fazenda?.nome || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {drone?.identificador || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {app.cultura}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                      {app.area_ha.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-pulvion-teal font-medium">
                      Ver/Editar
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAberto && aplicacaoSelecionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                Visualizar/Editar Aplicação
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editForm && (
              <div className="space-y-4">
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

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalAberto(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-slate-700 font-semibold hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarEdicao}
                    disabled={salvando}
                    className="flex-1 px-4 py-3 rounded-xl bg-pulvion-green text-white font-semibold hover:bg-green-500 disabled:opacity-50"
                  >
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
