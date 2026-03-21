import { describe, it, expect, beforeAll } from 'vitest';
import { BSDay } from '../src';
import { dataset as bundledDataset } from '@bsday/dataset';

beforeAll(() => {
    BSDay.setDataset(bundledDataset);
});

describe('BSDay Core Features', () => {

    it('creates a BS date correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        expect(d.isValid()).toBe(true);
        expect(d.year()).toBe(2080);
        expect(d.month()).toBe(5);
        expect(d.date()).toBe(10);
        expect(d.toBS()).toEqual({ year: 2080, month: 5, day: 10 });
    });

    it('converts to AD correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const ad = d.toAD();
        expect(ad instanceof Date).toBe(true);
    });

    it('formats correctly with locale', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const formattedBS = d.format('YYYY-MM-DD', 'bs');
        const formattedAD = d.format('YYYY-MM-DD', 'ad');
        expect(formattedBS).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(formattedAD).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        expect(d.locale('ne').format('YYYY MMMM DD')).toContain('२०८०');
        expect(d.locale('en').format('YYYY MMMM DD')).toContain('2080');
    });

    it('adds and subtracts time correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const plus10Days = d.add(10, 'day');
        const minus5Days = d.subtract(5, 'day');
        expect(plus10Days.date()).toBeGreaterThan(d.date());
        expect(minus5Days.date()).toBeLessThan(d.date());

        const plus2Months = d.add(2, 'month');
        expect(plus2Months.month()).toBeGreaterThan(d.month());

        const plus1Year = d.add(1, 'year');
        expect(plus1Year.year()).toBe(d.year() + 1);
    });

    it('startOf and endOf work correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const startOfDay = d.startOf('day').toAD();
        const endOfDay = d.endOf('day').toAD();

        expect(startOfDay.getUTCHours()).toBe(0);
        expect(endOfDay.getUTCHours()).toBe(23);
    });

    it('comparison functions work', () => {
        const a = new BSDay({ year: 2081, month: 1, day: 1 });
        const b = new BSDay({ year: 2080, month: 1, day: 1 });
        expect(a.isAfter(b)).toBe(true);
        expect(b.isBefore(a)).toBe(true);
        expect(a.isSame(b)).toBe(false);
        expect(b.isBetween(b, a, 'day', '[]')).toBe(true);
        expect(b.isBetween(b, a, 'day', '()')).toBe(false);
    });

    it('diff works', () => {
        const a = new BSDay({ year: 2081, month: 1, day: 1 });
        const b = new BSDay({ year: 2080, month: 1, day: 1 });
        expect(a.diff(b, 'day')).toBeGreaterThan(0);
        expect(a.diff(b, 'month')).toBeGreaterThan(0);
        expect(a.diff(b, 'year')).toBeCloseTo(1, 0);
    });

    it('plugin system works', () => {
        const testPlugin = (option: any, BSDayClass: any) => {
            BSDayClass.prototype.sayHello = function () {
                return 'hello';
            };
        };

        BSDay.extend(testPlugin);
        const d = new BSDay();
        expect((d as any).sayHello()).toBe('hello');
    });

    it('clone and immutability', () => {
        const original = new BSDay({ year: 2080, month: 5, day: 10 });
        const clone = original.clone();
        expect(clone.toString()).toBe(original.toString());
        expect(clone).not.toBe(original);

        const updated = original.add(1, 'day');
        expect(updated.toString()).not.toBe(original.toString());
    });

    it('dataset tithi/panchang', () => {
        const d = new BSDay({ year: 2080, month: 1, day: 1 });
        expect(d.tithi).toBeDefined();
        expect(d.panchang).toBeDefined();
        expect(d.data()).toBeDefined();
    });

});
