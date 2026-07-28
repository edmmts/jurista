import React from 'react';
import { Emprestimo } from '../../types/emprestimo';
import { Parcela } from '../../types/parcela';
import { MessageSquare, RefreshCw, Award } from 'lucide-react';

interface ContractActionsProps {
  activeLoan: Emprestimo;
  activeParcelas: Parcela[];
  onRefinance: (activeLoan: Emprestimo, activeParcelas: Parcela[]) => void;
  onPayoff: () => void;
  onSendCobrança: () => void;
}

export const ContractActions: React.FC<ContractActionsProps> = ({
  activeLoan,
  activeParcelas,
  onRefinance,
  onPayoff,
  onSendCobrança,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onSendCobrança}
        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Enviar Cobrança WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={() => onRefinance(activeLoan, activeParcelas)}
        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-4 h-4" />
        <span>🔄 Renegociar / Refin (Rolagem)</span>
      </button>

      <button
        type="button"
        onClick={onPayoff}
        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Award className="w-4 h-4" />
        <span>💰 Quitação Antecipada (15% Desc)</span>
      </button>
    </div>
  );
};
