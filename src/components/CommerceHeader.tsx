import React, { useState } from 'react';
import { Lead } from '../types/lead';
import { StatusBadge } from './StatusBadge';
import { MessageCircle, Phone, Copy, Check, Store, MapPin, Award } from 'lucide-react';
import { formatCurrency } from '../lib/currency';
import { getCleanPhone, formatPhone } from '../lib/phone';

interface CommerceHeaderProps {
  lead: Lead;
  onToast: (message: string) => void;
}

export const CommerceHeader: React.FC<CommerceHeaderProps> = ({ lead, onToast }) => {
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = () => {
    if (lead.pix) {
      navigator.clipboard.writeText(lead.pix);
      setCopiedPix(true);
      onToast('Chave PIX copiada!');
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const digitsPhone = getCleanPhone(lead.telefone);

  return (
    <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 relative shadow-xl">
      <div className="flex items-start gap-4">
        {/* Commerce Avatar or Logo */}
        <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-white text-xl overflow-hidden shrink-0 shadow-xl">
          {lead.logo_url ? (
            <img src={lead.logo_url} alt={lead.nome_comercio} className="w-full h-full object-cover" />
          ) : lead.foto_url ? (
            <img src={lead.foto_url} alt={lead.nome_comercio} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-8 h-8 text-emerald-400" />
          )}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-black text-white">{lead.nome_comercio}</h2>
            <StatusBadge status={lead.status} />
          </div>

          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Responsável: {lead.nome_responsavel}</span>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-bold text-slate-300">
              {lead.ramo_atividade}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              {lead.cidade} / {lead.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Quick Row */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block font-bold uppercase">Telefone</span>
          <span className="text-slate-200 font-bold">{formatPhone(lead.telefone)}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 truncate">
          <span className="text-[10px] text-slate-500 block font-bold uppercase">E-mail</span>
          <span className="text-slate-200 font-bold truncate block">{lead.email}</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={`https://wa.me/55${digitsPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/30 transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`tel:${digitsPhone}`}
          className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Ligar</span>
        </a>

        <button
          onClick={handleCopyPix}
          className="py-2 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-500/30 transition-all cursor-pointer"
        >
          {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>Copiar PIX</span>
        </button>
      </div>
    </div>
  );
};
