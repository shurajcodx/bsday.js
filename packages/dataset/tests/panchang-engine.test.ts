import { describe, expect, it } from 'vitest';
import {
  computePanchang,
  findTithiTransition,
  sunriseJD,
  TITHIS,
  NAKSHATRAS,
  YOGAS,
  KARANAS,
} from '../src/panchang-engine';
import { FestivalEngine } from '../src/festival-engine';
import type { DayPanchang, FestivalRule } from '../src/types/festival';

describe('Panchang Engine & Astronomical Utilities', () => {
  it('computes panchang correctly for a standard Julian Date', () => {
    // 2024-04-13 00:00 UTC (Baisakh 1, 2081 BS)
    // JD ~ 2460413.5
    const panchang = computePanchang(2460413.5);
    expect(panchang).toBeDefined();
    expect(TITHIS).toContain(panchang.tithi);
    expect(['Shukla', 'Krishna']).toContain(panchang.paksha);
    expect(NAKSHATRAS).toContain(panchang.nakshatra);
    expect(YOGAS).toContain(panchang.yoga);
    expect(typeof panchang.karana).toBe('string');
    expect(KARANAS).toContain(panchang.karana);
  });

  it('calculates sunrise JD and handles transitions', () => {
    const jdRise = sunriseJD(2024, 4, 13, 27.7172, 85.324, 1400);
    expect(jdRise).toBeGreaterThan(2460000);

    const transition = findTithiTransition(jdRise);
    if (transition) {
      expect(typeof transition.nextTithi).toBe('string');
      expect(transition.transitionJD).toBeGreaterThan(jdRise);
    }
  });

  it('computes festivals using FestivalEngine rules and overrides', () => {
    const engine = new FestivalEngine();

    const sampleDays: DayPanchang[] = [
      {
        jd: 2460413.5,
        dateAD: '2024-04-13',
        dateBS: '2081-01-01',
        sunriseJD: 2460413.7,
        month: 1,
        tithi: 'Panchami',
        paksha: 'Shukla',
        nakshatra: 'Mrigashirsha',
        yoga: 'Shobhana',
        karana: 'Bava',
      },
      {
        jd: 2460414.5,
        dateAD: '2024-04-14',
        dateBS: '2081-01-02',
        sunriseJD: 2460414.7,
        month: 1,
        tithi: 'Shashthi',
        paksha: 'Shukla',
        nakshatra: 'Ardra',
        yoga: 'Atiganda',
        karana: 'Balava',
      },
    ];

    const rules: FestivalRule[] = [
      {
        name: 'Sample New Year Festival',
        type: 'sunrise',
        month: 1,
        tithi: 'Panchami',
        paksha: 'Shukla',
      },
      {
        name: 'Sample Relative Festival',
        type: 'relative',
        base: 'Sample New Year Festival',
        offsetDays: 1,
      },
    ];

    const result = engine.computeFestivals(sampleDays, rules, {
      '2081-01-01': { addFestivals: ['Custom Overridden Festival'] },
    });

    expect(result['2081-01-01']).toContain('Sample New Year Festival');
    expect(result['2081-01-01']).toContain('Custom Overridden Festival');
    expect(result['2081-01-02']).toContain('Sample Relative Festival');
  });
});
