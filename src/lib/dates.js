// Datas trafegam como horário local "YYYY-MM-DDTHH:mm:ss" (sem fuso), exatamente como o aluno digitou.

const pad = (n) => String(n).padStart(2, '0');

export function toLocalISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function toInputValue(date) {
  return toLocalISO(date).slice(0, 16);
}

export function parseLocal(value) {
  if (!value) return null;
  const clean = String(value).replace(/Z$|[+-]\d{2}:\d{2}$/, '');
  const [d, t = '00:00:00'] = clean.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm, ss] = t.split(':').map((x) => Number(String(x).split('.')[0]) || 0);
  return new Date(y, m - 1, day, hh, mm, ss || 0);
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date) {
  const d = startOfDay(date);
  const diff = (d.getDay() + 6) % 7; // segunda-feira como início
  return addDays(d, -diff);
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDayLabel(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export function formatShortDay(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(value) {
  const d = value instanceof Date ? value : parseLocal(value);
  if (!d) return '';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function defaultDueDate() {
  const d = addDays(new Date(), 1);
  d.setHours(19, 0, 0, 0);
  return d;
}
