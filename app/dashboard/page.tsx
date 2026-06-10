"use client";

import { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import RecordsTable from '@/components/RecordsTable';
import { supabase } from '@/lib/supabaseClient';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    totalArea: 0,
    totalHours: 0,
    totalFarms: 0,
  });
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Aplicacao | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all basic data
        const [
          { data: appsData, error: appsError },
          { data: pilotsData, error: pilotsError },
          { data: farmsData, error: farmsError },
          { data: dronesData, error: dronesError },
        ] = await Promise.all([
          supabase.from('aplicacoes').select('*').order('data_aplicacao', { ascending: false }).limit(20),
          supabase.from('profiles').select('id, full_name'),
          supabase.from('fazendas').select('id, nome'),
          supabase.from('drones').select('id, identificador'),
        ]);

        if (appsError) throw appsError;
        if (pilotsError) throw pilotsError;
        if (farmsError) throw farmsError;
        if (dronesError) throw dronesError;

        setAplicacoes(appsData || []);
        setPilotos(pilotsData || []);
        setFazendas(farmsData || []);
        setDrones(dronesData || []);

        // Calculate KPIs
        const totalArea = (appsData || []).reduce(
          (sum, row) => sum + (Number(row.area_ha) || 0),
          0
        );
        const totalHours = (appsData || []).reduce(
          (sum, row) => sum + (Number(row.horas_voo) || 0),
          0
        );
        const { count: farmsCount } = await supabase
          .from('fazendas')
          .select('*', { count: 'exact', head: true });

        setMetrics({
          totalApplications: appsData?.length || 0,
          totalArea: totalArea || 0,
          totalHours: totalHours || 0,
          totalFarms: farmsCount || 0,
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Prepare records for table
  const records = aplicacoes.map(aplicacao => {
    const piloto = pilotos.find(p => p.id === aplicacao.user_id);
    const fazenda = fazendas.find(f => f.id === aplicacao.fazenda_id);
    const drone = drones.find(d => d.id === aplicacao.drone_id);
    return {
      ...aplicacao,
      data: formatDate(aplicacao.data_aplicacao),
      piloto: piloto?.full_name || '-',
      fazenda: fazenda?.nome || '-',
      drone: drone?.identificador || '-',
      produto: aplicacao.produto_nome,
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
                  Visão geral
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                  Painel de Controle
                </h1>
                <p className="mt-3 text-sm text-slate-500 max-w-2xl">
                  Monitore os principais indicadores, revisite os registros recentes
                  e valide o fluxo operacional da fazenda em um único painel.
                </p>
              </div>
              <div className="rounded-3xl bg-pulvion-teal/5 px-5 py-4 text-pulvion-teal">
                <p className="text-xs uppercase tracking-[0.3em] text-pulvion-green/80">
                  Atualizado em
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Aplicações"
              value={metrics.totalApplications}
            />
            <KpiCard
              title="Área total (ha)"
              value={metrics.totalArea.toFixed(2)}
            />
            <KpiCard
              title="Horas de voo"
              value={metrics.totalHours.toFixed(1)}
            />
            <KpiCard
              title="Fazendas"
              value={metrics.totalFarms}
            />
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
              Destaques da semana
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <p>
                +12% em aplicações comparado à semana anterior. A produtividade está
                seguindo dentro dos parâmetros esperados.
              </p>
              <p>
                3 fazendas com operações ativas no momento. Verifique detalhes
                diretamente nos cadastros.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
              Ações rápidas
            </p>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-2xl border border-pulvion-green bg-pulvion-green/10 px-4 py-3 text-left text-sm font-medium text-pulvion-teal transition hover:bg-pulvion-green/20">
                Visualizar relatórios
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Revisar cadastros pendentes
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Tabela de registros */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Últimos registros</h2>
            <p className="mt-1 text-sm text-slate-500">
              Clique em qualquer linha para ver os detalhes da aplicação.
            </p>
          </div>
          <span className="rounded-full bg-pulvion-green/10 px-3 py-1 text-sm font-semibold text-pulvion-teal">
            Total: {records.length}
          </span>
        </div>
        <div className="mt-5">
          {loading ? (
            <p className="text-gray-500 py-8 text-center">Carregando…</p>
          ) : (
            <RecordsTable
              records={records}
              onRowClick={(rec) => setSelectedRecord(aplicacoes.find(a => a.id === rec.id) || null)}
              columns={[
                { key: 'data', label: 'Data' },
                { key: 'piloto', label: 'Piloto' },
                { key: 'fazenda', label: 'Fazenda' },
                { key: 'cultura', label: 'Cultura' },
                { key: 'area_ha', label: 'Área (ha)' },
                { key: 'produto', label: 'Produto' },
                { key: 'drone', label: 'Drone' },
              ]}
            />
          )}
        </div>
      </section>

      {/* Modal de detalhes */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Detalhes da Aplicação
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedRecord.cultura} • {formatDate(selectedRecord.data_aplicacao)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition text-slate-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Seção Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Piloto</p>
                  <p className="text-sm font-medium text-slate-900">
                    {pilotos.find(p => p.id === selectedRecord.user_id)?.full_name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Fazenda</p>
                  <p className="text-sm font-medium text-slate-900">
                    {fazendas.find(f => f.id === selectedRecord.fazenda_id)?.nome || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Drone</p>
                  <p className="text-sm font-medium text-slate-900">
                    {drones.find(d => d.id === selectedRecord.drone_id)?.identificador || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Cultura</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedRecord.cultura}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Dados da Operação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Área (ha)</p>
                    <p className="text-xl font-semibold text-pulvion-teal">
                      {Number(selectedRecord.area_ha).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Horas de Voo</p>
                    <p className="text-xl font-semibold text-pulvion-teal">
                      {Number(selectedRecord.horas_voo).toFixed(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Tipo de Serviço</p>
                    <p className="text-xl font-semibold text-pulvion-teal">
                      {selectedRecord.tipo_servico || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedRecord.produto_nome || selectedRecord.classe_produto || selectedRecord.dosagem) && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Produto Aplicado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.classe_produto && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Classe</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedRecord.classe_produto}
                        </p>
                      </div>
                    )}
                    {selectedRecord.produto_nome && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Produto</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedRecord.produto_nome}
                        </p>
                      </div>
                    )}
                    {selectedRecord.dosagem && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Dosagem</p>
                        <p className="text-sm font-medium text-slate-900">
                          {Number(selectedRecord.dosagem).toFixed(2)} {selectedRecord.unidade || ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRecord.num_art && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Número ART</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedRecord.num_art}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 text-slate-700 font-semibold hover:bg-gray-100 transition text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
