export interface ContratoAnexo {
  id: string;
  nome: string;
  url: string;
  tipo: 'documento' | 'selfie' | 'comprovante' | 'outros';
  criado_em: string;
}

export interface ContratoObservacao {
  id: string;
  texto: string;
  autor: string;
  criado_em: string;
}

export interface ContratoAuditLog {
  id: string;
  evento: string;
  autor: string;
  data_hora: string;
  detalhes?: string;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  emprestimo_id: string;
  valor_principal: number;
  valor_total: number;
  taxa_porcentagem: number;
  prazo_parcelas: number;
  data_inicio: string;
  data_vencimento_final: string;
  status: 'Ativo' | 'Quitado' | 'Em Atraso' | 'Cancelado' | 'Renegociado';
  anexos: ContratoAnexo[];
  observacoes: ContratoObservacao[];
  historico_auditoria: ContratoAuditLog[];
}
