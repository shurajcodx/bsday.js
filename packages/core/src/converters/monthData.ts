import { MAX_YEAR, MIN_YEAR } from '../utils/constants';

export type BsMonthTable = Record<number, readonly number[]>;

// Initial implementation note:
// this synthetic month matrix is a deterministic placeholder so the core APIs
// are functional while we set up the architecture. Replace with the official
// BS month-length table for production-grade historical accuracy.
const BASE_PATTERN = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30] as const;

function isSyntheticLeapYear(year: number): boolean {
  return year % 4 === 0;
}

export const BS_MONTH_TABLE: BsMonthTable = (() => {
  const table: Record<number, readonly number[]> = {};

  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
    const row = [...BASE_PATTERN];
    if (isSyntheticLeapYear(year)) {
      row[11] = 31;
    }
    table[year] = row;
  }

  return table;
})();

export function getBsMonthDays(year: number, month: number): number {
  const row = BS_MONTH_TABLE[year];
  if (!row) {
    throw new RangeError(`No BS month table entry for year ${year}.`);
  }

  if (month < 1 || month > 12) {
    throw new RangeError(`BS month must be 1-12. Received ${month}.`);
  }

  return row[month - 1] ?? 0;
}

export function getBsYearDays(year: number): number {
  const row = BS_MONTH_TABLE[year];
  if (!row) {
    throw new RangeError(`No BS month table entry for year ${year}.`);
  }

  return row.reduce((sum, days) => sum + days, 0);
}

export function isBsLeapYear(year: number): boolean {
  return getBsYearDays(year) > 365;
}
