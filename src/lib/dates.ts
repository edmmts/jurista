export function formatToPTBRDate(isoString: string): string {
  if (!isoString) return '';
  const parts = isoString.split('T')[0].split('-');
  if (parts.length !== 3) return isoString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isHolidayOrWeekend(date: Date, skipMode: 'seg-sex' | 'seg-sab' | 'seg-dom' | string): boolean {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (skipMode === 'seg-sex') {
    return day === 0 || day === 6; // Sunday or Saturday
  }
  if (skipMode === 'seg-sab') {
    return day === 0; // Sunday
  }
  return false; // seg-dom or custom: no skip
}
