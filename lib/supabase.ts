
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ctvdlamxicoxniyqcpfd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dmRsYW14aWNveG5peXFjcGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjQ0MDksImV4cCI6MjA1NjAwMDQwOX0.H00Y_vwQQBVmWrdIBdSb-IklfMfe7bzxdAESh7J0ouc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// URL oficial atualizada conforme solicitado pelo usuário
export const APP_URL = 'https://app.curso.rapido.cajon.rota50ia.com'

// Helper para obter URL de áudio do bucket específico
export const getAudioUrl = (fileName: string) => {
  const { data } = supabase.storage
    .from('curso-rapido-cajon-faixas-audio')
    .getPublicUrl(fileName);
  return data.publicUrl;
};
