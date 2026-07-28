import React from 'react';
import { Parcela } from '../../types/parcela';
import { formatCurrency } from '../../lib/currency';
import { formatToPTBRDate } from '../../lib/dates';
import { Calendar, Clock } from 'lucide-react';

interface InstallmentsPreviewProps {
  parcelas: Parcela[];
}

export const InstallmentsPreview: React.FC<InstallmentsPreviewProps> = ({ parcelas }) => {
  return (
    <div className="space-y-3 text-xs">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-400" />
        Cronograma Temporário de Parcelas
      </h4>

      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-900">
        {parcelas.length === 0 ? (
          <p className="text-slate-500 text-center py-6">Nenhuma parcela gerada.</p>
        ) : (
          parcelas.map((p, idx) => {
            const zebraBg = idx % 2 === 0 ? 'bg-slate-950/80' : 'bg-slate-900/40';

            return (
              <div
                key={p.id}
                className={`p-3 flex justify-between items-center transition-colors ${zebraBg}`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Parcela {p.numero_parcela.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Vencimento: {formatToPTBRDate(p.data_vencimento)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-emerald-400 font-mono">
                    {formatCurrency(p.valor_esperado)}
                  </span>

                  {/* Badge */}
                  <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Pendente</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
