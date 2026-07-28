import { supabase, isSupabaseConfigured } from '../supabase';
import { Parcela } from '../../types/parcela';

export async function listarParcelas(): Promise<Parcela[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .order('data_vencimento', { ascending: true });
  if (error) {
    console.error('[parcelas] erro ao listar:', error);
    return [];
  }
  return (data || []) as Parcela[];
}

export async function listarParcelasPorEmprestimo(emprestimoId: string): Promise<Parcela[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .eq('emprestimo_id', emprestimoId)
    .order('numero_parcela', { ascending: true });
  if (error) {
    console.error('[parcelas] erro ao listar por empréstimo:', error);
    return [];
  }
  return (data || []) as Parcela[];
}

export async function criarParcelas(parcelas: Partial<Parcela>[]): Promise<Parcela[]> {
  if (!isSupabaseConfigured() || !supabase || parcelas.length === 0) return [];
  const payload = parcelas.map(({ id, ...rest }: any) => rest);
  const { data, error } = await supabase.from('parcelas').insert(payload).select();
  if (error) {
    console.error('[parcelas] erro ao criar em lote:', error);
    return [];
  }
  return (data || []) as Parcela[];
}

export async function registrarPagamento(
  id: string,
  valorPago: number,
  multaAplicada = false,
  valorMulta = 0
): Promise<Parcela | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('parcelas')
    .update({
      status: 'paga',
      valor_pago: valorPago,
      data_pagamento: new Date().toISOString().slice(0, 10),
      multa_aplicada: multaAplicada,
      valor_multa: valorMulta,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[parcelas] erro ao registrar pagamento:', error);
    return null;
  }
  return data as Parcela;
}

export async function atualizarParcela(id: string, parcela: Partial<Parcela>): Promise<Parcela | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { id: _omit, ...payload } = parcela as any;
  const { data, error } = await supabase.from('parcelas').update(payload).eq('id', id).select().single();
  if (error) {
    console.error('[parcelas] erro ao atualizar:', error);
    return null;
  }
  return data as Parcela;
}
