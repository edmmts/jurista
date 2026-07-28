export type RamoAtividade =
  | 'Alimentação'
  | 'Mercearia'
  | 'Mercado'
  | 'Distribuidora'
  | 'Estética'
  | 'Vestuário'
  | 'Oficina'
  | 'Barbearia'
  | 'Pet Shop'
  | 'Construção'
  | 'Outros';

export type ValorCredito = 300 | 500 | 800 | 1000;
export type PrazoCredito = 10 | 20 | 30;

export type TipoRelacao = 'Fornecedor' | 'Cliente' | 'Familiar' | 'Vizinho' | 'Outro' | 'Parente' | 'Sócio';

export interface ContatoReferencia {
  nome: string;
  relacao: TipoRelacao;
  whatsapp: string;
}

export interface DocumentoItem {
  name: string;
  url: string;
  uploading?: boolean;
  progress?: number;
}

export interface DocumentosLeadWizard {
  fachada?: DocumentoItem;
  selfie?: DocumentoItem;
  documentoPessoal?: DocumentoItem;
  comprovanteComercial?: DocumentoItem;
}

export interface LeadWizardFormData {
  nomeResponsavel: string;
  nomeComercio: string;
  ramoAtividade: RamoAtividade;
  whatsapp: string;
  valorSolicitado: ValorCredito;
  prazo: PrazoCredito;
  tipoChavePix: 'cpf' | 'celular' | 'email' | 'chave_aleatoria';
  chavePix: string;
  enderecoComercial: string;
  enderecoPessoal: string;
  cidade: string;
  estado: string;
  cep?: string;
  contato1: ContatoReferencia;
  contato2: ContatoReferencia;
  contato3: ContatoReferencia;
  documentos: DocumentosLeadWizard;
}

export type LeadStatus =
  | 'Rascunho'
  | 'Pendente'
  | 'Em Análise'
  | 'Visita Agendada'
  | 'Aprovado'
  | 'Recusado';

export type LeadPrioridade = 'Alta' | 'Média' | 'Baixa' | 'Aguardando';

export interface Contato {
  nome: string;
  tipo: TipoRelacao;
  telefone: string;
}

export interface DocumentosLead {
  selfie?: string;
  documento?: string;
  comprovante_comercial?: string;
  comprovante_residencial?: string;
  cartao_cnpj?: string;
  fachada?: string;
}

export interface TimelineItem {
  id: string;
  titulo: string;
  dataHora: string;
  autor?: string;
}

export interface ObservacaoItem {
  id: string;
  texto: string;
  dataHora: string;
  autor: string;
}

export interface Lead {
  id: string;
  nome_responsavel: string;
  nome_comercio: string;
  ramo_atividade: RamoAtividade;
  telefone: string;
  email: string;
  valor_solicitado: ValorCredito;
  prazo: PrazoCredito;
  pix: string;
  tipo_pix?: string;
  endereco_comercial: string;
  endereco_pessoal: string;
  cidade: string;
  estado: string;
  score_interno: number;
  foto_url?: string;
  logo_url?: string;
  contatos: Contato[];
  documentos: DocumentosLead;
  timeline: TimelineItem[];
  observacoes: ObservacaoItem[];
  status: LeadStatus;
  prioridade: LeadPrioridade;
  created_at: string;
}

export interface SupabaseLead {
  id?: string;
  nome?: string;
  nome_responsavel?: string;
  nome_comercio?: string;
  ramo_atividade?: string;
  email?: string;
  telefone?: string;
  valor_solicitado?: number;
  prazo_dias?: number;
  chave_pix?: string;
  endereco_pessoal?: string;
  endereco_empresa?: string;
  endereco_comercial?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato1_nome?: string;
  contato1_tel?: string;
  contato1_relacao?: string;
  contato2_nome?: string;
  contato2_tel?: string;
  contato2_relacao?: string;
  contato3_nome?: string;
  contato3_tel?: string;
  contato3_relacao?: string;
  comprovante_url?: string;
  selfie_url?: string;
  fachada_url?: string;
  documento_url?: string;
  status?: string;
  criado_em?: string;
}

export interface StoredLead {
  id: string;
  nome: string;
  nomeResponsavel?: string;
  nomeComercio?: string;
  ramoAtividade?: RamoAtividade;
  email: string;
  whatsapp: string;
  valor: number;
  prazo: number;
  tipoChavePix: string;
  chavePix: string;
  enderecoPessoal: string;
  enderecoEmpresa: string;
  enderecoComercial?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato1: { nome: string; whatsapp: string; relacao?: string };
  contato2: { nome: string; whatsapp: string; relacao?: string };
  contato3: { nome: string; whatsapp: string; relacao?: string };
  createdAt: string;
  status: string;
  dailyInstallment: number;
  businessDaysCount: number;
  totalValue: number;
  protocolNumber: string;
}
