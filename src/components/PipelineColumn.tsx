import React from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { LeadCard } from './LeadCard';
import { Layers, FolderOpen } from 'lucide-react';

interface ColumnConfig {
  id: LeadStatus;
  title: string;
  badgeBg: string;
  borderColor: string;
}

const COLUMN_CONFIGS: Record<LeadStatus, ColumnConfig> = {
  Rascunho: {
    id: 'Rascunho',
    title: '0. Rascunhos',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    borderColor: 'border-slate-500/30',
  },
  Pendente: {
    id: 'Pendente',
    title: '1. Novos Pendentes',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/30',
  },
  'Em Análise': {
    id: 'Em Análise',
    title: '2. Em Análise',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    borderColor: 'border-cyan-500/30',
  },
  'Visita Agendada': {
    id: 'Visita Agendada',
    title: '3. Visita Agendada',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-500/30',
  },
  Aprovado: {
    id: 'Aprovado',
    title: '4. Aprovados',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/30',
  },
  Recusado: {
    id: 'Recusado',
    title: '5. Recusados',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/30',
  },
};

interface PipelineColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDropLead?: (leadId: string, targetStatus: LeadStatus) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  status,
  leads,
  onSelectLead,
  onDropLead,
}) => {
  const config = COLUMN_CONFIGS[status] || COLUMN_CONFIGS.Pendente;

  const totalColumnValue = leads.reduce((acc, l) => acc + l.valor_solicitado, 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId && onDropLead) {
      onDropLead(leadId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-1 min-w-[280px] max-w-[340px] rounded-3xl bg-slate-900/50 border ${config.borderColor} p-4 flex flex-col justify-between space-y-4 backdrop-blur-sm shadow-xl`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-white tracking-tight">{config.title}</h3>
          <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${config.badgeBg}`}>
            {leads.length}
          </span>
        </div>

        {totalColumnValue > 0 && (
          <span className="text-[11px] font-mono text-slate-400 font-bold">
            R$ {totalColumnValue.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-3 min-h-[300px] overflow-y-auto pr-1">
        {leads.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 my-auto">
            <FolderOpen className="w-8 h-8 opacity-40" />
            <p>Nenhuma solicitação aqui</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', lead.id);
              }}
            >
              <LeadCard lead={lead} onSelectLead={onSelectLead} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
