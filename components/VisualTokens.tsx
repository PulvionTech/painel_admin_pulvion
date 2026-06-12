"use client";

import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Droplets,
  FlaskConical,
  Leaf,
  Package,
  Sprout,
} from 'lucide-react';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-cyan-200 bg-cyan-50 text-pulvion-teal',
    neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  const Icon = tone === 'success' ? CircleCheck : tone === 'warning' ? CircleAlert : tone === 'danger' ? CircleX : undefined;
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{Icon && <Icon className="h-3.5 w-3.5" />}{label}</span>;
}

export function ProductCategoryIcon({ category }: { category?: string }) {
  const value = (category || '').toLocaleLowerCase('pt-BR');
  const Icon = value.includes('herbic') ? Leaf : value.includes('fertiliz') ? Sprout : value.includes('adjuv') ? Droplets : value.includes('fung') || value.includes('inset') ? FlaskConical : Package;
  return <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-pulvion-teal/10 text-pulvion-teal"><Icon className="h-4 w-4" /></span>;
}
