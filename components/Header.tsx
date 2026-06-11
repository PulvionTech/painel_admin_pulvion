export default function Header() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard Operacional</h1>
        <p className="mt-1 text-sm text-gray-500">{today}</p>
      </div>
    </header>
  );
}
