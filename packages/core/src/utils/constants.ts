import type { CalendarType } from '../types';

export const MIN_YEAR = 1970;
export const MAX_YEAR = 2100;

export const MONTHS_NEPALI = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
] as const;

export const WEEKDAYS_NEPALI = [
  'Aaitabar',
  'Sombar',
  'Mangalbar',
  'Budhabar',
  'Bihibar',
  'Shukrabar',
  'Shanibar',
] as const;

export const MONTHS_AD = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const WEEKDAYS_AD = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DEFAULT_CALENDAR: CalendarType = 'bs';
