import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface StepHeaderProps {
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  totalSteps = 5,
  title,
  subtitle,
  icon,
  onBack,
  onClose,
}) => {
  return (
    <div className="flex items-start justify-between pb-3 border-b border-slate-800/80 gap-3">
      <div className="flex items-start gap-3">
        {onBack && currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar para a etapa anterior"
            className="p-2.5 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {icon && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            {icon}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-snug">
            {subtitle}
          </p>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
