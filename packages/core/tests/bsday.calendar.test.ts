import { describe, expect, it } from 'vitest';
import {
  bsday,
  getCalendarMatrix,
  isDateInRange,
  getDateRange,
  getMonthNames,
  getWeekdayNames,
} from '../src';

describe('Headless Calendar Matrix Generator', () => {
  it('generates a valid calendar matrix with correct row/column structure', () => {
    const weeks = getCalendarMatrix(2081, 5); // Bhadra 2081
    expect(weeks.length).toBeGreaterThanOrEqual(5);

    // Each row must be a week of 7 cells
    for (const week of weeks) {
      expect(week.length).toBe(7);
      for (const cell of week) {
        expect(cell.bs.year).toBeGreaterThanOrEqual(2080);
        expect(cell.bs.month).toBeGreaterThanOrEqual(1);
        expect(cell.bs.month).toBeLessThanOrEqual(12);
        expect(cell.bs.day).toBeGreaterThanOrEqual(1);
        expect(typeof cell.dateString).toBe('string');
        expect(typeof cell.adDateString).toBe('string');
        expect(typeof cell.isCurrentMonth).toBe('boolean');
        expect(typeof cell.isSaturday).toBe('boolean');
        expect(typeof cell.isWeekend).toBe('boolean');
      }
    }
  });

  it('correctly sets isCurrentMonth for leading and trailing days', () => {
    // 2081 Bhadra 1 started on Sunday (dayOfWeek 0)
    // In 2081, Bhadra 1 is 2081-05-01 (Aug 17, 2024 = Saturday in AD, let's verify)
    const weeks = getCalendarMatrix(2081, 5);

    // Find first cell with isCurrentMonth = true
    const currentMonthCells = weeks.flat().filter((c) => c.isCurrentMonth);
    // Bhadra 2081 has 31 days
    expect(currentMonthCells.length).toBe(31);
    expect(currentMonthCells[0].dayNumber).toBe(1);
    expect(currentMonthCells[30].dayNumber).toBe(31);
  });

  it('supports fixed 6-week (42 cell) matrix when fixedWeeks is true', () => {
    const weeks = getCalendarMatrix(2081, 1, { fixedWeeks: true });
    expect(weeks.length).toBe(6);
    expect(weeks.flat().length).toBe(42);
  });

  it('supports Monday as start of week', () => {
    const weeks = getCalendarMatrix(2081, 5, { startOfWeek: 'mon' });
    for (const week of weeks) {
      // First column must be Monday (dayOfWeek 1)
      expect(week[0].dayOfWeek).toBe(1);
      // Last column must be Sunday (dayOfWeek 0)
      expect(week[6].dayOfWeek).toBe(0);
    }
  });

  it('localizes dayText in Nepali when locale is ne', () => {
    const weeks = getCalendarMatrix(2081, 5, { locale: 'ne' });
    const cell10 = weeks.flat().find((c) => c.isCurrentMonth && c.bs.day === 10);
    expect(cell10?.dayText).toBe('१०');
  });

  it('marks disabled dates according to minDate, maxDate, and disabledDaysOfWeek', () => {
    const weeks = getCalendarMatrix(2081, 5, {
      minDate: '2081/05/10',
      maxDate: '2081/05/20',
      disabledDaysOfWeek: [6], // Disable Saturdays
    });

    const day5 = weeks.flat().find((c) => c.isCurrentMonth && c.bs.day === 5);
    expect(day5?.isDisabled).toBe(true); // Before minDate

    const day15 = weeks.flat().find((c) => c.isCurrentMonth && c.bs.day === 15);
    if (day15?.dayOfWeek === 6) {
      expect(day15.isDisabled).toBe(true);
    } else {
      expect(day15?.isDisabled).toBe(false);
    }

    const day25 = weeks.flat().find((c) => c.isCurrentMonth && c.bs.day === 25);
    expect(day25?.isDisabled).toBe(true); // After maxDate
  });

  it('works seamlessly via BSDay instance method', () => {
    const d = bsday.bs(2081, 6, 15);
    const matrix = d.getCalendarMatrix();
    expect(matrix.length).toBeGreaterThanOrEqual(5);
    const ashwinCells = matrix.flat().filter((c) => c.isCurrentMonth);
    expect(ashwinCells[0].bs.month).toBe(6);
  });
});

describe('Date Range & UI Helpers', () => {
  it('checks if a date is within range', () => {
    expect(isDateInRange('2081/05/15', '2081/05/10', '2081/05/20')).toBe(true);
    expect(isDateInRange('2081/05/05', '2081/05/10', '2081/05/20')).toBe(false);
    expect(isDateInRange('2081/05/10', '2081/05/10', '2081/05/20', '[]')).toBe(true);
    expect(isDateInRange('2081/05/10', '2081/05/10', '2081/05/20', '()')).toBe(false);
  });

  it('generates a range of consecutive dates', () => {
    const range = getDateRange('2081/05/01', '2081/05/05');
    expect(range.length).toBe(5);
    expect(range[0].format('YYYY/MM/DD')).toBe('2081/05/01');
    expect(range[4].format('YYYY/MM/DD')).toBe('2081/05/05');
  });

  it('provides localized month and weekday names', () => {
    const enMonths = getMonthNames('en', 'long');
    expect(enMonths[0]).toBe('Baisakh');
    expect(enMonths[11]).toBe('Chaitra');

    const neMonths = getMonthNames('ne', 'long');
    expect(neMonths[0]).toBe('वैशाख');
    expect(neMonths[11]).toBe('चैत');

    const enWeekdays = getWeekdayNames('en', 'short');
    expect(enWeekdays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    const neWeekdays = getWeekdayNames('ne', 'short');
    expect(neWeekdays[0]).toBe('आइत');
    expect(neWeekdays[6]).toBe('शनि');

    const mondayStart = getWeekdayNames('en', 'short', 1);
    expect(mondayStart[0]).toBe('Mon');
    expect(mondayStart[6]).toBe('Sun');
  });
});
