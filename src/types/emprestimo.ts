export interface Emprestimo {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  valor_principal: number;
  valor_total_devido: number;
  qtde_parcelas: number;
  valor_parcela: number;
  dias_cobranca: 'seg-sex' | 'seg-sab' | 'seg-dom' | string; // support segments
  data_inicio: string;
  status: 'ativo' | 'quitado' | 'inadimplente' | 'cancelado' | 'renegociado';
  criado_em: string;
  frequencia?: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  taxa_juros?: number;
  modo_juros?: 1 | 2 | 3;
}
