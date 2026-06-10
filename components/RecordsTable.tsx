"use client";

import React from 'react';

/**
 * RecordsTable component
 *
 * Renderiza uma tabela simples de registros. Recebe `records` como array de
 * objetos e um `onRowClick` para lidar com o clique em uma linha, abrindo o
 * modal de detalhes. As colunas são inferidas das chaves do primeiro
 * elemento. É possível passar `columns` para especificar as colunas e
 * cabeçalhos manualmente.
 */
export default function RecordsTable({
  records,
  onRowClick,
  columns,
}: {
  records: any[];
  onRowClick: (record: any) => void;
  columns?: { key: string; label: string }[];
}) {
  if (!records || records.length === 0) {
    return <p className="text-gray-500">Nenhum registro encontrado.</p>;
  }
  const inferredColumns =
    columns ||
    Object.keys(records[0]).map((key) => ({ key, label: key.replace(/_/g, ' ') }));
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-pulvion-teal text-white">
          <tr>
            {inferredColumns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((record, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(record)}
            >
              {inferredColumns.map((col) => (
                <td key={col.key} className="px-4 py-2 whitespace-nowrap text-sm">
                  {String(record[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}