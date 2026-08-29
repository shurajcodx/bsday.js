import { describe, expect, it } from 'vitest';
import { bsday, BSDay, validateBSDateString } from '../src';

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
    expect(endFY.format('YYYY/MM/DD HH:mm:ss.SSS')).toBe('2082/03/31 23:59:59.999');

    // Static helpers
    const staticStart = BSDay.startOfFiscalYear(2081);
    expect(staticStart.format('YYYY/MM/DD')).toBe('2081/04/01');
    const staticEnd = BSDay.endOfFiscalYear(2081);
    expect(staticEnd.format('YYYY/MM/DD')).toBe('2082/03/31');
  });

  it('calculates startOf and endOf fiscalQuarter', () => {
    const q1Date = bsday.bs(2081, 5, 10);
    expect(q1Date.startOf('fiscalQuarter').format('YYYY/MM/DD')).toBe('2081/04/01');
    expect(q1Date.endOf('fiscalQuarter').format('YYYY/MM/DD')).toBe('2081/06/31');

    const q4Date = bsday.bs(2082, 2, 10);
    expect(q4Date.startOf('fiscalQuarter').format('YYYY/MM/DD')).toBe('2082/01/01');
    expect(q4Date.endOf('fiscalQuarter').format('YYYY/MM/DD')).toBe('2082/03/31');
  });
});

describe('KYC & Age Calculation Helpers', () => {
  it('calculates exact chronological age in BS calendar', () => {
    const birth = bsday.bs(2057, 5, 15);
    const current = bsday.bs(2081, 8, 20);

    const age = birth.age(current);
    expect(age).toEqual({
      years: 24,
      months: 3,
      days: 5,
    });
  });

  it('handles month borrow correctly when current day is smaller than birth day', () => {
    // Birth on 2057-05-20, Current on 2081-06-05
    // In BS, Bhadra (Month 5) 2081 has 31 days
    const birth = bsday.bs(2057, 5, 20);
    const current = bsday.bs(2081, 6, 5);

    const age = birth.age(current);
    expect(age.years).toBe(24);
    expect(age.months).toBe(0);
    expect(age.days).toBe(16); // (31 - 20) + 5 = 16
  });

  it('formats age in English and Nepali', () => {
    const birth = bsday.bs(2057, 5, 15);
    const current = bsday.bs(2081, 8, 20);

    expect(birth.formatAge('en', current)).toBe('24 years, 3 months, 5 days');
    expect(birth.formatAge('ne', current)).toBe('२४ वर्ष, ३ महिना, ५ दिन');
  });

  it('validates adult age with isAdult', () => {
    const birth = bsday.bs(2060, 1, 1);
    const current = bsday.bs(2081, 1, 1);

    expect(birth.isAdult(18, current)).toBe(true);
    expect(birth.isAdult(25, current)).toBe(false);

    const minor = bsday.bs(2070, 1, 1);
    expect(minor.isAdult(18, current)).toBe(false);
  });
});

describe('Nepali Relative Time Plugin', () => {
  it('uses "भर्खरै" for recent differences in Nepali locale', () => {
    bsday.extend(bsday.relativeTimePlugin);
    const d1 = bsday();
    const d2 = d1.subtract(5, 'second');

    expect(d2.locale('ne').fromNow()).toBe('भर्खरै');
  });
});

describe('Form & Schema BS Date Validation', () => {
  it('validates correct BS date strings', () => {
    const res = validateBSDateString('2081/05/10');
    expect(res.isValid).toBe(true);
    expect(res.bs).toEqual({ year: 2081, month: 5, day: 10 });

    const resDash = validateBSDateString('2081-05-10');
    expect(resDash.isValid).toBe(true);
  });

  it('rejects invalid format and impossible BS dates', () => {
    expect(validateBSDateString('invalid').isValid).toBe(false);
    expect(validateBSDateString('2081/13/01').isValid).toBe(false);
    expect(validateBSDateString('2081/02/33').isValid).toBe(false);
  });

  it('enforces minDate and maxDate limits', () => {
    const minRes = validateBSDateString('2081/05/10', { minDate: '2081/05/15' });
    expect(minRes.isValid).toBe(false);
    expect(minRes.error).toContain('on or after');

    const maxRes = validateBSDateString('2081/06/10', { maxDate: '2081/05/30' });
    expect(maxRes.isValid).toBe(false);
    expect(maxRes.error).toContain('on or before');
  });
});
