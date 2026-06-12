"use client";

import { Pencil, Trash2, X } from 'lucide-react';

export default function CadastroModal({
  open,
  title,
  subtitle,
  mode,
  onClose,
  onEdit,
  onDelete,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6" onMouseDown={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1">
            {mode === 'view' && onEdit && (
              <button onClick={onEdit} aria-label="Editar" className="rounded-xl p-2 text-[#0F5A6B] transition hover:bg-[#0F5A6B]/10">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {mode === 'view' && onDelete && (
              <button onClick={onDelete} aria-label="Excluir" className="rounded-xl p-2 text-red-600 transition hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} aria-label="Fechar" className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function DetailGrid({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
          <div className="mt-1 break-words text-sm font-medium text-gray-800">{item.value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

export const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#39B54A]';
export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
export const primaryButtonClass = 'rounded-xl bg-[#39B54A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2fa140]';
export const secondaryButtonClass = 'rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50';
