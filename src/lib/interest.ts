export interface InterestCalculation {
  principal: number;
  juros: number;
  total: number;
  taxaPercentual: number;
}

export function calculateInterest(
  principal: number,
  mode: 1 | 2 | 3,
  value: number
): InterestCalculation {
  let juros = 0;
  let total = 0;
  let taxaPercentual = 0;

  if (mode === 1) {
    taxaPercentual = value;
    juros = Math.round(principal * (value / 100));
    total = principal + juros;
  } else if (mode === 2) {
    total = value;
    juros = Math.max(0, total - principal);
    taxaPercentual = principal > 0 ? Math.round((juros / principal) * 100) : 0;
  } else if (mode === 3) {
    juros = value;
    total = principal + juros;
    taxaPercentual = principal > 0 ? Math.round((juros / principal) * 100) : 0;
  }

  return {
    principal,
    juros,
    total,
    taxaPercentual,
  };
}
