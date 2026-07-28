import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { LeadCard } from './LeadCard';
import { formatCurrency } from '../lib/currency';
import { Sparkles, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: LeadStatus;
  title: string;
  icon: React.ReactNode;
  colorTheme: {
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    headerBg: string;
  };
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDropLead: (leadId: string, newStatus: LeadStatus) => void;
  onQuickMoveStatus: (leadId: string, newStatus: LeadStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  icon,
  colorTheme,
  leads,
  onSelectLead,
  onDropLead,
  onQuickMoveStatus,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalColumnValue = leads.reduce((acc, l) => acc + l.valor_solicitado, 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onDropLead(leadId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col min-w-[290px] max-w-[340px] flex-1 rounded-3xl bg-slate-950/70 border transition-all duration-200 overflow-hidden ${
        isDragOver
          ? 'border-emerald-500 bg-emerald-950/10 shadow-2xl shadow-emerald-500/20 scale-[1.01]'
          : colorTheme.borderColor
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 border-b border-slate-800/80 ${colorTheme.headerBg} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              {icon}
            </span>
            <h3 className="font-extrabold text-white text-sm tracking-wide">{title}</h3>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${colorTheme.badgeBg} ${colorTheme.badgeText}`}
          >
            {leads.length}
          </span>
        </div>

        {/* Column Volume Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Volume em Carteira</span>
          <span className="font-bold text-emerald-400">{formatCurrency(totalColumnValue)}</span>
        </div>
      </div>

      {/* Leads Container */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[500px] max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-slate-800">
        {leads.length === 0 ? (
          <div className="h-48 border-2 border-dashed border-slate-800/60 rounded-3xl flex flex-col items-center justify-center text-center p-4 text-slate-600 space-y-2">
            <Inbox className="w-8 h-8 text-slate-700 stroke-[1.5]" />
            <p className="text-xs font-medium">Nenhum MEI neste estágio</p>
            <p className="text-[10px] text-slate-600">Arraste ou receba novos leads aqui</p>
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
              <LeadCard
                lead={lead}
                onSelectLead={onSelectLead}
                onQuickMoveStatus={onQuickMoveStatus}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
