export function generatePixCopiaECola(chave: string, valor: number, beneficiario: string, cidade: string = 'SAO PAULO'): string {
  const valorStr = valor.toFixed(2);
  const cleanChave = chave.replace(/\s+/g, '');
  const cleanBeneficiario = beneficiario.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 25);
  
  // Return standard formatting for PIX copy-and-paste payload
  return `00020101021226580014br.gov.bcb.pix0136${cleanChave}5204000053039865405${valorStr.length.toString().padStart(2, '0')}${valorStr}5802BR59${cleanBeneficiario.length.toString().padStart(2, '0')}${cleanBeneficiario}60${cidade.length.toString().padStart(2, '0')}${cidade}62070503***6304`;
}
