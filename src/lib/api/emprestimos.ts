import { supabase, isSupabaseConfigured } from '../supabase';
import { Emprestimo } from '../../types/emprestimo';

export async function listarEmprestimos(): Promise<Emprestimo[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('emprestimos')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) {
    console.error('[emprestimos] erro ao listar:', error);
    return [];
  }
  return (data || []) as Emprestimo[];
}

export async function listarEmprestimosPorCliente(clienteId: string): Promise<Emprestimo[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('emprestimos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('criado_em', { ascending: false });
  if (error) {
    console.error('[emprestimos] erro ao listar por cliente:', error);
    return [];
  }
  return (data || []) as Emprestimo[];
}

export async function criarEmprestimo(emprestimo: Partial<Emprestimo>): Promise<Emprestimo | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id, ...payload } = emprestimo as any;
  const { data, error } = await supabase.from('emprestimos').insert([payload]).select().single();
  if (error) {
    console.error('[emprestimos] erro ao criar:', error);
    return null;
  }
  return data as Emprestimo;
}

export async function atualizarEmprestimo(id: string, emprestimo: Partial<Emprestimo>): Promise<Emprestimo | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id: _omit, ...payload } = emprestimo as any;
  const { data, error } = await supabase.from('emprestimos').update(payload).eq('id', id).select().single();
  if (error) {
    console.error('[emprestimos] erro ao atualizar:', error);
    return null;
  }
  return data as Emprestimo;
}

export async function excluirEmprestimo(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase.from('emprestimos').delete().eq('id', id);
  if (error) {
    console.error('[emprestimos] erro ao excluir:', error);
    return false;
  }
  return true;
}
