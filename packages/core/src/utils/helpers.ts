import { MAX_YEAR, MIN_YEAR } from './constants';
import type { BSDate } from '../types';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const NEPAL_OFFSET_MINUTES = 5 * 60 + 45;
export const NEPAL_OFFSET_MS = NEPAL_OFFSET_MINUTES * 60 * 1000;
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

function shiftToNepal(date: Date): Date {
  return new Date(date.getTime() + NEPAL_OFFSET_MS);
}

export interface NepalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  dayOfWeek: number;
}

export function getNepalDateTimeParts(date: Date): NepalDateTimeParts {
  const shifted = shiftToNepal(date);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

export function createNepalDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - NEPAL_OFFSET_MS);
}

export function updateNepalDateTime(date: Date, updater: (shifted: Date) => void): Date {
  const shifted = shiftToNepal(date);
  updater(shifted);
  return new Date(shifted.getTime() - NEPAL_OFFSET_MS);
}

export function nepalStartOfDay(date: Date): number {
  const shifted = shiftToNepal(date);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - NEPAL_OFFSET_MS;
}

export function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function diffInCalendarDays(a: Date, b: Date): number {
  return Math.floor((nepalStartOfDay(a) - nepalStartOfDay(b)) / DAY_MS);
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
