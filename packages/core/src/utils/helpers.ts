import { MAX_YEAR, MIN_YEAR } from './constants';
import type { BSDate } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const NEPALI_NUMBERS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function localizeNumber(value: string | number, locale: string = 'en'): string {
  const str = String(value);
  if (locale === 'en') return str;
  return str.split('').map(char => {
    const num = parseInt(char, 10);
    return isNaN(num) ? char : NEPALI_NUMBERS[num]!;
  }).join('');
}

export function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0');
}

export function utcStartOfDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(utcStartOfDay(date) + days * DAY_MS);
}

export function diffInUtcDays(a: Date, b: Date): number {
  return Math.floor((utcStartOfDay(a) - utcStartOfDay(b)) / DAY_MS);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mod(n: number, base: number): number {
  return ((n % base) + base) % base;
}

export function assertBsYearRange(year: number): void {
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`BS year must be between ${MIN_YEAR} and ${MAX_YEAR}. Received ${year}.`);
  }
}

export function buildBsKey(date: BSDate): string {
  return `${pad(date.year, 4)}-${pad(date.month)}-${pad(date.day)}`;
}
