"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Plane,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type Mode = 'login' | 'reset' | 'update';

const highlights = [
  { icon: Plane, title: 'Operação centralizada', text: 'Aplicações, pilotos, drones e fazendas no mesmo painel.' },
  { icon: Sprout, title: 'Rastreabilidade agrícola', text: 'Produtos, dosagens, áreas e serviços organizados por aplicação.' },
  { icon: ShieldCheck, title: 'Dados no Supabase', text: 'Persistência direta no banco e isolamento operacional por empresa.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
        setStatus('Defina uma nova senha para sua conta.');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    if (!email && mode !== 'update') {
      setError('Informe seu e-mail para continuar.');
      setLoading(false);
      return;
    }

    if (mode === 'reset') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) setError(resetError.message);
      else setStatus('Enviamos as instruções de recuperação para o seu e-mail.');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve possuir pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (mode === 'update') {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError(updateError.message);
      else {
        setStatus('Senha atualizada. Você já pode acessar o painel.');
        setMode('login');
        setPassword('');
      }
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }
    setStatus('Acesso confirmado. Redirecionando...');
    router.push('/dashboard');
    router.refresh();
  };

  const title = mode === 'login' ? 'Acesse sua operação' : mode === 'reset' ? 'Recuperar acesso' : 'Criar nova senha';
  const description = mode === 'login'
    ? 'Entre com sua conta administrativa para continuar.'
    : mode === 'reset'
      ? 'Informe seu e-mail para receber as instruções de recuperação.'
      : 'Defina uma senha segura para concluir a recuperação.';

  return (
    <main className="min-h-screen overflow-y-auto bg-slate-100 lg:grid lg:grid-cols-[minmax(420px,0.92fr)_minmax(520px,1.08fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-pulvion-teal px-10 py-9 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12">
        <div className="absolute -left-28 top-1/3 h-72 w-72 rounded-full bg-pulvion-green/20 blur-3xl" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="relative">
          <Image src="/logos/pulvion-logo-full-light-240w.png" alt="PulviOn" width={240} height={64} priority className="h-auto w-52 object-contain" />
          <div className="mt-14 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              <CheckCircle2 className="h-3.5 w-3.5 text-pulvion-green" />
              Gestão agrícola operacional
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight xl:text-5xl">Controle cada aplicação com clareza.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70 xl:text-base">
              Informações operacionais organizadas para apoiar decisões, acompanhar equipes e manter o histórico da operação.
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 xl:grid-cols-3">
          {highlights.map(({ icon: Icon, title: itemTitle, text }) => (
            <article key={itemTitle} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.12]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pulvion-green/20 text-pulvion-green"><Icon className="h-4 w-4" /></span>
              <h2 className="mt-3 text-sm font-semibold">{itemTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-white/60">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-7 flex justify-center lg:hidden">
            <Image src="/logos/pulvion-logo-full-dark-240w.png" alt="PulviOn" width={240} height={64} priority className="h-auto w-48 object-contain" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pulvion-green">PulviOn Admin</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-pulvion-teal/10 text-pulvion-teal">
                {mode === 'login' ? <LockKeyhole className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
              </span>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {error && <Feedback tone="error">{error}</Feedback>}
              {status && <Feedback tone="success">{status}</Feedback>}

              {mode !== 'update' && (
                <Field label="E-mail">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@empresa.com.br" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-pulvion-green focus:ring-4 focus:ring-pulvion-green/10" />
                </Field>
              )}

              {mode !== 'reset' && (
                <Field label={mode === 'update' ? 'Nova senha' : 'Senha'}>
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'update' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-pulvion-green focus:ring-4 focus:ring-pulvion-green/10" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-pulvion-teal">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setMode('reset'); setError(''); setStatus(''); }} className="text-sm font-semibold text-pulvion-teal transition hover:text-pulvion-green">Esqueci minha senha</button>
                </div>
              )}

              <button type="submit" disabled={loading} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pulvion-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#45ad68] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Processando...' : mode === 'login' ? 'Entrar no painel' : mode === 'reset' ? 'Enviar instruções' : 'Atualizar senha'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {mode !== 'login' ? (
              <button type="button" onClick={() => { setMode('login'); setError(''); setStatus(''); }} className="mt-5 w-full text-center text-sm font-semibold text-pulvion-teal transition hover:text-pulvion-green">Voltar para o login</button>
            ) : (
              <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                Ainda não possui acesso?{' '}
                <a href="mailto:contato@pulvion.com.br?subject=Solicitação%20de%20acesso%20ao%20PulviOn%20Admin" className="font-semibold text-pulvion-teal transition hover:text-pulvion-green">Solicite seu acesso</a>
              </p>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">Acesso restrito a usuários autorizados · PulviOn Admin</p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><span className="relative block">{children}</span></label>;
}

function Feedback({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return <div role="status" className={`rounded-xl border px-3.5 py-3 text-sm ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{children}</div>;
}
