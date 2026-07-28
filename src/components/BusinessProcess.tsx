import React from 'react';
import { FileText, SearchCheck, MapPin, Zap } from 'lucide-react';

export const BusinessProcess: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: FileText,
      title: 'O Pedido Oficial',
      desc: 'Preencha o formulário em etapas aqui na plataforma em menos de 2 minutos.',
    },
    {
      num: '02',
      icon: SearchCheck,
      title: 'Análise Rápida',
      desc: 'Nossa equipe valida as informações e confirma seus dados de contato e referências.',
    },
    {
      num: '03',
      icon: MapPin,
      title: 'Visita Presencial',
      desc: 'Um agente credenciado realiza o atendimento no seu endereço residencial ou comercial.',
    },
    {
      num: '04',
      icon: Zap,
      title: 'PIX Automático',
      desc: 'Com o pedido validado na visita, o valor contratado (R$ 100 a R$ 1.000) cai na sua conta!',
    },
  ];

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          Transparência Total
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
          Como funciona o fluxo do <span className="text-emerald-400">pedido ao PIX</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Um processo simples, presencial e 100% humanizado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-slate-700">{s.num}</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <IconComp className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
