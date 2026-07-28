import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Users,
  Plus,
  Search,
  CheckCircle2,
  X,
  Zap,
  LogOut,
  ChevronRight,
  MessageCircle,
  FileText,
  Award,
  Clock,
  ArrowUpRight,
  Menu,
  Percent,
  PiggyBank,
  Edit3,
  DollarSign,
  ShieldAlert,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  History,
  Check,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { Cliente, Emprestimo, Parcela } from '../types';
import { getTaxaPadrao, PERCENTUAL_DESCONTO_QUITACAO_ANTECIPADA, PERCENTUAL_MULTA_ATRASO } from '../lib/finance/rates';
import { roundCents, distribuirValorEmParcelas } from '../lib/finance/rounding';
import { LeadPipelineCRM } from './LeadPipelineCRM';
import {
  gerarParcelas,
  getScoreRating,
  INITIAL_CLIENTES,
  generateSeedLoansAndInstallments,
} from '../utils/adminLoanEngine';
import { formatCurrency } from '../utils/loanCalculator';
import { saveLeadToSupabase } from '../lib/supabase';
import { LoanWizard } from './loan/LoanWizard';
import { IncompleteProfileBanner } from './loan/IncompleteProfileBanner';
import { PaymentSchedule } from './loan/PaymentSchedule';
import { ContractActions } from './loan/ContractActions';
import { AuditTimeline } from './loan/AuditTimeline';
import { ContratoAuditLog } from '../types/contrato';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  // Navigation tabs: 'dashboard' | 'crm' | 'clientes' | 'financeiro' | 'cliente_detail'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'clientes' | 'financeiro' | 'cliente_detail'>('crm');

  // Mobile menu & side drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTodayDrawerOpen, setIsTodayDrawerOpen] = useState(false);

  // State Management
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_clientes');
      if (saved && saved.includes('cli_001')) {
        localStorage.removeItem('cp_admin_clientes');
        localStorage.removeItem('cp_admin_emprestimos');
        localStorage.removeItem('cp_admin_parcelas');
        return [];
      }
      return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
    } catch {
      return INITIAL_CLIENTES;
    }
  });

  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_emprestimos');
      if (saved) return JSON.parse(saved);
      const seed = generateSeedLoansAndInstallments();
      return seed.emprestimos;
    } catch {
      return generateSeedLoansAndInstallments().emprestimos;
    }
  });

  const [parcelas, setParcelas] = useState<Parcela[]>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_parcelas');
      if (saved) return JSON.parse(saved);
      const seed = generateSeedLoansAndInstallments();
      return seed.parcelas;
    } catch {
      return generateSeedLoansAndInstallments().parcelas;
    }
  });

  // Admin Cash Pool (Saldo em Caixa do Financeiro)
  const [saldoCaixa, setSaldoCaixa] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_saldo_caixa');
      return saved ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  // Modal to edit Cash Pool
  const [isEditCaixaModalOpen, setIsEditCaixaModalOpen] = useState(false);
  const [tempSaldoCaixa, setTempSaldoCaixa] = useState<number>(saldoCaixa);

  // Selected client for detail view
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('cp_admin_clientes');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[0].id : null;
    } catch {
      return null;
    }
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Bloqueado'>('todos');

  // Modals
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Delay Registration Modal State (Registrar Atraso com Multa de 5%)
  const [delayModalParcela, setDelayModalParcela] = useState<Parcela | null>(null);
  const [applyDailyFine, setApplyDailyFine] = useState(true);

  // Interest Exemption & Accordion State for Motor de Cobrança (Fase 2)
  const [isJurosIsentosMap, setIsJurosIsentosMap] = useState<Record<string, boolean>>({});
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // New Loan Form State
  const [newLoanClienteId, setNewLoanClienteId] = useState('');
  const [newLoanValor, setNewLoanValor] = useState<number>(300);
  const [newLoanQtdeParcelas, setNewLoanQtdeParcelas] = useState<10 | 20 | 30>(20);
  const [newLoanDiasCobranca, setNewLoanDiasCobranca] = useState<'seg-sex' | 'seg-sab' | 'seg-dom'>('seg-sex');
  const [newLoanDataInicio, setNewLoanDataInicio] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // New Client Form State
  const [newClientNome, setNewClientNome] = useState('');
  const [newClientCpf, setNewClientCpf] = useState('');
  const [newClientTelefone, setNewClientTelefone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientEndereco, setNewClientEndereco] = useState('');
  const [newClientLimiteTotal, setNewClientLimiteTotal] = useState<number>(500);
  const [newClientFotoUrl, setNewClientFotoUrl] = useState('');

  // Selected client notes & audit logs
  const [selectedNotes, setSelectedNotes] = useState<{ id: string; texto: string; dataHora: string; autor: string }[]>([]);
  const [selectedAuditLogs, setSelectedAuditLogs] = useState<{ id: string; evento: string; dataHora: string }[]>([]);

  useEffect(() => {
    if (selectedClienteId) {
      try {
        const savedNotes = localStorage.getItem(`cp_notes_${selectedClienteId}`);
        setSelectedNotes(savedNotes ? JSON.parse(savedNotes) : [
          { id: 'n1', texto: 'Cadastro inicial aprovado e limite de crédito concedido.', dataHora: 'Sincronização', autor: 'Sistema' }
        ]);
      } catch {
        setSelectedNotes([]);
      }

      try {
        const savedAudit = localStorage.getItem(`cp_audit_${selectedClienteId}`);
        setSelectedAuditLogs(savedAudit ? JSON.parse(savedAudit) : [
          { id: 'a1', evento: 'Cliente criado e ativado com sucesso', dataHora: new Date().toLocaleString() }
        ]);
      } catch {
        setSelectedAuditLogs([]);
      }
    }
  }, [selectedClienteId]);

  const handleAddNote = (text: string) => {
    if (!selectedClienteId || !text.trim()) return;
    const newNote = {
      id: `note_${Date.now()}`,
      texto: text,
      dataHora: new Date().toLocaleString('pt-BR'),
      autor: 'Gestor (Admin)',
    };
    const updated = [newNote, ...selectedNotes];
    setSelectedNotes(updated);
    localStorage.setItem(`cp_notes_${selectedClienteId}`, JSON.stringify(updated));
  };

  const addAuditLog = (evento: string) => {
    if (!selectedClienteId) return;
    const newLog = {
      id: `audit_${Date.now()}`,
      evento,
      dataHora: new Date().toLocaleString('pt-BR'),
    };
    const updated = [newLog, ...selectedAuditLogs];
    setSelectedAuditLogs(updated);
    localStorage.setItem(`cp_audit_${selectedClienteId}`, JSON.stringify(updated));
  };

  // Edit / KYC Modals and Fields
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editRg, setEditRg] = useState('');
  const [editDataNasc, setEditDataNasc] = useState('');
  const [editEstadoCivil, setEditEstadoCivil] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editEnderecoRes, setEditEnderecoRes] = useState('');
  const [editProfissao, setEditProfissao] = useState('');
  const [editEmpresa, setEditEmpresa] = useState('');
  const [editRenda, setEditRenda] = useState<number>(0);
  const [editChavePix, setEditChavePix] = useState('');
  const [editContato1Nome, setEditContato1Nome] = useState('');
  const [editContato1Tel, setEditContato1Tel] = useState('');
  const [editContato2Nome, setEditContato2Nome] = useState('');
  const [editContato2Tel, setEditContato2Tel] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [editDocUrl, setEditDocUrl] = useState('');
  const [editComprovanteUrl, setEditComprovanteUrl] = useState('');
  const [editSelfieUrl, setEditSelfieUrl] = useState('');

  const handleOpenEditModal = () => {
    if (!selectedCliente) return;
    setEditNome(selectedCliente.nome || '');
    setEditCpf(selectedCliente.cpf || '');
    setEditRg(selectedCliente.rg || '');
    setEditDataNasc(selectedCliente.data_nascimento || '');
    setEditEstadoCivil(selectedCliente.estado_civil || '');
    setEditEndereco(selectedCliente.endereco || '');
    setEditEnderecoRes(selectedCliente.endereco_residencial || '');
    setEditProfissao(selectedCliente.profissao || '');
    setEditEmpresa(selectedCliente.empresa || '');
    setEditRenda(selectedCliente.renda_mensal || 0);
    setEditChavePix(selectedCliente.chave_pix || '');
    setEditContato1Nome(selectedCliente.contatos?.[0]?.nome || '');
    setEditContato1Tel(selectedCliente.contatos?.[0]?.tel || '');
    setEditContato2Nome(selectedCliente.contatos?.[1]?.nome || '');
    setEditContato2Tel(selectedCliente.contatos?.[1]?.tel || '');
    setEditFotoUrl(selectedCliente.foto_url || '');
    setEditDocUrl(selectedCliente.doc_url || '');
    setEditComprovanteUrl(selectedCliente.comprovante_residencia_url || '');
    setEditSelfieUrl(selectedCliente.selfie_url || '');
    setIsEditClientModalOpen(true);
  };

  const handleSaveClientKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) return;

    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === selectedClienteId) {
          return {
            ...c,
            nome: editNome,
            cpf: editCpf,
            rg: editRg,
            data_nascimento: editDataNasc,
            estado_civil: editEstadoCivil,
            endereco: editEndereco,
            endereco_residencial: editEnderecoRes,
            profissao: editProfissao,
            empresa: editEmpresa,
            renda_mensal: Number(editRenda),
            chave_pix: editChavePix,
            contatos: [
              { nome: editContato1Nome, tel: editContato1Tel },
              ...(editContato2Nome ? [{ nome: editContato2Nome, tel: editContato2Tel }] : []),
            ],
            foto_url: editFotoUrl,
            doc_url: editDocUrl,
            comprovante_residencia_url: editComprovanteUrl,
            selfie_url: editSelfieUrl,
          };
        }
        return c;
      })
    );

    addAuditLog('Dados cadastrais completos (KYC) atualizados.');
    setIsEditClientModalOpen(false);
  };

  const handleToggleBlockClient = () => {
    if (!selectedCliente) return;
    const newStatus = selectedCliente.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
    setClientes((prev) =>
      prev.map((c) => (c.id === selectedCliente.id ? { ...c, status: newStatus } : c))
    );
    addAuditLog(`Status do cliente alterado para ${newStatus}.`);
    alert(`Cliente ${newStatus === 'Bloqueado' ? 'bloqueado/negativado' : 'ativado'} com sucesso!`);
  };

  const [isChangeLimitModalOpen, setIsChangeLimitModalOpen] = useState(false);
  const [tempLimitValue, setTempLimitValue] = useState<number>(1000);

  const handleSaveLimit = () => {
    if (!selectedCliente) return;
    const oldLimit = selectedCliente.limite_total;
    const newLimit = tempLimitValue;
    const diff = newLimit - oldLimit;

    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === selectedCliente.id) {
          return {
            ...c,
            limite_total: newLimit,
            limite_disponivel: Math.max(0, c.limite_disponivel + diff),
          };
        }
        return c;
      })
    );

    addAuditLog(`Limite total alterado de ${formatCurrency(oldLimit)} para ${formatCurrency(newLimit)}`);
    setIsChangeLimitModalOpen(false);
  };

  // Refin Modal States
  const [isRefinModalOpen, setIsRefinModalOpen] = useState(false);
  const [refinTerm, setRefinTerm] = useState<10 | 20 | 30>(20);
  const [refinDiasCobranca, setRefinDiasCobranca] = useState<'seg-sex' | 'seg-sab' | 'seg-dom'>('seg-sex');

  // Early payoff modal state
  const [isQuitacaoModalOpen, setIsQuitacaoModalOpen] = useState(false);

  // Adjust installment state
  const [adjustParcela, setAdjustParcela] = useState<Parcela | null>(null);
  const [adjustVencimento, setAdjustVencimento] = useState('');
  const [adjustValor, setAdjustValor] = useState<number>(0);

  const handleOpenAdjustParcela = (p: Parcela) => {
    setAdjustParcela(p);
    setAdjustVencimento(p.data_vencimento);
    setAdjustValor(p.valor_esperado);
  };

  const handleSaveAdjustParcela = () => {
    if (!adjustParcela) return;

    setParcelas((prev) =>
      prev.map((p) => {
        if (p.id === adjustParcela.id) {
          return {
            ...p,
            data_vencimento: adjustVencimento,
            valor_esperado: adjustValor,
          };
        }
        return p;
      })
    );

    addAuditLog(`Parcela #${adjustParcela.numero_parcela} alterada. Novo Vencimento: ${adjustVencimento}, Novo Valor: ${formatCurrency(adjustValor)}.`);
    setAdjustParcela(null);
  };

  // Receipt Share
  const handleShareReceipt = (p: Parcela) => {
    const text = `*RECIBO DE PAGAMENTO - MONKEY GESTÃO*\n\n` +
      `Recebemos de *${selectedCliente.nome}*\n` +
      `Valor pago: *${formatCurrency(p.valor_pago || p.valor_esperado)}*\n` +
      `Referente à Parcela: *#${p.numero_parcela}*\n` +
      `Data de vencimento: *${p.data_vencimento.split('-').reverse().join('/')}*\n` +
      `Data de pagamento: *${(p.data_pagamento || todayISO).split('-').reverse().join('/')}*\n\n` +
      `Agradecemos a pontualidade!\n` +
      `Monkey Crédito MEI`;
    
    const waUrl = `https://wa.me/55${selectedCliente.telefone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('cp_admin_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('cp_admin_emprestimos', JSON.stringify(emprestimos));
  }, [emprestimos]);

  useEffect(() => {
    localStorage.setItem('cp_admin_parcelas', JSON.stringify(parcelas));
  }, [parcelas]);

  useEffect(() => {
    localStorage.setItem('cp_admin_saldo_caixa', saldoCaixa.toString());
  }, [saldoCaixa]);

  // Key Dates & Calculations
  const todayISO = new Date().toISOString().split('T')[0];

  // 1. Capital Emprestado / Na Rua
  const capitalNaRua = parcelas
    .filter((p) => p.status === 'pendente' || p.status === 'atrasada')
    .reduce((acc, p) => acc + p.valor_esperado, 0);

  // 2. Total Recebido Histórico
  const totalRecebidoHistorico = parcelas
    .filter((p) => p.status === 'paga')
    .reduce((acc, p) => acc + (p.valor_pago || p.valor_esperado), 0);

  // 3. Recebíveis do Dia
  const parcelasHoje = parcelas.filter((p) => p.data_vencimento === todayISO);
  const recebiVeisHojeTotal = parcelasHoje.reduce((acc, p) => acc + p.valor_esperado, 0);
  const recebiVeisHojeRecebidos = parcelasHoje
    .filter((p) => p.status === 'paga')
    .reduce((acc, p) => acc + (p.valor_pago || p.valor_esperado), 0);

  // 4. Inadimplência & Atrasos
  const parcelasAtrasadas = parcelas.filter((p) => p.status === 'atrasada');
  const valorInadimplencia = parcelasAtrasadas.reduce((acc, p) => acc + p.valor_esperado, 0);
  const taxaInadimplencia = capitalNaRua > 0 ? ((valorInadimplencia / capitalNaRua) * 100).toFixed(1) : '0.0';

  // Capital Total Gerido (Limites Totais)
  const capitalTotalGerido = clientes.reduce((acc, c) => acc + c.limite_total, 0);

  // Actions for Installments (Baixa de Pagamento)
  const handleBaixarParcela = (parcelaId: string) => {
    let valorRecebido = 0;

    setParcelas((prev) =>
      prev.map((p) => {
        if (p.id === parcelaId) {
          valorRecebido = p.valor_esperado;
          return {
            ...p,
            status: 'paga',
            valor_pago: p.valor_esperado,
            data_pagamento: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );

    // Increase Cash Pool with received payment
    if (valorRecebido > 0) {
      setSaldoCaixa((prev) => prev + valorRecebido);
    }

    // Restore proportional credit limit and increase score
    const targetParcela = parcelas.find((p) => p.id === parcelaId);
    if (targetParcela) {
      setClientes((prev) =>
        prev.map((c) => {
          if (c.id === targetParcela.cliente_id) {
            const restoredLimit = Math.min(
              c.limite_total,
              c.limite_disponivel + targetParcela.valor_esperado
            );
            const updatedScore = Math.min(1200, c.score + 15);
            return {
              ...c,
              limite_disponivel: restoredLimit,
              score: updatedScore,
            };
          }
          return c;
        })
      );
    }
  };

  // Register Delay with optional 5% daily fine
  const handleConfirmarAtraso = () => {
    if (!delayModalParcela) return;

    const parcelaId = delayModalParcela.id;
    const targetParcela = parcelas.find((p) => p.id === parcelaId);
    if (!targetParcela) return;

    // Calculate 5% fine if selected
    const fineValue = applyDailyFine ? roundCents(targetParcela.valor_esperado * PERCENTUAL_MULTA_ATRASO) : 0;
    const novoValorEsperado = targetParcela.valor_esperado + fineValue;

    setParcelas((prev) =>
      prev.map((p) => {
        if (p.id === parcelaId) {
          return {
            ...p,
            status: 'atrasada',
            multa_aplicada: applyDailyFine,
            valor_multa: fineValue,
            valor_esperado: novoValorEsperado,
          };
        }
        return p;
      })
    );

    // Reduce Customer Score for late payment
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === targetParcela.cliente_id) {
          return {
            ...c,
            score: Math.max(200, c.score - 30),
          };
        }
        return c;
      })
    );

    setDelayModalParcela(null);
  };

  // Motor de Empréstimo Generation Logic
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanClienteId) return;

    const targetCliente = clientes.find((c) => c.id === newLoanClienteId);
    if (!targetCliente) return;

    // Check Available Cash in Pool
    if (newLoanValor > saldoCaixa) {
      alert(`Saldo insuficiente na ferramenta 'Financeiro'. Caixa atual: ${formatCurrency(saldoCaixa)}.`);
      return;
    }

    // Check Rotational Limit
    if (newLoanValor > targetCliente.limite_disponivel) {
      alert(
        `Atenção: O valor solicitado (${formatCurrency(newLoanValor)}) é maior do que o Limite Disponível do cliente (${formatCurrency(
          targetCliente.limite_disponivel
        )}).`
      );
      return;
    }

    // Rate multiplier calculation
    const rateMultiplier = newLoanQtdeParcelas === 10 ? 0.10 : newLoanQtdeParcelas === 20 ? 0.20 : 0.30;
    const valorTotalDevido = Math.round(newLoanValor * (1 + rateMultiplier));
    const valorParcela = Math.round((valorTotalDevido / newLoanQtdeParcelas) * 100) / 100;

    const newLoanId = `emp_${Date.now()}`;

    const newEmprestimo: Emprestimo = {
      id: newLoanId,
      cliente_id: targetCliente.id,
      cliente_nome: targetCliente.nome,
      valor_principal: newLoanValor,
      valor_total_devido: valorTotalDevido,
      qtde_parcelas: newLoanQtdeParcelas,
      valor_parcela: valorParcela,
      dias_cobranca: newLoanDiasCobranca,
      data_inicio: newLoanDataInicio,
      status: 'ativo',
      criado_em: new Date().toISOString(),
    };

    // Generate Installment Schedule using Loan Engine
    const generatedParcelas = gerarParcelas(
      newLoanValor,
      valorTotalDevido,
      newLoanQtdeParcelas,
      newLoanDiasCobranca,
      newLoanDataInicio,
      newLoanId,
      targetCliente.id,
      targetCliente.nome,
      targetCliente.telefone
    );

    // Update States & Deduct Loan Principal from Cash Pool
    setEmprestimos((prev) => [newEmprestimo, ...prev]);
    setParcelas((prev) => [...generatedParcelas, ...prev]);
    setSaldoCaixa((prev) => Math.max(0, prev - newLoanValor));

    // Reduce Customer Rotational Limit
    setClientes((prev) =>
      prev.map((c) =>
        c.id === targetCliente.id
          ? { ...c, limite_disponivel: c.limite_disponivel - newLoanValor }
          : c
      )
    );

    // Save to Supabase
    saveLeadToSupabase({
      nome: targetCliente.nome,
      email: targetCliente.email,
      telefone: targetCliente.telefone,
      valor_solicitado: newLoanValor,
      prazo_dias: newLoanQtdeParcelas,
      status: 'Empréstimo Aprovado pelo Gestor',
    });

    setIsNewLoanModalOpen(false);
  };

  const handleWizardSaveLoan = (
    newEmprestimo: Emprestimo,
    generatedParcelas: Parcela[],
    wizardAuditLogs: ContratoAuditLog[]
  ) => {
    const targetCliente = clientes.find((c) => c.id === newEmprestimo.cliente_id);
    if (!targetCliente) return;

    setEmprestimos((prev) => [newEmprestimo, ...prev]);
    setParcelas((prev) => [...generatedParcelas, ...prev]);
    setSaldoCaixa((prev) => Math.max(0, prev - newEmprestimo.valor_principal));

    setClientes((prev) =>
      prev.map((c) =>
        c.id === targetCliente.id
          ? { ...c, limite_disponivel: Math.max(0, c.limite_disponivel - newEmprestimo.valor_principal) }
          : c
      )
    );

    saveLeadToSupabase({
      nome: targetCliente.nome,
      email: targetCliente.email,
      telefone: targetCliente.telefone,
      valor_solicitado: newEmprestimo.valor_principal,
      prazo_dias: newEmprestimo.qtde_parcelas,
      status: 'Empréstimo Aprovado pelo Gestor',
    });

    const savedAuditKey = `cp_audit_${targetCliente.id}`;
    let existingLogs = [];
    try {
      const saved = localStorage.getItem(savedAuditKey);
      existingLogs = saved ? JSON.parse(saved) : [];
    } catch {}

    const formattedWizardLogs = wizardAuditLogs.map((l) => ({
      id: l.id,
      evento: `${l.evento} ${l.detalhes ? `(${l.detalhes})` : ''}`,
      dataHora: new Date().toLocaleString('pt-BR'),
    }));

    const newLogs = [...formattedWizardLogs, ...existingLogs];
    localStorage.setItem(savedAuditKey, JSON.stringify(newLogs));
  };

  // Create New Customer Logic
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientNome || !newClientTelefone) return;

    const newClient: Cliente = {
      id: `cli_${Date.now()}`,
      nome: newClientNome,
      cpf: newClientCpf || 'Não informado',
      telefone: newClientTelefone.replace(/\D/g, ''),
      email: newClientEmail || 'sememail@exemplo.com',
      endereco: newClientEndereco || 'Endereço não informado',
      limite_total: newClientLimiteTotal,
      limite_disponivel: newClientLimiteTotal,
      score: 1000,
      status: 'Ativo',
      criado_em: new Date().toISOString(),
      foto_url: newClientFotoUrl || undefined,
    };

    setClientes((prev) => [newClient, ...prev]);
    setIsNewClientModalOpen(false);
    setSelectedClienteId(newClient.id);
    setActiveTab('cliente_detail');

    // Reset Form
    setNewClientNome('');
    setNewClientCpf('');
    setNewClientTelefone('');
    setNewClientEmail('');
    setNewClientEndereco('');
    setNewClientFotoUrl('');
  };

  // Save Cash Pool Adjustment
  const handleSaveCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    setSaldoCaixa(Number(tempSaldoCaixa));
    setIsEditCaixaModalOpen(false);
  };

  // Refinancing / Rolagem operation
  const handleRefinancing = (activeLoan: Emprestimo, activeParcelas: Parcela[]) => {
    const unpaidParcelas = activeParcelas.filter((p) => p.status !== 'paga');
    const remainingBalance = unpaidParcelas.reduce((acc, p) => acc + p.valor_esperado, 0);

    if (remainingBalance <= 0) {
      alert('Contrato já está quitado!');
      return;
    }

    // Cancel / Pay off the old installments
    setParcelas((prev) =>
      prev.map((p) => {
        if (p.emprestimo_id === activeLoan.id && p.status !== 'paga') {
          return {
            ...p,
            status: 'paga',
            valor_pago: 0,
            data_pagamento: todayISO,
          };
        }
        return p;
      })
    );

    // Cancel old loan status
    setEmprestimos((prev) =>
      prev.map((e) => (e.id === activeLoan.id ? { ...e, status: 'quitado' } : e))
    );

    // Create new loan — usa a MESMA tabela de taxas oficial do simulador
    // público (src/lib/finance/rates.ts), evitando divergência entre o que
    // o cliente vê simulado e o que é realmente cobrado no refinanciamento.
    const rateMultiplier = getTaxaPadrao(refinTerm);
    const valorTotalDevido = Math.round(remainingBalance * (1 + rateMultiplier));
    const valorParcela = roundCents(valorTotalDevido / refinTerm);

    const newLoanId = `emp_${Date.now()}`;
    const newEmprestimo: Emprestimo = {
      id: newLoanId,
      cliente_id: selectedCliente.id,
      cliente_nome: selectedCliente.nome,
      valor_principal: remainingBalance,
      valor_total_devido: valorTotalDevido,
      qtde_parcelas: refinTerm,
      valor_parcela: valorParcela,
      dias_cobranca: refinDiasCobranca,
      data_inicio: todayISO,
      status: 'ativo',
      criado_em: new Date().toISOString(),
    };

    const generatedParcelas = gerarParcelas(
      remainingBalance,
      valorTotalDevido,
      refinTerm,
      refinDiasCobranca,
      todayISO,
      newLoanId,
      selectedCliente.id,
      selectedCliente.nome,
      selectedCliente.telefone
    );

    setEmprestimos((prev) => [newEmprestimo, ...prev]);
    setParcelas((prev) => [...generatedParcelas, ...prev]);

    addAuditLog(`Contrato ${activeLoan.id} refinanciado no novo contrato ${newLoanId} por ${refinTerm} dias. Saldo devedor migrado: ${formatCurrency(remainingBalance)}.`);
    setIsRefinModalOpen(false);
    alert('Refinanciamento (Refin) realizado com sucesso!');
  };

  // Early payoff option
  const handleEarlyPayoff = (activeLoan: Emprestimo, activeParcelas: Parcela[]) => {
    const unpaidParcelas = activeParcelas.filter((p) => p.status !== 'paga');
    const remainingBalance = unpaidParcelas.reduce((acc, p) => acc + p.valor_esperado, 0);

    if (remainingBalance <= 0) {
      alert('Nenhuma parcela em aberto.');
      return;
    }

    // Apply discount (percentual único vindo da tabela de taxas — sem número
    // mágico duplicado) — distribuído parcela a parcela em centavos, para
    // a soma do que foi baixado bater exatamente com o payoffValue.
    const payoffValue = roundCents(remainingBalance * (1 - PERCENTUAL_DESCONTO_QUITACAO_ANTECIPADA));
    const valoresPagos = distribuirValorEmParcelas(payoffValue, unpaidParcelas.length);
    const valorPagoPorParcelaId = new Map(
      unpaidParcelas.map((p, idx) => [p.id, valoresPagos[idx]])
    );

    // Register all unpaid as paid
    setParcelas((prev) =>
      prev.map((p) => {
        if (p.emprestimo_id === activeLoan.id && p.status !== 'paga') {
          return {
            ...p,
            status: 'paga',
            valor_pago: valorPagoPorParcelaId.get(p.id) ?? roundCents(p.valor_esperado * (1 - PERCENTUAL_DESCONTO_QUITACAO_ANTECIPADA)),
            data_pagamento: todayISO,
          };
        }
        return p;
      })
    );

    // Update loan status to quitado
    setEmprestimos((prev) =>
      prev.map((e) => (e.id === activeLoan.id ? { ...e, status: 'quitado' } : e))
    );

    // Add to cash pool
    setSaldoCaixa((prev) => prev + payoffValue);

    // Restore limit
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === selectedCliente.id) {
          return {
            ...c,
            limite_disponivel: c.limite_total,
            score: Math.min(1200, c.score + 50),
          };
        }
        return c;
      })
    );

    addAuditLog(`Quitação antecipada realizada com 15% de desconto. Pago total de ${formatCurrency(payoffValue)} (era ${formatCurrency(remainingBalance)}).`);
    setIsQuitacaoModalOpen(false);
    alert('Contrato quitado com sucesso!');
  };

  // Selected Client Details
  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) || clientes[0];
  const selectedClienteEmprestimos = emprestimos.filter((e) => e.cliente_id === selectedCliente?.id);
  const selectedClienteParcelas = parcelas.filter((p) => p.cliente_id === selectedCliente?.id);

  // Score Rating Badge Info
  const scoreInfo = selectedCliente ? getScoreRating(selectedCliente.score) : null;

  // Filtered Clients
  const filteredClientes = clientes.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.telefone.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Floating Side Button for Today's Receivables / Mobile Drawer Trigger */}
      <button
        onClick={() => setIsTodayDrawerOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-emerald-300/30"
      >
        <Calendar className="w-4 h-4 stroke-[2.5]" />
        <span>Recebidos de Hoje ({recebiVeisHojeRecebidos > 0 ? formatCurrency(recebiVeisHojeRecebidos) : parcelasHoje.length})</span>
      </button>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-tight">
                  Crédito<span className="text-emerald-400">Popular</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Painel Gestor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Controle de Empréstimos, Clientes e Saldo em Caixa
              </p>
            </div>
          </div>

          {/* Quick Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewLoanClienteId(selectedCliente?.id || clientes[0]?.id || '');
                setIsNewLoanModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Novo Empréstimo</span>
              <span className="sm:hidden">Novo</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700/60 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={onLogout}
              title="Sair do Admin"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Desktop/Tablet Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-950" />
            <span>CRM de Solicitações (Pipeline)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Financeiro</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'clientes' || activeTab === 'cliente_detail'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes & Limites ({clientes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financeiro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'financeiro'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Financeiro (Caixa & Balanço)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB CRM PIPELINE */}
        {activeTab === 'crm' && (
          <LeadPipelineCRM
            onAddClienteFromLead={(newCli) => setClientes((prev) => [newCli, ...prev])}
          />
        )}
        {/* =========================================================================
            TAB 1: DASHBOARD FINANCEIRO GLOBAL
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Saldo em Caixa */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Saldo em Caixa
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {formatCurrency(saldoCaixa)}
                </div>
                <button
                  onClick={() => setActiveTab('financeiro')}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Módulo Financeiro</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 2: Capital na Rua */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Capital na Rua (Devido)
                  </span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-cyan-400">
                  {formatCurrency(capitalNaRua)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Total de parcelas ativas a receber
                </p>
              </div>

              {/* Card 3: Recebíveis de Hoje */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-teal-500/30 relative overflow-hidden space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recebíveis de Hoje
                  </span>
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-teal-300">
                  {formatCurrency(recebiVeisHojeTotal)}
                </div>
                <p className="text-[11px] text-teal-400 font-semibold">
                  Recebido: {formatCurrency(recebiVeisHojeRecebidos)}
                </p>
              </div>

              {/* Card 4: Inadimplência */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 relative overflow-hidden space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Em Atraso (Multa 5%)
                  </span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400 flex items-baseline justify-between">
                  <span>{formatCurrency(valorInadimplencia)}</span>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {taxaInadimplencia}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {parcelasAtrasadas.length} parcela(s) vencida(s)
                </p>
              </div>
            </div>

            {/* Cronograma de Cobrança do Dia - Cards Responsivos Sem Scroll Horizontal */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Cronograma de Cobrança de Hoje ({todayISO})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Horário limite padrão de pagamento: <strong>17h00</strong>. Após as 17h, registre atraso com multa de 5%.
                  </p>
                </div>

                <button
                  onClick={() => setIsTodayDrawerOpen(true)}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Lateral</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {parcelasHoje.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto" />
                  <p>Nenhuma parcela com vencimento programado para a data de hoje.</p>
                </div>
              ) : (
                /* Card List with Zebra Striping for easy mobile reading */
                <div className="space-y-2">
                  {parcelasHoje.map((p, index) => {
                    const waLink = `https://wa.me/55${p.cliente_tel}?text=Ol%C3%A1%20${encodeURIComponent(
                      p.cliente_nome
                    )}%2C%20sua%20parcela%20n%C2%BA%20${p.numero_parcela}%20no%20valor%20de%20R%24%20${p.valor_esperado.toFixed(
                      2
                    )}%20vence%20hoje.%20Favor%20efetuar%20o%20pagamento%20at%C3%A9%20as%2017h.`;

                    // Alternating soft zebra colors
                    const rowBg = index % 2 === 0 ? 'bg-slate-950/80' : 'bg-slate-900/60';

                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border border-slate-800/80 ${rowBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors hover:border-slate-700`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.cliente_nome}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                                p.status === 'paga'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : p.status === 'atrasada'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {p.status === 'paga'
                                ? 'Paga'
                                : p.status === 'atrasada'
                                ? 'Atrasada (Multa 5%)'
                                : 'Pendente (Até 17h)'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-400 font-mono">
                            <span>Tel: {p.cliente_tel}</span>
                            <span>Parcela Nº {p.numero_parcela}</span>
                            <span className="text-emerald-400 font-bold font-sans">
                              {formatCurrency(p.valor_esperado)}
                            </span>
                          </div>
                        </div>

                        {/* Actions stacked cleanly on mobile, inline on desktop */}
                        <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 justify-end">
                          {p.status !== 'paga' && (
                            <>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Cobrar</span>
                              </a>

                              <button
                                onClick={() => handleBaixarParcela(p.id)}
                                className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                              >
                                Baixar
                              </button>

                              <button
                                onClick={() => setDelayModalParcela(p)}
                                className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
                              >
                                Registrar Atraso
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: FERRAMENTA 'FINANCEIRO' (SALDO, CAPITAL, BALANÇO COMPLETO)
           ========================================================================= */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-emerald-400" />
                    Ferramenta Financeiro (Caixa & Balanço)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gestão central do saldo próprio para empréstimos e balanço geral do negócio
                  </p>
                </div>

                <button
                  onClick={() => {
                    setTempSaldoCaixa(saldoCaixa);
                    setIsEditCaixaModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ajustar / Aportar Caixa</span>
                </button>
              </div>

              {/* Main Financial Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Saldo em Caixa Disponível</span>
                  <div className="text-2xl font-black text-emerald-400">{formatCurrency(saldoCaixa)}</div>
                  <p className="text-[11px] text-slate-400">Capital limpo pronto para conceder empréstimos</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Valor Emprestado (Na Rua)</span>
                  <div className="text-2xl font-black text-cyan-400">{formatCurrency(capitalNaRua)}</div>
                  <p className="text-[11px] text-slate-400">Saldo devedor total acumulado dos clientes</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Recebido (Histórico)</span>
                  <div className="text-2xl font-black text-teal-300">{formatCurrency(totalRecebidoHistorico)}</div>
                  <p className="text-[11px] text-slate-400">Soma de todas as parcelas pagas</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total em Atraso (Com Multa)</span>
                  <div className="text-2xl font-black text-rose-400">{formatCurrency(valorInadimplencia)}</div>
                  <p className="text-[11px] text-slate-400">{parcelasAtrasadas.length} parcela(s) vencida(s)</p>
                </div>
              </div>

              {/* Financial Balance Overview Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Resumo do Patrimônio de Empréstimos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">Patrimônio Operacional Total</span>
                    <span className="text-lg font-extrabold text-white">
                      {formatCurrency(saldoCaixa + capitalNaRua)}
                    </span>
                    <p className="text-[10px] text-slate-500">(Caixa Disponível + Capital na Rua)</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">Geração de Juros Prevista</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {formatCurrency(capitalNaRua * 0.20)}
                    </span>
                    <p className="text-[10px] text-slate-500">(Estimativa média de taxa de retorno)</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">Capital Total Concedido (Limites)</span>
                    <span className="text-lg font-extrabold text-slate-300">
                      {formatCurrency(capitalTotalGerido)}
                    </span>
                    <p className="text-[10px] text-slate-500">Soma de limites aprovados de todos os clientes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CLIENTES & LIMITES ROTATIVOS
           ========================================================================= */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nome, CPF ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Novo Cliente</span>
              </button>
            </div>

            {/* Clients Grid (No side-scroll necessary!) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClientes.map((c) => {
                const sInfo = getScoreRating(c.score);
                const pctUsed = Math.round(((c.limite_total - c.limite_disponivel) / c.limite_total) * 100);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClienteId(c.id);
                      setActiveTab('cliente_detail');
                    }}
                    className={`p-5 rounded-3xl bg-slate-900/90 border transition-all cursor-pointer space-y-4 hover:scale-[1.01] ${
                      selectedClienteId === c.id
                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base overflow-hidden shrink-0">
                          {c.foto_url ? (
                            <img src={c.foto_url} alt={c.nome} className="w-full h-full object-cover" />
                          ) : (
                            c.nome.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{c.nome}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">{c.cpf}</p>
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${sInfo.bg} ${sInfo.color} ${sInfo.border}`}
                      >
                        {c.score} pts
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 text-[11px]">Limite Rotativo</span>
                        <span className="font-bold text-emerald-400 text-[11px]">
                          {formatCurrency(c.limite_disponivel)} disponível
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, 100 - pctUsed))}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Em uso: {formatCurrency(c.limite_total - c.limite_disponivel)}</span>
                        <span>Total: {formatCurrency(c.limite_total)}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Tel: {c.telefone}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 group">
                        Ver Cronograma
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            FASE 2: DETALHE DO CLIENTE & MOTOR DE COBRANÇA (SNOWBALL EFFECT / ROLAGEM)
           ========================================================================= */}
        {activeTab === 'cliente_detail' && selectedCliente && (() => {
          const clientLoans = emprestimos.filter((e) => e.cliente_id === selectedCliente.id);
          const activeLoan = clientLoans.find((e) => e.status === 'ativo' || e.status === 'inadimplente');
          const finishedLoans = clientLoans.filter((e) => e.status === 'quitado');

          // Active loan installments
          const activeParcelas = activeLoan
            ? parcelas.filter((p) => p.emprestimo_id === activeLoan.id)
            : [];

          const parcelasAtrasadasActive = activeParcelas.filter((p) => p.status === 'atrasada');

          // Visão 360° Metrics
          const totalEmprestado = clientLoans.reduce((sum, e) => sum + e.valor_principal, 0);
          const totalJurosPagos = clientLoans.reduce((sum, e) => {
            if (e.status === 'quitado') {
              return sum + (e.valor_total_devido - e.valor_principal);
            } else {
              const loanParcelas = parcelas.filter(p => p.emprestimo_id === e.id);
              const paidParcelas = loanParcelas.filter(p => p.status === 'paga');
              if (paidParcelas.length === 0) return sum;
              const interestPerParcela = (e.valor_total_devido - e.valor_principal) / e.qtde_parcelas;
              return sum + (interestPerParcela * paidParcelas.length) + paidParcelas.reduce((s, p) => s + (p.valor_multa || 0), 0);
            }
          }, 0);
          const totalAtrasosDays = parcelasAtrasadasActive.reduce((sum, p) => {
            const dueDate = new Date(p.data_vencimento).getTime();
            const todayTime = new Date(todayISO).getTime();
            const diffDays = Math.max(1, Math.floor((todayTime - dueDate) / (1000 * 60 * 60 * 24)));
            return sum + diffDays;
          }, 0);
          const atrasoMedio = parcelasAtrasadasActive.length > 0 ? Math.round(totalAtrasosDays / parcelasAtrasadasActive.length) : 0;
          const parcelaHojeActive = activeParcelas.find(
            (p) => p.data_vencimento === todayISO && p.status === 'pendente'
          ) || activeParcelas.find((p) => p.status === 'pendente');

          // Check interest exemption
          const isJurosIsento = activeLoan ? !!isJurosIsentosMap[activeLoan.id] : false;

          // Snowball / Rolagem calculation
          const valorAtrasadoBase = parcelasAtrasadasActive.reduce(
            (acc, p) => acc + (p.multa_aplicada && p.valor_multa ? p.valor_esperado - p.valor_multa : p.valor_esperado),
            0
          );
          const jurosAtrasoTotal = parcelasAtrasadasActive.reduce(
            (acc, p) => acc + (p.valor_multa || 0),
            0
          );
          const valorHojeBase = parcelaHojeActive ? parcelaHojeActive.valor_esperado : 0;

          const valorTotalDevidoHoje = valorAtrasadoBase + (isJurosIsento ? 0 : jurosAtrasoTotal) + valorHojeBase;

          const isOverdue = parcelasAtrasadasActive.length > 0;

          // Handle WhatsApp automated message
          const generateWaMessage = () => {
            const lines = [
              `Olá *${selectedCliente.nome}*!`,
              `Segue o resumo do seu contrato no *Monkey Admin* para acerto HOJE (${todayISO.split('-').reverse().join('/')}):`,
              '',
            ];

            if (parcelasAtrasadasActive.length > 0) {
              lines.push(`🔴 *Parcela(s) Atrasada(s):* ${formatCurrency(valorAtrasadoBase)}`);
            }
            if (jurosAtrasoTotal > 0) {
              if (isJurosIsento) {
                lines.push(`💚 *Juros Diários:* ISENTOS pelo administrador (R$ 0,00)`);
              } else {
                lines.push(`⚠️ *Juros Diários Acumulados:* ${formatCurrency(jurosAtrasoTotal)}`);
              }
            }
            if (parcelaHojeActive) {
              lines.push(`🟡 *Parcela Vencendo Hoje:* ${formatCurrency(valorHojeBase)}`);
            }

            lines.push('----------------------------------');
            lines.push(`💰 *TOTAL DEVUDO HOJE: ${formatCurrency(valorTotalDevidoHoje)}*`);
            lines.push('');
            lines.push(`📌 *Chave PIX (WhatsApp):* ${selectedCliente.telefone}`);
            lines.push(`Por favor, envie o comprovante de pagamento assim que transferir.`);

            return encodeURIComponent(lines.join('\n'));
          };

          const handleBaixarTudoHoje = () => {
            const itemsToPay = [
              ...parcelasAtrasadasActive,
              ...(parcelaHojeActive ? [parcelaHojeActive] : []),
            ];

            if (itemsToPay.length === 0) {
              alert('Não há parcelas a receber hoje.');
              return;
            }

            const paidValue = valorTotalDevidoHoje;

            setParcelas((prev) =>
              prev.map((p) => {
                const match = itemsToPay.find((it) => it.id === p.id);
                if (match) {
                  return {
                    ...p,
                    status: 'paga',
                    valor_pago: p.id === parcelaHojeActive?.id
                      ? p.valor_esperado
                      : (p.multa_aplicada && p.valor_multa
                          ? (isJurosIsento ? p.valor_esperado - p.valor_multa : p.valor_esperado)
                          : p.valor_esperado),
                    data_pagamento: todayISO,
                  };
                }
                return p;
              })
            );

            // Add to cash pool
            setSaldoCaixa((prev) => prev + paidValue);

            // Restore customer limit
            setClientes((prev) =>
              prev.map((c) => {
                if (c.id === selectedCliente.id) {
                  return {
                    ...c,
                    limite_disponivel: Math.min(c.limite_total, c.limite_disponivel + paidValue),
                    score: Math.min(1200, c.score + 25),
                  };
                }
                return c;
              })
            );

            alert(`Pagamento de ${formatCurrency(paidValue)} registrado com sucesso!`);
          };

          return (
            <div className="space-y-6">
              <button
                onClick={() => setActiveTab('clientes')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                ← Voltar para lista de clientes
              </button>

              {/* Profile completeness warning */}
              <IncompleteProfileBanner
                cliente={selectedCliente}
                onCompleteClick={handleOpenEditModal}
              />

              {/* 1. HEADER DO CLIENTE (TOPO) */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-white text-xl overflow-hidden shrink-0 shadow-lg">
                      {selectedCliente.foto_url ? (
                        <img src={selectedCliente.foto_url} alt={selectedCliente.nome} className="w-full h-full object-cover" />
                      ) : (
                        selectedCliente.nome.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-white">{selectedCliente.nome}</h2>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {isOverdue ? '⚠️ Em Atraso' : '✓ Em Dia'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {selectedCliente.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono pt-1">
                        CPF: {selectedCliente.cpf} • Tel: {selectedCliente.telefone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenEditModal}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      ✏️ Editar Cadastro
                    </button>
                    <button
                      onClick={handleToggleBlockClient}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                        selectedCliente.status === 'Bloqueado'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {selectedCliente.status === 'Bloqueado' ? '🔓 Ativar Cliente' : '🔒 Bloquear / Negativar'}
                    </button>
                    <a
                      href={`https://wa.me/55${selectedCliente.telefone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-slate-950 stroke-none" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Resumo do Limite e Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase block">Resumo do Limite Rotativo</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {Math.round(((selectedCliente.limite_total - selectedCliente.limite_disponivel) / selectedCliente.limite_total) * 100)}% utilizado
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">
                        {formatCurrency(selectedCliente.limite_disponivel)} disponível
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((selectedCliente.limite_total - selectedCliente.limite_disponivel) /
                                selectedCliente.limite_total) *
                                100
                            )
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Usado: {formatCurrency(selectedCliente.limite_total - selectedCliente.limite_disponivel)}</span>
                      <div className="flex items-center gap-1.5">
                        <span>Total: {formatCurrency(selectedCliente.limite_total)}</span>
                        <button
                          onClick={() => {
                            setTempLimitValue(selectedCliente.limite_total);
                            setIsChangeLimitModalOpen(true);
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                        >
                          [Alterar Limite]
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Score Interno de Crédito</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{selectedCliente.score} pts</span>
                      <span className={`text-xs font-bold ${scoreInfo?.color}`}>{scoreInfo?.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Atualizado automaticamente conforme pontualidade de baixas
                    </p>
                  </div>

                  {/* Card 3: Visão 360° & Métricas */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase block">Visão 360° / Histórico</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Volume Total</span>
                        <span className="text-white font-extrabold">{formatCurrency(totalEmprestado)}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Juros Pagos</span>
                        <span className="text-emerald-400 font-extrabold">+{formatCurrency(totalJurosPagos)}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Atraso Médio</span>
                        <span className={`font-extrabold ${atrasoMedio > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {atrasoMedio} dia{atrasoMedio !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Métricas agregadas em tempo real de todos os contratos
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. O MOTOR DE COBRANÇA DIÁRIA (BLOCO PRINCIPAL - CONTRATO ATIVO) */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                      <h3 className="text-lg font-black text-white">Motor de Cobrança Diária (Contrato Ativo)</h3>
                    </div>
                    <p className="text-xs text-slate-400 pt-0.5">
                      {activeLoan
                        ? `Contrato #${activeLoan.id} • Principal: ${formatCurrency(activeLoan.valor_principal)} • Total Devido: ${formatCurrency(activeLoan.valor_total_devido)} (${activeLoan.qtde_parcelas}x de ${formatCurrency(activeLoan.valor_parcela)})`
                        : 'Nenhum contrato ativo no momento.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNewLoanClienteId(selectedCliente.id);
                      setIsNewLoanModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Novo Empréstimo</span>
                  </button>
                </div>

                {activeLoan ? (
                  <div className="space-y-6">
                    {/* BANNER PRINCIPAL: VALOR TOTAL DEVUDO HOJE (ROLAGEM DE DÍVIDA) */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-xl space-y-4">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Valor Total Devido HOJE
                          </span>
                          <div className="text-3xl font-black text-emerald-400 tracking-tight pt-0.5">
                            {formatCurrency(valorTotalDevidoHoje)}
                          </div>
                          <p className="text-xs text-slate-400 pt-1">
                            Soma calculada: Parcela de Hoje + Parcela(s) Atrasada(s) + Juros Diários
                          </p>
                        </div>

                        {/* ROLAGEM DE DÍVIDA BREAKDOWN CHIPS */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          {parcelasAtrasadasActive.length > 0 && (
                            <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                              Atrasadas: <strong>{formatCurrency(valorAtrasadoBase)}</strong>
                            </div>
                          )}

                          {jurosAtrasoTotal > 0 && (
                            <div
                              className={`px-3 py-1.5 rounded-xl border ${
                                isJurosIsento
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              }`}
                            >
                              Juros Acumulados:{' '}
                              <strong>
                                {isJurosIsento ? 'R$ 0,00 (ISENTO)' : formatCurrency(jurosAtrasoTotal)}
                              </strong>
                            </div>
                          )}

                          {parcelaHojeActive && (
                            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                              Parcela Hoje: <strong>{formatCurrency(valorHojeBase)}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SEMI-AUTOMATIC CONTROLS (AÇÕES SEMI-AUTOMÁTICAS) */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        {/* TOGGLE ISENTAR JUROS */}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeLoan) {
                              setIsJurosIsentosMap((prev) => ({
                                ...prev,
                                [activeLoan.id]: !prev[activeLoan.id],
                              }));
                            }
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isJurosIsento
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {isJurosIsento ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              <span>Juros ISENTOS (Clique p/ Cobrar)</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                              <span>Isentar Juros do Dia</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          {/* ENVIAR COBRANÇA WHATSAPP */}
                          <a
                            href={`https://wa.me/55${selectedCliente.telefone}?text=${generateWaMessage()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Enviar Cobrança WhatsApp</span>
                          </a>

                          {/* REGISTRAR PAGAMENTO HOJE */}
                          <button
                            onClick={handleBaixarTudoHoje}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Registrar Pagamento HOJE</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ACCORDION ACTIONS: REFIN & QUITAÇÃO ANTECIPADA */}
                    <ContractActions
                      activeLoan={activeLoan}
                      activeParcelas={activeParcelas}
                      onRefinance={() => setIsRefinModalOpen(true)}
                      onPayoff={() => setIsQuitacaoModalOpen(true)}
                      onSendCobrança={() => window.open(`https://wa.me/55${selectedCliente.telefone}?text=${generateWaMessage()}`, '_blank')}
                    />

                    {/* LISTA DE PARCELAS DO CONTRATO ATIVO (ZEBRA-STRIPED / RESPONSIVA) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Lista de Parcelas do Contrato Ativo
                      </h4>

                      <PaymentSchedule
                        parcelas={activeParcelas}
                        onBaixar={(id) => handleBaixarParcela(id)}
                        onAtrasar={(p) => setDelayModalParcela(p)}
                        onAjustar={(p) => handleOpenAdjustParcela(p)}
                        todayISO={todayISO}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto" />
                    <p>Este cliente não possui nenhum contrato ativo no momento.</p>
                  </div>
                )}
              </div>

              {/* 3. HISTÓRICO DE CONTRATOS (CONTRATOS ENCERRADOS) */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Histórico de Contratos Encerrados
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {finishedLoans.length} contrato(s) quitado(s)
                  </span>
                </div>

                {finishedLoans.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">
                    Nenhum contrato quitado no histórico deste cliente.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {finishedLoans.map((fLoan) => {
                      const isExpanded = expandedContractId === fLoan.id;
                      const fParcelas = parcelas.filter((p) => p.emprestimo_id === fLoan.id);

                      return (
                        <div
                          key={fLoan.id}
                          className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
                        >
                          <div
                            onClick={() =>
                              setExpandedContractId(isExpanded ? null : fLoan.id)
                            }
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-sm">
                                  Empréstimo #{fLoan.id}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ✓ Quitado
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">
                                Principal: {formatCurrency(fLoan.valor_principal)} • Total Devido:{' '}
                                {formatCurrency(fLoan.valor_total_devido)} • {fLoan.qtde_parcelas} parcelas
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-xs font-bold text-emerald-400">Ver Parcelas</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>

                          {/* Expanded Parcelas List */}
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-2">
                              {fParcelas.map((fp) => (
                                <div
                                  key={fp.id}
                                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs"
                                >
                                  <span className="text-slate-300 font-medium">
                                    Parcela 0{fp.numero_parcela} • Vencimento: {fp.data_vencimento}
                                  </span>
                                  <span className="text-emerald-400 font-extrabold">
                                    {formatCurrency(fp.valor_esperado)} (Pago)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. CRM & AUDITORIA (HISTÓRICO DE INTERAÇÕES E AUDITORIA) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Aba Histórico de Cobrança / Notas Internas */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        CRM - Histórico de Cobrança & Notas
                      </h3>
                    </div>
                    {/* Add note form */}
                    <div className="space-y-2">
                      <textarea
                        id="new-note-text"
                        placeholder="Digite uma nova nota de interação..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[70px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const val = e.currentTarget.value;
                            handleAddNote(val);
                            e.currentTarget.value = '';
                          }
                        }}
                      ></textarea>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">Pressione Enter para enviar nota</span>
                        <button
                          onClick={() => {
                            const textarea = document.getElementById('new-note-text') as HTMLTextAreaElement;
                            if (textarea) {
                              handleAddNote(textarea.value);
                              textarea.value = '';
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-[11px] active:scale-95 transition-all cursor-pointer"
                        >
                          Adicionar Nota
                        </button>
                      </div>
                    </div>

                    {/* Note List */}
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedNotes.map((note) => (
                        <div key={note.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-500 font-semibold">
                            <span>{note.autor}</span>
                            <span>{note.dataHora}</span>
                          </div>
                          <p className="text-slate-300 font-medium">{note.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Aba Histórico de Logs de Auditoria */}
                <AuditTimeline
                  logs={selectedAuditLogs.map((l) => ({
                    id: l.id,
                    evento: l.evento,
                    autor: 'Sistema',
                    data_hora: l.dataHora,
                  }))}
                />
              </div>
            </div>
          );
        })()}
      </main>

      {/* =========================================================================
          SLIDE-OVER DRAWER FOR TODAY'S RECEIVABLES
         ========================================================================= */}
      <AnimatePresence>
        {isTodayDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Recebidos de Hoje</h3>
                      <p className="text-xs text-slate-400">{todayISO}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTodayDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Recebido Hoje</span>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatCurrency(recebiVeisHojeRecebidos)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Total previsto para o dia: {formatCurrency(recebiVeisHojeTotal)}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lista de Parcelas do Dia
                  </h4>

                  {parcelasHoje.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Nenhuma parcela agendada para hoje.</p>
                  ) : (
                    parcelasHoje.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{p.cliente_nome}</span>
                          <span className="font-black text-emerald-400 text-sm">{formatCurrency(p.valor_esperado)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Parcela Nº {p.numero_parcela}</span>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${
                              p.status === 'paga'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {p.status === 'paga' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Recebido</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pendente</span>
                              </>
                            )}
                          </span>
                        </div>

                        {p.status !== 'paga' && (
                          <button
                            onClick={() => {
                              handleBaixarParcela(p.id);
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all cursor-pointer"
                          >
                            Baixar Pagamento
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsTodayDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer mt-6"
              >
                Fechar Painel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: REGISTRAR ATRASO (E COBRAR MULTA DIÁRIA DE 5%)
         ========================================================================= */}
      <AnimatePresence>
        {delayModalParcela && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Registrar Atraso de Parcela</h3>
                    <p className="text-xs text-slate-400">Horário limite das 17h00 ultrapassado</p>
                  </div>
                </div>

                <button
                  onClick={() => setDelayModalParcela(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 font-semibold">Cliente: {delayModalParcela.cliente_nome}</p>
                  <p className="text-slate-400">Parcela Nº {delayModalParcela.numero_parcela}</p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-300">Valor Original:</span>
                    <span className="font-extrabold text-white text-sm">
                      {formatCurrency(delayModalParcela.valor_esperado)}
                    </span>
                  </div>
                </div>

                {/* Option to apply 5% daily fine */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyDailyFine}
                      onChange={(e) => setApplyDailyFine(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800"
                    />
                    <div>
                      <span className="font-extrabold text-rose-300 block">Cobrar Multa Diária de 5%</span>
                      <span className="text-[11px] text-slate-300">
                        Adiciona 5% ao valor da parcela ({formatCurrency(delayModalParcela.valor_esperado * PERCENTUAL_MULTA_ATRASO)}).
                        Novo valor total: <strong>{formatCurrency(delayModalParcela.valor_esperado * 1.05)}</strong>.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setDelayModalParcela(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleConfirmarAtraso}
                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Confirmar Atraso
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: EDITAR / APORTAR SALDO DE CAIXA NO FINANCEIRO
         ========================================================================= */}
      <AnimatePresence>
        {isEditCaixaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                  Ajustar / Aportar Caixa Financeiro
                </h3>

                <button
                  onClick={() => setIsEditCaixaModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCaixa} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">
                    Saldo Disponível em Caixa para Empréstimos (R$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    value={tempSaldoCaixa}
                    onChange={(e) => setTempSaldoCaixa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Digite o valor total de caixa próprio disponível para conceder novos empréstimos.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Salvar Saldo em Caixa
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVO EMPRÉSTIMO (MOTOR DE EMPRÉSTIMOS COMPLETO) */}
      <AnimatePresence>
        {isNewLoanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <LoanWizard
              clientes={clientes}
              onAddClient={(newCli) => {
                setClientes((prev) => [newCli, ...prev]);
              }}
              onSaveLoan={(newEmp, generatedParcs, wizardAudit) => {
                handleWizardSaveLoan(newEmp, generatedParcs, wizardAudit);
              }}
              onClose={() => setIsNewLoanModalOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVO CLIENTE */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Cadastrar Novo Cliente
                </h3>

                <button
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newClientNome}
                    onChange={(e) => setNewClientNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Lima"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">CPF</label>
                    <input
                      type="text"
                      value={newClientCpf}
                      onChange={(e) => setNewClientCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Telefone com DDD</label>
                    <input
                      type="text"
                      required
                      value={newClientTelefone}
                      onChange={(e) => setNewClientTelefone(e.target.value)}
                      placeholder="11 99999-9999"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">E-mail</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="cliente@exemplo.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Endereço Residencial</label>
                  <input
                    type="text"
                    value={newClientEndereco}
                    onChange={(e) => setNewClientEndereco(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Foto do Cliente (URL)</label>
                  <input
                    type="text"
                    value={newClientFotoUrl}
                    onChange={(e) => setNewClientFotoUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Limite Total Inicial (R$)</label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    value={newClientLimiteTotal}
                    onChange={(e) => setNewClientLimiteTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Salvar e Abrir Perfil
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR CLIENTE (KYC COMPLETO) */}
      <AnimatePresence>
        {isEditClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Editar Ficha Cadastral (KYC)
                </h3>
                <button
                  onClick={() => setIsEditClientModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClientKYC} className="space-y-4 text-xs">
                {/* 1. Dados Pessoais */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">CPF</label>
                      <input
                        type="text"
                        required
                        value={editCpf}
                        onChange={(e) => setEditCpf(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">RG</label>
                      <input
                        type="text"
                        value={editRg}
                        onChange={(e) => setEditRg(e.target.value)}
                        placeholder="Ex: 00.000.000-0"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editDataNasc}
                        onChange={(e) => setEditDataNasc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Estado Civil</label>
                      <select
                        value={editEstadoCivil}
                        onChange={(e) => setEditEstadoCivil(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Endereço Comercial / Empresa</label>
                      <input
                        type="text"
                        value={editEndereco}
                        onChange={(e) => setEditEndereco(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Endereço Residencial Completo</label>
                      <input
                        type="text"
                        value={editEnderecoRes}
                        onChange={(e) => setEditEnderecoRes(e.target.value)}
                        placeholder="Rua, número, complemento, CEP"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Dados Profissionais & Renda */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Dados Profissionais & Renda</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Profissão / Ramo</label>
                      <input
                        type="text"
                        value={editProfissao}
                        onChange={(e) => setEditProfissao(e.target.value)}
                        placeholder="Ex: Cabeleireiro"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Nome da Empresa</label>
                      <input
                        type="text"
                        value={editEmpresa}
                        onChange={(e) => setEditEmpresa(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Renda Mensal (R$)</label>
                      <input
                        type="number"
                        value={editRenda}
                        onChange={(e) => setEditRenda(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Chave PIX Principal para Depósito</label>
                    <input
                      type="text"
                      value={editChavePix}
                      onChange={(e) => setEditChavePix(e.target.value)}
                      placeholder="CPF, celular, e-mail ou aleatória"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Contatos de Emergência/Referência */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Referências Pessoais / Comerciais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <span className="font-bold text-slate-300 block">1ª Referência</span>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">Nome</label>
                        <input
                          type="text"
                          value={editContato1Nome}
                          onChange={(e) => setEditContato1Nome(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          value={editContato1Tel}
                          onChange={(e) => setEditContato1Tel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <span className="font-bold text-slate-300 block">2ª Referência</span>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">Nome</label>
                        <input
                          type="text"
                          value={editContato2Nome}
                          onChange={(e) => setEditContato2Nome(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          value={editContato2Tel}
                          onChange={(e) => setEditContato2Tel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Anexos / Documentação */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">4. Anexos & Documentação (URLs)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Foto de Perfil (URL)</label>
                      <input
                        type="text"
                        value={editFotoUrl}
                        onChange={(e) => setEditFotoUrl(e.target.value)}
                        placeholder="Link da imagem da foto de perfil"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Selfie do Documento (URL)</label>
                      <input
                        type="text"
                        value={editSelfieUrl}
                        onChange={(e) => setEditSelfieUrl(e.target.value)}
                        placeholder="Link da imagem da selfie"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Documento de Identidade RG/CNH (URL)</label>
                      <input
                        type="text"
                        value={editDocUrl}
                        onChange={(e) => setEditDocUrl(e.target.value)}
                        placeholder="Link da imagem do documento"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Comprovante de Residência (URL)</label>
                      <input
                        type="text"
                        value={editComprovanteUrl}
                        onChange={(e) => setEditComprovanteUrl(e.target.value)}
                        placeholder="Link da imagem do comprovante"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
                >
                  Salvar Alterações KYC
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GESTÃO DE LIMITE TOTAL */}
      <AnimatePresence>
        {isChangeLimitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Alterar Limite Total de Crédito</span>
                </h3>
                <button
                  onClick={() => setIsChangeLimitModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Defina o limite rotativo total autorizado para <strong>{selectedCliente?.nome}</strong>. O limite disponível será recalculado automaticamente com base na diferença.
                </p>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Novo Limite Total (R$)</label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    value={tempLimitValue}
                    onChange={(e) => setTempLimitValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm font-extrabold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsChangeLimitModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveLimit}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Confirmar Limite
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAIS: RENEGOCIAÇÃO/REFINANCIAMENTO E QUITAÇÃO ANTECIPADA
          (recalculam activeLoan/activeParcelas a partir do selectedCliente,
           pois esses modais ficam fora do escopo da aba cliente_detail) */}
      {selectedCliente && (() => {
        const clientLoansForModals = emprestimos.filter((e) => e.cliente_id === selectedCliente.id);
        const activeLoan = clientLoansForModals.find((e) => e.status === 'ativo' || e.status === 'inadimplente');
        const activeParcelas = activeLoan
          ? parcelas.filter((p) => p.emprestimo_id === activeLoan.id)
          : [];

        return (
      <>
      {/* MODAL: RENEGOCIAÇÃO / REFINANCIAMENTO */}
      <AnimatePresence>
        {isRefinModalOpen && activeLoan && (() => {
          const unpaid = activeParcelas.filter(p => p.status !== 'paga');
          const balance = unpaid.reduce((acc, p) => acc + p.valor_esperado, 0);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Renegociação & Refin</span>
                  </h3>
                  <button
                    onClick={() => setIsRefinModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-slate-400 uppercase font-bold block text-[10px]">Saldo Devedor Migrado</span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {formatCurrency(balance)}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">
                      * As {unpaid.length} parcelas abertas do contrato vigente serão encerradas com R$ 0,00 e consolidadas no novo contrato de rolagem.
                    </span>
                  </div>

                  {/* Refin Term */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Novo Prazo (Dias)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 20, 30].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRefinTerm(num as any)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            refinTerm === num
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}
                        >
                          {num} Dias
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Refin Billing Days */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Novos Dias de Cobrança</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'seg-sex', label: 'Seg a Sex' },
                        { id: 'seg-sab', label: 'Seg a Sáb' },
                        { id: 'seg-dom', label: 'Seg a Dom' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRefinDiasCobranca(opt.id as any)}
                          className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            refinDiasCobranca === opt.id
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsRefinModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleRefinancing(activeLoan, activeParcelas)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Confirmar Refin
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* MODAL: QUITAÇÃO ANTECIPADA */}
      <AnimatePresence>
        {isQuitacaoModalOpen && activeLoan && (() => {
          const unpaid = activeParcelas.filter(p => p.status !== 'paga');
          const balance = unpaid.reduce((acc, p) => acc + p.valor_esperado, 0);
          const discounted = Math.round(balance * 0.85 * 100) / 100;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Quitação Antecipada</span>
                  </h3>
                  <button
                    onClick={() => setIsQuitacaoModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    Você está simulando a quitação antecipada total hoje com **15% de desconto de juros** sobre o saldo devedor pendente.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Saldo Original</span>
                      <span className="text-sm font-semibold text-slate-400 line-through font-mono">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 uppercase block font-bold">Com Desconto (-15%)</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(discounted)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsQuitacaoModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleEarlyPayoff(activeLoan, activeParcelas)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Quitar Contrato
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
      </>
        );
      })()}

      <AnimatePresence>
        {adjustParcela && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  Ajustar Parcela #{adjustParcela.numero_parcela}
                </h3>
                <button
                  onClick={() => setAdjustParcela(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Nova Data de Vencimento</label>
                  <input
                    type="date"
                    value={adjustVencimento}
                    onChange={(e) => setAdjustVencimento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Novo Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustValor}
                    onChange={(e) => setAdjustValor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm font-extrabold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustParcela(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAdjustParcela}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Salvar Ajuste
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
