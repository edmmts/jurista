import { LeadPrioridade } from '../types/lead';

export function getPriorityConfig(prioridade: LeadPrioridade = 'Média') {
  switch (prioridade) {
    case 'Alta':
      return {
        label: '🟢 Alta',
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        barBg: 'bg-emerald-500',
      };
    case 'Média':
      return {
        label: '🟡 Média',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        barBg: 'bg-amber-500',
      };
    case 'Baixa':
      return {
        label: '🔵 Baixa',
        bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        barBg: 'bg-cyan-500',
      };
    case 'Aguardando':
    default:
      return {
        label: '🔴 Aguardando',
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        barBg: 'bg-rose-500',
      };
  }
}
