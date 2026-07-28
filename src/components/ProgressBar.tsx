import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  stepLabels?: string[];
}

const DEFAULT_LABELS = ['Identificação', 'Capital', 'Localização', 'Documentos', 'Confirmação'];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 5,
  stepLabels = DEFAULT_LABELS,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Etapa {currentStep} de {totalSteps}
        </span>
        <span className="font-mono text-slate-400">{percentage}% Concluído</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do cadastro: ${percentage}%`}
        className="w-full h-2.5 bg-slate-900/90 rounded-full p-0.5 border border-slate-800/80 overflow-hidden shadow-inner"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 rounded-full shadow-lg shadow-emerald-500/30"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        />
      </div>

      <div className="hidden sm:flex justify-between text-[11px] font-medium text-slate-500 px-0.5">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <span
              key={label}
              className={`transition-colors ${
                isCurrent
                  ? 'text-emerald-400 font-bold'
                  : isActive
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};
