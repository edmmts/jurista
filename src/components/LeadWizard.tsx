import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Store,
  Briefcase,
  Phone,
  CreditCard,
  MapPin,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';

import { LeadWizardFormData, RamoAtividade, ValorCredito, PrazoCredito, StoredLead } from '../types/lead';
import { leadWizardSchema, step4Schema } from '../lib/validation';
import { saveLeadDraft, getLeadDraft, clearLeadDraft } from '../lib/storage';
import { maskPhone, maskCEP } from '../lib/masks';
import { saveLeadToSupabase, uploadDocumentToSupabase } from '../lib/supabase';

import { ProgressBar } from './ProgressBar';
import { StepIndicator } from './StepIndicator';
import { StepHeader } from './StepHeader';
import { ValueSelector } from './ValueSelector';
import { TermSelector } from './TermSelector';
import { ContactCard } from './ContactCard';
import { UploadCard } from './UploadCard';
import { SummaryCard } from './SummaryCard';

interface LeadWizardProps {
  onComplete?: (completedLead: StoredLead) => void;
  onPartialSave?: (partialData: Partial<LeadWizardFormData>, step: number) => void;
  onClose?: () => void;
}

const RAMOS_ATIVIDADE: RamoAtividade[] = [
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
];

export const LeadWizard: React.FC<LeadWizardProps> = ({ onComplete, onPartialSave, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [protocolNumber, setProtocolNumber] = useState<string>('');

  // Initial Form values
  const initialValues: LeadWizardFormData = {
    nomeResponsavel: '',
    nomeComercio: '',
    ramoAtividade: 'Alimentação',
    whatsapp: '',
    valorSolicitado: 500,
    prazo: 20,
    tipoChavePix: 'cpf',
    chavePix: '',
    enderecoComercial: '',
    enderecoPessoal: '',
    cidade: '',
    estado: 'SP',
    cep: '',
    contato1: { nome: '', relacao: 'Fornecedor', whatsapp: '' },
    contato2: { nome: '', relacao: 'Cliente', whatsapp: '' },
    contato3: { nome: '', relacao: 'Familiar', whatsapp: '' },
    documentos: {},
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<LeadWizardFormData>({
    resolver: zodResolver(leadWizardSchema) as any,
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const formValues = watch();

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = getLeadDraft();
    if (draft?.formData) {
      Object.entries(draft.formData).forEach(([key, val]) => {
        if (val !== undefined) {
          setValue(key as any, val);
        }
      });
      if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 4) {
        setCurrentStep(draft.currentStep);
      }
    }
  }, [setValue]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Step 1 Validation & AutoSave Partial Lead
  const handleStep1Next = async () => {
    const isValid = await trigger(['nomeResponsavel', 'nomeComercio', 'ramoAtividade', 'whatsapp']);
    if (!isValid) return;

    saveLeadDraft(formValues, 1);

    if (onPartialSave) {
      onPartialSave(formValues, 1);
    }

    // Fire partial registration to Supabase
    saveLeadToSupabase({
      nome_responsavel: formValues.nomeResponsavel,
      nome_comercio: formValues.nomeComercio,
      ramo_atividade: formValues.ramoAtividade,
      telefone: formValues.whatsapp,
      status: 'Rascunho - Etapa 1',
    });

    showToast('Identificação salva em rascunho!');
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleStep2Next = async () => {
    const isValid = await trigger(['valorSolicitado', 'prazo', 'tipoChavePix', 'chavePix']);
    if (!isValid) return;

    saveLeadDraft(formValues, 2);
    if (onPartialSave) {
      onPartialSave(formValues, 2);
    }

    showToast('Valor e PIX gravados!');
    setCurrentStep(3);
  };

  // Step 3 Validation & Next
  const handleStep3Next = async () => {
    const isValid = await trigger([
      'enderecoComercial',
      'enderecoPessoal',
      'cidade',
      'estado',
      'contato1',
      'contato2',
      'contato3',
    ]);
    if (!isValid) return;

    saveLeadDraft(formValues, 3);
    if (onPartialSave) {
      onPartialSave(formValues, 3);
    }

    showToast('Localização e referências registradas!');
    setCurrentStep(4);
  };

  // Step 4 Document Upload Handler
  const handleFileUpload = async (
    docKey: 'fachada' | 'selfie' | 'documentoPessoal' | 'comprovanteComercial',
    file: File
  ) => {
    const docName = file.name;
    const localUrl = URL.createObjectURL(file);

    setValue(`documentos.${docKey}`, {
      name: docName,
      url: localUrl,
      uploading: true,
      progress: 30,
    });

    setTimeout(() => {
      setValue(`documentos.${docKey}.progress`, 70);
    }, 300);

    const publicUrl = await uploadDocumentToSupabase(file, docKey);

    setValue(`documentos.${docKey}`, {
      name: docName,
      url: publicUrl || localUrl,
      uploading: false,
      progress: 100,
    });

    trigger('documentos');
    showToast(`Arquivo "${docName}" anexado!`);
  };

  const handleFileRemove = (docKey: 'fachada' | 'selfie' | 'documentoPessoal' | 'comprovanteComercial') => {
    setValue(`documentos.${docKey}`, undefined);
    trigger('documentos');
    showToast('Documento removido.');
  };

  const handleCopyFirstContact = (targetKey: 'contato2' | 'contato3') => {
    const first = formValues.contato1;
    if (first.whatsapp) {
      setValue(`${targetKey}.whatsapp`, first.whatsapp);
      setValue(`${targetKey}.relacao`, first.relacao);
      showToast(`Telefone e relação copiados para ${targetKey === 'contato2' ? '2º' : '3º'} contato`);
    }
  };

  // Final Form Submit Handler
  const onSubmit = async (data: LeadWizardFormData) => {
    setIsSubmitting(true);
    const generatedProtocol = `CP-${Date.now().toString().slice(-6)}`;
    setProtocolNumber(generatedProtocol);

    await saveLeadToSupabase({
      nome_responsavel: data.nomeResponsavel,
      nome_comercio: data.nomeComercio,
      ramo_atividade: data.ramoAtividade,
      telefone: data.whatsapp,
      valor_solicitado: data.valorSolicitado,
      prazo_dias: data.prazo,
      chave_pix: data.chavePix,
      endereco_comercial: data.enderecoComercial,
      endereco_pessoal: data.enderecoPessoal,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      contato1_nome: data.contato1.nome,
      contato1_tel: data.contato1.whatsapp,
      contato1_relacao: data.contato1.relacao,
      contato2_nome: data.contato2.nome,
      contato2_tel: data.contato2.whatsapp,
      contato2_relacao: data.contato2.relacao,
      contato3_nome: data.contato3.nome,
      contato3_tel: data.contato3.whatsapp,
      contato3_relacao: data.contato3.relacao,
      fachada_url: data.documentos.fachada?.url,
      selfie_url: data.documentos.selfie?.url,
      documento_url: data.documentos.documentoPessoal?.url,
      comprovante_url: data.documentos.comprovanteComercial?.url,
      status: 'Pendente - Análise e Visita',
    });

    clearLeadDraft();

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(5);

      if (onComplete) {
        const storedLead: StoredLead = {
          id: `lead_${Date.now()}`,
          nome: data.nomeResponsavel,
          nomeResponsavel: data.nomeResponsavel,
          nomeComercio: data.nomeComercio,
          ramoAtividade: data.ramoAtividade,
          email: `${data.nomeResponsavel.toLowerCase().replace(/\s+/g, '.')}@cliente.local`,
          whatsapp: data.whatsapp,
          valor: data.valorSolicitado,
          prazo: data.prazo,
          tipoChavePix: data.tipoChavePix,
          chavePix: data.chavePix,
          enderecoPessoal: data.enderecoPessoal,
          enderecoEmpresa: data.enderecoComercial,
          enderecoComercial: data.enderecoComercial,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          contato1: { nome: data.contato1.nome, whatsapp: data.contato1.whatsapp, relacao: data.contato1.relacao },
          contato2: { nome: data.contato2.nome, whatsapp: data.contato2.whatsapp, relacao: data.contato2.relacao },
          contato3: { nome: data.contato3.nome, whatsapp: data.contato3.whatsapp, relacao: data.contato3.relacao },
          createdAt: new Date().toISOString(),
          status: 'Visita Agendada',
          dailyInstallment: (data.valorSolicitado * 1.2) / data.prazo,
          businessDaysCount: data.prazo,
          totalValue: data.valorSolicitado * 1.2,
          protocolNumber: generatedProtocol,
        };
        onComplete(storedLead);
      }
    }, 1200);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Identificação Comercial';
      case 2: return 'Capital de Giro';
      case 3: return 'Localização e Referências';
      case 4: return 'Documentação Simplificada';
      case 5: return 'Solicitação Recebida!';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Crédito exclusivo para MEI, Autônomos e Pequenos Comércios';
      case 2: return 'Selecione o valor, o prazo e informe sua chave PIX';
      case 3: return 'Endereço para a visita presencial e 3 contatos de referência';
      case 4: return 'Anexe as fotos solicitadas para validação rápida';
      case 5: return 'Nossa equipe entrará em contato via WhatsApp para agendar a visita';
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/95 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-4 sm:p-7 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-4 right-4 z-50 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold text-xs flex items-center justify-between shadow-xl shadow-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{toastMessage}</span>
            </div>
            <button type="button" onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <StepHeader
        currentStep={currentStep}
        title={getStepTitle()}
        subtitle={getStepSubtitle()}
        onBack={currentStep > 1 && currentStep < 5 ? () => setCurrentStep((prev) => prev - 1) : undefined}
        onClose={onClose}
      />

      {/* Step Indicator & Progress Bar */}
      {currentStep < 5 && (
        <div className="my-4 space-y-3">
          <StepIndicator currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />
          <ProgressBar currentStep={currentStep} />
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit((data) => onSubmit(data as LeadWizardFormData))} className="space-y-6 mt-4">
        <AnimatePresence mode="wait">
          {/* PASSO 1: IDENTIFICAÇÃO COMERCIAL */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Pré-Cadastro Protegido:</strong> Seus dados serão salvos em rascunho para você não perder tempo.
                </span>
              </div>

              {/* Nome do Responsável */}
              <div className="space-y-1.5">
                <label htmlFor="nomeResponsavel" className="block text-xs font-bold text-slate-200">
                  Nome Completo do Responsável <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="nomeResponsavel"
                    type="text"
                    placeholder="Ex: João Carlos da Silva"
                    {...register('nomeResponsavel')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
                  />
                </div>
                {errors.nomeResponsavel && (
                  <p className="text-xs text-rose-400 font-medium">{errors.nomeResponsavel.message}</p>
                )}
              </div>

              {/* Nome do Comércio */}
              <div className="space-y-1.5">
                <label htmlFor="nomeComercio" className="block text-xs font-bold text-slate-200">
                  Nome do Comércio ou Atividade <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="nomeComercio"
                    type="text"
                    placeholder="Ex: Mercearia do João ou Barbeiro Autônomo"
                    {...register('nomeComercio')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
                  />
                </div>
                {errors.nomeComercio && (
                  <p className="text-xs text-rose-400 font-medium">{errors.nomeComercio.message}</p>
                )}
              </div>

              {/* Ramo de Atividade (Select) */}
              <div className="space-y-1.5">
                <label htmlFor="ramoAtividade" className="block text-xs font-bold text-slate-200">
                  Ramo de Atividade <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    id="ramoAtividade"
                    {...register('ramoAtividade')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px] cursor-pointer"
                  >
                    {RAMOS_ATIVIDADE.map((ramo) => (
                      <option key={ramo} value={ramo} className="bg-slate-950 text-white">
                        {ramo}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.ramoAtividade && (
                  <p className="text-xs text-rose-400 font-medium">{errors.ramoAtividade.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="block text-xs font-bold text-slate-200">
                  WhatsApp com DDD <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <Controller
                    name="whatsapp"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
                      />
                    )}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-xs text-rose-400 font-medium">{errors.whatsapp.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] cursor-pointer glow-emerald"
                >
                  <span>Continuar para Capital de Giro</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 2: CAPITAL DE GIRO */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Valor Selector */}
              <Controller
                name="valorSolicitado"
                control={control}
                render={({ field }) => (
                  <ValueSelector
                    selectedValue={field.value as ValorCredito}
                    onSelectValue={(val) => field.onChange(val)}
                    error={errors.valorSolicitado?.message}
                  />
                )}
              />

              {/* Term Selector */}
              <Controller
                name="prazo"
                control={control}
                render={({ field }) => (
                  <TermSelector
                    selectedTerm={field.value as PrazoCredito}
                    onSelectTerm={(term) => field.onChange(term)}
                    error={errors.prazo?.message}
                  />
                )}
              />

              {/* Dynamic Loan Summary Card */}
              <SummaryCard
                valor={formValues.valorSolicitado}
                prazo={formValues.prazo}
                nomeComercio={formValues.nomeComercio}
                nomeResponsavel={formValues.nomeResponsavel}
                showDetails={false}
              />

              {/* Chave PIX */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Tipo de Chave PIX para Recebimento <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                  {[
                    { id: 'cpf', label: 'CPF' },
                    { id: 'celular', label: 'Celular' },
                    { id: 'email', label: 'E-mail' },
                    { id: 'chave_aleatoria', label: 'Aleatória' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setValue('tipoChavePix', t.id as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                        formValues.tipoChavePix === t.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    placeholder="Digite sua chave PIX aqui..."
                    {...register('chavePix')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
                  />
                </div>
                {errors.chavePix && (
                  <p className="text-xs text-rose-400 font-medium">{errors.chavePix.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] cursor-pointer glow-emerald"
                >
                  <span>Continuar para Localização</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: LOCALIZAÇÃO & REFERÊNCIAS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Endereços do Negócio e Residência
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Endereço Comercial */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Endereço Comercial <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rua, nº, Bairro da Loja/Bancada"
                      {...register('enderecoComercial')}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none min-h-[48px]"
                    />
                    {errors.enderecoComercial && (
                      <p className="text-[10px] text-rose-400">{errors.enderecoComercial.message}</p>
                    )}
                  </div>

                  {/* Endereço Pessoal */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Endereço Pessoal <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rua, nº, Bairro da Residência"
                      {...register('enderecoPessoal')}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none min-h-[48px]"
                    />
                    {errors.enderecoPessoal && (
                      <p className="text-[10px] text-rose-400">{errors.enderecoPessoal.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">Cidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      {...register('cidade')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white min-h-[44px]"
                    />
                    {errors.cidade && <p className="text-[10px] text-rose-400">{errors.cidade.message}</p>}
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">Estado *</label>
                    <input
                      type="text"
                      placeholder="Ex: SP"
                      {...register('estado')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white min-h-[44px]"
                    />
                    {errors.estado && <p className="text-[10px] text-rose-400">{errors.estado.message}</p>}
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">CEP</label>
                    <Controller
                      name="cep"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="00000-000"
                          onChange={(e) => field.onChange(maskCEP(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white min-h-[44px]"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 3 Contatos de Referência */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between uppercase tracking-wider">
                  <span>3 Contatos de Referência Pessoal/Comercial</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Obrigatório 3 referências</span>
                </h3>

                <Controller
                  name="contato1"
                  control={control}
                  render={({ field }) => (
                    <ContactCard
                      index={1}
                      contact={field.value}
                      onChange={(val) => field.onChange(val)}
                      errors={errors.contato1 as any}
                    />
                  )}
                />

                <Controller
                  name="contato2"
                  control={control}
                  render={({ field }) => (
                    <ContactCard
                      index={2}
                      contact={field.value}
                      onChange={(val) => field.onChange(val)}
                      onCopyFromFirst={() => handleCopyFirstContact('contato2')}
                      errors={errors.contato2 as any}
                    />
                  )}
                />

                <Controller
                  name="contato3"
                  control={control}
                  render={({ field }) => (
                    <ContactCard
                      index={3}
                      contact={field.value}
                      onChange={(val) => field.onChange(val)}
                      onCopyFromFirst={() => handleCopyFirstContact('contato3')}
                      errors={errors.contato3 as any}
                    />
                  )}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStep3Next}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] cursor-pointer glow-emerald"
                >
                  <span>Continuar para Documentação</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 4: DOCUMENTAÇÃO */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-300">
                Anexe os documentos solicitados para agilizar sua pré-análise e agendamento da visita.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Fachada */}
                <UploadCard
                  id="fachada"
                  title="Foto da Fachada"
                  description="Foto da frente da loja, ponto comercial ou bancada"
                  isRequired={true}
                  docItem={formValues.documentos?.fachada}
                  onUpload={(f) => handleFileUpload('fachada', f)}
                  onRemove={() => handleFileRemove('fachada')}
                />

                {/* 2. Selfie com capture="user" */}
                <UploadCard
                  id="selfie"
                  title="Selfie do Responsável"
                  description="Selfie nítida do rosto segurando seu RG ou CNH"
                  isRequired={true}
                  isSelfie={true}
                  docItem={formValues.documentos?.selfie}
                  onUpload={(f) => handleFileUpload('selfie', f)}
                  onRemove={() => handleFileRemove('selfie')}
                />

                {/* 3. Documento Pessoal */}
                <UploadCard
                  id="documentoPessoal"
                  title="Documento Pessoal"
                  description="Frente e verso do RG, CNH ou Carteira Profissional"
                  isRequired={true}
                  docItem={formValues.documentos?.documentoPessoal}
                  onUpload={(f) => handleFileUpload('documentoPessoal', f)}
                  onRemove={() => handleFileRemove('documentoPessoal')}
                />

                {/* 4. Comprovante Comercial */}
                <UploadCard
                  id="comprovanteComercial"
                  title="Comprovante de Endereço Comercial"
                  description="Conta de Luz, Água, Telefone ou Fornecedor"
                  isRequired={true}
                  docItem={formValues.documentos?.comprovanteComercial}
                  onUpload={(f) => handleFileUpload('comprovanteComercial', f)}
                  onRemove={() => handleFileRemove('comprovanteComercial')}
                />
              </div>

              {errors.documentos && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Anexe pelo menos um documento para continuar.</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] cursor-pointer glow-emerald disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enviando solicitação...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
                      <span>Finalizar e Solicitar Pré-Análise</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 5: CONFIRMAÇÃO & SUCESSO */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-4 text-center space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Protocolo: {protocolNumber}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Recebemos sua solicitação.
                </h2>

                <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Nossa equipe realizará uma pré-análise e entrará em contato pelo WhatsApp para agendar uma visita ao seu estabelecimento.
                </p>
              </div>

              {/* Complete Summary Card */}
              <SummaryCard
                valor={formValues.valorSolicitado}
                prazo={formValues.prazo}
                nomeResponsavel={formValues.nomeResponsavel}
                nomeComercio={formValues.nomeComercio}
                chavePix={formValues.chavePix}
                tipoChavePix={formValues.tipoChavePix}
                showDetails={true}
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    else window.location.reload();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all min-h-[52px] cursor-pointer glow-emerald"
                >
                  Voltar para a página inicial
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
