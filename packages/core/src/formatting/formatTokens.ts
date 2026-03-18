import {
  MONTHS_AD,
  MONTHS_AD_NE,
  MONTHS_NEPALI,
  MONTHS_NEPALI_NE,
  WEEKDAYS_AD,
  WEEKDAYS_AD_NE,
  WEEKDAYS_NEPALI,
  WEEKDAYS_NEPALI_NE,
} from '../utils/constants';
import { localizeNumber, pad } from '../utils/helpers';
import type { FormatTokenResolver } from '../types';

export const BASE_FORMAT_TOKENS: Record<string, FormatTokenResolver> = {
  YYYY: ({ calendar, locale, ad, bs }) =>
    localizeNumber(calendar === 'ad' ? ad.getUTCFullYear() : bs.year, locale),
  YY: ({ calendar, locale, ad, bs }) =>
    localizeNumber(pad((calendar === 'ad' ? ad.getUTCFullYear() : bs.year) % 100), locale),
  MM: ({ calendar, locale, ad, bs }) =>
    localizeNumber(pad(calendar === 'ad' ? ad.getUTCMonth() + 1 : bs.month), locale),
  M: ({ calendar, locale, ad, bs }) =>
    localizeNumber(calendar === 'ad' ? ad.getUTCMonth() + 1 : bs.month, locale),
  DD: ({ calendar, locale, ad, bs }) =>
    localizeNumber(pad(calendar === 'ad' ? ad.getUTCDate() : bs.day), locale),
  D: ({ calendar, locale, ad, bs }) =>
    localizeNumber(calendar === 'ad' ? ad.getUTCDate() : bs.day, locale),
  MMM: ({ calendar, locale, ad, bs }) => {
    const monthIndex = calendar === 'ad' ? ad.getUTCMonth() : bs.month - 1;
    if (locale === 'ne') {
      return calendar === 'ad'
        ? MONTHS_AD_NE[monthIndex]!.slice(0, 3)
        : MONTHS_NEPALI_NE[monthIndex]!.slice(0, 3);
    }
    return calendar === 'ad'
      ? MONTHS_AD[monthIndex]!.slice(0, 3)
      : MONTHS_NEPALI[monthIndex]!.slice(0, 3);
  },
  MMMM: ({ calendar, locale, ad, bs }) => {
    const monthIndex = calendar === 'ad' ? ad.getUTCMonth() : bs.month - 1;
    if (locale === 'ne') {
      return calendar === 'ad' ? MONTHS_AD_NE[monthIndex]! : MONTHS_NEPALI_NE[monthIndex]!;
    }
    return calendar === 'ad' ? MONTHS_AD[monthIndex]! : MONTHS_NEPALI[monthIndex]!;
  },
  d: ({ ad, locale }) => localizeNumber(ad.getUTCDay(), locale),
  ddd: ({ calendar, locale, ad }) => {
    const dayIndex = ad.getUTCDay();
    if (locale === 'ne') {
      return calendar === 'ad'
        ? WEEKDAYS_AD_NE[dayIndex]!.slice(0, 3)
        : WEEKDAYS_NEPALI_NE[dayIndex]!.slice(0, 3);
    }
    return calendar === 'ad'
      ? WEEKDAYS_AD[dayIndex]!.slice(0, 3)
      : WEEKDAYS_NEPALI[dayIndex]!.slice(0, 3);
  },
  dddd: ({ calendar, locale, ad }) => {
    const dayIndex = ad.getUTCDay();
    if (locale === 'ne') {
      return calendar === 'ad' ? WEEKDAYS_AD_NE[dayIndex]! : WEEKDAYS_NEPALI_NE[dayIndex]!;
    }
    return calendar === 'ad' ? WEEKDAYS_AD[dayIndex]! : WEEKDAYS_NEPALI[dayIndex]!;
  },
  HH: ({ ad, locale }) => localizeNumber(pad(ad.getHours()), locale),
  mm: ({ ad, locale }) => localizeNumber(pad(ad.getMinutes()), locale),
  ss: ({ ad, locale }) => localizeNumber(pad(ad.getSeconds()), locale),
};
