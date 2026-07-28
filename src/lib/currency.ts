export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateDailyInstallment(
  valorSolicitado: number,
  prazoDias: number,
  taxaPercent: number = 20
): {
  valorTotal: number;
  parcelaDiaria: number;
  diasCobranca: number;
} {
  const valorTotal = valorSolicitado * (1 + taxaPercent / 100);
  const parcelaDiaria = valorTotal / prazoDias;
  return {
    valorTotal: Math.round(valorTotal * 100) / 100,
    parcelaDiaria: Math.round(parcelaDiaria * 100) / 100,
    diasCobranca: prazoDias,
  };
}
