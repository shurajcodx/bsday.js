import { describe, expect, it } from 'vitest';
import { BSDay } from '../src';
import { dataset as bundledDataset } from '@bsday/dataset';

describe('BSDay core', () => {
  it('returns a valid BS date for now()', () => {
    const date = BSDay.now();
    expect(date.bs).toEqual({
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
    expect(roundTrip.bs).toEqual(source.bs);
  });

  it('supports arithmetic and comparison', () => {
    const a = BSDay.fromBS([2082, 1, 1]);
    const b = a.addDays(10);

    expect(b.isAfter(a)).toBe(true);
    expect(a.isBefore(b)).toBe(true);
    expect(a.isSame(b)).toBe(false);
  });

  it('formats with built-in tokens', () => {
    const d = BSDay.fromBS([2082, 12, 9]);
    expect(d.format('YYYY-MM-DD')).toBe('2082-12-09');
  });

  it('parses from pattern', () => {
    const parsed = BSDay.parse('2082-12-09', 'YYYY-MM-DD', 'bs');
    expect(parsed.bs).toEqual({ year: 2082, month: 12, day: 9 });
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
    expect(date.data()?.events).toContain("International Women's Day");
    expect(date.panchang()).toEqual({
      paksha: 'Krishna',
      nakshatra: 'Swati',
      yoga: 'Dhruva',
      karana: 'Kaulava',
    });
  });

  it('maps known AD date to expected BS date', () => {
    const date = BSDay.fromAD(new Date(Date.UTC(2026, 2, 8)));
    expect(date.bs).toEqual({ year: 2082, month: 11, day: 24 });
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
    expect(a.festivals()).toEqual(['Test Festival']);
    expect(b.panchang()).toEqual({
      paksha: 'Krishna',
      nakshatra: 'Swati',
      yoga: 'Dhruva',
      karana: 'Kaulava',
    });

    const festivals = b.festivals();
    festivals.push('Mutated');
    expect(b.festivals()).toEqual(['Nari Diwas']);

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
