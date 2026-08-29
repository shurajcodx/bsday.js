import { BSDay } from '../core/BSDay';
import type { BSDayInput, LocaleType } from '../types';

export const MONTH_NAMES = {
  en: {
    long: [
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
    ],
    short: ['Bai', 'Jes', 'Ash', 'Shr', 'Bha', 'Ashw', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'],
  },
  ne: {
    long: [
      'वैशाख',
      'जेठ',
      'असार',
      'श्रावण',
      'भाद्र',
      'असोज',
      'कार्तिक',
      'मंसिर',
      'पौष',
      'माघ',
      'फाल्गुन',
      'चैत',
    ],
    short: ['वै', 'जे', 'अ', 'श्रा', 'भा', 'असो', 'का', 'मं', 'पौ', 'मा', 'फा', 'चै'],
  },
} as const;

export const WEEKDAY_NAMES = {
  en: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    min: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  ne: {
    long: ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'],
    short: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'],
    min: ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'],
  },
} as const;

export function getMonthNames(
  locale: LocaleType = 'en',
  format: 'long' | 'short' = 'long',
): string[] {
  const loc = MONTH_NAMES[locale] ?? MONTH_NAMES.en;
  return [...loc[format]];
}

export function getWeekdayNames(
  locale: LocaleType = 'en',
  format: 'long' | 'short' | 'min' = 'short',
  startOfWeek: 0 | 1 | 'sun' | 'mon' = 0,
): string[] {
  const loc = WEEKDAY_NAMES[locale] ?? WEEKDAY_NAMES.en;
  const list = [...loc[format]];
  const start = startOfWeek === 1 || startOfWeek === 'mon' ? 1 : 0;
  if (start === 1) {
    const sun = list.shift()!;
    list.push(sun);
  }
  return list;
}

export interface DateDisabledOptions {
  minDate?: BSDayInput;
  maxDate?: BSDayInput;
  disabledDates?: BSDayInput[];
  disabledDaysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
  disableHolidays?: boolean;
}

export function toBSDayHelper(input: BSDayInput): BSDay {
  if (input instanceof BSDay) {
    return input;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (match) {
      const year = Number(match[1]);
      if (year >= 1970 && year <= 2100) {
        return BSDay.bs(year, Number(match[2]), Number(match[3]));
      }
    }
  }
  if (input && typeof input === 'object' && 'year' in input && 'month' in input && 'day' in input) {
    const bsObj = input as { year: number; month: number; day: number };
    return BSDay.bs(bsObj.year, bsObj.month, bsObj.day);
  }
  return new BSDay(input);
}

export function isDateInRange(
  dateInput: BSDayInput,
  startInput: BSDayInput,
  endInput: BSDayInput,
  inclusivity: '()' | '[]' | '[)' | '(]' = '[]',
): boolean {
  const target = toBSDayHelper(dateInput);
  const start = toBSDayHelper(startInput);
  const end = toBSDayHelper(endInput);

  if (!target.isValid() || !start.isValid() || !end.isValid()) {
    return false;
  }

  const t = target.valueOf();
  const s = start.valueOf();
  const e = end.valueOf();

  const isAfterStart = inclusivity[0] === '[' ? t >= s : t > s;
  const isBeforeEnd = inclusivity[1] === ']' ? t <= e : t < e;

  return isAfterStart && isBeforeEnd;
}

export function isDateDisabled(dateInput: BSDayInput, options: DateDisabledOptions = {}): boolean {
  const d = toBSDayHelper(dateInput);
  if (!d.isValid()) return true;

  if (options.minDate) {
    const min = toBSDayHelper(options.minDate);
    if (min.isValid() && d.isBefore(min, 'date')) {
      return true;
    }
  }

  if (options.maxDate) {
    const max = toBSDayHelper(options.maxDate);
    if (max.isValid() && d.isAfter(max, 'date')) {
      return true;
    }
  }

  if (options.disabledDaysOfWeek && options.disabledDaysOfWeek.length > 0) {
    const day = d.day();
    if (options.disabledDaysOfWeek.includes(day)) {
      return true;
    }
  }

  if (options.disabledDates && options.disabledDates.length > 0) {
    for (const disabled of options.disabledDates) {
      const disabledBs = toBSDayHelper(disabled);
      if (disabledBs.isValid() && d.isSame(disabledBs, 'date')) {
        return true;
      }
    }
  }

  if (options.disableHolidays && d.isHoliday) {
    return true;
  }

  return false;
}

export function getDateRange(
  startInput: BSDayInput,
  endInput: BSDayInput,
  stepDays: number = 1,
): BSDay[] {
  const start = toBSDayHelper(startInput);
  const end = toBSDayHelper(endInput);

  if (!start.isValid() || !end.isValid()) {
    return [];
  }

  if (end.isBefore(start, 'date')) {
    return [];
  }

  const results: BSDay[] = [];
  let current = start.clone();

  while (current.isSameOrBefore(end, 'date')) {
    results.push(current.clone());
    current = current.add(stepDays, 'day');
  }

  return results;
}
