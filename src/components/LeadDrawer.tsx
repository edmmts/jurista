import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPrioridade } from '../types/lead';
import { CommerceHeader } from './CommerceHeader';
import { DocumentViewer } from './DocumentViewer';
import { Timeline } from './Timeline';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, calculateDailyInstallment } from '../lib/currency';
import { formatDateShort } from '../lib/date';
import { getGoogleMapsUrl } from '../lib/maps';
import {
  X,
  FileText,
  Clock,
  Users,
  ShieldCheck,
  Check,
  Send,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onUpdatePriority?: (leadId: string, newPriority: LeadPrioridade) => void;
  onAddNote: (leadId: string, noteText: string) => void;
  onApproveLeadToClient?: (lead: Lead) => void;
  onToast: (message: string) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onAddNote,
  onApproveLeadToClient,
  onToast,
}) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<
    'visao_geral' | 'analise_credito' | 'documentos' | 'timeline' | 'referencias'
  >('visao_geral');
  const [newNoteText, setNewNoteText] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const { parcelaDiaria, valorTotal } = calculateDailyInstallment(lead.valor_solicitado, lead.prazo);

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim());
    setNewNoteText('');
    onToast('Observação adicionada com sucesso!');
  };

  const handleApproveAndConvert = () => {
    onUpdateStatus(lead.id, 'Aprovado');
    if (onApproveLeadToClient) {
      onApproveLeadToClient(lead);
    }
    setShowApproveConfirm(false);
    onToast(`Cliente ${lead.nome_comercio} aprovado e cadastrado no sistema!`);
  };

  const statusOptions: LeadStatus[] = [
    'Pendente',
    'Em Análise',
    'Visita Agendada',
    'Aprovado',
    'Recusado',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">Dossiê de Crédito MEI</h3>
              <p className="text-[11px] font-mono text-slate-400">ID: {lead.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Main Commerce Banner */}
          <CommerceHeader lead={lead} onToast={onToast} />

          {/* Quick Stage Status Switcher */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Alterar Estágio do Funil
            </span>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((st) => {
                const isActive = lead.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(lead.id, st);
                      onToast(`Estágio alterado para "${st}"`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation Bar */}
          <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('visao_geral')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'visao_geral'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Visão Geral
            </button>

            <button
              onClick={() => setActiveTab('analise_credito')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'analise_credito'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Análise de Crédito
            </button>

            <button
              onClick={() => setActiveTab('documentos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'documentos'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Documentos
            </button>

            <button
              onClick={() => setActiveTab('referencias')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'referencias'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Referências ({lead.contatos?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Timeline
            </button>
          </div>

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Proposal Highlight Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Parâmetros do Microcrédito
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Taxa padrão: 20%</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Solicitado</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatCurrency(lead.valor_solicitado)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Prazo</span>
                    <span className="text-base font-black text-white">{lead.prazo} Dias</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Diária</span>
                    <span className="text-base font-black text-cyan-300">
                      {formatCurrency(parcelaDiaria)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Final</span>
                    <span className="text-base font-black text-purple-300">
                      {formatCurrency(valorTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endereços */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  Endereços Verificados
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                        Comercial (Ponto de Venda)
                      </span>
                      <p className="text-slate-200 font-medium">{lead.endereco_comercial}</p>
                    </div>

                    <a
                      href={getGoogleMapsUrl(lead.endereco_comercial)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer shrink-0"
                      title="Abrir no Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {lead.endereco_pessoal && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Residencial
                      </span>
                      <p className="text-slate-300 font-medium">{lead.endereco_pessoal}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Comments Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  Anotações da Equipe de Crédito
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lead.observacoes && lead.observacoes.length > 0 ? (
                    lead.observacoes.map((obs) => (
                      <div key={obs.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span className="text-emerald-400 font-bold">{obs.autor}</span>
                          <span>{obs.dataHora}</span>
                        </div>
                        <p className="text-slate-300">{obs.texto}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhuma observação registrada.</p>
                  )}
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNoteSubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Adicionar nota rápida do analista..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-500 border border-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ANÁLISE DE CRÉDITO */}
          {activeTab === 'analise_credito' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Score Interno do Comércio
                  </h4>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    {lead.score_interno || 800} / 1000
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${((lead.score_interno || 800) / 1000) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Avaliação baseada no fluxo de caixa diário estimado do estabelecimento ({lead.ramo_atividade}) e histórico com fornecedores.
                </p>
              </div>

              {/* Risk Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white border-b border-slate-800 pb-2">
                  Checklist de Risco Presencial
                </h4>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-slate-300">
                  <span>Comprovante de ponto de venda válido</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-slate-300">
                  <span>3 Referências comerciais verificadas</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-slate-300">
                  <span>Chave PIX vinculada ao titular</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in duration-150">
              <DocumentViewer documentos={lead.documentos} />
            </div>
          )}

          {/* TAB 4: REFERÊNCIAS & REDE */}
          {activeTab === 'referencias' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-slate-400">
                Lista de contatos e fornecedores informados pelo microempreendedor para checagem de crédito:
              </p>

              {lead.contatos && lead.contatos.length > 0 ? (
                lead.contatos.map((contact, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {idx + 1}ª Referência
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-400 font-medium">Nome</span>
                        <span className="text-white font-bold">{contact.nome}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Relação / Vínculo</span>
                        <span className="text-white font-bold">{contact.tipo || 'Outro'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">WhatsApp</span>
                        <span className="text-emerald-400 font-mono font-bold">{contact.telefone}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhum contato cadastrado.</p>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-in fade-in duration-150">
              <Timeline events={lead.timeline || []} />
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/90 shrink-0 space-y-3">
          {showApproveConfirm ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in zoom-in-95 duration-150">
              <p className="text-xs text-emerald-300 font-bold text-center">
                Confirmar aprovação do crédito e migrar {lead.nome_comercio} para a base de Clientes Ativos?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApproveConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApproveAndConvert}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Sim, Aprovar e Cadastrar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onUpdateStatus(lead.id, 'Recusado');
                  onToast('Proposta recusada.');
                }}
                className="py-3 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                Recusar Crédito
              </button>

              <button
                onClick={() => setShowApproveConfirm(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprovar Crédito MEI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
