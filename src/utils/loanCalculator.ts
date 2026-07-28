/**
 * Regras de Negócio do Crédito Popular:
 * - Valores: R$ 100,00 a R$ 1.000,00
 * - Prazo: 10, 20 ou 30 dias
 * - Cobrança: Parcelas diárias de segunda a sábado até as 17h00 (Domingos sem cobrança)
 */

export interface LoanCalculation {
  principal: number;
  termDays: number;
  totalPayable: number;
  businessDaysCount: number; // Quantidade de dias úteis de cobrança (seg-sáb)
  dailyInstallment: number; // Valor da parcela diária
  interestAmount: number;
}

export function calculateLoan(amount: number, termDays: 10 | 20 | 30): LoanCalculation {
  // Limitar ao intervalo de acordo com o prazo: 10 parcelas máx R$ 300; 20/30 parcelas máx R$ 1.000
  const maxAmountForTerm = termDays === 10 ? 300 : 1000;
  const validAmount = Math.max(100, Math.min(maxAmountForTerm, amount));

  const rateMultiplier = termDays === 10 ? 0.10 : termDays === 20 ? 0.20 : 0.30;
  
  const interestAmount = Math.round(validAmount * rateMultiplier);
  const totalPayable = validAmount + interestAmount;

  // Quantidade exata de parcelas diárias (10, 20 ou 30)
  const businessDaysCount = termDays;

  const dailyInstallment = Number((totalPayable / businessDaysCount).toFixed(2));

  return {
    principal: validAmount,
    termDays,
    totalPayable,
    businessDaysCount,
    dailyInstallment,
    interestAmount,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function generateProtocolNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CP-${dateStr}-${randomNum}`;
}
