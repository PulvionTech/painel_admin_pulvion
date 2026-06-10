"use client";

import '../globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-4 pt-16 lg:pt-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}