export default function Header() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return (
    <header className="flex flex-col gap-4 p-4 border-b border-gray-200 bg-white md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">Painel administrativo</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Bom dia, Administrador 👋</h2>
        <p className="mt-1 text-sm text-gray-500">{today}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="inline-flex items-center justify-center rounded-2xl bg-pulvion-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500">
          Criar nova aplicação
        </button>
        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
          Status do sistema: <span className="font-semibold text-slate-900">Ok</span>
        </div>
      </div>
    </header>
  );
}