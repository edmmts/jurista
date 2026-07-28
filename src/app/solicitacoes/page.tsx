import React from 'react';
import { LeadPipelineCRM } from '../../components/LeadPipelineCRM';

export default function SolicitacoesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <SolicitacoesCRMPage />
      </div>
    </div>
  );
}

export function SolicitacoesCRMPage() {
  return <LeadPipelineCRM />;
}
