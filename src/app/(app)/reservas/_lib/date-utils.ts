/** Retorna amanha em YYYY-MM-DD (timezone local) */
export function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

/** Retorna hoje + 30 dias em YYYY-MM-DD */
export function getMaxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return toISODate(d);
}

/** Retorna hoje em YYYY-MM-DD (timezone local) */
export function getToday(): string {
  return toISODate(new Date());
}

/** Verifica se YYYY-MM-DD cai em sabado ou domingo */
export function isWeekend(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

/** Verifica se YYYY-MM-DD eh hoje */
export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

/** Formata "2026-04-10" → "Sexta-feira, 10 de Abril de 2026" */
export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** Formata ISO timestamp → "HH:mm" */
export function formatTimeBR(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Converte Date para YYYY-MM-DD */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
