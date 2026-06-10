"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_BUCKET = 'logos';

/**
 * Página de White Label
 *
 * Permite configurar a identidade visual para clientes (logo e cores).
 */
export default function WhiteLabelPage() {
  const [primaryColor, setPrimaryColor] = useState('#5EC680');
  const [secondaryColor, setSecondaryColor] = useState('#0E5162');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('white_label_config')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (data) {
          setPrimaryColor(data.primary_color || '#5EC680');
          setSecondaryColor(data.secondary_color || '#0E5162');
          if (data.logo_url) {
            // Get public URL from storage
            const { data: urlData } = supabase
              .storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(data.logo_url);
            setLogoUrl(urlData.publicUrl);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    try {
      const { error } = await supabase
        .from('white_label_config')
        .upsert({ 
          id: 1, 
          primary_color: primaryColor, 
          secondary_color: secondaryColor 
        });
      
      if (error) {
        throw error;
      }
      
      setStatus('Configurações salvas com sucesso');
      setStatusType('success');
    } catch (err) {
      console.error(err);
      setStatus('Erro ao salvar configurações');
      setStatusType('error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus('Por favor, selecione um arquivo de imagem');
      setStatusType('error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus('O arquivo deve ter no máximo 5MB');
      setStatusType('error');
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to storage
      const { error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Save logo URL to database
      const { error: updateError } = await supabase
        .from('white_label_config')
        .upsert({
          id: 1,
          logo_url: filePath,
          primary_color: primaryColor,
          secondary_color: secondaryColor
        });

      if (updateError) {
        throw updateError;
      }

      setLogoUrl(publicUrlData.publicUrl);
      setStatus('Logo carregado com sucesso');
      setStatusType('success');
    } catch (err) {
      console.error('Erro no upload:', err);
      setStatus('Erro ao carregar o logo');
      setStatusType('error');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Tem certeza que deseja remover o logo?')) {
      return;
    }

    try {
      // Delete from database first
      const { error: updateError } = await supabase
        .from('white_label_config')
        .upsert({
          id: 1,
          logo_url: null,
          primary_color: primaryColor,
          secondary_color: secondaryColor
        });

      if (updateError) {
        throw updateError;
      }

      // If we have a logo URL, delete from storage
      const { data: currentConfig } = await supabase
        .from('white_label_config')
        .select('logo_url')
        .eq('id', 1)
        .single();

      if (currentConfig?.logo_url) {
        const { error: deleteError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove([currentConfig.logo_url]);
        if (deleteError) {
          console.error('Erro ao excluir arquivo do storage:', deleteError);
        }
      }

      setLogoUrl(null);
      setStatus('Logo removido com sucesso');
      setStatusType('success');
    } catch (err) {
      console.error('Erro ao remover logo:', err);
      setStatus('Erro ao remover o logo');
      setStatusType('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pulvion-green font-semibold">
            Personalização
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">White Label</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Personalize a identidade visual do painel com suas cores corporativas.
            Escolha as cores primária e secundária que refletem sua marca.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
              🖼️ Logo da marca
            </h2>
            
            {logoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-slate-50 rounded-2xl border border-gray-200">
                  <img
                    src={logoUrl}
                    alt="Logo da marca"
                    className="max-h-32 object-contain"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-pulvion-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-500 transition text-sm"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Carregando...' : 'Alterar logo'}
                  </button>
                  <button
                    onClick={handleDeleteLogo}
                    className="flex-1 border border-red-300 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-50 transition text-sm"
                  >
                    Remover logo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-pulvion-green transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-sm text-slate-600 font-medium">
                      Clique para selecionar um logo
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG ou SVG até 5MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-pulvion-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-500 transition text-sm"
                  disabled={isUploading}
                >
                  {isUploading ? 'Carregando...' : 'Carregar logo'}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Colors */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
              🎨 Cores do painel
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Cor primária
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm font-mono"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#5EC680"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Cor secundária
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:border-pulvion-green focus:outline-none text-sm font-mono"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#0E5162"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-pulvion-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-500 transition"
              >
                Salvar configurações
              </button>
              {status && (
                <p
                  className={`text-sm font-semibold ${statusType === 'success' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
            <p className="text-sm font-semibold text-slate-900 mb-4">Pré-visualização</p>
            <div className="space-y-3">
              {logoUrl && (
                <div className="rounded-2xl p-4 bg-slate-50 border border-gray-200 text-center">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-h-16 object-contain mx-auto"
                  />
                </div>
              )}
              <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: primaryColor }}>
                <p className="text-xs opacity-80">Cor primária</p>
                <p className="font-mono text-lg">{primaryColor}</p>
              </div>
              <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: secondaryColor }}>
                <p className="text-xs opacity-80">Cor secundária</p>
                <p className="font-mono text-lg">{secondaryColor}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
