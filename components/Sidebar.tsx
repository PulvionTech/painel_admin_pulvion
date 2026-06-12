"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const categories = [
  {
    label: 'Geral',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operação',
    items: [
      { label: 'Cadastros', href: '/dashboard/cadastros', icon: Database },
      { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCollapsed = collapsed && !mobileOpen;

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1280);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isRouteActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        className="fixed left-4 top-3 z-[60] rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm transition hover:bg-gray-100 lg:hidden sm:top-4"
      >
        {mobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>

      <aside
        className={`
          fixed z-50 flex h-screen min-h-0 flex-col bg-pulvion-teal
          left-0 top-0 transition-all duration-300 ease-in-out lg:fixed lg:z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${mobileOpen ? 'w-72 max-w-[85vw]' : isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex-shrink-0 border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-2">
            {isCollapsed ? (
              <div className="flex w-full items-center justify-center">
                <Image src="/logos/pulvion-symbol-48.png" alt="PulviOn" width={48} height={48} priority className="object-contain" />
              </div>
            ) : (
              <Image src="/logos/pulvion-logo-full-light-180w.png" alt="PulviOn" width={180} height={48} priority className="w-full max-w-[180px] object-contain" />
            )}

            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
              className="hidden flex-shrink-0 rounded-lg p-2 transition hover:bg-white/10 lg:inline-flex"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-4 w-4 text-white" />}
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          {categories.map((category) => (
            <section key={category.label} className="mb-6 last:mb-0">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
                  {category.label}
                </p>
              )}
              <ul className="space-y-1">
                {category.items.map((item) => {
                  const active = isRouteActive(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`
                          group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition
                          ${active
                            ? 'bg-pulvion-green text-white'
                            : 'text-white/75 hover:bg-gray-100 hover:text-pulvion-teal'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {isCollapsed ? (
                          <span className="pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-pulvion-teal px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {item.label}
                          </span>
                        ) : (
                          <span className="ml-2 whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}
