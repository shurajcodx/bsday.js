import { describe, expect, it } from 'vitest';
import { dataset, metadata } from '../src';

describe('@bsday/dataset', () => {
  it('exports dataset keyed by BS date', () => {
    const keys = Object.keys(dataset);
    expect(keys.length).toBeGreaterThan(1000);
    expect(keys[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('contains normalized fields for known date', () => {
    expect(dataset['2082-11-24']).toEqual({
      tithi: 'Panchami',
      festivals: ['नारी दिवस'],
      nakshatra: 'Swati',
      yoga: 'Dhruva',
      karana: 'Kaulava',
    });
  });

  it('exposes generation metadata', () => {
    expect(typeof metadata.source).toBe('string');
    expect(metadata.coverage.startYear).toBeGreaterThan(0);
    expect(metadata.coverage.endYear).toBeGreaterThanOrEqual(metadata.coverage.startYear);
    expect(metadata.coverage.keys).toBe(Object.keys(dataset).length);
  });
});
