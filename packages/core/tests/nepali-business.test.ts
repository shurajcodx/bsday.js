import { describe, it, expect, beforeAll } from 'vitest';
import bundledDataset from '../../dataset/src/data/dataset.json';
import {
  bsday,
  BSDay,
  validateBSDateString,
  isValidBSDate,
  isValidADDate,
  isLeapYear,
  normalizeNepaliDigits,
  toDevanagariDigits,
} from '../src';
import type { BSDayData } from '../src';

beforeAll(() => {
  BSDay.setDataset(bundledDataset as unknown as Record<string, BSDayData>);
});

describe('Nepali Business, Financial & Localization Engine', () => {
  describe('Nepali Fiscal Year (आर्थिक वर्ष)', () => {
    it('correctly identifies fiscal year across Shrawan (Month 4) boundary', () => {
      // 2081 Shrawan 1 ➔ FY 2081/82
      const shrawan = bsday.bs(2081, 4, 1);
      expect(shrawan.fiscalYearNumber()).toBe(2081);
      expect(shrawan.fiscalYear('short')).toBe('2081/82');
      expect(shrawan.fiscalYear('full')).toBe('2081/2082');
      expect(shrawan.fiscalYear('extended')).toBe('FY 2081/82');

      // 2081 Ashadh 31 ➔ FY 2080/81
      const ashadh = bsday.bs(2081, 3, 31);
      expect(ashadh.fiscalYearNumber()).toBe(2080);
      expect(ashadh.fiscalYear('short')).toBe('2080/81');
      expect(ashadh.fiscalYear('full')).toBe('2080/2081');
      expect(ashadh.fiscalYear('extended')).toBe('FY 2080/81');
    });

    it('formats fiscal year in Nepali locale', () => {
      const d = bsday.bs(2081, 5, 10).locale('ne');
      expect(d.fiscalYear('short')).toBe('२०८१/८२');
      expect(d.fiscalYear('full')).toBe('२०८१/२०८२');
      expect(d.fiscalYear('extended')).toBe('आ.व. २०८१/८२');
    });

    it('correctly calculates fiscal quarters (Q1-Q4)', () => {
      // Q1: Shrawan (4), Bhadra (5), Ashwin (6)
      expect(bsday.bs(2081, 4, 15).fiscalQuarter()).toBe(1);
      expect(bsday.bs(2081, 6, 30).fiscalQuarter()).toBe(1);

      // Q2: Kartik (7), Mangsir (8), Poush (9)
      expect(bsday.bs(2081, 7, 1).fiscalQuarter()).toBe(2);
      expect(bsday.bs(2081, 9, 29).fiscalQuarter()).toBe(2);

      // Q3: Magh (10), Falgun (11), Chaitra (12)
      expect(bsday.bs(2081, 10, 1).fiscalQuarter()).toBe(3);
      expect(bsday.bs(2081, 12, 30).fiscalQuarter()).toBe(3);

      // Q4: Baisakh (1), Jestha (2), Ashadh (3)
      expect(bsday.bs(2081, 1, 1).fiscalQuarter()).toBe(4);
      expect(bsday.bs(2081, 3, 31).fiscalQuarter()).toBe(4);
    });

    it('calculates startOf and endOf fiscalYear', () => {
      const d = bsday.bs(2081, 8, 15);
      const startFY = d.startOf('fiscalYear');
      expect(startFY.format('YYYY/MM/DD HH:mm:ss.SSS')).toBe('2081/04/01 00:00:00.000');

      const endFY = d.endOf('fiscalYear');
      expect(endFY.format('YYYY/MM/DD HH:mm:ss.SSS')).toBe('2082/03/32 23:59:59.999');

      // Static helpers
      const staticStart = BSDay.startOfFiscalYear(2081);
      expect(staticStart.format('YYYY/MM/DD')).toBe('2081/04/01');
      const staticEnd = BSDay.endOfFiscalYear(2081);
      expect(staticEnd.format('YYYY/MM/DD')).toBe('2082/03/32');
    });
  });

  describe('KYC Chronological Age Engine', () => {
    it('calculates exact BS age between two dates', () => {
      const dob = bsday.bs(2055, 6, 12);
      const ref = bsday.bs(2081, 5, 15);

      const ageObj = dob.age(ref);
      expect(ageObj.years).toBe(25);
      expect(ageObj.months).toBe(11);
      expect(ageObj.days).toBe(3);

      expect(dob.formatAge('en', ref)).toBe('25 years, 11 months, 3 days');
      expect(dob.formatAge('ne', ref)).toBe('२५ वर्ष, ११ महिना, ३ दिन');
    });

    it('handles adult threshold verification with isAdult()', () => {
      const adult = bsday.bs(2060, 1, 1);
      const minor = bsday.bs(2070, 1, 1);
      const ref = bsday.bs(2081, 5, 15);

      expect(adult.isAdult(18, ref)).toBe(true);
      expect(minor.isAdult(18, ref)).toBe(false);
    });
  });

  describe('Business Days & Workdays Engine', () => {
    const friday = bsday.bs(2081, 5, 14);
    const saturday = bsday.bs(2081, 5, 15);
    const sunday = bsday.bs(2081, 5, 16);

    it('identifies Saturdays, Sundays, and weekends correctly', () => {
      expect(friday.isSaturday).toBe(false);
      expect(saturday.isSaturday).toBe(true);
      expect(sunday.isSunday).toBe(true);
      expect(saturday.isWeekend()).toBe(true);
      expect(sunday.isWeekend()).toBe(false); // Default Nepal weekend is only Saturday
    });

    it('evaluates isBusinessDay() taking into account workweek configs', () => {
      expect(friday.isBusinessDay()).toBe(true);
      expect(saturday.isBusinessDay()).toBe(false);
      expect(sunday.isBusinessDay()).toBe(true);
      expect(sunday.isBusinessDay({ includeSundays: false })).toBe(false);
    });

    it('adds and subtracts business days skipping non-working days', () => {
      const nextWorkday = friday.addBusinessDays(1);
      expect(nextWorkday.format('YYYY/MM/DD')).toBe('2081/05/16');

      const prevWorkday = sunday.subtractBusinessDays(1);
      expect(prevWorkday.format('YYYY/MM/DD')).toBe('2081/05/14');
    });

    it('calculates businessDaysBetween()', () => {
      const days = friday.businessDaysBetween('2081/05/17');
      expect(days).toBe(2);
      expect(BSDay.isBusinessDay('2081/05/14')).toBe(true);
      expect(BSDay.isBusinessDay('2081/05/15')).toBe(false);
    });
  });

  describe('Devanagari Numeral String Parsing & Utilities', () => {
    it('normalizes Nepali numerals to ASCII and converts to Devanagari', () => {
      expect(normalizeNepaliDigits('२०८१/०५/१५')).toBe('2081/05/15');
      expect(toDevanagariDigits('2081/05/15')).toBe('२०८१/०५/१५');
    });

    it('creates BSDay instances directly from Devanagari strings', () => {
      const d1 = bsday.bs('२०८१/०५/१५');
      const d2 = BSDay.bs('२०८१-०५-१५');
      expect(d1.isValid()).toBe(true);
      expect(d1.year()).toBe(2081);
      expect(d1.month()).toBe(5);
      expect(d1.date()).toBe(15);
      expect(d2.isValid()).toBe(true);
    });

    it('parses Devanagari formatted strings with BSDay.parse()', () => {
      const parsed = BSDay.parse('२०८१/०५/१५', 'YYYY/MM/DD', 'bs');
      expect(parsed.isValid()).toBe(true);
      expect(parsed.year()).toBe(2081);
      expect(parsed.month()).toBe(5);
      expect(parsed.date()).toBe(15);
    });
  });

  describe('Validation Utilities', () => {
    it('validates BS date strings with validateBSDateString()', () => {
      const valid = validateBSDateString('2081/05/15');
      expect(valid.isValid).toBe(true);
      expect(valid.bs).toEqual({ year: 2081, month: 5, day: 15 });

      const devanagari = validateBSDateString('२०८१/०५/१५');
      expect(devanagari.isValid).toBe(true);
      expect(devanagari.bs).toEqual({ year: 2081, month: 5, day: 15 });

      const invalid = validateBSDateString('2081/05/35');
      expect(invalid.isValid).toBe(false);
    });

    it('validates BS and AD date units', () => {
      expect(isValidBSDate(2081, 5, 31)).toBe(true);
      expect(isValidBSDate(2081, 5, 32)).toBe(false);
      expect(isValidADDate(2024, 2, 29)).toBe(true);
      expect(isValidADDate(2023, 2, 29)).toBe(false);
      expect(isLeapYear(2024, 'ad')).toBe(true);
    });
  });
});
