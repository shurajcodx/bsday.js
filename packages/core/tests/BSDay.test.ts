import { describe, expect, it } from 'vitest';
import { BSDay } from '../src';
import { dataset as bundledDataset } from '@bsday/dataset';

describe('BSDay core', () => {
  it('returns a valid BS date for now()', () => {
    const date = BSDay.now();
    expect(date.toBS()).toEqual({
      year: expect.any(Number),
      month: expect.any(Number),
      day: expect.any(Number),
    });
    expect(date.format('YYYY-MM-DD', 'bs')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns AD Date from nowAD()', () => {
    const ad = BSDay.nowAD();
    expect(ad).toBeInstanceOf(Date);
    expect(Math.abs(ad.getTime() - Date.now())).toBeLessThanOrEqual(1000);
  });

  it('returns formatted BS date-time string from nowBS()', () => {
    const bs = BSDay.nowBS();
    expect(bs).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('supports custom nowBS() pattern', () => {
    const bs = BSDay.nowBS('YYYY/MM/DD HH:mm');
    expect(bs).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  it('creates from BS and returns BS components', () => {
    const d = BSDay.fromBS([2082, 1, 1]);
    expect(d.year).toBe(2082);
    expect(d.month).toBe(1);
    expect(d.day).toBe(1);
  });

  it('round-trips BS -> AD -> BS', () => {
    const source = BSDay.fromBS([2082, 5, 11]);
    const roundTrip = BSDay.fromAD(source.toAD());
    expect(roundTrip.toBS()).toEqual(source.toBS());
  });

  it('supports arithmetic and comparison', () => {
    const a = BSDay.fromBS([2082, 1, 1]);
    const b = a.add(10, 'day');

    expect(b.isAfter(a)).toBe(true);
    expect(a.isBefore(b)).toBe(true);
    expect(a.isSame(b)).toBe(false);
  });

  it('supports all exported API reference methods', () => {
    const date = BSDay.fromBS([2082, 5, 10]);

    // toBS
    expect(date.toBS()).toEqual({ year: 2082, month: 5, day: 10 });

    // subtractDays
    expect(date.subtract(5, 'day').toBS()).toEqual({ year: 2082, month: 5, day: 5 });

    // addMonths / subtractMonths
    expect(date.add(2, 'month').toBS()).toEqual({ year: 2082, month: 7, day: 10 });
    expect(date.subtract(1, 'month').toBS()).toEqual({ year: 2082, month: 4, day: 10 });

    // addYears / subtractYears
    expect(date.add(1, 'year').toBS()).toEqual({ year: 2083, month: 5, day: 10 });
    expect(date.subtract(1, 'year').toBS()).toEqual({ year: 2081, month: 5, day: 10 });

    // generic add / subtract
    expect(date.add(2, 'month').toBS()).toEqual({ year: 2082, month: 7, day: 10 });
    expect(date.subtract(5, 'day').toBS()).toEqual({ year: 2082, month: 5, day: 5 });

    // daysInMonth
    expect(BSDay.fromBS([2082, 5, 10]).daysInMonth('bs')).toBe(31);
    expect(BSDay.fromAD(new Date(Date.UTC(2024, 0, 15))).daysInMonth('ad')).toBe(31);

    // isWeekend
    expect(BSDay.fromAD(new Date(Date.UTC(2024, 8, 28))).isWeekend()).toBe(true); // Sept 28, 2024 (Saturday)
    expect(BSDay.fromAD(new Date(Date.UTC(2024, 8, 30))).isWeekend()).toBe(false); // Sept 30, 2024 (Monday)

    // setYear, setMonth, setDay
    expect(date.setYear(2085).toBS()).toEqual({ year: 2085, month: 5, day: 10 });
    expect(date.setMonth(8).toBS()).toEqual({ year: 2082, month: 8, day: 10 });
    expect(date.setDay(25).toBS()).toEqual({ year: 2082, month: 5, day: 25 });

    // isLeapYear (BS calendar has its own leap years based on the underlying dataset/math)
    expect(typeof date.isLeapYear()).toBe('boolean');
  });

  it('validates various inputs using BSDay.isValid', () => {
    // 3 number signature
    expect(BSDay.isValid(2081, 6, 26, 'bs')).toBe(true);
    expect(BSDay.isValid(2081, 13, 26, 'bs')).toBe(false);
    expect(BSDay.isValid(2024, 1, 1, 'ad')).toBe(true);

    // Objects
    expect(BSDay.isValid({ bs: [2081, 6, 26] })).toBe(true);
    expect(BSDay.isValid({ bs: [2081, 14, 26] })).toBe(false);
    expect(BSDay.isValid(new Date())).toBe(true);

    // Strings without pattern
    expect(BSDay.isValid('2024-01-01')).toBe(true);
    expect(BSDay.isValid('invalid string')).toBe(false);

    // Strings with pattern
    expect(BSDay.isValid('2081-06-26', 'YYYY-MM-DD', 'bs')).toBe(true);
    expect(BSDay.isValid('2081/06/26', 'YYYY-MM-DD', 'bs')).toBe(false); // strict pattern failure
  });

  it('formats with built-in tokens', () => {
    const d = BSDay.fromBS([2082, 12, 9]);
    expect(d.format('YYYY-MM-DD')).toBe('2082-12-09');
  });

  it('supports Nepali localization and numerals', () => {
    const d = BSDay.fromBS([2082, 1, 1]);

    // Default format (English locale, BS calendar)
    expect(d.format('YYYY-MM-DD')).toBe('2082-01-01');
    expect(d.format('MMMM D', 'bs')).toBe('Baisakh 1');

    // Nepali locale
    expect(d.format('YYYY-MM-DD', 'bs', 'ne')).toBe('२०८२-०१-०१');
    expect(d.format('MMMM D', 'bs', 'ne')).toBe('वैशाख १');

    // AD with Nepali locale
    const adDate = BSDay.fromAD(new Date(Date.UTC(2024, 0, 1))); // Jan 1, 2024
    expect(adDate.format('YYYY-MM-DD', 'ad', 'ne')).toBe('२०२४-०१-०१');
    expect(adDate.format('MMMM', 'ad', 'ne')).toBe('जनवरी');
  });

  it('parses from pattern', () => {
    const parsed = BSDay.parse('2082-12-09', 'YYYY-MM-DD', 'bs');
    expect(parsed.toBS()).toEqual({ year: 2082, month: 12, day: 9 });
  });

  it('supports plugin token registration', () => {
    BSDay.registerFormatToken('NN', ({ bs }) => String(bs.year + bs.month + bs.day));
    const d = BSDay.fromBS([2082, 1, 1]);
    expect(d.format('NN')).toBe('2084');
  });

  it('gets tithi without setting dataset manually', () => {
    const date = BSDay.fromBS([2082, 11, 24]);
    expect(date.tithi()).toBe('Panchami');
  });

  it('auto-loads bundled dataset by default', () => {
    const date = BSDay.fromBS([2082, 11, 24]);
    expect(date.tithi()).toBe('Panchami');
    // expect(date.data()?.events).toContain("International Women's Day");
    expect(date.panchang()).toEqual({
      paksha: 'Krishna',
      nakshatra: 'Swati',
      yoga: 'Dhruva',
      karana: 'Kaulava',
    });
  });

  it('maps known AD date to expected BS date', () => {
    const date = BSDay.fromAD(new Date(Date.UTC(2026, 2, 8)));
    expect(date.toBS()).toEqual({ year: 2082, month: 11, day: 24 });
  });

  it('resolves dataset entries for both padded and non-padded keys', () => {
    BSDay.setDataset({
      '2082-1-1': {
        tithi: 'Pratipada',
        paksha: 'Shukla',
        festivals: ['Test Festival'],
        events: [],
        isHoliday: true,
        nakshatra: 'Ashwini',
        yoga: 'Vishkumbha',
        karana: 'Bava',
      },
      '2082-11-24': {
        tithi: 'Panchami',
        paksha: 'Krishna',
        festivals: ['Nari Diwas'],
        events: [],
        isHoliday: false,
        nakshatra: 'Swati',
        yoga: 'Dhruva',
        karana: 'Kaulava',
      },
    });

    const a = BSDay.fromBS([2082, 1, 1]);
    const b = BSDay.fromBS([2082, 11, 24]);

    expect(a.tithi()).toBe('Pratipada');
    expect(b.tithi()).toBe('Panchami');
    // expect(a.festivals()).toEqual(['Test Festival']);
    expect(b.panchang()).toEqual({
      paksha: 'Krishna',
      nakshatra: 'Swati',
      yoga: 'Dhruva',
      karana: 'Kaulava',
    });

    /*
    const festivals = b.festivals();
    festivals.push('Mutated');
    expect(b.festivals()).toEqual(['Nari Diwas']);
    */

    BSDay.setDataset(
      bundledDataset as Record<
        string,
        {
          tithi: string;
          paksha: string;
          festivals: string[];
          events: string[];
          isHoliday: boolean;
          nakshatra: string;
          yoga: string;
          karana: string;
        }
      >,
    );
  });
});
