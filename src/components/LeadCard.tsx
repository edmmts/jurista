import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { formatCurrency, calculateDailyInstallment } from '../lib/currency';
import { timeAgo } from '../lib/date';
import { getPriorityConfig } from '../lib/priority';
import { StatusBadge } from './StatusBadge';
import {
  MapPin,
  Clock,
  ChevronRight,
  Store,
  User,
  MoreVertical,
  Calendar,
  Check,
  ArrowRight,
  MessageCircle,
  Phone,
  Tag,
} from 'lucide-react';
import { getCleanPhone } from '../lib/phone';

interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onQuickMoveStatus?: (leadId: string, newStatus: LeadStatus) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelectLead, onQuickMoveStatus }) => {
  const [showMenu, setShowMenu] = useState(false);

  const { parcelaDiaria } = calculateDailyInstallment(lead.valor_solicitado, lead.prazo);
  const priorityCfg = getPriorityConfig(lead.prioridade);

  const digitsPhone = getCleanPhone(lead.telefone);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  return (
    <div
      onClick={() => onSelectLead(lead)}
      className="group relative p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer overflow-hidden space-y-3"
    >
      {/* Top Priority Bar Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${priorityCfg.barBg}`} />

      {/* Header Row: Commerce Name (Major Highlight) + Actions */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-white text-sm overflow-hidden shrink-0 shadow-md">
            {lead.logo_url ? (
              <img src={lead.logo_url} alt={lead.nome_comercio} className="w-full h-full object-cover" />
            ) : lead.foto_url ? (
              <img src={lead.foto_url} alt={lead.nome_comercio} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
              {lead.nome_comercio}
            </h4>
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              <span className="truncate">{lead.nome_responsavel}</span>
            </p>
          </div>
        </div>

        <div className="relative shrink-0 flex items-center gap-1">
          <StatusBadge prioridade={lead.prioridade} size="sm" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Ações Rápidas"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Quick Actions Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-30 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Mover Estágio</div>
              <button
                onClick={(e) => handleActionClick(e, () => onQuickMoveStatus?.(lead.id, 'Em Análise'))}
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-slate-900 transition-colors flex items-center justify-between"
              >
                <span>Em Análise</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>

              <button
                onClick={(e) => handleActionClick(e, () => onQuickMoveStatus?.(lead.id, 'Visita Agendada'))}
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-slate-900 transition-colors flex items-center justify-between"
              >
                <span>Visita Agendada</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
              </button>

              <button
                onClick={(e) => handleActionClick(e, () => onQuickMoveStatus?.(lead.id, 'Aprovado'))}
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-slate-900 transition-colors flex items-center justify-between"
              >
                <span>Aprovar</span>
                <Check className="w-3 h-3 text-emerald-400" />
              </button>

              <div className="border-t border-slate-800 my-1" />

              <a
                href={`https://wa.me/55${digitsPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Abrir WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Ramo Tag + Location */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-bold text-slate-300 flex items-center gap-1">
          <Tag className="w-3 h-3 text-emerald-400" />
          {lead.ramo_atividade}
        </span>

        <span className="flex items-center gap-1 text-slate-400">
          <MapPin className="w-3 h-3 text-slate-500" />
          {lead.cidade}
        </span>
      </div>

      {/* Financial Info Box */}
      <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Solicitado</span>
          <span className="font-black text-emerald-400 text-sm">{formatCurrency(lead.valor_solicitado)}</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Prazo & Diária</span>
          <span className="font-bold text-white text-xs">
            {lead.prazo}d ({formatCurrency(parcelaDiaria)}/dia)
          </span>
        </div>
      </div>

      {/* Footer Info: Time Ago + Dossiê Link */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeAgo(lead.created_at)}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-300 group-hover:text-emerald-400 transition-colors font-bold text-xs">
          <span>Abrir Dossiê</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
