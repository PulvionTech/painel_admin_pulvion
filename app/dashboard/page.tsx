"use client";

import { useEffect, useMemo, useState } from 'react';
import KpiCard from '@/components/KpiCard';
import RecordsTable from '@/components/RecordsTable';
import WeatherCard, { WeatherData } from '@/components/WeatherCard';
import { supabase } from '@/lib/supabaseClient';
import {
  ClipboardList,
  LandPlot,
  Clock,
  Warehouse,
  X,
  Pencil,
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
  const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
  return date.toLocaleDateString('pt-BR');
};

const parseApplicationDate = (dateString: string) =>
  new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);

// Mock temporário preparado para substituição por dados da API Open-Meteo.
const climateData: WeatherData = {
  city: 'Uberaba',
  state: 'MG',
  temperature: 22,
  condition: 'Chuva leve',
  rainChance: 55,
  humidity: 65,
  windSpeed: 6,
  operationalStatus: 'Atenção',
  operationalMessage: 'Atenção à chuva leve',
  lastUpdate: new Date(),
  hourly: [
    { time: '14h', temperature: 22 },
    { time: '17h', temperature: 23 },
    { time: '20h', temperature: 20 },
    { time: '23h', temperature: 19 },
  ],
  daily: [
    { day: 'Qui', high: 23, low: 17 },
    { day: 'Sex', high: 21, low: 17 },
    { day: 'Sáb', high: 24, low: 17 },
    { day: 'Dom', high: 24, low: 17 },
    { day: 'Seg', high: 24, low: 17 },
  ],
};

const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7days' },
  { label: '30 dias', value: '30days' },
  { label: '90 dias', value: '90days' },
  { label: 'Ano', value: 'year' },
];

export default function DashboardPage() {
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Aplicacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
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

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAplicacoes = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (selectedPeriod === 'today') start.setHours(0, 0, 0, 0);
    if (selectedPeriod === '7days') start.setDate(now.getDate() - 7);
    if (selectedPeriod === '30days') start.setDate(now.getDate() - 30);
    if (selectedPeriod === '90days') start.setDate(now.getDate() - 90);
    if (selectedPeriod === 'year') start.setMonth(0, 1);
    if (selectedPeriod === 'year') start.setHours(0, 0, 0, 0);

    return aplicacoes.filter((aplicacao) => parseApplicationDate(aplicacao.data_aplicacao) >= start);
  }, [aplicacoes, selectedPeriod]);

  const metrics = useMemo(() => ({
    totalApplications: filteredAplicacoes.length,
    totalArea: filteredAplicacoes.reduce((sum, row) => sum + (Number(row.area_ha) || 0), 0),
    totalHours: filteredAplicacoes.reduce((sum, row) => sum + (Number(row.horas_voo) || 0), 0),
    totalFarms: new Set(filteredAplicacoes.map((row) => row.fazenda_id)).size,
  }), [filteredAplicacoes]);

  const records = filteredAplicacoes.map(aplicacao => {
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

  const updateSelectedRecord = (field: keyof Aplicacao, value: string | number) => {
    setSelectedRecord((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    setSaveError('');
    setLoading(true);
    const payload = {
      data_aplicacao: selectedRecord.data_aplicacao,
      user_id: selectedRecord.user_id,
      fazenda_id: selectedRecord.fazenda_id,
      drone_id: selectedRecord.drone_id,
      cultura: selectedRecord.cultura,
      area_ha: selectedRecord.area_ha,
      horas_voo: selectedRecord.horas_voo,
      tipo_servico: selectedRecord.tipo_servico,
      classe_produto: selectedRecord.classe_produto,
      produto_nome: selectedRecord.produto_nome,
      dosagem: selectedRecord.dosagem,
      unidade: selectedRecord.unidade,
      num_art: selectedRecord.num_art,
    };
    const { data, error } = await supabase
      .from('aplicacoes')
      .update(payload)
      .eq('id', selectedRecord.id)
      .select()
      .single();
    setLoading(false);
    if (error) {
      console.error('Erro ao atualizar aplicação:', error);
      setSaveError(error.message);
      return;
    }
    setAplicacoes((current) => current.map((item) => item.id === data.id ? data as Aplicacao : item));
    setSelectedRecord(data as Aplicacao);
    setIsEditing(false);
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

      <WeatherCard data={climateData} />

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Últimos Registros de Aplicação
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Visualização operacional dos {records.length} registros mais recentes.
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
                    { key: 'horas_voo', label: 'Horas' },
                    { key: 'tipo_servico', label: 'Serviço' },
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
                    setSaveError('');
                  }}
                  className="p-1.5 rounded-xl hover:bg-gray-100 transition text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <ApplicationEditForm
                record={selectedRecord}
                pilotos={pilotos}
                fazendas={fazendas}
                drones={drones}
                onChange={updateSelectedRecord}
              />
            ) : (
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
            )}

            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-wrap gap-3">
              {saveError && <p className="basis-full text-sm text-red-600">{saveError}</p>}
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setIsEditing(false);
                  setSaveError('');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
              >
                Fechar
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#39B54A] text-white font-semibold hover:bg-[#39B54A]/90 transition text-sm"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationEditForm({
  record,
  pilotos,
  fazendas,
  drones,
  onChange,
}: {
  record: Aplicacao;
  pilotos: Piloto[];
  fazendas: Fazenda[];
  drones: Drone[];
  onChange: (field: keyof Aplicacao, value: string | number) => void;
}) {
  const inputClass = 'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm';
  return (
    <div className="p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <EditField label="Data"><input type="date" value={record.data_aplicacao.split('T')[0]} onChange={(event) => onChange('data_aplicacao', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Piloto"><select value={record.user_id} onChange={(event) => onChange('user_id', event.target.value)} className={inputClass}>{pilotos.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></EditField>
        <EditField label="Fazenda"><select value={record.fazenda_id} onChange={(event) => onChange('fazenda_id', event.target.value)} className={inputClass}>{fazendas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></EditField>
        <EditField label="Drone"><select value={record.drone_id} onChange={(event) => onChange('drone_id', event.target.value)} className={inputClass}>{drones.map((item) => <option key={item.id} value={item.id}>{item.identificador}</option>)}</select></EditField>
        <EditField label="Cultura"><input value={record.cultura || ''} onChange={(event) => onChange('cultura', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Tipo de serviço"><input value={record.tipo_servico || ''} onChange={(event) => onChange('tipo_servico', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Área (ha)"><input type="number" min="0" step="0.01" value={record.area_ha ?? ''} onChange={(event) => onChange('area_ha', Number(event.target.value))} className={inputClass} /></EditField>
        <EditField label="Horas de voo"><input type="number" min="0" step="0.1" value={record.horas_voo ?? ''} onChange={(event) => onChange('horas_voo', Number(event.target.value))} className={inputClass} /></EditField>
        <EditField label="Classe do produto"><input value={record.classe_produto || ''} onChange={(event) => onChange('classe_produto', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Produto"><input value={record.produto_nome || ''} onChange={(event) => onChange('produto_nome', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Dosagem"><input type="number" min="0" step="0.01" value={record.dosagem ?? ''} onChange={(event) => onChange('dosagem', Number(event.target.value))} className={inputClass} /></EditField>
        <EditField label="Unidade"><input value={record.unidade || ''} onChange={(event) => onChange('unidade', event.target.value)} className={inputClass} /></EditField>
        <EditField label="Número ART"><input value={record.num_art || ''} onChange={(event) => onChange('num_art', event.target.value)} className={inputClass} /></EditField>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  );
}
