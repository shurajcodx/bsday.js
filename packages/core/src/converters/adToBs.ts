import type { BSDate } from '../types';
import { MAX_YEAR, MIN_YEAR } from '../utils/constants';
import { diffInCalendarDays } from '../utils/helpers';
import { getBsMonthDays, getBsYearDays } from './monthData';
import { AD_EPOCH_UTC, BS_EPOCH } from './bsToAd';

const AD_EPOCH = new Date(AD_EPOCH_UTC);

export function adToBs(ad: Date): BSDate {
  let remaining = diffInCalendarDays(ad, AD_EPOCH);
  if (remaining < 0) {
    throw new RangeError(
      `AD date ${ad.toISOString()} is before supported BS range (${MIN_YEAR}-${MAX_YEAR}).`,
    );
  }

  let year = BS_EPOCH.year;
  while (year <= MAX_YEAR) {
    const yearDays = getBsYearDays(year);
    if (remaining < yearDays) {
      break;
    }

    remaining -= yearDays;
    year += 1;
  }

  if (year > MAX_YEAR) {
    throw new RangeError(
      `AD date ${ad.toISOString()} is beyond supported BS range (${MIN_YEAR}-${MAX_YEAR}).`,
    );
  }

  let month = 1;
  while (month <= 12) {
    const monthDays = getBsMonthDays(year, month);
    if (remaining < monthDays) {
      break;
    }

    remaining -= monthDays;
    month += 1;
  }

  return {
    year,
    month,
    day: remaining + 1,
  };
}
