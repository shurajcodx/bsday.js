import type { BSDate } from '../types';
import { MIN_YEAR } from '../utils/constants';
import { assertBsYearRange, createNepalDate, DAY_MS } from '../utils/helpers';
import { getBsMonthDays, getBsYearDays } from './monthData';
import { isValidBSDate } from '../utils/validation';

const BS_EPOCH: BSDate = { year: 1970, month: 1, day: 1 };
// Anchor mapping:
// 1970-01-01 BS == 1913-04-13 00:00 in Nepal time.
const AD_EPOCH_UTC = createNepalDate(1913, 4, 13).getTime();

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
  return new Date(AD_EPOCH_UTC + offsetDays * DAY_MS);
}

export { AD_EPOCH_UTC, BS_EPOCH, MIN_YEAR };
