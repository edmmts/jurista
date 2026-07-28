export interface Parcela {
  id: string;
  emprestimo_id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_tel: string;
  numero_parcela: number;
  valor_esperado: number;
  data_vencimento: string;
  status: 'pendente' | 'paga' | 'atrasada' | 'cancelada' | 'renegociada';
  valor_pago?: number;
  data_pagamento?: string;
  multa_aplicada?: boolean;
  valor_multa?: number;
}
