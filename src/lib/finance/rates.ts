/**
 * TABELA OFICIAL DE TAXAS — fonte única da verdade.
 *
 * Antes desse arquivo, a mesma tabela (10 dias=10%, 20 dias=20%, 30 dias=30%)
 * estava duplicada em 2 lugares (simulador público e refinanciamento no
 * admin), com risco de ficarem dessincronizadas se alguém mudasse só uma.
 *
 * Isso NÃO afeta a tela "Novo Empréstimo" do admin (LoanWizard), que
 * continua permitindo negociação livre de taxa por cliente (modo 1/2/3).
 * Essa tabela é usada apenas onde a taxa é fixa e não-negociável:
 * simulador da landing page e refinanciamento/rolagem.
 */
export const TAXA_PADRAO_POR_PRAZO: Record<10 | 20 | 30, number> = {
  10: 0.10,
  20: 0.20,
  30: 0.30,
};

export function getTaxaPadrao(prazoDias: number): number {
  if (prazoDias <= 10) return TAXA_PADRAO_POR_PRAZO[10];
  if (prazoDias <= 20) return TAXA_PADRAO_POR_PRAZO[20];
  return TAXA_PADRAO_POR_PRAZO[30];
}

/** Percentual da multa por atraso (regra atual: 5% sobre o valor da parcela). */
export const PERCENTUAL_MULTA_ATRASO = 0.05;

/** Desconto para quitação antecipada (regra atual: 15% sobre o saldo devedor). */
export const PERCENTUAL_DESCONTO_QUITACAO_ANTECIPADA = 0.15;
