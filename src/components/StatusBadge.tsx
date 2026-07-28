import React from 'react';
import { LeadStatus, LeadPrioridade } from '../types/lead';
import { getPriorityConfig } from '../lib/priority';

interface StatusBadgeProps {
  status?: LeadStatus;
  prioridade?: LeadPrioridade;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, prioridade, size = 'md' }) => {
  if (prioridade) {
    const cfg = getPriorityConfig(prioridade);
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
      <span className={`inline-flex items-center font-bold rounded-full border ${cfg.bg} ${sizeClasses}`}>
        {cfg.label}
      </span>
    );
  }

  if (status) {
    const statusConfig: Record<LeadStatus, { label: string; bg: string }> = {
      Rascunho: {
        label: 'Rascunho',
        bg: 'bg-slate-500/15 border-slate-500/40 text-slate-300',
      },
      Pendente: {
        label: 'Pendente',
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      },
      'Em Análise': {
        label: 'Em Análise',
        bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      },
      'Visita Agendada': {
        label: 'Visita Agendada',
        bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
      },
      Aprovado: {
        label: 'Aprovado',
        bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      },
      Recusado: {
        label: 'Recusado',
        bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      },
    };

    const cfg = statusConfig[status] || statusConfig.Pendente;
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
      <span className={`inline-flex items-center font-extrabold rounded-full border ${cfg.bg} ${sizeClasses}`}>
        {cfg.label}
      </span>
    );
  }

  return null;
};
