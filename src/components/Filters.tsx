import React from 'react';
import { Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { LeadStatus, RamoAtividade } from '../types/lead';

export interface FilterState {
  status: 'todos' | LeadStatus;
  ramo: 'todos' | RamoAtividade;
  valor: 'todos' | 300 | 500 | 800 | 1000;
  prazo: 'todos' | 10 | 20 | 30;
  ordenacao: 'recentes' | 'antigos' | 'maior_valor' | 'menor_valor';
}

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const isFiltered =
    filters.status !== 'todos' ||
    filters.ramo !== 'todos' ||
    filters.valor !== 'todos' ||
    filters.prazo !== 'todos' ||
    filters.ordenacao !== 'recentes';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-400 mr-1">Status:</span>
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value as FilterState['status'] })
          }
          className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="todos" className="bg-slate-900 text-white">Todos os estágios</option>
          <option value="Pendente" className="bg-slate-900 text-white">1. Pendente</option>
          <option value="Em Análise" className="bg-slate-900 text-white">2. Em Análise</option>
          <option value="Visita Agendada" className="bg-slate-900 text-white">3. Visita Agendada</option>
          <option value="Aprovado" className="bg-slate-900 text-white">4. Aprovado</option>
          <option value="Recusado" className="bg-slate-900 text-white">5. Recusado</option>
        </select>
      </div>

      {/* Ramo de Atividade */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
        <span className="font-bold text-slate-400 mr-1">Ramo:</span>
        <select
          value={filters.ramo}
          onChange={(e) =>
            onFilterChange({ ...filters, ramo: e.target.value as FilterState['ramo'] })
          }
          className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="todos" className="bg-slate-900 text-white">Todos os ramos</option>
          <option value="Alimentação" className="bg-slate-900 text-white">Alimentação</option>
          <option value="Estética" className="bg-slate-900 text-white">Estética</option>
          <option value="Vestuário" className="bg-slate-900 text-white">Vestuário</option>
          <option value="Distribuidora" className="bg-slate-900 text-white">Distribuidora</option>
          <option value="Mercado" className="bg-slate-900 text-white">Mercado</option>
          <option value="Oficina" className="bg-slate-900 text-white">Oficina</option>
          <option value="Pet Shop" className="bg-slate-900 text-white">Pet Shop</option>
          <option value="Outros" className="bg-slate-900 text-white">Outros</option>
        </select>
      </div>

      {/* Valor Filter */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
        <span className="font-bold text-slate-400 mr-1">Valor:</span>
        <select
          value={filters.valor}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              valor: e.target.value === 'todos' ? 'todos' : (Number(e.target.value) as any),
            })
          }
          className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="todos" className="bg-slate-900 text-white">Qualquer valor</option>
          <option value="300" className="bg-slate-900 text-white">R$ 300</option>
          <option value="500" className="bg-slate-900 text-white">R$ 500</option>
          <option value="800" className="bg-slate-900 text-white">R$ 800</option>
          <option value="1000" className="bg-slate-900 text-white">R$ 1.000</option>
        </select>
      </div>

      {/* Prazo Filter */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
        <span className="font-bold text-slate-400 mr-1">Prazo:</span>
        <select
          value={filters.prazo}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              prazo: e.target.value === 'todos' ? 'todos' : (Number(e.target.value) as any),
            })
          }
          className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="todos" className="bg-slate-900 text-white">Qualquer prazo</option>
          <option value="10" className="bg-slate-900 text-white">10 Dias</option>
          <option value="20" className="bg-slate-900 text-white">20 Dias</option>
          <option value="30" className="bg-slate-900 text-white">30 Dias</option>
        </select>
      </div>

      {/* Ordenação */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <select
          value={filters.ordenacao}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              ordenacao: e.target.value as FilterState['ordenacao'],
            })
          }
          className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
        >
          <option value="recentes" className="bg-slate-900 text-white">Mais recentes</option>
          <option value="antigos" className="bg-slate-900 text-white">Mais antigos</option>
          <option value="maior_valor" className="bg-slate-900 text-white">Maior valor</option>
          <option value="menor_valor" className="bg-slate-900 text-white">Menor valor</option>
        </select>
      </div>

      {isFiltered && (
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      )}
    </div>
  );
};
