import { MONTHS_AD, MONTHS_NEPALI, WEEKDAYS_AD, WEEKDAYS_NEPALI } from '../utils/constants';
import { pad } from '../utils/helpers';
import type { FormatTokenResolver } from '../types';

export const BASE_FORMAT_TOKENS: Record<string, FormatTokenResolver> = {
  YYYY: ({ calendar, ad, bs }) => String(calendar === 'ad' ? ad.getUTCFullYear() : bs.year),
  YY: ({ calendar, ad, bs }) => pad((calendar === 'ad' ? ad.getUTCFullYear() : bs.year) % 100),
  MM: ({ calendar, ad, bs }) => pad(calendar === 'ad' ? ad.getUTCMonth() + 1 : bs.month),
  M: ({ calendar, ad, bs }) => String(calendar === 'ad' ? ad.getUTCMonth() + 1 : bs.month),
  DD: ({ calendar, ad, bs }) => pad(calendar === 'ad' ? ad.getUTCDate() : bs.day),
  D: ({ calendar, ad, bs }) => String(calendar === 'ad' ? ad.getUTCDate() : bs.day),
  MMM: ({ calendar, ad, bs }) => {
    const monthIndex = calendar === 'ad' ? ad.getUTCMonth() : bs.month - 1;
    return calendar === 'ad'
      ? MONTHS_AD[monthIndex]!.slice(0, 3)
      : MONTHS_NEPALI[monthIndex]!.slice(0, 3);
  },
  MMMM: ({ calendar, ad, bs }) => {
    const monthIndex = calendar === 'ad' ? ad.getUTCMonth() : bs.month - 1;
    return calendar === 'ad' ? MONTHS_AD[monthIndex]! : MONTHS_NEPALI[monthIndex]!;
  },
  d: ({ ad }) => String(ad.getUTCDay()),
  ddd: ({ calendar, ad }) => {
    const dayIndex = ad.getUTCDay();
    return calendar === 'ad'
      ? WEEKDAYS_AD[dayIndex]!.slice(0, 3)
      : WEEKDAYS_NEPALI[dayIndex]!.slice(0, 3);
  },
  dddd: ({ calendar, ad }) => {
    const dayIndex = ad.getUTCDay();
    return calendar === 'ad' ? WEEKDAYS_AD[dayIndex]! : WEEKDAYS_NEPALI[dayIndex]!;
  },
};
