"use client";

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const router = useRouter();
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair do sistema:', error);
      return;
    }
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white p-4 pl-16 lg:pl-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard Operacional</h1>
        <p className="mt-1 text-sm text-gray-500">{today}</p>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}
