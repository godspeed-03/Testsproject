export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysStr(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
