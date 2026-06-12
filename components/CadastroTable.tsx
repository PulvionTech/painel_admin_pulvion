"use client";

import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface CadastroColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
}

export default function CadastroTable<T extends { id?: string }>({
  title,
  rows,
  columns,
  onRowClick,
  onAdd,
  searchText,
  emptyText,
}: {
  title: string;
  rows: T[];
  columns: CadastroColumn<T>[];
  onRowClick: (row: T) => void;
  onAdd: () => void;
  searchText: (row: T) => string;
  emptyText: string;
}) {
  const [search, setSearch] = useState('');
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? rows.filter((row) => searchText(row).toLowerCase().includes(term))
      : rows;
  }, [rows, search, searchText]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{filteredRows.length} registro(s)</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#39B54A] sm:w-64"
            />
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39B54A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2fa140]"
          >
            <Plus className="h-4 w-4" />
            Adicionar Novo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className="cursor-pointer transition hover:bg-[#39B54A]/5"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-gray-500">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export function StatusBadge({ active, activeLabel = 'Ativo', inactiveLabel = 'Inativo' }: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
      active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
