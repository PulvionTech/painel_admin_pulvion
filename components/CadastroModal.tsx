"use client";

import { AtSign, BadgeCheck, CalendarDays, CircleGauge, Contact, Drone, Eye, FileText, LandPlot, MapPin, Package, Pencil, Phone, Sprout, Trash2, UserRound, Warehouse, Wrench, X } from 'lucide-react';
import { Badge } from './VisualTokens';

const detailIcons: Record<string, React.ElementType> = {
  nome: UserRound, fazenda: Warehouse, 'cidade / uf': MapPin, cidade: MapPin, contato: Contact,
  telefone: Phone, 'e-mail': AtSign, 'área total': LandPlot, 'área (ha)': LandPlot,
  status: CircleGauge, ativo: BadgeCheck, observações: FileText, 'criada em': CalendarDays,
  modelo: Drone, identificador: Drone, 'registro anac': BadgeCheck, 'número de série': FileText,
  perfil: UserRound, convite: AtSign, 'licença caar': BadgeCheck, serviço: Wrench,
  cultura: Sprout, produtos: Package,
};

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[92vh] sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulvion-teal/10 text-pulvion-teal"><Eye className="h-4 w-4" /></span><h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h2></div>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1">
            {mode === 'view' && onEdit && (
              <button onClick={onEdit} aria-label="Editar" title="Editar registro" className="rounded-xl border border-transparent p-2 text-[#0F5A6B] transition hover:border-[#0F5A6B]/20 hover:bg-[#0F5A6B]/10">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {mode === 'view' && onDelete && (
              <button onClick={onDelete} aria-label="Excluir" title="Excluir registro" className="rounded-xl border border-transparent p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} aria-label="Fechar" title="Fechar" className="rounded-xl border border-transparent p-2 text-gray-500 transition hover:border-gray-200 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function DetailGrid({ items }: { items: Array<{ label: string; value: React.ReactNode; icon?: React.ElementType; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon || detailIcons[item.label.toLocaleLowerCase('pt-BR')] || FileText;
        const normalizedValue = String(item.value || '').toLocaleLowerCase('pt-BR');
        const tone = item.tone || (['ativa', 'ativo', 'sim', 'em operação'].includes(normalizedValue) ? 'success' : normalizedValue.includes('manutenção') ? 'warning' : 'neutral');
        return <div key={item.label} className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-3 transition hover:border-pulvion-teal/20 hover:bg-white">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-pulvion-teal/10 text-pulvion-teal"><Icon className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p><div className="mt-1 break-words text-sm font-medium text-gray-800">{['status', 'ativo'].includes(item.label.toLocaleLowerCase('pt-BR')) ? <Badge label={String(item.value || '—')} tone={tone} /> : item.value || '—'}</div></div>
          </div>
        </div>;
      })}
    </div>
  );
}

export const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#39B54A]';
export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
export const primaryButtonClass = 'rounded-xl bg-[#39B54A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2fa140]';
export const secondaryButtonClass = 'rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50';
