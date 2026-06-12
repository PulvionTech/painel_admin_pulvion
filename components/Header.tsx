"use client";

import { LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const pageContext = [
  {
    match: (pathname: string) => pathname === '/dashboard',
    title: 'Visão geral',
    description: 'Acompanhe os principais indicadores e registros da operação.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/dashboard/cadastros'),
    title: 'Cadastros',
    description: 'Gerencie fazendas, drones, pilotos e aplicações.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/dashboard/relatorios'),
    title: 'Relatórios',
    description: 'Analise resultados e acompanhe o desempenho operacional.',
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pageContext.find((page) => page.match(pathname)) || pageContext[0];
  const [dateContext, setDateContext] = useState({ greeting: 'Olá', today: '' });

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setDateContext({
      greeting: hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite',
      today: now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair do sistema:', error);
      return;
    }
    router.push('/login');
  };

  return (
    <header className="flex min-w-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-3 pl-16 sm:gap-4 sm:p-4 sm:pl-16 lg:pl-4">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-pulvion-green sm:text-xs">
          {dateContext.greeting}{dateContext.today ? ` · ${dateContext.today}` : ''}
        </p>
        <div className="mt-0.5 flex min-w-0 items-baseline gap-3">
          <h1 className="truncate text-base font-semibold text-gray-900 sm:text-xl">{currentPage.title}</h1>
          <p className="hidden truncate text-sm text-gray-500 md:block">{currentPage.description}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-3.5 sm:py-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}
