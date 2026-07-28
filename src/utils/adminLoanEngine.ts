import { Cliente, Emprestimo, Parcela } from '../types';
import { generateInstallmentSchedule } from '../lib/installments';

/**
 * Wrapper fino sobre generateInstallmentSchedule (src/lib/installments.ts).
 * Antes, essa função tinha sua própria implementação duplicada — com uma
 * regra de arredondamento diferente na última parcela, o que podia causar
 * a soma das parcelas divergir do valor total devido em alguns centavos.
 * Agora ambas usam exatamente a mesma lógica (fonte única da verdade).
 */
export function gerarParcelas(
  valorPrincipal: number,
  valorTotalDevido: number,
  qtdeParcelas: number,
  diasCobranca: 'seg-sex' | 'seg-sab' | 'seg-dom',
  dataInicioISO: string,
  emprestimoId: string,
  clienteId: string,
  clienteNome: string,
  clienteTel: string
): Parcela[] {
  const parcelas = generateInstallmentSchedule({
    principal: valorPrincipal,
    totalPayable: valorTotalDevido,
    qtdeParcelas,
    dataInicioISO,
    diasCobranca,
    emprestimoId,
    clienteId,
    clienteNome,
    clienteTel,
  });

  // Mantém o comportamento original: se por algum motivo a data gerada já
  // ficou no passado (ex: refinanciamento feito após o horário de corte),
  // a parcela já nasce marcada como atrasada em vez de pendente.
  const todayISO = new Date().toISOString().split('T')[0];
  return parcelas.map((p) =>
    p.data_vencimento < todayISO ? { ...p, status: 'atrasada' as const } : p
  );
}

/**
 * Returns visual rating badge info according to customer's score
 */
export function getScoreRating(score: number) {
  if (score >= 800) {
    return {
      label: 'Excelente (Verde)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      barColor: 'bg-emerald-500',
    };
  } else if (score >= 600) {
    return {
      label: 'Regular (Amarelo)',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      barColor: 'bg-amber-500',
    };
  } else {
    return {
      label: 'Alto Risco (Vermelho)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      barColor: 'bg-rose-500',
    };
  }
}

/**
 * Sample Seed Data for instant admin dashboard experience
 */
export const INITIAL_CLIENTES: Cliente[] = [];

export function generateSeedLoansAndInstallments(): { emprestimos: Emprestimo[]; parcelas: Parcela[] } {
  return {
    emprestimos: [],
    parcelas: [],
  };
}
