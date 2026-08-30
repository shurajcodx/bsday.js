import { describe, expect, it } from 'vitest';
import {
  bsday,
  getCalendarMatrix,
  isDateInRange,
  isDateDisabled,
  getDateRange,
  getMonthNames,
  getWeekdayNames,
} from '../src';

describe('Calendar Matrix & Range Utilities', () => {
  describe('Headless Calendar Matrix Generator', () => {
    it('generates a valid calendar matrix with correct row/column structure', () => {
      const weeks = getCalendarMatrix(2081, 5); // Bhadra 2081
      expect(weeks.length).toBeGreaterThanOrEqual(5);

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
      const weeks = getCalendarMatrix(2081, 5);
      const currentMonthCells = weeks.flat().filter((c) => c.isCurrentMonth);
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
        expect(week[0].dayOfWeek).toBe(1);
        expect(week[6].dayOfWeek).toBe(0);
      }
    });

    it('formats cell day numbers in Nepali Devanagari when locale is ne', () => {
      const weeks = getCalendarMatrix(2081, 5, { locale: 'ne' });
      const firstCurrent = weeks.flat().find((c) => c.isCurrentMonth && c.dayNumber === 1);
      expect(firstCurrent?.dayText).toBe('१');
    });

    it('flags isDisabled when cell falls outside minDate or maxDate', () => {
      const weeks = getCalendarMatrix(2081, 5, {
        minDate: '2081/05/10',
        maxDate: '2081/05/20',
      });
      const day5 = weeks.flat().find((c) => c.isCurrentMonth && c.dayNumber === 5);
      const day15 = weeks.flat().find((c) => c.isCurrentMonth && c.dayNumber === 15);
      const day25 = weeks.flat().find((c) => c.isCurrentMonth && c.dayNumber === 25);

      expect(day5?.isDisabled).toBe(true);
      expect(day15?.isDisabled).toBe(false);
      expect(day25?.isDisabled).toBe(true);
    });

    it('works as a method on BSDay instance', () => {
      const d = bsday.bs(2081, 5, 15);
      const matrix = d.getCalendarMatrix({ fixedWeeks: true });
      expect(matrix.length).toBe(6);
      expect(matrix[0].length).toBe(7);
    });
  });

  describe('Date Range & Selection Helpers', () => {
    it('checks if a date is within a given range with isDateInRange()', () => {
      const start = '2081/05/01';
      const end = '2081/05/15';

      expect(isDateInRange('2081/05/10', start, end)).toBe(true);
      expect(isDateInRange('2081/05/01', start, end, '[]')).toBe(true);
      expect(isDateInRange('2081/05/01', start, end, '()')).toBe(false);
      expect(isDateInRange('2081/05/20', start, end)).toBe(false);
    });

    it('evaluates isDateDisabled() based on min, max, and disabled lists', () => {
      const options = {
        minDate: '2081/05/05',
        maxDate: '2081/05/25',
        disabledDates: ['2081/05/10'],
        disabledDaysOfWeek: [6], // Saturdays
      };

      expect(isDateDisabled('2081/05/01', options)).toBe(true);
      expect(isDateDisabled('2081/05/10', options)).toBe(true);
      expect(isDateDisabled('2081/05/12', options)).toBe(false);
      expect(isDateDisabled('2081/05/15', options)).toBe(true); // Saturday
    });

    it('generates an array of BSDay dates with getDateRange()', () => {
      const range = getDateRange('2081/05/01', '2081/05/05');
      expect(range.length).toBe(5);
      expect(range[0].format('YYYY/MM/DD')).toBe('2081/05/01');
      expect(range[4].format('YYYY/MM/DD')).toBe('2081/05/05');
    });

    it('provides localized month and weekday names', () => {
      const enMonths = getMonthNames('en', 'long');
      const neMonths = getMonthNames('ne', 'long');
      expect(enMonths[0]).toBe('Baisakh');
      expect(neMonths[0]).toBe('वैशाख');

      const enDays = getWeekdayNames('en', 'short');
      const neDays = getWeekdayNames('ne', 'min');
      expect(enDays[0]).toBe('Sun');
      expect(neDays[0]).toBe('आ');
    });
  });
});
