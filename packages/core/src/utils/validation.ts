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
