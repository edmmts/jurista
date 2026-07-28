import { createClient } from '@supabase/supabase-js';
import { SupabaseLead } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Inserts or updates a lead in the Supabase 'leads' table.
 */
export async function saveLeadToSupabase(leadData: SupabaseLead) {
  if (!supabase || !isSupabaseConfigured()) {
    console.info('[Supabase] Configuração ausente ou chave padrão detectada. Salvando localmente.');
    return { data: null, error: new Error('Supabase não configurado') };
  }

  try {
    // Check if a lead with this telephone already exists to avoid duplicates
    let existingId: string | null = null;
    if (leadData.telefone) {
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('telefone', leadData.telefone)
        .limit(1);
      
      if (existingLeads && existingLeads.length > 0) {
        existingId = existingLeads[0].id;
      }
    }

    const payload = {
      nome: leadData.nome || leadData.nome_responsavel || 'Sem Nome',
      email: leadData.email || 'sememail@exemplo.com',
      telefone: leadData.telefone,
      valor_solicitado: leadData.valor_solicitado,
      prazo_dias: leadData.prazo_dias,
      chave_pix: leadData.chave_pix,
      endereco_pessoal: leadData.endereco_pessoal,
      endereco_empresa: leadData.endereco_empresa || leadData.endereco_comercial,
      contato1_nome: leadData.contato1_nome,
      contato1_tel: leadData.contato1_tel,
      contato2_nome: leadData.contato2_nome,
      contato2_tel: leadData.contato2_tel,
      contato3_nome: leadData.contato3_nome,
      contato3_tel: leadData.contato3_tel,
      comprovante_url: leadData.comprovante_url,
      selfie_url: leadData.selfie_url,
      status: leadData.status || 'Cadastro Incompleto',
    };

    let result;
    if (existingId) {
      result = await supabase
        .from('leads')
        .update(payload)
        .eq('id', existingId)
        .select();
    } else {
      result = await supabase
        .from('leads')
        .insert([payload])
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('[Supabase Error]:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('[Supabase Exception]:', err);
    return { data: null, error: err };
  }
}

/**
 * Uploads a file (comprovante or selfie) to the 'documentos' Supabase Storage Bucket.
 */
export async function uploadDocumentToSupabase(file: File, pathFolder: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured()) {
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Supabase Storage Upload Error]:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('documentos').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage Exception]:', err);
    return null;
  }
}

/**
 * SQL script for reference / quick copy setup
 */
export const SUPABASE_SQL_SCRIPT = `-- 1. Criação da Tabela Principal de Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    valor_solicitado NUMERIC,
    prazo_dias INTEGER,
    chave_pix TEXT,
    endereco_pessoal TEXT,
    endereco_empresa TEXT,
    contato1_nome TEXT,
    contato1_tel TEXT,
    contato2_nome TEXT,
    contato2_tel TEXT,
    contato3_nome TEXT,
    contato3_tel TEXT,
    comprovante_url TEXT,
    selfie_url TEXT,
    status TEXT DEFAULT 'Cadastro Incompleto',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criação do Bucket de Storage para as Fotos (Documentos e Selfies)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', true);

-- 3. Políticas de Segurança (RLS - Permite que a Landing Page insira dados)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção pública" 
ON leads FOR INSERT 
TO public WITH CHECK (true);

CREATE POLICY "Permitir leitura pública" 
ON leads FOR SELECT 
TO public USING (true);

-- Permite upload público para o bucket de documentos (MVP)
CREATE POLICY "Permitir uploads publicos" 
ON storage.objects FOR INSERT 
TO public WITH CHECK (bucket_id = 'documentos');`;
