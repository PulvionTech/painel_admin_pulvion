"use client";

import React from 'react';

/**
 * KpiCard component
 *
 * Exibe um cartão simples contendo um título, um valor principal e um indicador
 * opcional de diferença (delta). O cartão aplica cores do sistema de design
 * PulviOn e pode receber classes extras via props para customização.  
 */
export default function KpiCard({
  title,
  value,
  delta,
  className = '',
}: {
  title: string;
  value: string | number;
  delta?: string;
  className?: string;
}) {
  // Define a cor do delta de acordo com sinal (negativo em vermelho, positivo em verde).
  const deltaClass = delta && delta.startsWith('-') ? 'text-error-red' : 'text-pulvion-green';
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      {delta && (
        <span className={`mt-2 text-xs font-medium ${deltaClass}`}>{delta}</span>
      )}
    </div>
  );
}