import { z } from 'zod';

export const clientQuickSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().min(8, 'O telefone deve conter o DDD'),
  cpf: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  endereco: z.string().optional(),
  nomeComercio: z.string().optional(),
  cnpj: z.string().optional(),
});

export const clientKycSchema = z.object({
  nome: z.string().min(3, 'Nome completo obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().min(5, 'RG obrigatório'),
  data_nascimento: z.string().min(10, 'Data de nascimento obrigatória'),
  estado_civil: z.string().min(1, 'Selecione o estado civil'),
  endereco: z.string().min(5, 'Endereço comercial obrigatório'),
  endereco_residencial: z.string().min(5, 'Endereço residencial obrigatório'),
  profissao: z.string().min(2, 'Profissão obrigatória'),
  empresa: z.string().min(2, 'Nome da empresa obrigatório'),
  renda_mensal: z.number().min(100, 'Renda mensal deve ser superior a R$ 100'),
  chave_pix: z.string().min(4, 'Chave PIX obrigatória'),
});
