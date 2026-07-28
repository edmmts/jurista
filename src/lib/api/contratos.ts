import { supabase, isSupabaseConfigured } from '../supabase';
import { Contrato } from '../../types/contrato';

export async function listarContratos(): Promise<Contrato[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) {
    console.error('[contratos] erro ao listar:', error);
    return [];
  }
  return (data || []) as Contrato[];
}

export async function buscarContrato(id: string): Promise<Contrato | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase.from('contratos').select('*').eq('id', id).single();
  if (error) {
    console.error('[contratos] erro ao buscar:', error);
    return null;
  }
  return data as Contrato;
}

export async function criarContrato(contrato: Partial<Contrato>): Promise<Contrato | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id, ...payload } = contrato as any;
  const { data, error } = await supabase.from('contratos').insert([payload]).select().single();
  if (error) {
    console.error('[contratos] erro ao criar:', error);
    return null;
  }
  return data as Contrato;
}

export async function atualizarContrato(id: string, contrato: Partial<Contrato>): Promise<Contrato | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id: _omit, ...payload } = contrato as any;
  const { data, error } = await supabase.from('contratos').update(payload).eq('id', id).select().single();
  if (error) {
    console.error('[contratos] erro ao atualizar:', error);
    return null;
  }
  return data as Contrato;
}

export async function adicionarObservacao(id: string, contrato: Contrato, texto: string, autor: string): Promise<Contrato | null> {
  const novaObs = { id: `obs_${Date.now()}`, texto, autor, criado_em: new Date().toISOString() };
  const observacoes = [...(contrato.observacoes || []), novaObs];
  return atualizarContrato(id, { observacoes });
}

export async function registrarAuditoria(id: string, contrato: Contrato, evento: string, autor: string, detalhes?: string): Promise<Contrato | null> {
  const novoLog = { id: `log_${Date.now()}`, evento, autor, data_hora: new Date().toISOString(), detalhes };
  const historico_auditoria = [...(contrato.historico_auditoria || []), novoLog];
  return atualizarContrato(id, { historico_auditoria });
}
