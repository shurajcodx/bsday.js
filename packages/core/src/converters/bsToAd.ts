import type { BSDate } from '../types';
import { MIN_YEAR } from '../utils/constants';
import { assertBsYearRange } from '../utils/helpers';
import { getBsMonthDays, getBsYearDays } from './monthData';
import { isValidBSDate } from '../utils/validation';

const BS_EPOCH: BSDate = { year: 1970, month: 1, day: 1 };
// Anchor mapping:
// 1970-01-01 BS == 1913-04-14 AD (UTC date boundary).
const AD_EPOCH_UTC = Date.UTC(1913, 3, 14);

function daysSinceBsEpoch(date: BSDate): number {
  let days = 0;

  for (let y = BS_EPOCH.year; y < date.year; y += 1) {
    days += getBsYearDays(y);
  }

  for (let m = 1; m < date.month; m += 1) {
    days += getBsMonthDays(date.year, m);
  }

  days += date.day - 1;
  return days;
}

export function bsToAd(date: BSDate): Date {
  assertBsYearRange(date.year);

  if (!isValidBSDate(date.year, date.month, date.day)) {
    throw new RangeError(`Invalid BS date ${date.year}-${date.month}-${date.day}.`);
  }

  const offsetDays = daysSinceBsEpoch(date);
  return new Date(AD_EPOCH_UTC + offsetDays * 24 * 60 * 60 * 1000);
}

export { AD_EPOCH_UTC, BS_EPOCH, MIN_YEAR };
