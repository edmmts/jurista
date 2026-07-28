import React from 'react';
import { Parcela } from '../../types/parcela';
import { formatCurrency } from '../../lib/currency';
import { formatToPTBRDate } from '../../lib/dates';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface PaymentScheduleProps {
  parcelas: Parcela[];
  onBaixar: (id: string) => void;
  onAtrasar: (p: Parcela) => void;
  onAjustar: (p: Parcela) => void;
  todayISO: string;
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({
  parcelas,
  onBaixar,
  onAtrasar,
  onAjustar,
  todayISO,
}) => {
  return (
    <div className="space-y-3">
      {parcelas.map((p, idx) => {
        const isToday = p.data_vencimento === todayISO;
        const zebraBg = idx % 2 === 0 ? 'bg-slate-950/90' : 'bg-slate-900/60';

        return (
          <div
            key={p.id}
            className={`p-3.5 rounded-2xl border transition-colors ${zebraBg} ${
              p.status === 'atrasada'
                ? 'border-rose-500/40'
                : isToday && p.status === 'pendente'
                ? 'border-amber-500/40'
                : 'border-slate-800'
            } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  Parcela {p.numero_parcela.toString().padStart(2, '0')}
                </span>

                {/* BADGES DE STATUS */}
                {p.status === 'atrasada' && (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Atrasada</span>
                  </span>
                )}

                {isToday && p.status === 'pendente' && (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Vence Hoje</span>
                  </span>
                )}

                {!isToday && p.status === 'pendente' && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Pendente</span>
                  </span>
                )}

                {p.status === 'paga' && (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Paga ({p.data_pagamento || 'Baixada'})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Vencimento: {formatToPTBRDate(p.data_vencimento)}</span>
                <span className="text-emerald-400 font-bold font-sans">
                  Valor: {formatCurrency(p.valor_esperado)}
                </span>
                {p.multa_aplicada && p.valor_multa ? (
                  <span className="text-rose-400">
                    (+{formatCurrency(p.valor_multa)} Juros)
                  </span>
                ) : null}
              </div>
            </div>

            {/* PARCELA ACTIONS */}
            {p.status !== 'paga' && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                <button
                  onClick={() => onBaixar(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Baixar
                </button>
                <button
                  onClick={() => onAtrasar(p)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Registrar Atraso
                </button>
                <button
                  onClick={() => onAjustar(p)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer"
                  title="Editar Vencimento / Aplicar Desconto"
                >
                  ⚙️ Ajustar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
