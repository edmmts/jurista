import { supabase, isSupabaseConfigured } from '../supabase';
import { Cliente } from '../../types/cliente';

export async function listarClientes(): Promise<Cliente[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) {
    console.error('[clientes] erro ao listar:', error);
    return [];
  }
  return (data || []) as Cliente[];
}

export async function buscarCliente(id: string): Promise<Cliente | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  if (error) {
    console.error('[clientes] erro ao buscar:', error);
    return null;
  }
  return data as Cliente;
}

export async function criarCliente(cliente: Partial<Cliente>): Promise<Cliente | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id, ...payload } = cliente as any;
  const { data, error } = await supabase.from('clientes').insert([payload]).select().single();
  if (error) {
    console.error('[clientes] erro ao criar:', error);
    return null;
  }
  return data as Cliente;
}

export async function atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id: _omit, ...payload } = cliente as any;
  const { data, error } = await supabase.from('clientes').update(payload).eq('id', id).select().single();
  if (error) {
    console.error('[clientes] erro ao atualizar:', error);
    return null;
  }
  return data as Cliente;
}

export async function excluirCliente(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) {
    console.error('[clientes] erro ao excluir:', error);
    return false;
  }
  return true;
}
