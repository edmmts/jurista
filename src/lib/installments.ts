import { Parcela } from '../types/parcela';

export function generateInstallmentSchedule(params: {
  principal: number;
  totalPayable: number;
  qtdeParcelas: number;
  dataInicioISO: string;
  diasCobranca: 'seg-sex' | 'seg-sab' | 'seg-dom' | string;
  checkedDays?: boolean[]; // index 0 = Sunday, 1 = Monday, etc.
  emprestimoId: string;
  clienteId: string;
  clienteNome: string;
  clienteTel: string;
}): Parcela[] {
  const {
    totalPayable,
    qtdeParcelas,
    dataInicioISO,
    diasCobranca,
    checkedDays,
    emprestimoId,
    clienteId,
    clienteNome,
    clienteTel,
  } = params;

  const parcelas: Parcela[] = [];
  const valorParcela = Math.round((totalPayable / qtdeParcelas) * 100) / 100;

  let currentDate = new Date(dataInicioISO.includes('T') ? dataInicioISO : dataInicioISO + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + 1);

  let count = 0;
  while (count < qtdeParcelas) {
    const dayOfWeek = currentDate.getDay();

    let isValidDay = false;
    if (diasCobranca === 'seg-dom') {
      isValidDay = true;
    } else if (diasCobranca === 'seg-sab') {
      isValidDay = dayOfWeek !== 0;
    } else if (diasCobranca === 'seg-sex') {
      isValidDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (checkedDays) {
      isValidDay = !!checkedDays[dayOfWeek];
    } else {
      isValidDay = true;
    }

    if (isValidDay) {
      count++;
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dataVencimento = `${yyyy}-${mm}-${dd}`;

      parcelas.push({
        id: `parc_${emprestimoId}_${count}`,
        emprestimo_id: emprestimoId,
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        cliente_tel: clienteTel,
        numero_parcela: count,
        valor_esperado: count === qtdeParcelas ? Math.round((totalPayable - valorParcela * (qtdeParcelas - 1)) * 100) / 100 : valorParcela,
        data_vencimento: dataVencimento,
        status: 'pendente',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return parcelas;
}
