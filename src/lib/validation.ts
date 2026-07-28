import { z } from 'zod';

export const ramoAtividadeEnum = z.enum([
  'Alimentação',
  'Mercearia',
  'Mercado',
  'Distribuidora',
  'Estética',
  'Vestuário',
  'Oficina',
  'Barbearia',
  'Pet Shop',
  'Construção',
  'Outros',
]);

const phoneSchema = z.string().refine((val) => {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}, {
  message: 'Informe um número de WhatsApp válido com DDD (ex: 11 99999-9999)',
});

// Step 1 Schema: Identificação Comercial
export const step1Schema = z.object({
  nomeResponsavel: z.string().min(3, 'Nome do responsável deve ter no mínimo 3 caracteres'),
  nomeComercio: z.string().min(2, 'Informe o nome do seu comércio ou atividade'),
  ramoAtividade: ramoAtividadeEnum,
  whatsapp: phoneSchema,
});

// Step 2 Schema: Capital de Giro
export const step2Schema = z.object({
  valorSolicitado: z.union([z.literal(300), z.literal(500), z.literal(800), z.literal(1000)]),
  prazo: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  tipoChavePix: z.enum(['cpf', 'celular', 'email', 'chave_aleatoria']),
  chavePix: z.string().min(3, 'Informe a chave PIX para depósito'),
});

// Reference Contact Schema
export const contatoReferenciaSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do contato'),
  relacao: z.enum(['Fornecedor', 'Cliente', 'Familiar', 'Vizinho', 'Outro', 'Parente', 'Sócio']),
  whatsapp: phoneSchema,
});

// Step 3 Schema: Localização & Referências
export const step3Schema = z.object({
  enderecoComercial: z.string().min(5, 'Informe o endereço comercial completo'),
  enderecoPessoal: z.string().min(5, 'Informe o endereço pessoal completo'),
  cidade: z.string().min(2, 'Informe a cidade'),
  estado: z.string().min(2, 'Informe o estado'),
  cep: z.string().optional(),
  contato1: contatoReferenciaSchema,
  contato2: contatoReferenciaSchema,
  contato3: contatoReferenciaSchema,
});

// Document item schema
const documentoItemSchema = z.object({
  name: z.string(),
  url: z.string().min(1, 'Documento obrigatório'),
  uploading: z.boolean().optional(),
  progress: z.number().optional(),
}).optional();

// Step 4 Schema: Documentação
export const step4Schema = z.object({
  documentos: z.object({
    fachada: documentoItemSchema,
    selfie: documentoItemSchema,
    documentoPessoal: documentoItemSchema,
    comprovanteComercial: documentoItemSchema,
  }),
});

// Combined Lead Wizard Schema
export const leadWizardSchema = z.object({
  nomeResponsavel: z.string().min(3, 'Nome do responsável é obrigatório'),
  nomeComercio: z.string().min(2, 'Nome do comércio é obrigatório'),
  ramoAtividade: ramoAtividadeEnum,
  whatsapp: phoneSchema,
  valorSolicitado: z.union([z.literal(300), z.literal(500), z.literal(800), z.literal(1000)]),
  prazo: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  tipoChavePix: z.enum(['cpf', 'celular', 'email', 'chave_aleatoria']),
  chavePix: z.string().min(3, 'Chave PIX é obrigatória'),
  enderecoComercial: z.string().min(5, 'Endereço comercial é obrigatório'),
  enderecoPessoal: z.string().min(5, 'Endereço pessoal é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string().optional(),
  contato1: contatoReferenciaSchema,
  contato2: contatoReferenciaSchema,
  contato3: contatoReferenciaSchema,
  documentos: z.object({
    fachada: documentoItemSchema,
    selfie: documentoItemSchema,
    documentoPessoal: documentoItemSchema,
    comprovanteComercial: documentoItemSchema,
  }),
});

export type LeadWizardSchemaType = z.infer<typeof leadWizardSchema>;
