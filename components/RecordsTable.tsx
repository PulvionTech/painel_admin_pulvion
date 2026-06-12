"use client";

import React from 'react';
import { Eye, Search } from 'lucide-react';
import Pagination from './Pagination';

const PAGE_SIZE = 8;

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
  const [page, setPage] = React.useState(1);

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
  const paginatedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, records]);

  if (!records || records.length === 0) {
    return <p className="text-gray-500">Nenhum registro encontrado.</p>;
  }
  const inferredColumns =
    columns ||
    Object.keys(records[0]).map((key) => ({ key, label: key.replace(/_/g, ' ') }));
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
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
      <div className="space-y-2 md:hidden">
        {paginatedRecords.map((record, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onRowClick(record)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition active:bg-[#39B54A]/5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{record.data || 'Sem data'}</span>
                <span className="truncate text-sm text-gray-500">{record.cultura || '—'}</span>
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">{record.fazenda || '—'} · {record.contato || '—'}</p>
              <p className="mt-1 truncate text-xs text-gray-500">{record.piloto || '—'} · {record.drone || '—'}</p>
              <p className="mt-1 text-xs font-medium text-[#0F5A6B]">{record.area_ha || 0} ha · {record.tipo_servico || '—'} · {record.produtos_resumo || '0 produtos'}</p>
            </div>
            <Eye className="h-4 w-4 flex-shrink-0 text-pulvion-teal" />
          </button>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0F5A6B] text-white">
            <tr>
              {inferredColumns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedRecords.map((record, idx) => (
              <tr
                key={idx}
                className="cursor-pointer transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-[#39B54A]/5"
                onClick={() => onRowClick(record)}
              >
                {inferredColumns.map((col) => (
                  <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {String(record[col.key] ?? '')}
                  </td>
                ))}
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
      <Pagination page={page} totalItems={filteredRecords.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
