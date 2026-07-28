import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Cliente } from '../../types/cliente';

interface IncompleteProfileBannerProps {
  cliente: Cliente;
  onCompleteClick: () => void;
}

export const IncompleteProfileBanner: React.FC<IncompleteProfileBannerProps> = ({ cliente, onCompleteClick }) => {
  const isCpfMissing = !cliente.cpf || cliente.cpf === 'Não informado';
  const isEnderecoMissing = !cliente.endereco || cliente.endereco === 'Endereço não informado';

  if (!isCpfMissing && !isEnderecoMissing) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
        <div>
          <span className="font-bold block">⚠️ Cadastro Incompleto</span>
          Este cliente possui informações obrigatórias pendentes: 
          {isCpfMissing && ' [CPF]'}
          {isEnderecoMissing && ' [Endereço Residencial]'}.
        </div>
      </div>
      <button
        onClick={onCompleteClick}
        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
      >
        Completar Cadastro
      </button>
    </div>
  );
};
