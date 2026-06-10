"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardIcon,
  ReportsIcon,
  CadastrosIcon,
  SheetsIcon,
  WhiteLabelIcon,
  MenuIcon,
  XIcon,
} from '@/components/Icons';
import { supabase } from '@/lib/supabaseClient';

const items = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Relatórios', href: '/dashboard/relatorios', icon: ReportsIcon },
  { label: 'Cadastros', href: '/dashboard/cadastros', icon: CadastrosIcon },
  { label: 'Integração Sheets', href: '/dashboard/integracao', icon: SheetsIcon },
  { label: 'White Label', href: '/dashboard/white-label', icon: WhiteLabelIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is on mobile to auto-collapse
    const checkMobile = () => {
      setMenuOpen(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-pulvion-teal text-white rounded-xl shadow-lg hover:bg-pulvion-teal/90 transition"
        aria-label="Abrir menu"
      >
        {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 lg:z-auto flex flex-col
          bg-gradient-to-b from-pulvion-teal to-[#0C4554]
          text-white min-h-screen
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${menuOpen ? 'w-72' : 'w-20 lg:w-20'}
        `}
      >
        {/* Top section */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {menuOpen ? (
              <div className="flex items-center gap-3">
                <Image
                  src="/logos/pulvion-logo-light-150.png"
                  alt="PulviOn"
                  width={150}
                  height={60}
                  className="h-10 w-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/logos/pulvion-logo-light-150.png"
                  alt="PulviOn"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
            )}
            
            {/* Toggle button (desktop) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-white/10 transition"
              aria-label={menuOpen ? "Recolher menu" : "Expandir menu"}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {menuOpen && (
            <p className="text-sm text-white/70 max-w-[230px]">
              Acompanhe operações, Sheets e cadastros com visual moderna.
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-4">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-4 rounded-2xl
                  text-sm transition-all duration-200 group
                  ${isActive ? 'bg-pulvion-green text-white shadow-lg shadow-pulvion-green/25' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {menuOpen && <span className="font-medium">{item.label}</span>}
                {!menuOpen && (
                  <div className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-4 rounded-2xl
              text-white/70 hover:bg-red-500/20 hover:text-red-200
              transition-all duration-200 group
            `}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {menuOpen && <span className="font-medium">Sair do sistema</span>}
            {!menuOpen && (
              <div className="absolute left-24 bg-red-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                Sair do sistema
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="text-xs text-white/40 pt-4 border-t border-white/10">
              <p>PulviOn Admin © 2026</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
