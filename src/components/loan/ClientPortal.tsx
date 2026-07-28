import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, User, Lock, KeyRound, QrCode, LogOut, Check, Copy } from 'lucide-react';
import { Cliente } from '../../types/cliente';
import { Emprestimo } from '../../types/emprestimo';
import { Parcela } from '../../types/parcela';
import { formatCurrency } from '../../lib/currency';
import { formatToPTBRDate } from '../../lib/dates';
import { generatePixCopiaECola } from '../../lib/pix';
import { PixSection } from './PixSection';

interface ClientPortalProps {
  onBackToLanding: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ onBackToLanding }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Loaded Entities
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dashboard Filters & State
  const [filterStatus, setFilterStatus] = useState<'todas' | 'pagas' | 'pendentes' | 'atrasadas' | 'proximas'>('todas');
  const [showQuitarModal, setShowQuitarModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load database from localStorage
  const loadDatabase = () => {
    try {
      const savedCli = localStorage.getItem('cp_admin_clientes');
      const savedEmp = localStorage.getItem('cp_admin_emprestimos');
      const savedPar = localStorage.getItem('cp_admin_parcelas');

      if (savedCli) setClientes(JSON.parse(savedCli));
      if (savedEmp) setEmprestimos(JSON.parse(savedEmp));
      if (savedPar) setParcelas(JSON.parse(savedPar));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      setError('Por favor, informe seu CPF.');
      return;
    }

    const foundCli = clientes.find((c) => c.cpf.replace(/\D/g, '') === cleanCpf);
    if (!foundCli) {
      setError('Cliente não cadastrado no sistema.');
      return;
    }

    // Default password is last 4 digits of telephone
    const defaultPassword = foundCli.telefone.slice(-4);
    const savedPasswordKey = `cp_password_${foundCli.id}`;
    const currentPassword = localStorage.getItem(savedPasswordKey) || defaultPassword;

    if (password !== currentPassword) {
      setError('Senha incorreta.');
      return;
    }

    setCurrentCliente(foundCli);
    setIsLoggedIn(true);

    // If password is still the default, force change password
    if (password === defaultPassword) {
      setMustChangePassword(true);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (currentCliente) {
      localStorage.setItem(`cp_password_${currentCliente.id}`, newPassword);
      setMustChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Senha alterada com sucesso!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentCliente(null);
    setCpf('');
    setPassword('');
    setMustChangePassword(false);
    onBackToLanding();
  };

  // Calculations for logged in customer
  const clientLoans = currentCliente ? emprestimos.filter((e) => e.cliente_id === currentCliente.id) : [];
  const activeLoan = clientLoans.find((e) => e.status === 'ativo');
  const clientParcelas = currentCliente ? parcelas.filter((p) => p.cliente_id === currentCliente.id && (!activeLoan || p.emprestimo_id === activeLoan.id)) : [];

  const filteredParcelas = clientParcelas.filter((p) => {
    if (filterStatus === 'todas') return true;
    if (filterStatus === 'pagas') return p.status === 'paga';
    if (filterStatus === 'pendentes') return p.status === 'pendente';
    if (filterStatus === 'atrasadas') return p.status === 'atrasada';
    if (filterStatus === 'proximas') return p.status === 'pendente'; // simplistic next
    return true;
  });

  // Payoff Calculation: remaining principal - 15% discount on remaining interest
  const unpaidParcelas = clientParcelas.filter((p) => p.status !== 'paga');
  const totalOriginalUnpaid = unpaidParcelas.reduce((acc, curr) => acc + curr.valor_esperado, 0);
  // Calculate simulated interest discount
  const estimatedPayoff = Math.round(totalOriginalUnpaid * 0.85 * 100) / 100;

  const handleCopyPix = () => {
    const code = generatePixCopiaECola(currentCliente?.chave_pix || '00000000000', estimatedPayoff, currentCliente?.nome || 'Credito Popular');
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between py-6 px-4">
      {/* Container header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/10">
            M
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">Monkey Cred</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Portal do Cliente</p>
          </div>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        )}
      </div>

      <div className="max-w-2xl w-full mx-auto py-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* LOGIN CARD */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/90 border border-slate-850 p-6 rounded-3xl shadow-2xl space-y-4 max-w-md w-full mx-auto"
            >
              <div className="text-center space-y-1">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-base font-extrabold text-white">Acesse sua Conta</h2>
                <p className="text-[10px] text-slate-500">Digite seu CPF e senha de acesso inicial</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">CPF</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">Senha Inicial</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="4 últimos dígitos do seu telefone"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-xs"
                >
                  Entrar no Painel
                </button>
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold active:scale-95 transition-all cursor-pointer text-xs mt-2"
                >
                  Voltar ao Site Principal
                </button>
              </form>
            </motion.div>
          ) : mustChangePassword ? (
            /* CHANGE PASSWORD SCREEN */
            <motion.div
              key="change-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4 max-w-md w-full mx-auto"
            >
              <div className="text-center space-y-1">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-base font-extrabold text-white">Alterar Senha Provisória</h2>
                <p className="text-[10px] text-slate-500">Para sua segurança, defina uma nova senha de acesso.</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-xs"
                >
                  Salvar Nova Senha
                </button>
              </form>
            </motion.div>
          ) : (
            /* CLIENT DASHBOARD */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center font-bold text-white text-lg overflow-hidden shrink-0 border border-slate-700">
                    {currentCliente?.foto_url ? (
                      <img src={currentCliente.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentCliente?.nome.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{currentCliente?.nome}</h3>
                    <p className="text-[10px] text-slate-400">Score Interno: {currentCliente?.score} • CPF: {currentCliente?.cpf}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  ● Limite Disp: {currentCliente && formatCurrency(currentCliente.limite_disponivel)}
                </span>
              </div>

              {/* Active Loan Info */}
              {activeLoan ? (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Empréstimo Ativo</span>
                      <span className="text-base font-black text-white">{formatCurrency(activeLoan.valor_principal)}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                      Ativo
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-850 text-[10px] text-slate-400">
                    <div>
                      <span>Parcelas:</span>
                      <strong className="block text-white font-mono">{activeLoan.qtde_parcelas}x</strong>
                    </div>
                    <div>
                      <span>Valor Parcela:</span>
                      <strong className="block text-emerald-400 font-mono">{formatCurrency(activeLoan.valor_parcela)}</strong>
                    </div>
                    <div>
                      <span>Total Devido:</span>
                      <strong className="block text-white font-mono">{formatCurrency(activeLoan.valor_total_devido)}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">Pretende quitar antecipadamente com desconto?</span>
                    <button
                      onClick={() => setShowQuitarModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Simular Quitação
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-1">
                  <p className="font-bold">Nenhum empréstimo ativo no momento.</p>
                  <p className="text-[10px] text-slate-500">Seu limite rotativo está 100% disponível para novas contratações.</p>
                </div>
              )}

              {/* Installment filters & schedule */}
              {clientParcelas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico de Parcelas</h4>
                    <div className="flex gap-1">
                      {(['todas', 'pagas', 'pendentes', 'atrasadas'] as const).map((fs) => (
                        <button
                          key={fs}
                          onClick={() => setFilterStatus(fs)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-extrabold border uppercase transition-colors cursor-pointer ${
                            filterStatus === fs
                              ? 'bg-slate-800 text-white border-slate-700'
                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-400'
                          }`}
                        >
                          {fs}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-900 rounded-3xl overflow-hidden divide-y divide-slate-900 bg-slate-900/40">
                    {filteredParcelas.length === 0 ? (
                      <p className="text-center py-6 text-slate-500">Nenhuma parcela neste filtro.</p>
                    ) : (
                      filteredParcelas.map((p) => (
                        <div key={p.id} className="p-3.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block">Parcela {p.numero_parcela.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-slate-400">Vencimento: {formatToPTBRDate(p.data_vencimento)}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-400 font-mono">{formatCurrency(p.valor_esperado)}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                                p.status === 'paga'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : p.status === 'atrasada'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-slate-850 text-slate-400 border-slate-750'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quitação Prepayment Modal */}
      <AnimatePresence>
        {showQuitarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white">Quitação Antecipada (15% Desconto)</h3>
                <button
                  onClick={() => setShowQuitarModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Restante Original:</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(totalOriginalUnpaid)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto Proporcional Juros (15%):</span>
                    <span className="font-bold font-mono">-{formatCurrency(totalOriginalUnpaid - estimatedPayoff)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold pt-2 border-t border-slate-850 text-cyan-400">
                    <span>Valor para Quitação:</span>
                    <span className="font-mono">{formatCurrency(estimatedPayoff)}</span>
                  </div>
                </div>

                {/* Simulated PIX copy paste area */}
                <PixSection
                  amount={estimatedPayoff}
                  pixKey={currentCliente?.chave_pix || '000.000.000-00'}
                  receiverName="Monkey Cred ESC"
                />

                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  A simulação possui validade de 24 horas. Após efetuar o pagamento via PIX Copia e Cola, envie o comprovante para suporte@monkeycred.app ou WhatsApp do analista.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* footer credits */}
      <div className="text-center text-[10px] text-slate-600 mt-8">
        Monkey Cred Limitada © 2026. Todos os direitos reservados.
      </div>
    </div>
  );
};
