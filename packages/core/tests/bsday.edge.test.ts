import { describe, it, expect, beforeAll } from 'vitest';
import bundledDataset from '../../dataset/src/data/dataset.json';

import { BSDay, bsday } from '../src';

beforeAll(() => {
    BSDay.setDataset(bundledDataset);
});

describe('BSDay Edge Cases', () => {
    it('invalid inputs: empty string, null, undefined', () => {
        expect(new BSDay('').isValid()).toBe(false);
        expect(new BSDay(null).isValid()).toBe(false);
        expect(new BSDay(undefined).isValid()).toBe(true);
    });

    it('invalid numeric inputs', () => {
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
        const ad = BSDay.parse('2024-10-12', 'YYYY-MM-DD', 'ad');

        expect(bs.isValid()).toBe(true);
        expect(bs.toAD().toISOString()).toBe('2024-10-11T18:15:00.000Z');
        expect(bsFromNumbers.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
        expect(bsFromFactory.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
        expect(ad.isValid()).toBe(true);
        expect(ad.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
    });

    it('does not treat BS slash strings as implicit constructor input', () => {
        const adOnly = new BSDay('1969-07-20');
        const bsOnly = new BSDay('2081/06/27');

        expect(adOnly.isValid()).toBe(true);
        expect(adOnly.format('YYYY-MM-DD', 'ad')).toBe('1969-07-20');
        expect(bsOnly.isValid()).toBe(false);
        expect(BSDay.isValid('2081/06/27')).toBe(false);
    });

    it('AD leap years', () => {
        expect(BSDay.isLeapYear(2000, 'ad')).toBe(true);
        expect(BSDay.isLeapYear(1900, 'ad')).toBe(false);
        expect(BSDay.isLeapYear(2024, 'ad')).toBe(true);
        expect(BSDay.isLeapYear(2023, 'ad')).toBe(false);
    });

    it('BS month/day boundaries', () => {
        const d = new BSDay({ year: 2080, month: 12, day: 30 }).hour(9).minute(45);
        const overflow = d.add(1, 'day');
        expect(overflow.date()).toBe(1);
        expect(overflow.month()).toBe(1);
        expect(overflow.hour()).toBe(9);
        expect(overflow.minute()).toBe(45);
    });

    it('clamp BS day on setMonth', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 30 });
        const m = d.setMonth(2);
        expect(m.date()).toBeLessThanOrEqual(m.daysInMonth('bs'));
    });

    it('add/subtract months across years', () => {
        const d1 = new BSDay({ year: 2080, month: 11, day: 10 });
        const d2 = d1.add(3, 'month');
        expect(d2.year()).toBe(2081);
        expect(d2.month()).toBe(2);

        const d3 = new BSDay({ year: 2081, month: 1, day: 10 });
        const d4 = d3.subtract(2, 'month');
        expect(d4.year()).toBe(2080);
        expect(d4.month()).toBe(11);
    });

    it('startOf and endOf', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 }).hour(8).minute(10).second(15);
        const start = d.startOf('day').toAD();
        const end = d.endOf('day').toAD();
        expect(new BSDay(start).hour()).toBe(0);
        expect(new BSDay(end).hour()).toBe(23);
    });

    it('diff across year boundary', () => {
        const d1 = new BSDay({ year: 2080, month: 12, day: 30 });
        const d2 = new BSDay({ year: 2081, month: 1, day: 2 });
        // Correct difference is 2 days (31st doesn't exist in 2080 month 12)
        expect(d2.diff(d1, 'day')).toBe(2);
        expect(d2.diff(d1, 'month')).toBeCloseTo(2 / 30, 6);
        expect(d2.diff(d1, 'month', false)).toBe(0);
        expect(d2.diff(d1, 'year')).toBeCloseTo(2 / 365, 6);
        expect(d2.diff(d1, 'year', false)).toBe(0);
    });

    it('dataset missing entries', () => {
        const d = new BSDay({ year: 3000, month: 1, day: 1 });
        expect(d.tithi).toBeNull();
        expect(d.panchang).toBeNull();
        expect(d.data()).toBeNull();
        expect(d.festivals).toEqual([]);
        expect(d.events).toEqual([]);
        expect(d.isHoliday).toBe(false);
    });

    it('keeps dataset-backed panchang opt-in', () => {
        const existingDataset = BSDay.dataset();
        BSDay.setDataset({});

        const d = new BSDay({ year: 2080, month: 1, day: 1 });
        expect(d.tithi).toBeNull();
        expect(d.panchang).toBeNull();
        expect(d.data()).toBeNull();
        expect(d.festivals).toEqual([]);
        expect(d.events).toEqual([]);
        expect(d.isHoliday).toBe(false);

        BSDay.setDataset(existingDataset);
    });

    it('plugin safe multiple extension', () => {
        const plugin = (opt: any, BSDayClass: any) => {
            BSDayClass.prototype.pluginTest = () => 'ok';
        };
        BSDay.extend(plugin);
        BSDay.extend(plugin);

        const d = new BSDay();
        expect((d as any).pluginTest()).toBe('ok');
    });

    it('clone immutability edge', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const clone = d.clone();
        expect(clone).not.toBe(d);

        const updated = d.add(1, 'day');
        expect(updated.toString()).not.toBe(d.toString());
    });

    it('rejects instants before the Nepal-local epoch boundary', () => {
        const beforeBoundary = BSDay.fromAD(new Date('1913-04-12T18:14:59.999Z'));
        expect(() => beforeBoundary.toBS()).toThrow(RangeError);
    });

});
