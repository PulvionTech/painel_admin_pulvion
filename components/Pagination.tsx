"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1);

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        {totalItems === 0 ? 'Nenhum registro' : `Exibindo ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} de ${totalItems}`}
      </p>
      <div className={`items-center gap-1 ${totalPages > 1 ? 'flex' : 'hidden sm:flex'}`}>
        <PageButton label="Página anterior" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        {pages.map((item, index) => (
          <span key={item} className="contents">
            {index > 0 && item - pages[index - 1] > 1 && <span className="px-1 text-xs text-gray-400">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${item === page ? 'bg-pulvion-green text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              {item}
            </button>
          </span>
        ))}
        <PageButton label="Próxima página" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}
