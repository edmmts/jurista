import { ContatoReferencia, LeadWizardFormData, RamoAtividade, ValorCredito, PrazoCredito } from './types/lead';

export * from './types/lead';

export * from './types/cliente';
export * from './types/emprestimo';
export * from './types/parcela';
export * from './types/contrato';

export interface ContatoProximo {
  nome: string;
  whatsapp: string;
  parentesco?: string;
  relacao?: string;
}

export interface LeadFormData {
  nome: string;
  nomeResponsavel?: string;
  nomeComercio?: string;
  ramoAtividade?: RamoAtividade;
  email: string;
  whatsapp: string;
  valor: ValorCredito | number;
  prazo: PrazoCredito | number;
  tipoChavePix: 'cpf' | 'celular' | 'email' | 'chave_aleatoria';
  chavePix: string;
  enderecoPessoal: string;
  enderecoEmpresa: string;
  enderecoComercial?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato1: ContatoProximo;
  contato2: ContatoProximo;
  contato3: ContatoProximo;
  comprovanteResidenciaName?: string;
  comprovanteResidenciaUrl?: string;
  selfieName?: string;
  selfieUrl?: string;
  fachadaName?: string;
  fachadaUrl?: string;
  documentoPessoalName?: string;
  documentoPessoalUrl?: string;
}

export interface StoredLead extends LeadFormData {
  id: string;
  createdAt: string;
  status: string;
  dailyInstallment: number;
  businessDaysCount: number;
  totalValue: number;
  protocolNumber: string;
}
