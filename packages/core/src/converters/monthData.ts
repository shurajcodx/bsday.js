import { MAX_YEAR, MIN_YEAR } from '../utils/constants';
import { ACCURATE_BS_MONTH_TABLE } from './accurateMonthData';

export type BsMonthTable = Record<number, readonly number[]>;

const BASE_PATTERN = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30] as const;

export const BS_MONTH_TABLE: BsMonthTable = (() => {
  const table: Record<number, readonly number[]> = {};

  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    table[year] = ACCURATE_BS_MONTH_TABLE[year] || BASE_PATTERN;
  }

  return table;
})();

export const getBsMonthDays = (year: number, month: number): number => {
  const row = BS_MONTH_TABLE[year];
  if (!row) throw new RangeError(`No BS month table entry for year ${year}.`);
  if (month < 1 || month > 12)
    throw new RangeError(`BS month must be 1-12. Received ${month}.`);
  return row[month - 1] ?? 0;
};

export const getBsYearDays = (year: number): number => {
  const row = BS_MONTH_TABLE[year];
  if (!row) throw new RangeError(`No BS month table entry for year ${year}.`);
  return row.reduce((sum, days) => sum + days, 0);
};

export const isBsLeapYear = (year: number): boolean =>
  getBsYearDays(year) > 365;
