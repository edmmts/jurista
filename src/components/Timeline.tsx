import React from 'react';
import { TimelineItem } from '../types/lead';
import { CheckCircle2 } from 'lucide-react';

interface TimelineProps {
  events: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-500 italic">Nenhum evento registrado ainda na timeline.</p>;
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((event, idx) => {
        const isLatest = idx === events.length - 1;

        return (
          <div key={event.id || idx} className="relative flex items-start gap-3 group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 scale-110'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {isLatest ? (
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>

            {/* Event Content */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 w-full hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-white">{event.titulo}</h5>
                <span className="text-[10px] font-mono text-slate-400">{event.dataHora}</span>
              </div>
              {event.autor && (
                <span className="text-[10px] text-emerald-400/80 font-mono block pt-1">
                  Por: {event.autor}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
