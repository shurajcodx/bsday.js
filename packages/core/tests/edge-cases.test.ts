import { describe, it, expect, beforeAll } from 'vitest';
import bundledDataset from '../../dataset/src/data/dataset.json';

import { BSDay, bsday, relativeTimePlugin } from '../src';
import type { BSDayPluginHost, BSDayData } from '../src';

beforeAll(() => {
  BSDay.setDataset(bundledDataset as unknown as Record<string, BSDayData>);
});

describe('BSDay Edge Cases & Boundary Handling', () => {
  describe('Input Validation & Constructor Edges', () => {
    it('handles empty strings, null, and undefined safely', () => {
      expect(new BSDay('').isValid()).toBe(false);
      expect(new BSDay(null).isValid()).toBe(false);
      expect(new BSDay(undefined).isValid()).toBe(true);
    });

    it('rejects out-of-range numeric inputs', () => {
      const d = new BSDay({ year: 2080, month: 13, day: 32 });
      expect(d.isValid()).toBe(false);
    });

    it('treats bare constructor strings as AD-like input', () => {
      const d = new BSDay('2024-10-12');
      expect(d.isValid()).toBe(true);
      expect(BSDay.isValid('2024-10-12')).toBe(true);
      expect(d.format('YYYY-MM-DD', 'ad')).toBe('2024-10-12');
    });

    it('accepts explicit BS creation through BSDay.bs', () => {
      const bs = BSDay.bs('2081/06/27');
      const bsFromNumbers = BSDay.bs(2081, 6, 27);
      const bsFromFactory = bsday.bs('2081/06/27');
      const ad = BSDay.parse('2024-10-13', 'YYYY-MM-DD', 'ad');

      expect(bs.isValid()).toBe(true);
      expect(bs.toAD().toISOString()).toBe('2024-10-12T18:15:00.000Z');
      expect(bsFromNumbers.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
      expect(bsFromFactory.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
      expect(ad.isValid()).toBe(true);
      expect(ad.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
    });

    it('keeps default-factory exports attached for CommonJS consumers', () => {
      expect(bsday.BSDay).toBe(BSDay);
      expect(bsday.bsday).toBe(bsday);
      expect(bsday.relativeTimePlugin).toBe(relativeTimePlugin);
    });

    it('does not treat BS slash strings as implicit constructor input', () => {
      const adOnly = new BSDay('1969-07-20');
      const bsOnly = new BSDay('2081/06/27');

      expect(adOnly.isValid()).toBe(true);
      expect(adOnly.format('YYYY-MM-DD', 'ad')).toBe('1969-07-20');
      expect(bsOnly.isValid()).toBe(false);
      expect(BSDay.isValid('2081/06/27')).toBe(false);
    });
  });

  describe('Calendar Boundaries & Overflows', () => {
    it('evaluates AD and BS leap years correctly', () => {
      expect(BSDay.isLeapYear(2000, 'ad')).toBe(true);
      expect(BSDay.isLeapYear(1900, 'ad')).toBe(false);
      expect(BSDay.isLeapYear(2024, 'ad')).toBe(true);
      expect(BSDay.isLeapYear(2023, 'ad')).toBe(false);
    });

    it('handles BS month/day boundary overflows correctly', () => {
      const d = new BSDay({ year: 2080, month: 12, day: 30 }).hour(9).minute(45);
      const overflow = d.add(1, 'day');
      expect(overflow.date()).toBe(1);
      expect(overflow.month()).toBe(1);
      expect(overflow.year()).toBe(2081);
    });

    it('clamps BS day when moving to a month with fewer days', () => {
      const d = new BSDay({ year: 2080, month: 1, day: 31 });
      const nextMonth = d.month(2);
      expect(nextMonth.date()).toBeLessThanOrEqual(nextMonth.daysInMonth());
    });

    it('handles add/subtract months across year boundaries', () => {
      const d = new BSDay({ year: 2080, month: 11, day: 1 });
      const next = d.add(3, 'month');
      expect(next.year()).toBe(2081);
      expect(next.month()).toBe(2);

      const prev = next.subtract(3, 'month');
      expect(prev.year()).toBe(2080);
      expect(prev.month()).toBe(11);
    });

    it('computes diff across year boundaries', () => {
      const a = new BSDay({ year: 2081, month: 2, day: 1 });
      const b = new BSDay({ year: 2080, month: 11, day: 1 });
      expect(a.diff(b, 'month')).toBe(3);
    });
  });

  describe('Dataset Fallback & Plugins', () => {
    it('gracefully handles dates missing from dataset', () => {
      const d = new BSDay({ year: 1980, month: 1, day: 1 });
      expect(d.tithi).toBeNull();
      expect(d.panchang).toBeNull();
      expect(d.data()).toBeNull();
      expect(d.festivals).toEqual([]);
      expect(d.events).toEqual([]);
      expect(d.isHoliday).toBe(false);
    });

    it('safely handles multiple registrations of the same plugin', () => {
      let runCount = 0;
      const testPlugin = (_option: unknown, BSDayClass: BSDayPluginHost) => {
        runCount++;
        (BSDayClass.prototype as Record<string, unknown>).duplicateTest = () => true;
      };

      BSDay.extend(testPlugin);
      BSDay.extend(testPlugin);
      expect(runCount).toBe(1);
    });

    it('rejects instants before the Nepal-local epoch boundary', () => {
      const beforeEpoch = new Date('1913-04-12T18:14:59.999Z');
      const d = BSDay.fromAD(beforeEpoch);
      expect(() => d.toBS()).toThrow(RangeError);
    });
  });
});
