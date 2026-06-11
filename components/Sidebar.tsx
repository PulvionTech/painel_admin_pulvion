"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Database,
  FileSpreadsheet,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Navigation items organized by categories
const categories = [
  {
    label: 'Geral',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Operação',
    items: [
      { label: 'Cadastros', href: '/dashboard/cadastros', icon: Database },
      { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    ],
  },
  {
    label: 'Integrações',
    items: [
      { label: 'Sheets', href: '/dashboard/integracao', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Configuração',
    items: [
      { label: 'White Label', href: '/dashboard/white-label', icon: Palette },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Auto-collapse on smaller screens
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1200);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 lg:z-auto flex flex-col
          bg-[#0F5A6B] min-h-screen
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarCollapsed ? (
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/logos/pulvion-icon-64.png"
                  alt="PulviOn"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
              </div>
            ) : (
              <Image
                src="/logos/pulvion-logo-light-150.png"
                alt="PulviOn"
                width={140}
                height={48}
                className="h-9 w-auto"
              />
            )}
            
            {/* Toggle button (desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-white/70" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {categories.map((category) => (
            <div key={category.label} className="mb-6">
              {!sidebarCollapsed && (
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40 px-3 mb-2">
                  {category.label}
                </p>
              )}
              <ul className="space-y-1">
                {category.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-[#39B54A]/20 text-white border-l-2 border-[#39B54A]'
                            : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                          }
                        `}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#39B54A]' : 'text-white/60 group-hover:text-white'}`}
                        />
                        
                        {sidebarCollapsed ? (
                          <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#0F5A6B] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 border border-white/10">
                            {item.label}
                          </div>
                        ) : (
                          <span className="whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3">
          {sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="group relative flex items-center justify-center w-full p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 text-white/60 group-hover:text-white" />
              <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#0F5A6B] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 border border-white/10">
                Sair do sistema
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-9 h-9 rounded-xl bg-[#39B54A]/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Usuário
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    Administrador
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                Sair do sistema
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
