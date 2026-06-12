"use client";

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogged, setKeepLogged] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    if (!email || !password) {
      setError('Preencha todos os campos para continuar.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStatus('Login realizado com sucesso! Redirecionando...');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex w-2/5 bg-pulvion-teal text-white p-10 flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-3 mb-8">
            <Image
              src="/logos/pulvion-logo-light-150.png"
              alt="PulviOn"
              width={150}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-3xl font-semibold leading-tight max-w-xs">
            Cada voo registrado. Cada dado seguro.
          </h2>
          <p className="mt-6 max-w-sm text-sm text-white/80 leading-7">
            Conecte-se ao painel de gestão para acompanhar aplicações e cadastros de fazendas, drones e pilotos.
          </p>
        </div>

        <div className="space-y-4 text-sm text-white/80">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Estatísticas</p>
            <p className="mt-3 font-semibold text-lg">200+ registros/mês</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Resiliência</p>
            <p className="mt-3 font-semibold text-lg">100% offline-ready</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Conformidade</p>
            <p className="mt-3 font-semibold text-lg">MAPA compliance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-[32px] shadow-lg overflow-hidden border border-gray-100">
          <div className="p-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-2 w-2 rounded-full bg-pulvion-green" />
              <span className="text-xs uppercase tracking-[0.3em] text-pulvion-teal/70">
                acesso restrito
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">Boas-vindas</h2>
            <p className="mt-3 text-sm text-slate-600">
              Entre com sua conta admin para acessar o painel de gestão.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
                  {error}
                </div>
              )}
              {status && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                  {status}
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-pulvion-teal/80 focus:ring-2 focus:ring-pulvion-teal/10"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-sm font-medium text-pulvion-teal hover:text-pulvion-green"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-pulvion-teal/80 focus:ring-2 focus:ring-pulvion-teal/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={keepLogged}
                    onChange={(e) => setKeepLogged(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-pulvion-teal focus:ring-pulvion-teal"
                  />
                  Manter conectado
                </label>
                <button type="button" className="font-semibold text-pulvion-teal hover:text-pulvion-green">
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pulvion-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verificando…' : 'Entrar no painel'}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-500">
              <p>
                Não tem acesso?{' '}
                <a href="#" className="font-semibold text-pulvion-teal hover:text-pulvion-green">
                  Solicite seu acesso
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
