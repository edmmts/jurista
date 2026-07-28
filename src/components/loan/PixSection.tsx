import React, { useState } from 'react';
import { QrCode, Copy, Check } from 'lucide-react';
import { generatePixCopiaECola } from '../../lib/pix';

interface PixSectionProps {
  amount: number;
  pixKey: string;
  receiverName: string;
}

export const PixSection: React.FC<PixSectionProps> = ({ amount, pixKey, receiverName }) => {
  const [copied, setCopied] = useState(false);
  const code = generatePixCopiaECola(pixKey || '000.000.000-00', amount, receiverName || 'Credito Popular');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-3 text-xs">
      <div className="flex items-center gap-2 text-emerald-400 font-bold">
        <QrCode className="w-4 h-4" />
        <span>Pagamento Rápido via PIX</span>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-slate-400">
          Chave cadastrada: <strong className="text-white">{pixKey || 'Não informada'}</strong> • Valor: <strong className="text-emerald-400 font-mono">R$ {amount.toFixed(2)}</strong>
        </p>

        {/* Mock QR Code visual representation */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center relative group overflow-hidden">
            {/* Visual simulation of QR Code pixels */}
            <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 5 === 0 ? 'bg-slate-950' : 'bg-transparent'}`}></div>
              ))}
            </div>
            <span className="absolute inset-0 bg-slate-950/80 text-white font-extrabold text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              QR Code Simulado
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={code}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-mono text-slate-400 focus:outline-none h-[50px] resize-none"
          ></textarea>
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
            title="Copiar PIX"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
