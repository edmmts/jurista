import React from 'react';
import { Zap, MapPin, Calendar, Lock, UserCheck, ShieldCheck } from 'lucide-react';

export const Differentials: React.FC = () => {
  const items = [
    {
      icon: Zap,
      title: 'Dinheiro Rápido no PIX',
      description: 'Assim que sua solicitação e visita forem validadas, a transferência do PIX é feita imediatamente.',
      color: 'from-emerald-500 to-teal-400',
      badge: 'R$ 100 a R$ 1.000',
    },
    {
      icon: MapPin,
      title: 'Visita Presencial Segura',
      description: 'Nosso agente credenciado vai até a sua residência ou empresa para tirar dúvidas e finalizar a entrega.',
      color: 'from-teal-400 to-cyan-400',
      badge: 'Atendimento Local',
    },
    {
      icon: Calendar,
      title: 'Cobrança Diária Acessível',
      description: 'Pagamento em pequenas parcelas diárias de segunda a sábado até as 17h00. Domingos sem cobrança.',
      color: 'from-cyan-400 to-blue-500',
      badge: 'Prazo 10, 20 ou 30 dias',
    },
    {
      icon: UserCheck,
      title: 'Sem Burocracia de Banco',
      description: 'Processo humano, sem consultas abusivas que travam quem é trabalhador autônomo ou pequenos negócios.',
      color: 'from-emerald-400 to-cyan-400',
      badge: 'Aprovação Ágil',
    },
  ];

  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Por que escolher o <span className="text-emerald-400">Crédito Popular</span>?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Um modelo transparente feito para ajudar quem precisa de capital de giro rápido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Subtle top border glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-cyan-500/40 opacity-50 group-hover:opacity-100 transition-opacity"></div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 shadow-md`}>
                    <IconComponent className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>Garantia de atendimento</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
