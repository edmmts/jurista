import React from 'react';
import { ValorCredito, PrazoCredito } from '../types/lead';
import { calculateDailyInstallment, formatCurrency } from '../lib/currency';
import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SummaryCardProps {
  valor: ValorCredito;
  prazo: PrazoCredito;
  nomeComercio?: string;
  nomeResponsavel?: string;
  chavePix?: string;
  tipoChavePix?: string;
  showDetails?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  valor,
  prazo,
  nomeComercio,
  nomeResponsavel,
  chavePix,
  tipoChavePix,
  showDetails = true,
}) => {
  const calc = calculateDailyInstallment(valor, prazo);

  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Resumo da Solicitação
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          Simulação
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-medium text-slate-400 block">Valor Escolhido</span>
          <span className="text-base sm:text-lg font-extrabold text-white">
            {formatCurrency(valor)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-medium text-slate-400 block">Prazo Escolhido</span>
          <span className="text-base sm:text-lg font-extrabold text-white">
            {prazo} Dias
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-300 block">Estimativa da Parcela Diária</span>
          <span className="text-xs text-slate-400">Segunda a Sábado</span>
        </div>
        <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
          {formatCurrency(calc.parcelaDiaria)} / dia
        </span>
      </div>

      {showDetails && (
        <div className="space-y-1.5 text-xs text-slate-300 pt-1">
          {nomeResponsavel && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Responsável:</span>
              <span className="font-semibold text-white">{nomeResponsavel}</span>
            </div>
          )}
          {nomeComercio && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Comércio:</span>
              <span className="font-semibold text-white">{nomeComercio}</span>
            </div>
          )}
          {chavePix && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Chave PIX:</span>
              <span className="font-semibold text-emerald-300">
                {chavePix} ({tipoChavePix?.toUpperCase() || 'PIX'})
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Total Previsto:</span>
            <span className="font-bold text-white">{formatCurrency(calc.valorTotal)}</span>
          </div>
        </div>
      )}

      {/* Informative Rule Box */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 text-[11px] text-slate-300 flex items-start gap-2.5">
        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block">Regra de Cobrança Operacional:</strong>
          <span>As cobranças acontecem de <strong>segunda a sábado até às 17h</strong>. O <strong>domingo é livre de cobrança</strong>.</span>
        </div>
      </div>
    </div>
  );
};
