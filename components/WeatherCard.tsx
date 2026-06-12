"use client";

import {
  Clock,
  CloudDrizzle,
  CloudRain,
  Droplets,
  MapPin,
  TriangleAlert,
  Wind,
} from 'lucide-react';

export interface WeatherData {
  city: string;
  state: string;
  temperature: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  operationalStatus: 'Ideal' | 'Atenção' | 'Não recomendado';
  operationalMessage: string;
  lastUpdate: Date;
  hourly: Array<{ time: string; temperature: number }>;
  daily: Array<{ day: string; high: number; low: number }>;
}

const statusStyles: Record<WeatherData['operationalStatus'], string> = {
  Ideal: 'border-green-200 bg-green-50 text-green-800',
  Atenção: 'border-amber-200 bg-amber-50 text-amber-800',
  'Não recomendado': 'border-red-200 bg-red-50 text-red-800',
};

export default function WeatherCard({ data }: { data: WeatherData }) {
  const updatedAt = data.lastUpdate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1.2fr] lg:divide-x lg:divide-gray-100">
        <div className="lg:pr-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Condições Climáticas</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-[#0F5A6B]" />
                <span>{data.city}, {data.state}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{updatedAt}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F5A6B]/10">
              <CloudDrizzle className="h-6 w-6 text-[#0F5A6B]" />
            </div>
            <div>
              <p className="text-3xl font-semibold leading-none text-gray-900">{data.temperature}°C</p>
              <p className="mt-1 text-xs font-medium text-gray-500">{data.condition}</p>
            </div>
          </div>

          <div className={`mt-3 flex gap-2 rounded-xl border p-3 ${statusStyles[data.operationalStatus]}`}>
            <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide">
                Condição operacional: {data.operationalStatus}
              </p>
              <p className="mt-0.5 text-xs">{data.operationalMessage}</p>
            </div>
          </div>
        </div>

        <section className="lg:px-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl bg-gray-50 py-2.5">
            <WeatherMetric icon={CloudRain} label="Chuva" value={`${data.rainChance}%`} />
            <WeatherMetric icon={Droplets} label="Umidade" value={`${data.humidity}%`} />
            <WeatherMetric icon={Wind} label="Vento" value={`${data.windSpeed} km/h`} />
          </div>
          <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Próximas horas</h4>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {data.hourly.map((item) => (
              <div key={item.time} className="rounded-lg border border-gray-100 px-1.5 py-2 text-center">
                <p className="text-[11px] text-gray-400">{item.time}</p>
                <CloudDrizzle className="mx-auto my-1 h-3.5 w-3.5 text-[#0F5A6B]" />
                <p className="text-xs font-semibold text-gray-800">{item.temperature}°</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-3 lg:border-l-0 lg:border-t-0 lg:pl-4 lg:pt-0">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Próximos 5 dias</h4>
          <div className="mt-2 divide-y divide-gray-100">
            {data.daily.map((item) => (
              <div key={item.day} className="flex items-center justify-between py-2">
                <span className="text-xs font-medium text-gray-600">{item.day}</span>
                <CloudDrizzle className="h-3.5 w-3.5 text-[#0F5A6B]" />
                <span className="text-xs font-semibold text-gray-800">
                  {item.high}° <span className="font-normal text-gray-400">/ {item.low}°</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function WeatherMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="px-1 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-[#0F5A6B]" />
      <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}
