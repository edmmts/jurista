export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  limite_total: number;
  limite_disponivel: number;
  score: number;
  status: 'Ativo' | 'Bloqueado' | 'Em Análise';
  criado_em: string;
  foto_url?: string;
  logo_url?: string;
  contatos?: { nome: string; tel: string }[];
  // KYC fields
  rg?: string;
  data_nascimento?: string;
  estado_civil?: string;
  endereco_residencial?: string;
  profissao?: string;
  empresa?: string;
  renda_mensal?: number;
  chave_pix?: string;
  comprovante_residencia_url?: string;
  selfie_url?: string;
  doc_url?: string;
  // Registration completeness indicators
  cadastro_completo?: boolean;
}
