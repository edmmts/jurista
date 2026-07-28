import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Differentials } from './components/Differentials';
import { InteractiveCalculator } from './components/InteractiveCalculator';
import { BusinessProcess } from './components/BusinessProcess';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { LeadWizard } from './components/LeadWizard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientPortal } from './components/loan/ClientPortal';
import { LeadFormData, StoredLead } from './types';
import { ShieldCheck, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'client'>('public');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Verifica sessão real do Supabase Auth (não mais um flag local)
  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsAdminLoggedIn(!!data.session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Stored Leads
  const [capturedLeads, setCapturedLeads] = useState<StoredLead[]>(() => {
    try {
      const saved = localStorage.getItem('cp_captured_leads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('cp_captured_leads', JSON.stringify(capturedLeads));
  }, [capturedLeads]);

  // Handle Step 1 Partial Lead Capture (Risco Zero)
  const handlePartialSaveLead = (partialData: Partial<LeadFormData>, step: number) => {
    const existingIndex = capturedLeads.findIndex((l) => l.whatsapp === partialData.whatsapp);

    if (existingIndex >= 0) {
      // Update existing lead in state
      setCapturedLeads((prev) => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          ...partialData,
        };
        return copy;
      });
    } else {
      // Create new retained lead record immediately
      const newLead: StoredLead = {
        id: `lead_${Date.now()}`,
        nome: partialData.nome || '',
        email: partialData.email || '',
        whatsapp: partialData.whatsapp || '',
        valor: partialData.valor || 500,
        prazo: partialData.prazo || 20,
        tipoChavePix: partialData.tipoChavePix || 'cpf',
        chavePix: partialData.chavePix || '',
        enderecoPessoal: partialData.enderecoPessoal || '',
        enderecoEmpresa: partialData.enderecoEmpresa || '',
        contato1: partialData.contato1 || { nome: '', whatsapp: '' },
        contato2: partialData.contato2 || { nome: '', whatsapp: '' },
        contato3: partialData.contato3 || { nome: '', whatsapp: '' },
        createdAt: new Date().toISOString(),
        status: 'lead_retido',
        dailyInstallment: 0,
        businessDaysCount: 0,
        totalValue: 0,
        protocolNumber: '',
      };

      setCapturedLeads((prev) => [newLead, ...prev]);
    }
  };

  // Handle Full Lead Wizard Completion
  const handleCompleteLead = (completedLead: StoredLead) => {
    setCapturedLeads((prev) => {
      const filtered = prev.filter((l) => l.whatsapp !== completedLead.whatsapp);
      return [completedLead, ...filtered];
    });

    // Sync to Admin CRM local storage so it immediately shows up in the pipeline!
    try {
      const savedCrm = localStorage.getItem('solicitacoes_leads_mei_v1');
      const currentCrmLeads = savedCrm ? JSON.parse(savedCrm) : [];
      
      const newCrmLead = {
        id: completedLead.id,
        nome_responsavel: completedLead.nomeResponsavel || completedLead.nome || 'Sem Nome',
        nome_comercio: completedLead.nomeComercio || 'Comércio Sem Nome',
        ramo_atividade: completedLead.ramoAtividade || 'Outros',
        telefone: completedLead.whatsapp,
        email: completedLead.email || `${(completedLead.nomeResponsavel || completedLead.nome || 'cliente').toLowerCase().replace(/\s+/g, '.')}@cliente.local`,
        valor_solicitado: completedLead.valor || 500,
        prazo: completedLead.prazo || 20,
        pix: completedLead.chavePix || '',
        tipo_pix: completedLead.tipoChavePix || 'cpf',
        endereco_comercial: completedLead.enderecoEmpresa || 'Não informado',
        endereco_pessoal: completedLead.enderecoPessoal || 'Não informado',
        cidade: completedLead.cidade || 'Não informado',
        estado: completedLead.estado || 'SP',
        score_interno: 790,
        status: 'Pendente',
        prioridade: 'Alta',
        created_at: completedLead.createdAt || new Date().toISOString(),
        contatos: [
          { nome: completedLead.contato1?.nome || 'Contato 1', tipo: completedLead.contato1?.relacao || 'Outro', telefone: completedLead.contato1?.whatsapp || '' },
          { nome: completedLead.contato2?.nome || 'Contato 2', tipo: completedLead.contato2?.relacao || 'Outro', telefone: completedLead.contato2?.whatsapp || '' },
          { nome: completedLead.contato3?.nome || 'Contato 3', tipo: completedLead.contato3?.relacao || 'Outro', telefone: completedLead.contato3?.whatsapp || '' },
        ],
        documentos: {
          selfie: completedLead.selfieUrl || '',
          comprovante_comercial: completedLead.comprovanteResidenciaUrl || '',
        },
        timeline: [
          { id: 't1', titulo: 'Solicitação criada pelo formulário', dataHora: 'Agora mesmo', autor: 'Cliente' }
        ],
        observacoes: [],
      };

      const filteredCrm = currentCrmLeads.filter((l: any) => l.telefone !== completedLead.whatsapp);
      localStorage.setItem('solicitacoes_leads_mei_v1', JSON.stringify([newCrmLead, ...filteredCrm]));
    } catch (err) {
      console.error('Erro ao sincronizar com CRM local:', err);
    }
  };

  const scrollToSimulador = () => {
    const el = document.getElementById('simulador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        Carregando...
      </div>
    );
  }

  if (isAdminLoggedIn) {
    return (
      <AdminDashboard
        onLogout={async () => {
          if (supabase) await supabase.auth.signOut();
          setIsAdminLoggedIn(false);
        }}
      />
    );
  }

  if (viewMode === 'client') {
    return (
      <ClientPortal onBackToLanding={() => setViewMode('public')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        onOpenLeadModal={() => setIsWizardOpen(true)}
        onOpenAdminModal={() => setIsAdminLoginModalOpen(true)}
        onOpenClientPortal={() => setViewMode('client')}
        capturedLeadsCount={capturedLeads.length}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {/* FASE 1: Hero & Differentials */}
        <HeroSection
          onStartWizard={() => setIsWizardOpen(true)}
          onOpenCalculator={scrollToSimulador}
        />

        <Differentials />

        {/* FASE 2 & 3: Interactive Calculator */}
        <InteractiveCalculator
          onSelectLoan={(amount, term) => {
            setIsWizardOpen(true);
          }}
        />

        {/* Business Process Flow (Pedido -> Análise -> Visita -> PIX) */}
        <BusinessProcess />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQ />

        {/* Inline Bottom CTA Banner */}
        <section className="py-12 px-4 max-w-4xl mx-auto my-8">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-emerald-500/40 text-center relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-950">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <Zap className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Precisa de dinheiro rápido no PIX hoje?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2 leading-relaxed">
              Solicite seu Crédito Popular de R$ 100 a R$ 1.000 agora mesmo. Sem taxas escondidas e com parcelas diárias acessíveis.
            </p>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="mt-6 inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer glow-emerald"
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <span>PREENCHER PEDIDO AGORA</span>
            </button>
          </div>
        </section>
      </main>

      {/* Lead Wizard Modal Overlay */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <div className="w-full max-w-2xl my-auto">
              <LeadWizard
                onComplete={handleCompleteLead}
                onPartialSave={handlePartialSaveLead}
                onClose={() => setIsWizardOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal Overlay */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginModalOpen(false);
          setIsAdminLoggedIn(true);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-slate-400 text-xs text-center space-y-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Crédito Popular MVP</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <span>Valores: R$ 100,00 a R$ 1.000,00</span>
            <span>•</span>
            <span>Prazo: 10, 20 ou 30 dias</span>
            <span>•</span>
            <span>Cobrança: Seg a Sáb até 17h00</span>
          </div>
        </div>

        <p className="max-w-3xl mx-auto text-[11px] text-slate-500 pt-3 border-t border-slate-900">
          O Crédito Popular opera através de correspondência presencial e análise humanizada.
          A aprovação e liberação via PIX dependem do preenchimento correto do formulário, validação dos dados de contato e confirmação da visita presencial.
        </p>
      </footer>
    </div>
  );
}

