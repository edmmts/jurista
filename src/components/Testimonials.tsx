import React from 'react';
import { Star, Quote, Building2, Store, UserCheck } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      nome: 'Marta Rodrigues',
      ocupacao: 'Dona de Salão de Beleza',
      cidade: 'São Paulo - SP',
      depoimento: 'Precisei de R$ 500,00 para comprar produtos urgentes para o salão. Fiz o pedido no site, o agente fez a visita rápida no mesmo dia e o PIX caiu na hora. A parcela diária é super tranquila de pagar.',
      rating: 5,
    },
    {
      nome: 'Roberto Alves',
      ocupacao: 'Feirante e Comerciante Autônomo',
      cidade: 'Guarulhos - SP',
      depoimento: 'Nenhum banco me dava crédito rápido para comprar mercadoria da feira. Com o Crédito Popular peguei R$ 1.000,00 e pago a cobrança diária até as 17h sem dor de cabeça.',
      rating: 5,
    },
    {
      nome: 'Juliana Mendes',
      ocupacao: 'Confeiteira Autônoma',
      cidade: 'Campinas - SP',
      depoimento: 'Achei ótimo que não tem burocracia de papelada sem fim. O agente foi super respeitoso na visita presencial e explicou tudo certinho sobre o parcelamento diário.',
      rating: 5,
    },
  ];

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Quem usou e aprovou o <span className="text-emerald-400">Crédito Popular</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Depoimentos reais de microempreendedores e trabalhadores autônomos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((r, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "{r.depoimento}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{r.nome}</h4>
                <p className="text-[11px] text-emerald-400">{r.ocupacao}</p>
                <p className="text-[10px] text-slate-500">{r.cidade}</p>
              </div>
              <Quote className="w-8 h-8 text-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
