import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DocumentoItem } from '../types/lead';

interface UploadCardProps {
  id: string;
  title: string;
  description: string;
  isRequired?: boolean;
  docItem?: DocumentoItem;
  isSelfie?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  error?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  id,
  title,
  description,
  isRequired = true,
  docItem,
  isSelfie = false,
  onUpload,
  onRemove,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const isUploading = docItem?.uploading;
  const progress = docItem?.progress || 0;
  const hasFile = Boolean(docItem?.url);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 transition-colors hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
            {title}
            {isRequired && <span className="text-emerald-400">*</span>}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>

        {hasFile && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
          </span>
        )}
      </div>

      {/* Main Upload Box */}
      {hasFile ? (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {docItem?.url.startsWith('data:image') || docItem?.url.startsWith('http') ? (
              <img
                src={docItem.url}
                alt={docItem.name}
                className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40 shrink-0 bg-slate-900"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{docItem?.name}</p>
              <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Arquivo carregado com sucesso</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${title}`}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer shrink-0"
            title="Remover arquivo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : isUploading ? (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-center">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Enviando arquivo...</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`p-4 rounded-xl border-2 border-dashed transition-all text-center space-y-3 ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-500/10'
              : error
              ? 'border-rose-500/50 bg-rose-500/5'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <div className="flex justify-center gap-2">
            {isSelfie ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Camera className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-300 font-medium">
              Arraste e solte o arquivo aqui ou escolha uma opção
            </p>
            <p className="text-[10px] text-slate-500">Formatos aceitos: JPG, PNG, PDF (máx. 10MB)</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {isSelfie ? (
              <>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all min-h-[48px] cursor-pointer"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Tirar Selfie Agora</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition-colors min-h-[48px] cursor-pointer"
                >
                  Escolher da Galeria
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition-colors min-h-[48px] flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
