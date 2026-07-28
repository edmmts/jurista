import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 5,
  onStepClick,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between w-full py-2 px-1 relative">
      {/* Background connecting line */}
      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
      
      {/* Active colored line */}
      <div
        className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300 -z-0"
        style={{
          width: `${((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 100}%`,
        }}
      />

      {steps.map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isClickable = onStepClick && step < currentStep;

        return (
          <button
            key={step}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick(step)}
            aria-label={`Ir para etapa ${step}`}
            className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[44px] min-w-[44px] ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20 cursor-pointer'
                : isCurrent
                ? 'bg-slate-950 text-emerald-400 border-2 border-emerald-500 shadow-lg shadow-emerald-500/30 scale-110 font-black'
                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 stroke-[3]" />
            ) : (
              <span>{step}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
