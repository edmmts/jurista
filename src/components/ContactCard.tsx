import React from 'react';
import { ContatoReferencia, TipoRelacao } from '../types/lead';
import { User, Phone, Copy } from 'lucide-react';
import { maskPhone } from '../lib/masks';

interface ContactCardProps {
  index: number;
  contact: ContatoReferencia;
  onChange: (updated: ContatoReferencia) => void;
  onCopyFromFirst?: () => void;
  errors?: {
    nome?: { message?: string };
    relacao?: { message?: string };
    whatsapp?: { message?: string };
  };
}

const RELACOES: TipoRelacao[] = ['Fornecedor', 'Cliente', 'Familiar', 'Vizinho', 'Outro'];

export const ContactCard: React.FC<ContactCardProps> = ({
  index,
  contact,
  onChange,
  onCopyFromFirst,
  errors,
}) => {
  const safeContact = {
    nome: contact?.nome || '',
    relacao: contact?.relacao || 'Fornecedor' as TipoRelacao,
    whatsapp: contact?.whatsapp || '',
  };

  const handleFieldChange = (field: keyof ContatoReferencia, value: string) => {
    onChange({
      ...safeContact,
      [field]: field === 'whatsapp' ? maskPhone(value) : value,
    });
  };

  const getCardTheme = () => {
    if (index === 1) return { title: '1ª Referência (Preferência Fornecedor ou Cliente)', border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (index === 2) return { title: '2ª Referência (Familiar ou Amigo)', border: 'border-teal-500/30', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    return { title: '3ª Referência (Vizinho ou Comercial)', border: 'border-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
  };

  const theme = getCardTheme();

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/90 border ${theme.border} space-y-3 shadow-lg relative`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${theme.badge}`}>
          {theme.title}
        </span>
        {index > 1 && onCopyFromFirst && (
          <button
            type="button"
            onClick={onCopyFromFirst}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-950/60 hover:bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800/80 cursor-pointer"
            title="Copiar mesmo DDD/Relação do 1º contato"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar do 1º</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Nome */}
        <div className="sm:col-span-1 space-y-1">
          <label className="block text-[11px] font-semibold text-slate-300">
            Nome Completo <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Ex: Carlos Silva"
              value={safeContact.nome}
              onChange={(e) => handleFieldChange('nome', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
            />
          </div>
          {errors?.nome?.message && <p className="text-[10px] text-rose-400 font-medium">{errors.nome.message}</p>}
        </div>

        {/* Relação */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-300">
            Relação / Vínculo <span className="text-emerald-400">*</span>
          </label>
          <select
            value={safeContact.relacao}
            onChange={(e) => handleFieldChange('relacao', e.target.value as TipoRelacao)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px] cursor-pointer"
          >
            {RELACOES.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-white">
                {r}
              </option>
            ))}
          </select>
          {errors?.relacao?.message && <p className="text-[10px] text-rose-400 font-medium">{errors.relacao.message}</p>}
        </div>

        {/* WhatsApp */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-300">
            WhatsApp com DDD <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={safeContact.whatsapp}
              onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
            />
          </div>
          {errors?.whatsapp?.message && <p className="text-[10px] text-rose-400 font-medium">{errors.whatsapp.message}</p>}
        </div>
      </div>
    </div>
  );
};
