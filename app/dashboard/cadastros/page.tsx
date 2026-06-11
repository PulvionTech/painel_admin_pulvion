"use client";

import { useState, useEffect } from 'react';
import { Warehouse, Plane, UserRound, ClipboardList } from 'lucide-react';
import FazendaTab from '@/components/FazendaTab';
import DroneTab from '@/components/DroneTab';
import PilotoTab from '@/components/PilotoTab';
import AplicacaoTab from '@/components/AplicacaoTab';

const tabs = [
  { id: 'fazendas', label: 'Fazendas', icon: Warehouse },
  { id: 'drones', label: 'Drones', icon: Plane },
  { id: 'pilotos', label: 'Pilotos', icon: UserRound },
  { id: 'aplicacoes', label: 'Aplicações', icon: ClipboardList },
];

export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState('fazendas');

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">
          Cadastros
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie fazendas, drones, pilotos e aplicações da sua operação.
        </p>
      </div>

      {/* Abas horizontais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-[#39B54A]/10 text-[#0F5A6B] border border-[#39B54A]/20 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="min-h-[500px]">
        {activeTab === 'fazendas' && <FazendaTab />}
        {activeTab === 'drones' && <DroneTab />}
        {activeTab === 'pilotos' && <PilotoTab />}
        {activeTab === 'aplicacoes' && <AplicacaoTab />}
      </div>
    </div>
  );
}
