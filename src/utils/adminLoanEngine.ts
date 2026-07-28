import { Cliente, Emprestimo, Parcela } from '../types';

/**
 * Calculates due dates and generates installments for a loan, skipping non-collection days.
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
  const parcelas: Parcela[] = [];
  const valorParcela = Math.round((valorTotalDevido / qtdeParcelas) * 100) / 100;

  // First installment starts on the day after loan initiation
  let currentDate = new Date(dataInicioISO.includes('T') ? dataInicioISO : dataInicioISO + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + 1);

  let count = 0;
  while (count < qtdeParcelas) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    let isValidDay = false;
    if (diasCobranca === 'seg-dom') {
      isValidDay = true;
    } else if (diasCobranca === 'seg-sab') {
      isValidDay = dayOfWeek !== 0; // Skip Sunday
    } else if (diasCobranca === 'seg-sex') {
      isValidDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Skip Sat & Sun
    }

    if (isValidDay) {
      count++;
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dataVencimento = `${yyyy}-${mm}-${dd}`;

      // Check if past due date relative to today
      const todayISO = new Date().toISOString().split('T')[0];
      const isPast = dataVencimento < todayISO;

      parcelas.push({
        id: `parc_${emprestimoId}_${count}`,
        emprestimo_id: emprestimoId,
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        cliente_tel: clienteTel,
        numero_parcela: count,
        valor_esperado: count === qtdeParcelas ? valorTotalDevido - valorParcela * (qtdeParcelas - 1) : valorParcela,
        data_vencimento: dataVencimento,
        status: isPast ? 'atrasada' : 'pendente',
      });
    }

    // Move to next calendar day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return parcelas;
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
