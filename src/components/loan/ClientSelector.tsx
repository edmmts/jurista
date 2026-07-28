import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Cliente } from '../../types/cliente';

interface ClientSelectorProps {
  clientes: Cliente[];
  selectedClienteId: string | null;
  onSelect: (id: string) => void;
  onAddNewClientClick: () => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  clientes,
  selectedClienteId,
  onSelect,
  onAddNewClientClick,
}) => {
  const [query, setQuery] = useState('');

  const filtered = clientes.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.nome.toLowerCase().includes(q) ||
      c.cpf.includes(q) ||
      c.telefone.includes(q) ||
      (c.empresa && c.empresa.toLowerCase().includes(q))
    );
  });

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por Nome, CPF, Telefone ou Comércio..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="button"
          onClick={onAddNewClientClick}
          className="px-4 py-2 bg-slate-900 border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Suggested Matches Typeahead List */}
      {query.trim() !== '' && filtered.length > 0 && (
        <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden divide-y divide-slate-900 max-h-[160px] overflow-y-auto">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelect(c.id);
                setQuery('');
              }}
              className="p-3 hover:bg-slate-900/50 cursor-pointer transition-colors flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-white block">{c.nome}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {c.empresa || 'Sem Comércio'} • CPF: {c.cpf}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{c.telefone}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected Customer Details */}
      {selectedCliente ? (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Cliente Selecionado</span>
              <span className="text-sm font-extrabold text-white">{selectedCliente.nome}</span>
              <p className="text-[10px] text-slate-400 pt-0.5">
                Comércio: <strong>{selectedCliente.empresa || 'Não informado'}</strong> • CPF: {selectedCliente.cpf}
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                selectedCliente.cpf && selectedCliente.endereco && selectedCliente.cpf !== 'Não informado' && selectedCliente.endereco !== 'Endereço não informado'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {selectedCliente.cpf && selectedCliente.endereco && selectedCliente.cpf !== 'Não informado' && selectedCliente.endereco !== 'Endereço não informado'
                ? '● Completo'
                : '🟡 Incompleto'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
            <div>
              <span>Cidade:</span>
              <strong className="block text-white">{selectedCliente.endereco.split('-').pop()?.trim() || 'Não informada'}</strong>
            </div>
            <div>
              <span>Telefone:</span>
              <strong className="block text-white">{selectedCliente.telefone}</strong>
            </div>
            <div>
              <span>Limite Disp:</span>
              <strong className="block text-emerald-400 font-mono">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCliente.limite_disponivel)}
              </strong>
            </div>
            <div>
              <span>Status:</span>
              <strong className={`block uppercase ${selectedCliente.status === 'Ativo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedCliente.status}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
          Pesquise e selecione um cliente para continuar.
        </div>
      )}
    </div>
  );
};
