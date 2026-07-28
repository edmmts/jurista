import React from 'react';
import { Lead } from '../types/lead';
import { formatCurrency } from '../lib/currency';
import { Users, DollarSign, Clock, CheckCircle, Store, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  leads: Lead[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const totalSolicitado = leads.reduce((acc, l) => acc + l.valor_solicitado, 0);
  const pendentesCount = leads.filter((l) => l.status === 'Pendente').length;
  const aprovadosCount = leads.filter((l) => l.status === 'Aprovado').length;
  const taxaAprovacao = totalLeads > 0 ? Math.round((aprovadosCount / totalLeads) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Total de Solicitantes</span>
          <Store className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-black text-white">{totalLeads} MEIs</div>
        <div className="text-[11px] text-slate-400 font-mono">Microcomércios</div>
      </div>

      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Volume em Análise</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-black text-emerald-400">{formatCurrency(totalSolicitado)}</div>
        <div className="text-[11px] text-slate-400 font-mono">Em crédito solicitado</div>
      </div>

      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Novos Pendentes</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-black text-amber-300">{pendentesCount} propostas</div>
        <div className="text-[11px] text-slate-400 font-mono">Aguardando atendimento</div>
      </div>

      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Aprovações</span>
          <CheckCircle className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-black text-cyan-300">{taxaAprovacao}%</div>
        <div className="text-[11px] text-slate-400 font-mono">{aprovadosCount} aprovados de {totalLeads}</div>
      </div>
    </div>
  );
};
