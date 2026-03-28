import { describe, expect, it } from 'vitest';
import { dataset, datasetNepali } from '../src';

describe('@bsday.js/dataset', () => {
  it('exports dataset keyed by BS date', () => {
    const keys = Object.keys(dataset);
    expect(keys.length).toBeGreaterThan(1000);
    expect(keys[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('contains normalized fields for a known date (English)', () => {
    const day = dataset['2082-11-24'];
    expect(day.tithi).toBe('Panchami');
    expect(day.paksha).toBe('Krishna');
    expect(day.events).toContain('International Women\'s Day');
    expect(day.isHoliday).toBe(false);
  });

  it('correctly identifies Dashain across different years', () => {
    // 2081
    expect(dataset['2081-06-26'].festivals).toContain('Vijaya Dashami');
    expect(dataset['2081-06-26'].isHoliday).toBe(true);

    // 2082
    expect(dataset['2082-06-15'].festivals).toContain('Vijaya Dashami');
    expect(dataset['2082-06-15'].isHoliday).toBe(true);
  });

  it('correctly identifies Tihar festivals', () => {
    // Laxmi Puja and Kukur Tihar overlap in 2082-07-03
    expect(dataset['2082-07-03'].festivals).toContain('Laxmi Puja');
    expect(dataset['2082-07-03'].festivals).toContain('Kukur Tihar');
  });

  it('handles future year generation correctly (2090 BS)', () => {
    const nny2090 = dataset['2090-01-01'];
    expect(nny2090.events).toContain('Nepali New Year');
    expect(nny2090.festivals).toContain('Buddha Jayanti');
    expect(nny2090.tithi).toBe('Purnima');
    expect(nny2090.paksha).toBe('Shukla');
  });

  it('verifies international events mapping', () => {
    // Dec 25, 2024 maps to 2081-09-10 BS
    expect(dataset['2081-09-10'].events).toContain('Christmas Day');
  });

  it('contains normalized fields for a known date (Nepali)', () => {
    if (!datasetNepali) return; // skip if not exported

    const dayNe = datasetNepali['2082-11-24'];
    expect(dayNe.tithi).toBe('पञ्चमी');
    expect(dayNe.nakshatra).toBe('स्वाति');
    expect(dayNe.yoga).toBe('ध्रुव');
    expect(dayNe.karana).toBe('कौलव');
    expect(dayNe.events).toContain('नारी दिवस');
  });

  it('ensures all dataset entries have correct structure', () => {
    for (const date in dataset) {
      const day = dataset[date];
      expect(typeof day.tithi).toBe('string');
      expect(['Shukla', 'Krishna']).toContain(day.paksha);
      expect(Array.isArray(day.festivals)).toBe(true);
      expect(Array.isArray(day.events)).toBe(true);
      expect(typeof day.isHoliday).toBe('boolean');
    }
  });
});
