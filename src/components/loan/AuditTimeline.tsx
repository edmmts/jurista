import React from 'react';
import { Clock } from 'lucide-react';
import { ContratoAuditLog } from '../../types/contrato';

interface AuditTimelineProps {
  logs: ContratoAuditLog[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
      <div className="flex items-center gap-2 text-slate-400 font-bold">
        <Clock className="w-4 h-4 text-purple-400" />
        <span>Linha do Tempo de Auditoria (Histórico Imutável)</span>
      </div>

      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-[10px] text-slate-500 py-2">Nenhum evento registrado.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="relative pl-4 border-l border-slate-800 space-y-0.5">
              <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-extrabold text-slate-300">{log.evento}</span>
                <span className="text-slate-500 font-mono">{log.data_hora}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-sans">
                Autor: <strong className="text-slate-400">{log.autor}</strong>
                {log.detalhes && ` • ${log.detalhes}`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
