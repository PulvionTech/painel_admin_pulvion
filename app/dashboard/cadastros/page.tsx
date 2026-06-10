"use client";

import { useState } from 'react';
import FazendaTab from '@/components/FazendaTab';
import DroneTab from '@/components/DroneTab';
import PilotoTab from '@/components/PilotoTab';
import AplicacaoTab from '@/components/AplicacaoTab';
import { FazendaTabIcon, DroneTabIcon, PilotoTabIcon } from '@/components/Icons';

const tabs = [
  { id: 'fazendas', label: 'Fazendas', icon: FazendaTabIcon, description: 'Gerencie suas propriedades rurais' },
  { id: 'drones', label: 'Drones', icon: DroneTabIcon, description: 'Adicione e configure seus equipamentos' },
  { id: 'pilotos', label: 'Pilotos', icon: PilotoTabIcon, description: 'Cadastre os operadores' },
  { id: 'aplicacoes', label: 'Aplicações', icon: () => <span className="text-lg">✈️</span>, description: 'Registre as aplicações realizadas' },
];

export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState('fazendas');

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
            Gerenciamento
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Cadastros
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Gerencie todos os recursos da sua operação agrícola em um só lugar.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Tab buttons */}
        <div className="space-y-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full text-left p-5 rounded-2xl border-2 transition-all
                  flex items-start gap-4
                  ${isActive
                    ? 'border-pulvion-green bg-pulvion-green/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className={`
                  p-3 rounded-xl flex-shrink-0
                  ${isActive
                    ? 'bg-pulvion-green text-white'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  <tab.icon />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isActive ? 'text-pulvion-teal' : 'text-slate-700'}`}>
                    {tab.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {tab.description}
                  </p>
                </div>
                {isActive && (
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-pulvion-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            {/* Tab header */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pulvion-green/10 text-pulvion-teal">
                  {activeTabData && <activeTabData.icon />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {activeTabData?.label}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {activeTabData?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'fazendas' && <FazendaTab />}
              {activeTab === 'drones' && <DroneTab />}
              {activeTab === 'pilotos' && <PilotoTab />}
              {activeTab === 'aplicacoes' && <AplicacaoTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
