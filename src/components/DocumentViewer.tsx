import React, { useState } from 'react';
import { DocumentosLead } from '../types/lead';
import { FileText, Eye, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface DocumentViewerProps {
  documentos: DocumentosLead;
}

interface DocItem {
  key: keyof DocumentosLead;
  title: string;
  url?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentos }) => {
  const [activeModalDoc, setActiveModalDoc] = useState<{ title: string; url: string } | null>(null);

  const docsList: DocItem[] = [
    { key: 'selfie', title: 'Selfie do Responsável', url: documentos.selfie },
    { key: 'documento', title: 'Documento (RG / CNH)', url: documentos.documento },
    { key: 'comprovante_comercial', title: 'Comprovante Comercial', url: documentos.comprovante_comercial },
    { key: 'comprovante_residencial', title: 'Comprovante Residencial', url: documentos.comprovante_residencial },
    { key: 'cartao_cnpj', title: 'Cartão CNPJ / MEI', url: documentos.cartao_cnpj },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {docsList.map((doc) => {
          const hasDoc = !!doc.url;

          return (
            <div
              key={doc.key}
              onClick={() => {
                if (hasDoc && doc.url) {
                  setActiveModalDoc({ title: doc.title, url: doc.url });
                }
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                hasDoc
                  ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer group'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <FileText className={`w-4 h-4 ${hasDoc ? 'text-emerald-400' : 'text-slate-600'}`} />
                {hasDoc ? (
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Pendente</span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-200 truncate">{doc.title}</div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                {hasDoc ? 'Clique p/ visualizar' : 'Não anexado'}
              </p>
            </div>
          );
        })}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">{activeModalDoc.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalDoc(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[60vh] flex items-center justify-center p-2">
              <img
                src={activeModalDoc.url}
                alt={activeModalDoc.title}
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
