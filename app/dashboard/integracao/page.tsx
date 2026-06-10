"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Página de integração com Google Sheets
 *
 * Permite ao usuário cadastrar o ID da planilha e mapeamento de colunas.
 * Os dados são salvos na tabela `sheets_config` no Supabase.
 */
export default function IntegracaoPage() {
  const [sheetId, setSheetId] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const { error } = await supabase
      .from('sheets_config')
      .upsert({ id: 1, google_sheet_id: sheetId });
    if (error) setStatus('Erro ao salvar');
    else setStatus('Configuração salva com sucesso');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
            Integração externa
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Google Sheets
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Configure a integração com Google Sheets para sincronizar automaticamente
            seus dados de aplicação. A planilha será atualizada em tempo real conforme
            novos registros forem criados.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
            📄 Configurações
          </h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                ID da planilha Google Sheets
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-pulvion-green focus:outline-none text-sm"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
              <p className="mt-2 text-xs text-slate-500">
                Copie o ID da URL: https://docs.google.com/spreadsheets/d/{'{ID}'}/...
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-pulvion-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-500 transition"
            >
              Salvar configuração
            </button>
            {status && (
              <p className={`text-sm ${status.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                ✓ {status}
              </p>
            )}
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-blue-200 bg-blue-50">
            <p className="text-sm font-semibold text-blue-900 mb-3">ℹ️ Como funciona</p>
            <ul className="text-xs text-blue-800 space-y-2 list-disc list-inside">
              <li>Sincronização automática a cada nova aplicação</li>
              <li>Todos os dados são enviados em tempo real</li>
              <li>Seu painel continua funcionando normalmente</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}