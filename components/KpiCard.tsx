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
      className={`rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:mb-2 sm:text-xs">{title}</h3>
          <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
          {delta && (
            <span className={`mt-2 text-xs font-medium ${deltaClass}`}>{delta}</span>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-[#39B54A]/10 p-2 sm:p-3">
            <Icon className="h-5 w-5 text-[#39B54A] sm:h-6 sm:w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
