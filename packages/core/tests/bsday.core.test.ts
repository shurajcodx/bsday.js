import { describe, it, expect, beforeAll } from 'vitest';
import bundledDataset from '../../dataset/src/data/dataset.json';

import { BSDay } from '../src';
import type { BSDayPluginHost } from '../src';

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
        const d = new BSDay({ year: 2081, month: 1, day: 1 });
        const ad = d.toAD();
        expect(ad instanceof Date).toBe(true);
        expect(ad.toISOString()).toBe('2024-04-12T18:15:00.000Z');
    });

    it('formats correctly with locale', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 });
        const formattedBS = d.format('YYYY-MM-DD', 'bs');
        const formattedAD = d.format('YYYY-MM-DD', 'ad');
        expect(formattedBS).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(formattedAD).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(d.format()).toBe('2080/05/10');

        expect(d.locale('ne').format('YYYY MMMM DD')).toContain('२०८०');
        expect(d.locale('en').format('YYYY MMMM DD')).toContain('2080');
    });

    it('adds and subtracts time correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 }).hour(13).minute(25).second(40);
        const plus10Days = d.add(10, 'day');
        const minus5Days = d.subtract(5, 'day');
        expect(plus10Days.date()).toBeGreaterThan(d.date());
        expect(minus5Days.date()).toBeLessThan(d.date());
        expect(plus10Days.hour()).toBe(13);
        expect(plus10Days.minute()).toBe(25);
        expect(plus10Days.second()).toBe(40);

        const plus2Months = d.add(2, 'month');
        expect(plus2Months.month()).toBeGreaterThan(d.month());
        expect(plus2Months.hour()).toBe(13);

        const plus1Year = d.add(1, 'year');
        expect(plus1Year.year()).toBe(d.year() + 1);
        expect(plus1Year.hour()).toBe(13);
    });

    it('startOf and endOf work correctly', () => {
        const d = new BSDay({ year: 2080, month: 5, day: 10 }).hour(13).minute(25).second(40);
        const startOfDay = d.startOf('day').toAD();
        const endOfDay = d.endOf('day').toAD();

        expect(new BSDay(startOfDay).hour()).toBe(0);
        expect(new BSDay(startOfDay).minute()).toBe(0);
        expect(new BSDay(endOfDay).hour()).toBe(23);
        expect(new BSDay(endOfDay).minute()).toBe(59);
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
        expect(a.diff(b, 'year')).toBe(1);
        expect(a.diff(b, 'month', true)).toBe(12);
        expect(a.diff(b, 'year', false)).toBe(1);
    });

    it('plugin system works', () => {
        type GreetingBSDay = BSDay & { sayHello(): string };
        const testPlugin = (_option: unknown, BSDayClass: BSDayPluginHost) => {
            BSDayClass.prototype.sayHello = function () {
                return 'hello';
            };
        };

        BSDay.extend(testPlugin);
        const d = new BSDay() as GreetingBSDay;
        expect(d.sayHello()).toBe('hello');
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

    it('exposes the full dataset day record and clones array fields', () => {
        const d = new BSDay({ year: 2090, month: 12, day: 6 });
        const record = d.data();

        expect(record).toEqual({
            tithi: 'Amavasya',
            paksha: 'Krishna',
            festivals: ['Ghode Jatra'],
            events: ['International Day of Happiness'],
            isHoliday: true,
            nakshatra: 'Purva Bhadrapada',
            yoga: 'Shubha',
            karana: 'Naga',
        });
        expect(d.festivals).toEqual(['Ghode Jatra']);
        expect(d.events).toEqual(['International Day of Happiness']);
        expect(d.isHoliday).toBe(true);

        record!.festivals!.push('Mutated');
        record!.events!.push('Changed');

        expect(d.festivals).toEqual(['Ghode Jatra']);
        expect(d.events).toEqual(['International Day of Happiness']);
    });

    it('maps exact Nepal midnight instants to the first supported BS date', () => {
        const atBoundary = BSDay.fromAD(new Date('1913-04-12T18:15:00.000Z'));
        expect(atBoundary.toBS()).toEqual({ year: 1970, month: 1, day: 1 });
        expect(atBoundary.hour()).toBe(0);
        expect(atBoundary.minute()).toBe(0);
    });

    it('formats AD values in Nepal local civil time', () => {
        const d = new BSDay({ year: 2081, month: 1, day: 1 });
        expect(d.format('YYYY-MM-DD HH:mm:ss', 'ad')).toBe('2024-04-13 00:00:00');
        expect(BSDay.nowBS().split('/')).toHaveLength(3);
    });

    it('round-trips BS datetimes with time tokens', () => {
        const original = new BSDay({ year: 2081, month: 6, day: 27 }).hour(13).minute(5).second(9);
        const formatted = original.format('YYYY/MM/DD HH:mm:ss', 'bs');
        const parsed = BSDay.parse(formatted, 'YYYY/MM/DD HH:mm:ss', 'bs');

        expect(parsed.toBS()).toEqual(original.toBS());
        expect(parsed.hour()).toBe(13);
        expect(parsed.minute()).toBe(5);
        expect(parsed.second()).toBe(9);
    });

    it('parses Nepali numerals and Nepali month labels', () => {
        const nepaliFormattedBs = new BSDay({ year: 2081, month: 6, day: 27 })
            .hour(13)
            .minute(5)
            .second(9)
            .locale('ne')
            .format('YYYY MMMM DD HH:mm:ss', 'bs');
        const parsedBs = BSDay.parse(nepaliFormattedBs, 'YYYY MMMM DD HH:mm:ss', 'bs');
        const parsedAd = BSDay.parse('२०२४ अप्रिल १३ ००:००:००', 'YYYY MMMM DD HH:mm:ss', 'ad');

        expect(parsedBs.toBS()).toEqual({ year: 2081, month: 6, day: 27 });
        expect(parsedBs.hour()).toBe(13);
        expect(parsedAd.toBS()).toEqual({ year: 2081, month: 1, day: 1 });
        expect(parsedAd.hour()).toBe(0);
    });

    it('escapes bracketed string literals in format', () => {
        const d = new BSDay({ year: 2081, month: 1, day: 15 });
        expect(d.format('YYYY [Year] MM [Month]')).toBe('2081 Year 01 Month');
        expect(d.format('YYYY [साल] MMMM [महिना]')).toBe('2081 साल Baisakh महिना');
        expect(d.locale('ne').format('YYYY [साल] MMMM [महिना]')).toBe('२०८१ साल वैशाख महिना');
    });

    it('supports extended Day.js format tokens (hh, h, m, s, SSS, Q)', () => {
        const d = new BSDay({ year: 2081, month: 5, day: 10 }).hour(14).minute(7).second(5).millisecond(42);
        expect(d.format('YYYY-MM-DD hh:mm:ss:SSS A')).toBe('2081-05-10 02:07:05:042 PM');
        expect(d.format('YYYY-MM-DD h:m:s A')).toBe('2081-05-10 2:7:5 PM');
        expect(d.format('Q')).toBe('2'); // Month 5 is Q2

        const nepaliFormatted = d.locale('ne').format('YYYY/MM/DD hh:mm:ss:SSS Q A');
        expect(nepaliFormatted).toContain('०२:०७:०५:०४२');
        expect(nepaliFormatted).toContain('२');
        expect(nepaliFormatted).toContain('अपराह्न');
    });

    it('handles quarter getters, setters, arithmetic, and startOf/endOf', () => {
        const d = new BSDay({ year: 2081, month: 2, day: 10 });
        expect(d.quarter()).toBe(1);

        const q3 = d.quarter(3);
        expect(q3.quarter()).toBe(3);
        expect(q3.month()).toBe(8); // (3 - 1)*3 + 2 = 8

        const addedQ = d.add(2, 'quarter');
        expect(addedQ.quarter()).toBe(3);
        expect(addedQ.month()).toBe(8);

        const startOfQ = q3.startOf('quarter');
        expect(startOfQ.month()).toBe(7);
        expect(startOfQ.date()).toBe(1);

        const endOfQ = q3.endOf('quarter');
        expect(endOfQ.month()).toBe(9);
        expect(endOfQ.hour()).toBe(23);
        expect(endOfQ.minute()).toBe(59);
    });

    it('handles isSameOrBefore and isSameOrAfter', () => {
        const d1 = new BSDay({ year: 2081, month: 1, day: 10 });
        const d2 = new BSDay({ year: 2081, month: 1, day: 10 });
        const d3 = new BSDay({ year: 2081, month: 2, day: 1 });

        expect(d1.isSameOrBefore(d2)).toBe(true);
        expect(d1.isSameOrAfter(d2)).toBe(true);
        expect(d1.isSameOrBefore(d3)).toBe(true);
        expect(d3.isSameOrAfter(d1)).toBe(true);
        expect(d3.isSameOrBefore(d1)).toBe(false);
    });

    it('supports valueOf, unix, toISOString, and toObject', () => {
        const d = new BSDay({ year: 2081, month: 1, day: 1 }).hour(6).minute(30).second(15).millisecond(100);
        expect(typeof d.valueOf()).toBe('number');
        expect(d.valueOf()).toBe(d.toAD().getTime());
        expect(d.unix()).toBe(Math.floor(d.toAD().getTime() / 1000));
        expect(d.toISOString()).toBe(d.toAD().toISOString());

        const obj = d.toObject();
        expect(obj).toEqual({
            years: 2081,
            months: 1,
            date: 1,
            hours: 6,
            minutes: 30,
            seconds: 15,
            milliseconds: 100,
        });
    });
});

