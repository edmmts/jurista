import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, LeadPrioridade, RamoAtividade } from '../types/lead';
import { mockLeads } from '../data/mockLeads';
import { Cliente } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StatsCards } from './StatsCards';
import { SearchBar } from './SearchBar';
import { Filters, FilterState } from './Filters';
import { KanbanColumn } from './KanbanColumn';
import { LeadDrawer } from './LeadDrawer';
import {
  Clock,
  Search,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Database,
  Building2,
  ShieldAlert,
} from 'lucide-react';

const STORAGE_KEY = 'solicitacoes_leads_mei_v1';

interface LeadPipelineCRMProps {
  onAddClienteFromLead?: (newCli: Cliente) => void;
}

export const LeadPipelineCRM: React.FC<LeadPipelineCRMProps> = ({ onAddClienteFromLead }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        if (saved.includes('lead_mei_001')) {
          localStorage.removeItem(STORAGE_KEY);
          return [];
        }
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler localStorage do CRM:', e);
    }
    return mockLeads;
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: 'todos',
    ramo: 'todos',
    valor: 'todos',
    prazo: 'todos',
    ordenacao: 'recentes',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for manual lead insertion
  const [newLeadForm, setNewLeadForm] = useState({
    nome_comercio: '',
    nome_responsavel: '',
    ramo_atividade: 'Mercado' as RamoAtividade,
    telefone: '',
    email: '',
    valor_solicitado: 500 as 300 | 500 | 800 | 1000,
    prazo: 20 as 10 | 20 | 30,
    endereco_comercial: '',
    cidade: 'São Paulo',
    estado: 'SP',
    pix: '',
  });

  // Fetch leads from Supabase if configured
  useEffect(() => {
    async function loadSupabaseLeads() {
      if (!isSupabaseConfigured() || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Erro ao buscar leads do Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          const mappedLeads: Lead[] = data.map((row: any) => {
            const contatos = [];
            if (row.contato1_nome) {
              contatos.push({ nome: row.contato1_nome, tipo: (row.contato1_relacao || 'Fornecedor') as any, telefone: row.contato1_tel || '' });
            }
            if (row.contato2_nome) {
              contatos.push({ nome: row.contato2_nome, tipo: (row.contato2_relacao || 'Cliente') as any, telefone: row.contato2_tel || '' });
            }
            if (row.contato3_nome) {
              contatos.push({ nome: row.contato3_nome, tipo: (row.contato3_relacao || 'Familiar') as any, telefone: row.contato3_tel || '' });
            }

            return {
              id: row.id,
              nome_responsavel: row.nome || 'Sem Nome',
              nome_comercio: row.nome_comercio || 'Comércio Sem Nome',
              ramo_atividade: (row.ramo_atividade as any) || 'Outros',
              telefone: row.telefone || '',
              email: row.email || 'sememail@exemplo.com',
              valor_solicitado: (Number(row.valor_solicitado) || 500) as any,
              prazo: (Number(row.prazo_dias) || 20) as any,
              pix: row.chave_pix || '',
              tipo_pix: 'chave_aleatoria',
              endereco_comercial: row.endereco_empresa || 'Não informado',
              endereco_pessoal: row.endereco_pessoal || 'Não informado',
              cidade: row.cidade || 'Não informado',
              estado: row.estado || 'SP',
              score_interno: 750,
              status: (row.status as any) || 'Pendente',
              prioridade: 'Média',
              created_at: row.criado_em || new Date().toISOString(),
              contatos,
              documentos: {
                selfie: row.selfie_url,
                comprovante_comercial: row.comprovante_url,
              },
              timeline: [
                { id: 't1', titulo: 'Lead sincronizado com Supabase', dataHora: 'Sincronizado', autor: 'Supabase Sync' }
              ],
              observacoes: [],
            };
          });

          setLeads((prev) => {
            const localOnly = prev.filter(pl => !mappedLeads.some(sl => sl.id === pl.id));
            return [...mappedLeads, ...localOnly];
          });
        }
      } catch (err) {
        console.error('Erro na requisição dos leads:', err);
      }
    }
    loadSupabaseLeads();
  }, []);

  // Save to localStorage on any lead update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [leads]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetStorage = () => {
    setLeads(mockLeads);
    localStorage.removeItem(STORAGE_KEY);
    showToast('CRM restaurado para os dados padrão!');
  };

  // Status Change Handler
  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((item) => {
        if (item.id === leadId) {
          const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const newTimelineItem = {
            id: `t_${Date.now()}`,
            titulo: `Estágio alterado para "${newStatus}"`,
            dataHora: `Hoje às ${nowStr}`,
            autor: 'Agente CRM',
          };
          return {
            ...item,
            status: newStatus,
            timeline: [...(item.timeline || []), newTimelineItem],
          };
        }
        return item;
      })
    );

    // Update selected lead state if drawer is open
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Sync status change to Supabase if configured
    if (isSupabaseConfigured() && supabase && !leadId.startsWith('lead_mei_')) {
      supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)
        .then(({ error }) => {
          if (error) {
            console.error('Erro ao atualizar status no Supabase:', error);
          }
        });
    }
  };

  // Add Note Handler
  const handleAddNote = (leadId: string, noteText: string) => {
    const nowStr = new Date().toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newNote = {
      id: `obs_${Date.now()}`,
      texto: noteText,
      dataHora: nowStr,
      autor: 'Analista de Crédito',
    };

    setLeads((prev) =>
      prev.map((item) => {
        if (item.id === leadId) {
          return {
            ...item,
            observacoes: [newNote, ...(item.observacoes || [])],
          };
        }
        return item;
      })
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              observacoes: [newNote, ...(prev.observacoes || [])],
            }
          : null
      );
    }
  };

  // Handle Manual Lead Addition
  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.nome_comercio || !newLeadForm.nome_responsavel || !newLeadForm.telefone) {
      showToast('Preencha os campos obrigatórios do comércio');
      return;
    }

    const createdLead: Lead = {
      id: `lead_mei_${Date.now()}`,
      nome_comercio: newLeadForm.nome_comercio,
      nome_responsavel: newLeadForm.nome_responsavel,
      ramo_atividade: newLeadForm.ramo_atividade,
      telefone: newLeadForm.telefone,
      email: newLeadForm.email || `${newLeadForm.nome_responsavel.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      valor_solicitado: newLeadForm.valor_solicitado,
      prazo: newLeadForm.prazo,
      pix: newLeadForm.pix || newLeadForm.telefone,
      tipo_pix: 'celular',
      endereco_comercial: newLeadForm.endereco_comercial || 'Endereço Comercial Cadastrado',
      endereco_pessoal: '',
      cidade: newLeadForm.cidade,
      estado: newLeadForm.estado,
      score_interno: 810,
      status: 'Pendente',
      prioridade: 'Alta',
      created_at: new Date().toISOString(),
      contatos: [
        { nome: 'Contato Principal', tipo: 'Fornecedor', telefone: newLeadForm.telefone },
      ],
      documentos: {
        selfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        documento: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      },
      timeline: [
        { id: 't1', titulo: 'Nova solicitação inserida no CRM', dataHora: 'Agora mesmo', autor: 'Admin CRM' },
      ],
      observacoes: [],
    };

    setLeads((prev) => [createdLead, ...prev]);
    setShowAddModal(false);
    showToast(`Solicitação da ${createdLead.nome_comercio} criada com sucesso!`);
  };

  // Convert Lead to Cliente and delegate to parent callback
  const handleApproveLead = (lead: Lead) => {
    if (onAddClienteFromLead) {
      const newCliente: Cliente = {
        id: `cli_${Date.now()}`,
        nome: lead.nome_responsavel,
        cpf: 'Não informado',
        telefone: lead.telefone,
        email: lead.email || 'sememail@exemplo.com',
        endereco: lead.endereco_comercial || lead.endereco_pessoal || 'Endereço não informado',
        limite_total: lead.valor_solicitado,
        limite_disponivel: lead.valor_solicitado,
        score: lead.score_interno || 800,
        status: 'Ativo',
        criado_em: new Date().toISOString(),
        contatos: lead.contatos ? lead.contatos.map((c) => ({ nome: c.nome, tel: c.telefone })) : [],
      };
      onAddClienteFromLead(newCliente);
    }
  };

  // Filter & Search Engine
  const filteredLeads = useMemo(() => {
    return leads
      .filter((item) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchComercio = item.nome_comercio.toLowerCase().includes(q);
          const matchResp = item.nome_responsavel.toLowerCase().includes(q);
          const matchTel = item.telefone.includes(q);
          const matchCidade = item.cidade.toLowerCase().includes(q);
          if (!matchComercio && !matchResp && !matchTel && !matchCidade) {
            return false;
          }
        }

        // Status Filter
        if (filters.status !== 'todos' && item.status !== filters.status) {
          return false;
        }

        // Ramo Filter
        if (filters.ramo !== 'todos' && item.ramo_atividade !== filters.ramo) {
          return false;
        }

        // Valor Filter
        if (filters.valor !== 'todos' && item.valor_solicitado !== filters.valor) {
          return false;
        }

        // Prazo Filter
        if (filters.prazo !== 'todos' && item.prazo !== filters.prazo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.ordenacao === 'recentes') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (filters.ordenacao === 'antigos') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (filters.ordenacao === 'maior_valor') {
          return b.valor_solicitado - a.valor_solicitado;
        }
        if (filters.ordenacao === 'menor_valor') {
          return a.valor_solicitado - b.valor_solicitado;
        }
        return 0;
      });
  }, [leads, searchQuery, filters]);

  // Group leads into pipeline columns
  const pendentes = filteredLeads.filter((l) => l.status === 'Pendente');
  const emAnalise = filteredLeads.filter((l) => l.status === 'Em Análise');
  const visitaAgendada = filteredLeads.filter((l) => l.status === 'Visita Agendada');
  const aprovados = filteredLeads.filter((l) => l.status === 'Aprovado');
  const recusados = filteredLeads.filter((l) => l.status === 'Recusado');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              CRM de Solicitações (MEI)
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase tracking-widest">
              Pipeline de Crédito
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Gerenciamento e acompanhamento das propostas enviadas pela Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetStorage}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Resetar dados do CRM"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 border border-emerald-400 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-xl shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <StatsCards leads={leads} />

      {/* Filter & Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <Filters
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => {
            setFilters({
              status: 'todos',
              ramo: 'todos',
              valor: 'todos',
              prazo: 'todos',
              ordenacao: 'recentes',
            });
            setSearchQuery('');
          }}
        />
      </div>

      {/* Kanban Board Row */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-thin scrollbar-thumb-slate-800">
        <KanbanColumn
          status="Pendente"
          title="Novos Pendentes"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          colorTheme={{
            badgeBg: 'bg-amber-500/20',
            badgeText: 'text-amber-300',
            borderColor: 'border-amber-500/20',
            headerBg: 'bg-amber-950/10',
          }}
          leads={pendentes}
          onSelectLead={setSelectedLead}
          onDropLead={handleUpdateStatus}
          onQuickMoveStatus={handleUpdateStatus}
        />

        <KanbanColumn
          status="Em Análise"
          title="Em Análise"
          icon={<Search className="w-4 h-4 text-cyan-400" />}
          colorTheme={{
            badgeBg: 'bg-cyan-500/20',
            badgeText: 'text-cyan-300',
            borderColor: 'border-cyan-500/20',
            headerBg: 'bg-cyan-950/10',
          }}
          leads={emAnalise}
          onSelectLead={setSelectedLead}
          onDropLead={handleUpdateStatus}
          onQuickMoveStatus={handleUpdateStatus}
        />

        <KanbanColumn
          status="Visita Agendada"
          title="Visita Agendada"
          icon={<CalendarCheck className="w-4 h-4 text-purple-400" />}
          colorTheme={{
            badgeBg: 'bg-purple-500/20',
            badgeText: 'text-purple-300',
            borderColor: 'border-purple-500/20',
            headerBg: 'bg-purple-950/10',
          }}
          leads={visitaAgendada}
          onSelectLead={setSelectedLead}
          onDropLead={handleUpdateStatus}
          onQuickMoveStatus={handleUpdateStatus}
        />

        <KanbanColumn
          status="Aprovado"
          title="Aprovados"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          colorTheme={{
            badgeBg: 'bg-emerald-500/20',
            badgeText: 'text-emerald-300',
            borderColor: 'border-emerald-500/20',
            headerBg: 'bg-emerald-950/10',
          }}
          leads={aprovados}
          onSelectLead={setSelectedLead}
          onDropLead={handleUpdateStatus}
          onQuickMoveStatus={handleUpdateStatus}
        />

        <KanbanColumn
          status="Recusado"
          title="Recusados"
          icon={<XCircle className="w-4 h-4 text-rose-400" />}
          colorTheme={{
            badgeBg: 'bg-rose-500/20',
            badgeText: 'text-rose-300',
            borderColor: 'border-rose-500/20',
            headerBg: 'bg-rose-950/10',
          }}
          leads={recusados}
          onSelectLead={setSelectedLead}
          onDropLead={handleUpdateStatus}
          onQuickMoveStatus={handleUpdateStatus}
        />
      </div>

      {/* Detail Drawer Modal */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onApproveLeadToClient={handleApproveLead}
        onToast={showToast}
      />

      {/* Manual Lead Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Nova Solicitação do Comércio</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                  Nome do Comércio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Padaria Santo Antônio"
                  value={newLeadForm.nome_comercio}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, nome_comercio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Santos"
                    value={newLeadForm.nome_responsavel}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, nome_responsavel: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Ramo de Atividade
                  </label>
                  <select
                    value={newLeadForm.ramo_atividade}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, ramo_atividade: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Mercado">Mercado</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Estética">Estética</option>
                    <option value="Vestuário">Vestuário</option>
                    <option value="Distribuidora">Distribuidora</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Pet Shop">Pet Shop</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Telefone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="11987654321"
                    value={newLeadForm.telefone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, telefone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Valor Solicitado (R$)
                  </label>
                  <select
                    value={newLeadForm.valor_solicitado}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, valor_solicitado: Number(e.target.value) as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  >
                    <option value="300">R$ 300,00</option>
                    <option value="500">R$ 500,00</option>
                    <option value="800">R$ 800,00</option>
                    <option value="1000">R$ 1.000,00</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Prazo em Dias
                  </label>
                  <select
                    value={newLeadForm.prazo}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, prazo: Number(e.target.value) as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="10">10 Dias</option>
                    <option value="20">20 Dias</option>
                    <option value="30">30 Dias</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.cidade}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, cidade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block pb-1">
                  Endereço Comercial
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro..."
                  value={newLeadForm.endereco_comercial}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, endereco_comercial: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                >
                  Cadastrar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
