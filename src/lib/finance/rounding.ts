/**
 * Utilitários de arredondamento monetário.
 * Centraliza a regra de "sempre 2 casas decimais, sem drift de ponto flutuante"
 * usada em todos os cálculos financeiros do sistema (juros, parcelas, multas).
 */

/** Arredonda um valor para 2 casas decimais (centavos). */
export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Divide um valor total em N parcelas iguais, jogando o resto do
 * arredondamento (poucos centavos) na ÚLTIMA parcela — garante que a
 * soma das parcelas seja SEMPRE exatamente igual ao total, nunca diverge.
 */
export function distribuirEmParcelas(totalCentavos: number, qtde: number): number[] {
  const valorBase = Math.floor(totalCentavos / qtde);
  const resto = totalCentavos - valorBase * qtde;
  const valores = new Array(qtde).fill(valorBase);
  // distribui o resto (em centavos) nas últimas parcelas, 1 centavo por parcela
  for (let i = 0; i < resto; i++) {
    valores[qtde - 1 - i] += 1;
  }
  return valores;
}

/** Versão em reais (não centavos) de distribuirEmParcelas — uso mais comum no app. */
export function distribuirValorEmParcelas(total: number, qtde: number): number[] {
  const totalCentavos = Math.round(total * 100);
  return distribuirEmParcelas(totalCentavos, qtde).map((c) => c / 100);
}
