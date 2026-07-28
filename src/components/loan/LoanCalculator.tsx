import React, { useEffect } from 'react';

interface LoanCalculatorProps {
  principal: number;
  setPrincipal: (v: number) => void;
  frequency: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  setFrequency: (v: 'diario' | 'semanal' | 'quinzenal' | 'mensal') => void;
  term: number;
  setTerm: (v: number) => void;
  interestMode: 1 | 2 | 3;
  setInterestMode: (v: 1 | 2 | 3) => void;
  interestValue: number;
  setInterestValue: (v: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  diasCobranca: 'seg-sex' | 'seg-sab' | 'seg-dom' | string;
  setDiasCobranca: (v: string) => void;
  checkedDays: boolean[];
  setCheckedDays: (v: boolean[]) => void;
  onCalculate: () => void;
  maxAuthorizedLimit: number;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  principal,
  setPrincipal,
  frequency,
  setFrequency,
  term,
  setTerm,
  interestMode,
  setInterestMode,
  interestValue,
  setInterestValue,
  startDate,
  setStartDate,
  diasCobranca,
  setDiasCobranca,
  checkedDays,
  setCheckedDays,
  onCalculate,
  maxAuthorizedLimit,
}) => {

  useEffect(() => {
    onCalculate();
  }, [principal, frequency, term, interestMode, interestValue, startDate, diasCobranca, checkedDays]);

  const handleQuickPrincipal = (val: number) => {
    setPrincipal(Math.min(val, maxAuthorizedLimit));
  };

  const handleCheckedDaysToggle = (idx: number) => {
    const copy = [...checkedDays];
    copy[idx] = !copy[idx];
    setCheckedDays(copy);
    setDiasCobranca('custom');
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Principal Selection */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <label className="block font-bold text-slate-300">Valor Principal do Empréstimo</label>
          
          <div className="flex gap-2">
            {[300, 500, 800, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickPrincipal(val)}
                className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  principal === val
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="100"
              max={Math.max(1000, maxAuthorizedLimit)}
              step="50"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Min: R$ 100</span>
              <span>Max: R$ {maxAuthorizedLimit}</span>
            </div>
          </div>

          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Math.min(Number(e.target.value), maxAuthorizedLimit))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>

        {/* Frequência & Parcelas */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="space-y-1">
            <label className="block font-bold text-slate-300">Frequência</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['diario', 'semanal', 'quinzenal', 'mensal'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 rounded-lg font-bold border transition-colors capitalize text-[10px] cursor-pointer ${
                    frequency === f
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-300">Quantidade de Parcelas (1 a 60)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={term}
              onChange={(e) => setTerm(Math.max(1, Math.min(60, Number(e.target.value))))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interest Modes */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <label className="block font-bold text-slate-300">Configuração de Juros</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 1, label: 'Modo 1: Taxa %' },
              { mode: 2, label: 'Modo 2: Valor Final' },
              { mode: 3, label: 'Modo 3: Lucro Líquido' },
            ].map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setInterestMode(opt.mode as any);
                  setInterestValue(opt.mode === 1 ? 20 : opt.mode === 2 ? principal + 100 : 100);
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                  interestMode === opt.mode
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-400">
              {interestMode === 1 && 'Taxa de Juros (%)'}
              {interestMode === 2 && 'Valor Total Final a Pagar (R$)'}
              {interestMode === 3 && 'Lucro Líquido Desejado (R$)'}
            </label>
            <input
              type="number"
              value={interestValue}
              onChange={(e) => setInterestValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Collection Days & Start Date */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="space-y-1">
            <label className="block font-bold text-slate-300">Data de Início do Contrato</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-300">Dias de Cobrança (Frequência Diária)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'seg-sex', label: 'Segunda a Sexta' },
                { id: 'seg-sab', label: 'Segunda a Sábado' },
                { id: 'seg-dom', label: 'Todos os Dias' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setDiasCobranca(opt.id);
                    if (opt.id === 'seg-sex') setCheckedDays([false, true, true, true, true, true, false]);
                    if (opt.id === 'seg-sab') setCheckedDays([false, true, true, true, true, true, true]);
                    if (opt.id === 'seg-dom') setCheckedDays([true, true, true, true, true, true, true]);
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    diasCobranca === opt.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Days Checkbox Row */}
            <div className="space-y-1 pt-1.5 border-t border-slate-900">
              <span className="block text-[10px] text-slate-500">Dias Personalizados:</span>
              <div className="flex flex-wrap gap-1.5">
                {weekdays.map((w, idx) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleCheckedDaysToggle(idx)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-extrabold border transition-colors cursor-pointer ${
                      checkedDays[idx] && diasCobranca === 'custom'
                        ? 'bg-purple-500 text-white border-purple-400'
                        : checkedDays[idx] && diasCobranca !== 'custom'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-950 text-slate-600 border-slate-900'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
