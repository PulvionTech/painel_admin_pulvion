export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-lg">
        <h1 className="text-5xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-xl text-slate-600">Página não encontrada</p>
        <p className="mt-2 text-sm text-slate-500">
          A página que você está procurando não existe ou foi removida.
        </p>
      </div>
    </div>
  );
}
