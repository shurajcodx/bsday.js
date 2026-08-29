import {
  MONTHS_AD,
  MONTHS_AD_NE,
  MONTHS_NEPALI,
  MONTHS_NEPALI_NE,
  WEEKDAYS_AD,
  WEEKDAYS_AD_NE,
  WEEKDAYS_NEPALI,
  WEEKDAYS_NEPALI_NE,
  AM_PM_AD,
  AM_PM_NE,
} from '../utils/constants';
import { getNepalDateTimeParts, localizeNumber, pad } from '../utils/helpers';
import type { FormatTokenResolver } from '../types';

export const BASE_FORMAT_TOKENS: Record<string, FormatTokenResolver> = {
  YYYY: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(calendar === 'ad' ? adParts.year : bs.year, locale);
  },
  YY: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(pad((calendar === 'ad' ? adParts.year : bs.year) % 100), locale);
  },
  MM: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(pad(calendar === 'ad' ? adParts.month : bs.month), locale);
  },
  M: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(calendar === 'ad' ? adParts.month : bs.month, locale);
  },
  DD: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(pad(calendar === 'ad' ? adParts.day : bs.day), locale);
  },
  D: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    return localizeNumber(calendar === 'ad' ? adParts.day : bs.day, locale);
  },
  MMM: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    const monthIndex = calendar === 'ad' ? adParts.month - 1 : bs.month - 1;
    if (locale === 'ne') {
      return calendar === 'ad' ? MONTHS_AD_NE[monthIndex]! : MONTHS_NEPALI_NE[monthIndex]!;
    }
    return calendar === 'ad'
      ? MONTHS_AD[monthIndex]!.slice(0, 3)
      : MONTHS_NEPALI[monthIndex]!.slice(0, 3);
  },
  MMMM: ({ calendar, locale, ad, bs }) => {
    const adParts = getNepalDateTimeParts(ad);
    const monthIndex = calendar === 'ad' ? adParts.month - 1 : bs.month - 1;
    if (locale === 'ne') {
      return calendar === 'ad' ? MONTHS_AD_NE[monthIndex]! : MONTHS_NEPALI_NE[monthIndex]!;
    }
    return calendar === 'ad' ? MONTHS_AD[monthIndex]! : MONTHS_NEPALI[monthIndex]!;
  },
  d: ({ ad, locale }) => localizeNumber(getNepalDateTimeParts(ad).dayOfWeek, locale),
  ddd: ({ calendar, locale, ad }) => {
    const dayIndex = getNepalDateTimeParts(ad).dayOfWeek;
    if (locale === 'ne') {
      return calendar === 'ad' ? WEEKDAYS_AD_NE[dayIndex]! : WEEKDAYS_NEPALI_NE[dayIndex]!;
    }
    return calendar === 'ad'
      ? WEEKDAYS_AD[dayIndex]!.slice(0, 3)
      : WEEKDAYS_NEPALI[dayIndex]!.slice(0, 3);
  },
  dddd: ({ calendar, locale, ad }) => {
    const dayIndex = getNepalDateTimeParts(ad).dayOfWeek;
    if (locale === 'ne') {
      return calendar === 'ad' ? WEEKDAYS_AD_NE[dayIndex]! : WEEKDAYS_NEPALI_NE[dayIndex]!;
    }
    return calendar === 'ad' ? WEEKDAYS_AD[dayIndex]! : WEEKDAYS_NEPALI[dayIndex]!;
  },
  HH: ({ ad, locale }) => localizeNumber(pad(getNepalDateTimeParts(ad).hour), locale),
  hh: ({ ad, locale }) => {
    const hour = getNepalDateTimeParts(ad).hour;
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return localizeNumber(pad(h12), locale);
  },
  h: ({ ad, locale }) => {
    const hour = getNepalDateTimeParts(ad).hour;
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return localizeNumber(h12, locale);
  },
  mm: ({ ad, locale }) => localizeNumber(pad(getNepalDateTimeParts(ad).minute), locale),
  m: ({ ad, locale }) => localizeNumber(getNepalDateTimeParts(ad).minute, locale),
  ss: ({ ad, locale }) => localizeNumber(pad(getNepalDateTimeParts(ad).second), locale),
  s: ({ ad, locale }) => localizeNumber(getNepalDateTimeParts(ad).second, locale),
  SSS: ({ ad, locale }) => localizeNumber(pad(getNepalDateTimeParts(ad).millisecond, 3), locale),
  Q: ({ calendar, locale, ad, bs }) => {
    const month = calendar === 'ad' ? getNepalDateTimeParts(ad).month : bs.month;
    const quarter = Math.ceil(month / 3);
    return localizeNumber(quarter, locale);
  },
  A: ({ ad, locale }) => {
    const { hour } = getNepalDateTimeParts(ad);
    const index = hour < 12 ? 0 : 1;
    return locale === 'ne' ? AM_PM_NE[index]! : AM_PM_AD[index]!;
  },
  a: ({ ad, locale }) => {
    const { hour } = getNepalDateTimeParts(ad);
    const index = hour < 12 ? 0 : 1;
    return locale === 'ne' ? AM_PM_NE[index]! : AM_PM_AD[index]!.toLowerCase();
  },
};
