import type { SystemSettings } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let activeFormat: SystemSettings['dateFormat'] = 'DD MMM YYYY';

/** Called by the data layer whenever system settings change. */
export function setDateFormat(format: SystemSettings['dateFormat']) {
  activeFormat = format;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Parse a yyyy-mm-dd string as a local date (avoids UTC shifting). */
export function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoOffset(days: number): string {
  return toISODate(addDays(new Date(), days));
}

export function formatDate(value: string, format = activeFormat): string {
  const d = parseISODate(value);
  if (!d) return '-';
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  switch (format) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd} ${MONTHS[d.getMonth()]} ${yyyy}`;
  }
}

/** "10:00" → "10:00 AM" */
export function formatTime(value: string): string {
  if (!value) return '-';
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '-';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${pad(hour)}:${pad(m)} ${suffix}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${formatDate(toISODate(d))}, ${formatTime(`${d.getHours()}:${d.getMinutes()}`)}`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(toISODate(new Date(iso)));
}

export function dayNumber(value: string): string {
  const d = parseISODate(value);
  return d ? pad(d.getDate()) : '--';
}

export function monthShort(value: string): string {
  const d = parseISODate(value);
  return d ? MONTHS[d.getMonth()] : '';
}

export function monthLong(index: number): string {
  return MONTHS_LONG[index];
}

export function monthShortByIndex(index: number): string {
  return MONTHS[index];
}

export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = parseISODate(fromISO);
  const b = parseISODate(toISO);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** 6x7 grid of dates covering the given month (weeks start on Sunday). */
export function monthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Combine date + time for sorting. */
export function dateTimeValue(date: string, time = '00:00'): number {
  const d = parseISODate(date);
  if (!d) return Number.MAX_SAFE_INTEGER;
  const [h, m] = time.split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}
