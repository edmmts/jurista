import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cliente } from '../../types/cliente';
import { Emprestimo } from '../../types/emprestimo';
import { Parcela } from '../../types/parcela';
import { ContratoAuditLog } from '../../types/contrato';
import { ClientSelector } from './ClientSelector';
import { QuickClientModal } from './QuickClientModal';
import { LoanCalculator } from './LoanCalculator';
import { InstallmentsPreview } from './InstallmentsPreview';
import { ContractSummary } from './ContractSummary';
import { IncompleteProfileBanner } from './IncompleteProfileBanner';
import { performLoanCalculation, CalculatedLoanDetails } from '../../lib/loanEngine';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';

interface LoanWizardProps {
  clientes: Cliente[];
  onAddClient: (c: Cliente) => void;
  onSaveLoan: (emp: Emprestimo, parcs: Parcela[], auditLogs: ContratoAuditLog[]) => void;
  onClose: () => void;
}

export const LoanWizard: React.FC<LoanWizardProps> = ({
  clientes,
  onAddClient,
  onSaveLoan,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);

  // Financial States
  const [principal, setPrincipal] = useState<number>(300);
  const [frequency, setFrequency] = useState<'diario' | 'semanal' | 'quinzenal' | 'mensal'>('diario');
  const [term, setTerm] = useState<number>(20);
  const [interestMode, setInterestMode] = useState<1 | 2 | 3>(1);
  const [interestValue, setInterestValue] = useState<number>(20); // 20% by default
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [diasCobranca, setDiasCobranca] = useState<string>('seg-sex');
  const [checkedDays, setCheckedDays] = useState<boolean[]>([false, true, true, true, true, true, false]); // Mon-Fri default

  // Calculation Results
  const [calcResult, setCalcResult] = useState<CalculatedLoanDetails | null>(null);

  // Audit Logs (Timeline)
  const [auditLogs, setAuditLogs] = useState<ContratoAuditLog[]>([]);

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

  const addAuditLog = (evento: string, detalhes?: string) => {
    const newLog: ContratoAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      evento,
      autor: 'Administrador',
      data_hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      detalhes,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Run calculation
  const handleCalculate = () => {
    if (!selectedCliente) return;
    const res = performLoanCalculation({
      principal,
      mode: interestMode,
      interestValue,
      qtdeParcelas: term,
      diasCobranca,
      checkedDays,
      dataInicioISO: startDate,
      clienteId: selectedCliente.id,
      clienteNome: selectedCliente.nome,
      clienteTel: selectedCliente.telefone,
    });
    setCalcResult(res);
  };

  useEffect(() => {
    if (selectedCliente) {
      handleCalculate();
    }
  }, [selectedClienteId]);

  // Log key adjustments
  const prevPrincipal = React.useRef(principal);
  useEffect(() => {
    if (step > 1 && principal !== prevPrincipal.current) {
      addAuditLog('Valor principal alterado', `Novo valor: R$ ${principal}`);
      prevPrincipal.current = principal;
    }
  }, [principal]);

  const prevInterestVal = React.useRef(interestValue);
  useEffect(() => {
    if (step > 1 && interestValue !== prevInterestVal.current) {
      addAuditLog('Parâmetro de taxa alterado', `Novo valor: ${interestValue}`);
      prevInterestVal.current = interestValue;
    }
  }, [interestValue]);

  const handleNext = () => {
    if (step === 1 && !selectedClienteId) return;
    if (step === 1) {
      addAuditLog('Cliente selecionado', selectedCliente?.nome);
    }
    if (step === 2) {
      addAuditLog('Configuração financeira salva', `Total: R$ ${calcResult?.totalPayable}`);
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinalize = () => {
    if (!selectedCliente || !calcResult) return;

    const newLoan: Emprestimo = {
      id: `emp_${Date.now()}`,
      cliente_id: selectedCliente.id,
      cliente_nome: selectedCliente.nome,
      valor_principal: calcResult.principal,
      valor_total_devido: calcResult.totalPayable,
      qtde_parcelas: calcResult.qtdeParcelas,
      valor_parcela: calcResult.valorParcela,
      dias_cobranca: diasCobranca,
      data_inicio: startDate,
      status: 'ativo',
      criado_em: new Date().toISOString(),
      frequencia: frequency,
      taxa_juros: calcResult.taxaPercentual,
      modo_juros: interestMode,
    };

    onSaveLoan(newLoan, calcResult.parcelas, auditLogs);
    setStep(4);
  };

  const getWhatsAppLink = () => {
    if (!selectedCliente) return '';
    const phone = selectedCliente.telefone;
    const msg = `Olá, ${selectedCliente.nome}.\n\nSeu contrato de empréstimo foi gerado e aprovado com sucesso!\n\nUse os dados abaixo para acompanhar pela Área do Cliente:\n🌐 Site: https://meucredito.app/login\n👤 Usuário: ${selectedCliente.cpf || 'Seu CPF'}\n🔑 Senha inicial: ${phone.slice(-4)}\n\nQualquer dúvida, estamos à disposição.`;
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  const maxLimit = selectedCliente ? selectedCliente.limite_disponivel : 1000;

  return (
    <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-xs text-white">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-extrabold text-white">Novo Contrato de Empréstimo</h2>
          <p className="text-[10px] text-slate-400">Motor de Empréstimos e Geração de Parcelas</p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
        >
          Voltar ao Painel
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
        {[
          { num: 1, label: 'Cliente' },
          { num: 2, label: 'Financeiro' },
          { num: 3, label: 'Resumo & Parcelas' },
          { num: 4, label: 'WhatsApp & Acesso' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step === s.num
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : step > s.num
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {s.num}
            </span>
            <span className={`hidden sm:inline font-bold ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Incomplete profile warning */}
      {selectedCliente && (
        <IncompleteProfileBanner
          cliente={selectedCliente}
          onCompleteClick={() => {
            // Emite aviso para completar cadastro
            alert('Por favor, edite a ficha cadastral do cliente na aba Detalhes do Cliente do Painel Administrativo.');
          }}
        />
      )}

      {/* Step Panels */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <ClientSelector
                clientes={clientes}
                selectedClienteId={selectedClienteId}
                onSelect={(id) => setSelectedClienteId(id)}
                onAddNewClientClick={() => setIsQuickClientOpen(true)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LoanCalculator
                principal={principal}
                setPrincipal={setPrincipal}
                frequency={frequency}
                setFrequency={setFrequency}
                term={term}
                setTerm={setTerm}
                interestMode={interestMode}
                setInterestMode={setInterestMode}
                interestValue={interestValue}
                setInterestValue={setInterestValue}
                startDate={startDate}
                setStartDate={setStartDate}
                diasCobranca={diasCobranca}
                setDiasCobranca={setDiasCobranca}
                checkedDays={checkedDays}
                setCheckedDays={setCheckedDays}
                onCalculate={handleCalculate}
                maxAuthorizedLimit={maxLimit}
              />
            </motion.div>
          )}

          {step === 3 && calcResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <ContractSummary
                clienteNome={selectedCliente?.nome || ''}
                principal={calcResult.principal}
                juros={calcResult.juros}
                total={calcResult.totalPayable}
                taxaPercentual={calcResult.taxaPercentual}
                qtdeParcelas={calcResult.qtdeParcelas}
                valorParcela={calcResult.valorParcela}
                primeiroVencimento={calcResult.proximoVencimento}
                ultimoVencimento={calcResult.dataFinal}
              />

              <InstallmentsPreview parcelas={calcResult.parcelas} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4 max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Contrato Gerado com Sucesso!</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  O cronograma de parcelas e o limite rotativo do cliente foram atualizados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-left border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mensagem WhatsApp</span>
                <p className="text-[10px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  Olá, {selectedCliente?.nome}. seu contrato de empréstimo foi aprovado! Acesse em https://meucredito.app/login. CPF / Senha final telefone.
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-center flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950 stroke-none" />
                  <span>Enviar por WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Concluir e Voltar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {step < 4 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-850">
          <button
            type="button"
            disabled={step === 1}
            onClick={handleBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !selectedClienteId}
              onClick={handleNext}
              className="px-4 py-2 bg-emerald-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-black rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed text-[11px]"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalize}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <span>Aprovar e Liberar Crédito</span>
              <CheckCircle2 className="w-4 h-4 fill-slate-950 stroke-none" />
            </button>
          )}
        </div>
      )}

      {/* Quick Client Insertion Modal */}
      <QuickClientModal
        isOpen={isQuickClientOpen}
        onClose={() => setIsQuickClientOpen(false)}
        onSave={onAddClient}
      />
    </div>
  );
};
