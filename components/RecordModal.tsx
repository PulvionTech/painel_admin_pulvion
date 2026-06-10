"use client";

import React from 'react';

/**
 * RecordModal component
 *
 * Exibe um modal centralizado para visualização de detalhes de um registro de
 * aplicação. Recebe o objeto `record` com as informações a serem exibidas e
 * controla a visibilidade via `open` e `onClose`.
 */
export default function RecordModal({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record: any;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4 text-pulvion-teal">
          Detalhes do registro
        </h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {Object.entries(record || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b py-1">
              <span className="font-medium text-gray-600">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-gray-800 text-right ml-4 truncate">
                {String(value ?? '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}