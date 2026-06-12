"use client";

import { ClipboardList, Drone, Eye, Plus, Search, UserRound, Warehouse } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Pagination from './Pagination';

const PAGE_SIZE = 8;
const sectionIcons: Record<string, React.ElementType> = {
  Fazendas: Warehouse,
  Drones: Drone,
  Pilotos: UserRound,
  Aplicações: ClipboardList,
};

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
  icon: TitleIcon,
}: {
  title: string;
  rows: T[];
  columns: CadastroColumn<T>[];
  onRowClick: (row: T) => void;
  onAdd: () => void;
  searchText: (row: T) => string;
  emptyText: string;
  icon?: React.ElementType;
}) {
  const [search, setSearch] = useState('');
  const SectionIcon = TitleIcon || sectionIcons[title] || ClipboardList;
  const [page, setPage] = useState(1);
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? rows.filter((row) => searchText(row).toLowerCase().includes(term))
      : rows;
  }, [rows, search, searchText]);
  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, rows]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pulvion-teal/10 text-pulvion-teal"><SectionIcon className="h-5 w-5" /></span>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
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

      <div className="space-y-2 p-3 md:hidden">
        {paginatedRows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onRowClick(row)}
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-pulvion-teal/20 hover:bg-[#39B54A]/5 active:bg-[#39B54A]/10"
          >
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2">
              {columns.slice(0, 9).map((column, index) => (
                <div key={column.key} className={index === 0 ? 'col-span-2' : 'min-w-0'}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{column.label}</p>
                  <div className="mt-0.5 truncate text-sm text-gray-700">{column.render(row)}</div>
                </div>
              ))}
            </div>
            <Eye className="mt-1 h-4 w-4 flex-shrink-0 text-pulvion-teal" />
          </button>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className="group cursor-pointer transition odd:bg-white even:bg-slate-50/60 hover:bg-[#39B54A]/5"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                    {column.render(row)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right"><span title="Visualizar detalhes" className="inline-flex rounded-lg p-2 text-pulvion-teal transition group-hover:bg-pulvion-teal/10"><Eye className="h-4 w-4" /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-gray-500">{emptyText}</p>
        )}
      </div>
      <div className="px-3 pb-3">
        <Pagination page={page} totalItems={filteredRows.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
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
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
      active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
