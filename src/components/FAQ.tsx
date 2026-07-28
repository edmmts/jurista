import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Clock, MapPin, DollarSign, ShieldCheck } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Quais os valores e prazos disponíveis?',
      a: 'Você pode solicitar empréstimos de R$ 100,00 a R$ 1.000,00, com opções de pagamento em 10, 20 ou 30 parcelas diárias (para o prazo de 10 parcelas, o valor máximo é de R$ 300,00).',
    },
    {
      q: 'Como funciona a regra de pagamento diário até as 17h00?',
      a: 'As parcelas são calculadas com base nos dias úteis de contrato. As cobranças ocorrem diariamente de segunda a sábado até as 17h00. Nos domingos não há cobrança.',
    },
    {
      q: 'Como funciona o processo de aprovação?',
      a: 'Você faz o pedido oficial preenchendo o formulário em etapas aqui no site. Nossa equipe faz uma análise rápida das suas informações e contatos de referência. Em seguida, agendamos uma visita presencial para concluir a entrega do PIX.',
    },
    {
      q: 'Preciso ter nome limpo ou comprovação bancária?',
      a: 'O Crédito Popular foi pensado para trabalhadores autônomos, informais e pequenos comerciantes. Fazemos uma análise humana e presencial focada na sua capacidade real de pagamento diário, sem exigências abusivas.',
    },
    {
      q: 'Para que servem os 3 contatos de referência solicitados?',
      a: 'Os 3 contatos (família, amigo/vizinho, trabalho) servem exclusivamente para confirmação de identidade e apoio de segurança para o agendamento da visita do nosso agente.',
    },
  ];

  return (
    <section className="py-10 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Perguntas e Respostas
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Tudo o que você precisa saber sobre o Crédito Popular.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
