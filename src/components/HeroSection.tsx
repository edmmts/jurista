import React from 'react';
import { ArrowRight, CheckCircle2, Clock, MapPin, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStartWizard: () => void;
  onOpenCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartWizard, onOpenCalculator }) => {
  return (
    <section className="relative pt-6 pb-12 px-4 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Crédito Rápido e Sem Burocracia no PIX</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Empréstimo Popular de <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            R$ 100,00 a R$ 1.000,00
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
          Dinheiro rápido no seu PIX para autônomos, pequenos comerciantes e pessoas físicas. 
          Sem complicações e com pagamento facilitado em parcelas diárias.
        </p>

        {/* Key Features Pill Badge Group */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs sm:text-sm font-medium text-slate-200">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Zap className="w-4 h-4 text-emerald-400" />
            Liberação via PIX
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Visita Presencial
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Clock className="w-4 h-4 text-amber-400" />
            Cobrança Seg a Sáb (até 17h)
          </span>
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={onStartWizard}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 text-base font-extrabold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer glow-emerald"
          >
            <span>SOLICITAR AGORA</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={onOpenCalculator}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500/40 text-slate-200 text-sm font-semibold transition-all hover:bg-slate-800 cursor-pointer"
          >
            Simular Valores
          </button>
        </div>

        {/* Trust metrics */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Análise em minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sem taxas escondidas</span>
          </div>
        </div>

        {/* Business Rule Notice Banner */}
        <div className="mt-6 p-4 rounded-2xl glass-card border border-emerald-500/20 text-left flex items-start gap-3.5 max-w-2xl mx-auto">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-300">Como funciona o pagamento?</p>
            <p className="leading-normal text-slate-300">
              O valor do empréstimo (<strong>R$ 100 a R$ 1.000</strong>) é quitado através de 
              <strong> parcelas diárias</strong> cobradas de <strong>segunda a sábado até as 17h00</strong> (domingos isentos). 
              Após o pedido e análise rápida, agendamos a visita presencial e o PIX cai na sua conta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
