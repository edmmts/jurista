import { LeadWizardFormData } from '../types/lead';

const DRAFT_STORAGE_KEY = 'cp_lead_wizard_draft_v2';
const LEADS_STORAGE_KEY = 'cp_captured_leads';

export function saveLeadDraft(data: Partial<LeadWizardFormData>, currentStep: number): void {
  try {
    const payload = {
      formData: data,
      currentStep,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[Storage] Não foi possível salvar rascunho no localStorage:', error);
  }
}

export function getLeadDraft(): { formData: Partial<LeadWizardFormData>; currentStep: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[Storage] Erro ao carregar rascunho do localStorage:', error);
    return null;
  }
}

export function clearLeadDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn('[Storage] Erro ao limpar rascunho:', error);
  }
}
