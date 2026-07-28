import { calculateInterest } from './interest';
import { generateInstallmentSchedule } from './installments';
import { Parcela } from '../types/parcela';

export interface CalculatedLoanDetails {
  principal: number;
  juros: number;
  totalPayable: number;
  taxaPercentual: number;
  valorParcela: number;
  qtdeParcelas: number;
  proximoVencimento: string;
  dataFinal: string;
  lucroEstimado: number;
  parcelas: Parcela[];
}

export function performLoanCalculation(params: {
  principal: number;
  mode: 1 | 2 | 3;
  interestValue: number;
  qtdeParcelas: number;
  diasCobranca: 'seg-sex' | 'seg-sab' | 'seg-dom' | string;
  checkedDays?: boolean[];
  dataInicioISO: string;
  clienteId: string;
  clienteNome: string;
  clienteTel: string;
  emprestimoId?: string;
}): CalculatedLoanDetails {
  const {
    principal,
    mode,
    interestValue,
    qtdeParcelas,
    diasCobranca,
    checkedDays,
    dataInicioISO,
    clienteId,
    clienteNome,
    clienteTel,
    emprestimoId = `emp_${Date.now()}`,
  } = params;

  const interestDetails = calculateInterest(principal, mode, interestValue);

  const parcelas = generateInstallmentSchedule({
    principal,
    totalPayable: interestDetails.total,
    qtdeParcelas,
    dataInicioISO,
    diasCobranca,
    checkedDays,
    emprestimoId,
    clienteId,
    clienteNome,
    clienteTel,
  });

  const proximoVencimento = parcelas.length > 0 ? parcelas[0].data_vencimento : dataInicioISO;
  const dataFinal = parcelas.length > 0 ? parcelas[parcelas.length - 1].data_vencimento : dataInicioISO;
  
  const lucroEstimado = interestDetails.juros;
  const valorParcela = parcelas.length > 0 ? parcelas[0].valor_esperado : 0;

  return {
    principal,
    juros: interestDetails.juros,
    totalPayable: interestDetails.total,
    taxaPercentual: interestDetails.taxaPercentual,
    valorParcela,
    qtdeParcelas,
    proximoVencimento,
    dataFinal,
    lucroEstimado,
    parcelas,
  };
}
