import React, { useState } from 'react';
import { Calculator, Clock, CheckCircle2, ArrowRight, DollarSign, Calendar, Zap, AlertTriangle } from 'lucide-react';
import { calculateLoan, formatCurrency } from '../utils/loanCalculator';

interface InteractiveCalculatorProps {
  onSelectLoan: (amount: number, term: 10 | 20 | 30) => void;
}

export const InteractiveCalculator: React.FC<InteractiveCalculatorProps> = ({ onSelectLoan }) => {
  const [amount, setAmount] = useState<number>(500);
  const [term, setTerm] = useState<10 | 20 | 30>(20);

  const calc = calculateLoan(amount, term);

  return (
    <section id="simulador" className="py-10 px-4 max-w-4xl mx-auto">
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Calculator className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Simulador de Crédito Popular
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Ajuste o valor e veja o valor exato da sua parcela diária
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> PIX Direto na Conta
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-6">
            {/* Amount Slider & Presets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Valor Solicitado
                </label>
                <span className="text-2xl font-black text-emerald-400">
                  {formatCurrency(calc.principal)}
                </span>
              </div>

              <input
                type="range"
                min="100"
                max={term === 10 ? 300 : 1000}
                step="50"
                value={Math.min(amount, term === 10 ? 300 : 1000)}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[100, 300, 500, 1000].map((val) => {
                  const isDisabled = term === 10 && val > 300;
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setAmount(val)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isDisabled
                          ? 'opacity-35 cursor-not-allowed bg-slate-900/50 text-slate-600 border-slate-800'
                          : amount === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      R$ {val}
                    </button>
                  );
                })}
              </div>
              {term === 10 && (
                <p className="text-[11px] text-amber-400/90 font-medium">
                  * Para 10 parcelas, o valor máximo é de R$ 300,00.
                </p>
              )}
            </div>

            {/* Term presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Prazo de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const newTerm = t as 10 | 20 | 30;
                      setTerm(newTerm);
                      if (newTerm === 10 && amount > 300) {
                        setAmount(300);
                      }
                    }}
                    className={`py-3 px-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${
                      term === t
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{t} Parcelas</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="text-center pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Valor da Parcela Diária
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 my-1">
                {formatCurrency(calc.dailyInstallment)}
                <span className="text-xs text-slate-400 font-normal"> / dia</span>
              </div>
              <span className="text-[11px] text-teal-300 font-medium">
                ({calc.businessDaysCount} cobranças de Segunda a Sábado)
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Valor Liberado:</span>
                <span className="font-bold text-white">{formatCurrency(calc.principal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Total a Quitar:</span>
                <span className="font-bold text-white">{formatCurrency(calc.totalPayable)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Horário de Cobrança:</span>
                <span className="font-semibold text-amber-300">Até as 17h00 (Seg a Sáb)</span>
              </div>
            </div>

            <button
              onClick={() => onSelectLoan(amount, term)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-extrabold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
            >
              <span>SOLICITAR ESTE VALOR</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
