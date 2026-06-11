"use client";

import { useEffect, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import RecordsTable from '@/components/RecordsTable';
import { supabase } from '@/lib/supabaseClient';
import {
  ClipboardList,
  LandPlot,
  Clock,
  Warehouse,
  Sun,
  Droplets,
  Wind,
  CloudRain,
  X,
  Pencil,
  MapPin,
} from 'lucide-react';

interface Piloto {
  id: string;
  full_name: string;
}

interface Fazenda {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
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
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Mock data for climate
const climateData = {
  city: 'Uberaba',
  state: 'MG',
  temp: 22,
  humidity: 71,
  windSpeed: 8,
  rainChance: 10,
  lastUpdate: new Date(),
};

const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7days' },
  { label: '30 dias', value: '30days' },
  { label: '90 dias', value: '90days' },
  { label: 'Ano', value: 'year' },
];

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

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
          supabase.from('aplicacoes').select('*').order('data_aplicacao', { ascending: false }).limit(50),
          supabase.from('profiles').select('id, full_name'),
          supabase.from('fazendas').select('id, nome, cidade, estado'),
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

  const handleSaveEdit = () => {
    setIsEditing(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-5">
      {/* Period filter */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-700">
          Período: {periodOptions.find(p => p.value === selectedPeriod)?.label}
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {periodOptions.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`
                px-4 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${selectedPeriod === period.value
                  ? 'bg-[#39B54A] text-white'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Aplicações"
          value={metrics.totalApplications}
          icon={ClipboardList}
        />
        <KpiCard
          title="Área Aplicada"
          value={`${metrics.totalArea.toFixed(0)} ha`}
          icon={LandPlot}
        />
        <KpiCard
          title="Horas de Voo"
          value={`${metrics.totalHours.toFixed(1)} h`}
          icon={Clock}
        />
        <KpiCard
          title="Fazendas"
          value={metrics.totalFarms}
          icon={Warehouse}
        />
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Main area for records (70% width) */}
        <div className="flex-1 lg:w-[70%]">
          {/* Main Records Table */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Registros de Aplicação
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Total: {records.length}
                </p>
              </div>
            </div>
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-500">Carregando registros…</p>
                </div>
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
        </div>

        {/* Right: Side widgets (30% width) */}
        <div className="w-full lg:w-[30%]">
          {/* Climate Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Condições Climáticas
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Atualizado às {formatTime(climateData.lastUpdate)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-[#0F5A6B]" />
              <span>
                {climateData.city}, {climateData.state}
              </span>
            </div>

            {/* Main temp */}
            <div className="flex items-center gap-3 mb-3">
              <Sun className="h-7 w-7 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {climateData.temp}°C
                </p>
              </div>
            </div>

            {/* Other indicators */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Droplets className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Umidade</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {climateData.humidity}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Wind className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Vento</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {climateData.windSpeed} km/h
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <CloudRain className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Chuva</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {climateData.rainChance}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar Aplicação' : 'Detalhes da Aplicação'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRecord.cultura} • {formatDate(selectedRecord.data_aplicacao)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 transition text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    setIsEditing(false);
                  }}
                  className="p-1.5 rounded-xl hover:bg-gray-100 transition text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Seção Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Piloto</p>
                  <p className="text-sm font-medium text-gray-900">
                    {pilotos.find(p => p.id === selectedRecord.user_id)?.full_name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Fazenda</p>
                  <p className="text-sm font-medium text-gray-900">
                    {fazendas.find(f => f.id === selectedRecord.fazenda_id)?.nome || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Drone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {drones.find(d => d.id === selectedRecord.drone_id)?.identificador || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Cultura</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRecord.cultura}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Dados da Operação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Área (ha)</p>
                    <p className="text-lg font-semibold text-[#0F5A6B]">
                      {Number(selectedRecord.area_ha).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Horas de Voo</p>
                    <p className="text-lg font-semibold text-[#0F5A6B]">
                      {Number(selectedRecord.horas_voo).toFixed(1)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Tipo de Serviço</p>
                    <p className="text-lg font-semibold text-[#0F5A6B]">
                      {selectedRecord.tipo_servico || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedRecord.produto_nome || selectedRecord.classe_produto || selectedRecord.dosagem) && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Produto Aplicado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecord.classe_produto && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Classe</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRecord.classe_produto}
                        </p>
                      </div>
                    )}
                    {selectedRecord.produto_nome && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Produto</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedRecord.produto_nome}
                        </p>
                      </div>
                    )}
                    {selectedRecord.dosagem && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Dosagem</p>
                        <p className="text-sm font-medium text-gray-900">
                          {Number(selectedRecord.dosagem).toFixed(2)} {selectedRecord.unidade || ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRecord.num_art && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Número ART</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRecord.num_art}
                  </p>
                </div>
              )}

              {/* Data de criação e atualização */}
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Criado em</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRecord.created_at ? formatDate(selectedRecord.created_at) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Última alteração</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRecord.updated_at ? formatDate(selectedRecord.updated_at) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setIsEditing(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
              >
                Fechar
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#39B54A] text-white font-semibold hover:bg-[#39B54A]/90 transition text-sm"
                >
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
