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

/** Verifica se YYYY-MM-DD ou ISO timestamp eh hoje */
export function isToday(dateStr: string): boolean {
  return dateStr.slice(0, 10) === getToday();
}

/** Formata "2026-04-10" ou "2026-04-10T00:00:00.000Z" → "Sexta-feira, 10 de Abril de 2026" */
export function formatDateBR(dateStr: string): string {
  const datePart = dateStr.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
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

/** Retorna hoje em YYYY-MM-DD — usado para salas (reserva no mesmo dia permitida) */
export function getMinDateSala(): string {
  return toISODate(new Date());
}

/** Converte data YYYY-MM-DD + horario HH:mm para ISO 8601 UTC */
export function toUTCISO(dateStr: string, horario: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = horario.split(':').map(Number);
  const d = new Date(year, month - 1, day, h, m, 0, 0);
  return d.toISOString();
}

/** Formata ISO 8601 UTC → HH:mm no timezone local do browser */
export function formatHorarioLocal(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Gera array de slots de 30min entre 08:00 e 17:30 */
export function gerarSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

/** Calcula duracao legivel entre dois horarios HH:mm → "1h30" ou "30min" */
export function calcularDuracao(inicio: string, fim: string): string {
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  const totalMin = hf * 60 + mf - (hi * 60 + mi);
  if (totalMin <= 0) return '';
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/** Converte Date para YYYY-MM-DD */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
