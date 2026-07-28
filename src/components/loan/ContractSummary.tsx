import React from 'react';
import { formatCurrency } from '../../lib/currency';
import { formatToPTBRDate } from '../../lib/dates';
import { FileText } from 'lucide-react';

interface ContractSummaryProps {
  clienteNome: string;
  principal: number;
  juros: number;
  total: number;
  taxaPercentual: number;
  qtdeParcelas: number;
  valorParcela: number;
  primeiroVencimento: string;
  ultimoVencimento: string;
}

export const ContractSummary: React.FC<ContractSummaryProps> = ({
  clienteNome,
  principal,
  juros,
  total,
  taxaPercentual,
  qtdeParcelas,
  valorParcela,
  primeiroVencimento,
  ultimoVencimento,
}) => {
  return (
    <div className="space-y-4 text-xs">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <FileText className="w-4 h-4 text-emerald-400" />
        Ficha Resumo do Contrato
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Cliente</span>
          <span className="font-extrabold text-white block truncate">{clienteNome || 'Selecione o Cliente'}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Valor Principal</span>
          <span className="font-extrabold text-emerald-400 block font-mono">{formatCurrency(principal)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Juros / Custo</span>
          <span className="font-extrabold text-rose-400 block font-mono">
            {formatCurrency(juros)} ({taxaPercentual}%)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Devido</span>
          <span className="font-extrabold text-cyan-400 block font-mono">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Quantidade Parcelas</span>
          <span className="font-extrabold text-white block font-mono">{qtdeParcelas}x</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Valor Parcela</span>
          <span className="font-extrabold text-emerald-400 block font-mono">{formatCurrency(valorParcela)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Primeiro Vencimento</span>
          <span className="font-extrabold text-white block">{formatToPTBRDate(primeiroVencimento)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Último Vencimento</span>
          <span className="font-extrabold text-white block">{formatToPTBRDate(ultimoVencimento)}</span>
        </div>
      </div>
    </div>
  );
};
