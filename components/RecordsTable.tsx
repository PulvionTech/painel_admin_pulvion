"use client";

import React from 'react';
import { Search } from 'lucide-react';

/**
 * RecordsTable component
 *
 * Renderiza uma tabela de registros com busca, status column e navegação por clique.
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
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRecords = React.useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((record) =>
      Object.values(record).some(
        (value) =>
          String(value)
            .toLowerCase()
            .includes(term)
      )
    );
  }, [records, searchTerm]);

  if (!records || records.length === 0) {
    return <p className="text-gray-500">Nenhum registro encontrado.</p>;
  }
  const inferredColumns =
    columns ||
    Object.keys(records[0]).map((key) => ({ key, label: key.replace(/_/g, ' ') }));
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar registros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#39B54A] focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0F5A6B] text-white">
            <tr>
              {inferredColumns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRecords.map((record, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#39B54A]/5 cursor-pointer transition-colors"
                onClick={() => onRowClick(record)}
              >
                {inferredColumns.map((col) => (
                  <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {String(record[col.key] ?? '')}
                  </td>
                ))}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                    Concluída
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredRecords.length === 0 && (
        <p className="text-sm text-gray-500 py-8 text-center">
          Nenhum registro encontrado com o termo "{searchTerm}".
        </p>
      )}
    </div>
  );
}
