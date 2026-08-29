import type { CalendarType } from '../types';
import { getBsMonthDays, isBsLeapYear } from '../converters/monthData';
import { MAX_YEAR, MIN_YEAR } from './constants';

export function isLeapYear(year: number, calendar: CalendarType = 'ad'): boolean {
  if (calendar === 'bs') {
    if (year < MIN_YEAR || year > MAX_YEAR) {
      return false;
    }
    return isBsLeapYear(year);
  }

  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isValidADDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
  );
}

export function isValidBSDate(year: number, month: number, day: number): boolean {
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12 || day < 1) {
    return false;
  }

  return day <= getBsMonthDays(year, month);
}

export interface BSDateValidationOptions {
  minDate?: string;
  maxDate?: string;
  minYear?: number;
  maxYear?: number;
}

export interface BSDateValidationResult {
  isValid: boolean;
  error?: string;
  bs?: { year: number; month: number; day: number };
}

export function validateBSDateString(
  input: string,
  options: BSDateValidationOptions = {},
): BSDateValidationResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Date string is required' };
  }

  const match = input.trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (!match) {
    return { isValid: false, error: 'Invalid date format. Expected YYYY/MM/DD or YYYY-MM-DD' };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!isValidBSDate(year, month, day)) {
    return { isValid: false, error: `Invalid BS date ${year}-${month}-${day}` };
  }

  if (options.minYear && year < options.minYear) {
    return { isValid: false, error: `Year must be at least ${options.minYear}` };
  }

  if (options.maxYear && year > options.maxYear) {
    return { isValid: false, error: `Year must not exceed ${options.maxYear}` };
  }

  const normalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (options.minDate) {
    const minNorm = options.minDate.replace(/\//g, '-');
    if (normalized < minNorm) {
      return { isValid: false, error: `Date must be on or after ${options.minDate}` };
    }
  }

  if (options.maxDate) {
    const maxNorm = options.maxDate.replace(/\//g, '-');
    if (normalized > maxNorm) {
      return { isValid: false, error: `Date must be on or before ${options.maxDate}` };
    }
  }

  return { isValid: true, bs: { year, month, day } };
}

