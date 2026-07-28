import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Cliente } from '../../types/cliente';
import { clientQuickSchema } from '../../lib/validators';

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCli: Cliente) => void;
}

export const QuickClientModal: React.FC<QuickClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [nomeComercio, setNomeComercio] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      nome,
      telefone,
      cpf: cpf || undefined,
      email: email || undefined,
      endereco: endereco || undefined,
      nomeComercio: nomeComercio || undefined,
      cnpj: cnpj || undefined,
    };

    const result = clientQuickSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const isComplete = !!(cpf && endereco);

    const newClient: Cliente = {
      id: `cli_${Date.now()}`,
      nome: result.data.nome,
      cpf: result.data.cpf || 'Não informado',
      telefone: result.data.telefone.replace(/\D/g, ''),
      email: result.data.email || 'sememail@exemplo.com',
      endereco: result.data.endereco || 'Endereço não informado',
      limite_total: 1000,
      limite_disponivel: 1000,
      score: 1000,
      status: 'Ativo',
      criado_em: new Date().toISOString(),
      empresa: result.data.nomeComercio || undefined,
      cadastro_completo: isComplete,
    };

    onSave(newClient);
    onClose();

    // Reset fields
    setNome('');
    setTelefone('');
    setCpf('');
    setEmail('');
    setEndereco('');
    setNomeComercio('');
    setCnpj('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            Cadastro Rápido de Cliente
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-300">Nome Completo *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Eduardo Lima"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.nome && <span className="text-rose-400 text-[10px]">{errors.nome}</span>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">WhatsApp / Celular *</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="11 99999-9999"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.telefone && <span className="text-rose-400 text-[10px]">{errors.telefone}</span>}
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">CPF (Opcional)</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-300">E-mail (Opcional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.email && <span className="text-rose-400 text-[10px]">{errors.email}</span>}
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-300">Endereço Residencial (Opcional)</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">Nome do Comércio (Opcional)</label>
              <input
                type="text"
                value={nomeComercio}
                onChange={(e) => setNomeComercio(e.target.value)}
                placeholder="Ex: Pastelaria do Calvo"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-300">CNPJ (Opcional)</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            * Campos obrigatórios. O cadastro será salvo como **Cadastro Parcial** caso CPF ou endereço não sejam preenchidos.
          </p>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Cadastrar Cliente
          </button>
        </form>
      </div>
    </div>
  );
};
