"use client";

import '../globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col lg:ml-20 xl:ml-64">
        <Header />
        <div className="min-w-0 flex-1 p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
