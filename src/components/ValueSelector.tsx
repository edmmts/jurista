import React from 'react';
import { ValorCredito } from '../types/lead';
import { formatCurrency } from '../lib/currency';
import { Check, DollarSign } from 'lucide-react';

interface ValueSelectorProps {
  selectedValue: ValorCredito;
  onSelectValue: (value: ValorCredito) => void;
  error?: string;
}

const VALUES: ValorCredito[] = [300, 500, 800, 1000];

export const ValueSelector: React.FC<ValueSelectorProps> = ({
  selectedValue,
  onSelectValue,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold text-slate-200">
          Valor do Crédito Solicitado <span className="text-emerald-400">*</span>
        </label>
        <span className="text-xs text-slate-400 font-medium">4 opções de valor fixo</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VALUES.map((val) => {
          const isSelected = selectedValue === val;

          return (
            <button
              key={val}
              type="button"
              onClick={() => onSelectValue(val)}
              aria-pressed={isSelected}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[72px] outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-emerald-400 shadow-xl shadow-emerald-500/25 scale-[1.02] ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Opção
                </span>
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <DollarSign className="w-4 h-4 text-slate-500" />
                )}
              </div>

              <div className="mt-2">
                <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                  {formatCurrency(val)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-400 font-medium pt-1">{error}</p>}
    </div>
  );
};
