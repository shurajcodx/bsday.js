import {
  DayPanchang,
  FestivalRule,
  FestivalResult,
  SunriseRule,
  SunsetRule,
  NightRule,
  RelativeRule,
} from './types/festival.js';

export class FestivalEngine {
  /**
   * Computes festivals for a list of days based on rules and overrides.
   */
  public computeFestivals(
    days: DayPanchang[],
    rules: FestivalRule[],
    overrides: Record<string, { addFestivals?: string[]; removeFestivals?: string[] }> = {},
  ): FestivalResult {
    const results: FestivalResult = {};

    // 1. Process standard rules (Sunrise, Sunset, Night)
    for (const day of days) {
      const dateStr = day.dateBS;
      results[dateStr] = results[dateStr] || [];

      for (const rule of rules) {
        if (rule.type === 'sunrise') {
          if (this.matchesSunriseRule(day, rule)) {
            this.addFestival(results, dateStr, rule.name);
          }
        } else if (rule.type === 'sunset') {
          if (this.matchesSunsetRule(day, rule)) {
            this.addFestival(results, dateStr, rule.name);
          }
        } else if (rule.type === 'night') {
          if (this.matchesNightRule(day, rule)) {
            this.addFestival(results, dateStr, rule.name);
          }
        }
      }
    }

    // 2. Apply Relative Rules
    this.applyRelativeRules(results, rules, days);

    // 3. Apply Overrides
    for (const [date, override] of Object.entries(overrides)) {
      if (!results[date]) results[date] = [];

      if (override.removeFestivals) {
        results[date] = results[date].filter((f) => !override.removeFestivals!.includes(f));
      }
      if (override.addFestivals) {
        for (const f of override.addFestivals) {
          this.addFestival(results, date, f);
        }
      }

      // Clean up if empty
      if (results[date].length === 0) {
        delete results[date];
      }
    }

    return results;
  }

  private matchesSunriseRule(day: DayPanchang, rule: SunriseRule): boolean {
    return (
      day.month === rule.month &&
      day.tithi === rule.tithi &&
      (!rule.paksha || day.paksha === rule.paksha)
    );
  }

  /**
   * Sunset window: 16:00 - 20:00
   * We simplify by checking if the tithi exists at 18:00 (Sunset approx)
   * or if a transition into it happens during this day and stays until sunset.
   */
  private matchesSunsetRule(day: DayPanchang, rule: SunsetRule): boolean {
    // For now, let's keep it simple: if the month matches and tithi is present
    // at sunrise OR it starts after sunrise but before sunset.
    // A more advanced engine would need to compute Panchang at sunset.
    // Given recompute-all-dataset logic:
    // const panchangSunset = computePanchang(jdSunrise + 0.4);
    // 0.4 is approx 10 hours after sunrise (approx sunset)

    // This logic is better handled by whoever calls the engine if they provide DayPanchang
    // which already has sunset tithi, OR the engine itself re-computes.
    // To keep it self-contained with the provided DayPanchang structure:
    const monthMatch = day.month === rule.month;
    if (!monthMatch) return false;

    if (day.tithi === rule.tithi && (!rule.paksha || day.paksha === rule.paksha)) {
      return true;
    }

    if (day.nextTithi === rule.tithi) {
      // Check if next tithi starts before sunset
      // Approx sunset: sunriseJD + 0.4
      if (day.nextTithiStart && day.nextTithiStart < day.sunriseJD + 0.4) {
        return true;
      }
    }

    return false;
  }

  /**
   * Night window: 23:00 - 02:00
   */
  private matchesNightRule(day: DayPanchang, rule: NightRule): boolean {
    const monthMatch = day.month === rule.month;
    if (!monthMatch) return false;

    if (day.tithi === rule.tithi && (!rule.paksha || day.paksha === rule.paksha)) {
      // If it's already the tithi at sunrise, it likely persists through the night
      // (Tithis are ~24h)
      return true;
    }

    if (day.nextTithi === rule.tithi) {
      // Check if next tithi starts before midnight (approx sunriseJD + 0.75)
      if (day.nextTithiStart && day.nextTithiStart < day.sunriseJD + 0.75) {
        return true;
      }
    }

    return false;
  }

  private applyRelativeRules(
    results: FestivalResult,
    rules: FestivalRule[],
    days: DayPanchang[],
  ): void {
    const relativeRules = rules.filter((r) => r.type === 'relative') as RelativeRule[];

    // We might need to iterate multiple times if there are nested relatives,
    // but usually they depend on base festivals found via sunrise/sunset/night.

    for (const rule of relativeRules) {
      // Find the base festival date
      for (const [date, festivals] of Object.entries(results)) {
        if (festivals.includes(rule.base)) {
          // Calculate target date
          const targetDateStr = this.addDaysToBSDate(date, rule.offsetDays, days);
          if (targetDateStr) {
            this.addFestival(results, targetDateStr, rule.name);
          }
        }
      }
    }
  }

  private addFestival(results: FestivalResult, date: string, name: string): void {
    if (!results[date]) results[date] = [];
    if (!results[date].includes(name)) {
      results[date].push(name);
    }
  }

  /**
   * Helper to add days to a BS date string (YYYY-MM-DD).
   * This requires a lookup in the days array to find the sequence.
   */
  private addDaysToBSDate(dateStr: string, offset: number, days: DayPanchang[]): string | null {
    const index = days.findIndex((d) => d.dateBS === dateStr);
    if (index === -1) return null;

    const targetIndex = index + offset;
    if (targetIndex >= 0 && targetIndex < days.length) {
      return days[targetIndex].dateBS;
    }
    return null;
  }
}
