import React from 'react';
import { ShieldCheck, Zap, Lock, User } from 'lucide-react';

interface HeaderProps {
  onOpenLeadModal?: () => void;
  onOpenAdminModal?: () => void;
  onOpenClientPortal?: () => void;
  capturedLeadsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLeadModal,
  onOpenAdminModal,
  onOpenClientPortal,
  capturedLeadsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Crédito<span className="text-emerald-400">Popular</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Atendimento Rápido
            </div>
          </div>
        </a>

        {/* Action badges / buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Client Portal Button */}
          {onOpenClientPortal && (
            <button
              onClick={onOpenClientPortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold hover:text-emerald-400 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Área do Cliente</span>
            </button>
          )}

          {/* Admin Login Button "Entrar" */}
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold hover:text-emerald-400 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entrar</span>
            </button>
          )}

          {/* Quick CTA button */}
          <button
            onClick={onOpenLeadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Pedir Crédito</span>
          </button>
        </div>
      </div>
    </header>
  );
};
