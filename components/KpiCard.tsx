"use client";

import React from 'react';

/**
 * KpiCard component
 *
 * Exibe um cartão simples contendo um ícone, título, valor principal e um indicador
 * opcional de diferença (delta). O cartão aplica cores do sistema de design
 * PulviOn e pode receber classes extras via props para customização.  
 */
export default function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  className = '',
}: {
  title: string;
  value: string | number;
  delta?: string;
  icon?: React.ElementType;
  className?: string;
}) {
  // Define a cor do delta de acordo com sinal (negativo em vermelho, positivo em verde).
  const deltaClass = delta && delta.startsWith('-') ? 'text-red-600' : 'text-[#39B54A]';
  
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {delta && (
            <span className={`mt-2 text-xs font-medium ${deltaClass}`}>{delta}</span>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[#39B54A]/10 rounded-xl">
            <Icon className="h-6 w-6 text-[#39B54A]" />
          </div>
        )}
      </div>
    </div>
  );
}
