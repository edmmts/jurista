import React from 'react';
import { PrazoCredito } from '../types/lead';
import { Calendar, Check } from 'lucide-react';

interface TermSelectorProps {
  selectedTerm: PrazoCredito;
  onSelectTerm: (term: PrazoCredito) => void;
  error?: string;
}

const TERMS: { value: PrazoCredito; label: string; desc: string }[] = [
  { value: 10, label: '10 Dias', desc: '10 parcelas diárias' },
  { value: 20, label: '20 Dias', desc: '20 parcelas diárias' },
  { value: 30, label: '30 Dias', desc: '30 parcelas diárias' },
];

export const TermSelector: React.FC<TermSelectorProps> = ({
  selectedTerm,
  onSelectTerm,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold text-slate-200">
          Prazo de Pagamento Desejado <span className="text-emerald-400">*</span>
        </label>
        <span className="text-xs text-slate-400 font-medium">Segunda a Sábado</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TERMS.map((t) => {
          const isSelected = selectedTerm === t.value;

          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onSelectTerm(t.value)}
              aria-pressed={isSelected}
              className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer min-h-[64px] outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-emerald-400 shadow-xl shadow-emerald-500/25 scale-[1.02] ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                  {t.label}
                </span>
              </div>
              <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-400 font-medium pt-1">{error}</p>}
    </div>
  );
};
