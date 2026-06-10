import { createClient } from '@supabase/supabase-js';

// Instancia o cliente do Supabase para uso no navegador
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);