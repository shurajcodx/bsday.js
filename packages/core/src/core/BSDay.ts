import { adToBs } from '../converters/adToBs';
import { dataset as bundledDataset } from '@bsday/dataset';
import { bsToAd } from '../converters/bsToAd';
import { getBsMonthDays } from '../converters/monthData';
import { formatDate } from '../formatting/formatter';
import { BASE_FORMAT_TOKENS } from '../formatting/formatTokens';
import { parseDate } from '../parsing/parser';
import { PluginManager } from '../plugins/PluginManager';
import type {
  BSDate,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayPlugin,
  CalendarType,
  DateUnit,
  FormatTokenResolver,
  LocaleType,
} from '../types';
import {
  DEFAULT_CALENDAR,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS_NEPALI,
  WEEKDAYS_NEPALI,
} from '../utils/constants';
import { addUtcDays, buildBsKey, clamp, mod, pad, utcStartOfDay } from '../utils/helpers';
import { isLeapYear, isValidADDate, isValidBSDate } from '../utils/validation';

interface BSDayOptions {
  mutable?: boolean;
}

const pluginManager = new PluginManager();
const formatTokenRegistry: Record<string, FormatTokenResolver> = {
  ...BASE_FORMAT_TOKENS,
};

let datasetStore: Record<string, BSDayData> = bundledDataset as Record<string, BSDayData>;

export class BSDay {
  private adDate: Date;
  private readonly mutableMode: boolean;
  private _locale: LocaleType = 'en';

  static MIN_YEAR = MIN_YEAR;
  static MAX_YEAR = MAX_YEAR;
  static MONTHS_NEPALI = MONTHS_NEPALI;
  static WEEKDAYS_NEPALI = WEEKDAYS_NEPALI;

  constructor(input?: BSDayInput, options: BSDayOptions = {}) {
    this.mutableMode = options.mutable ?? false;

    if (!input) {
      this.adDate = new Date();
      return;
    }

    if (input instanceof Date) {
      this.adDate = new Date(input.getTime());
      return;
    }

    if (typeof input === 'string') {
      const parsed = new Date(input);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid date string: ${input}`);
      }

      this.adDate = parsed;
      return;
    }

    const { bs } = input as BSDayInputBS;
    this.adDate = bsToAd({ year: bs[0], month: bs[1], day: bs[2] });
  }

  static now(): BSDay {
    return new BSDay();
  }

  static nowAD(): Date {
    return BSDay.now().toAD();
  }

  static nowBS(pattern = 'YYYY-MM-DD HH:mm', locale: LocaleType = 'en'): string {
    return BSDay.now().format(pattern, 'bs', locale);
  }

  static fromAD(input: Date): BSDay {
    return new BSDay(input);
  }

  static fromBS(bs: [number, number, number]): BSDay {
    return new BSDay({ bs });
  }

  static parse(input: string, pattern: string, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    const parsed = parseDate(input, pattern, calendar);
    if (parsed instanceof Date) {
      return BSDay.fromAD(parsed);
    }

    return BSDay.fromBS([parsed.year, parsed.month, parsed.day]);
  }

  static extend(plugin: BSDayPlugin): void {
    BSDay.use(plugin);
  }

  static use(plugin: BSDayPlugin): void {
    pluginManager.use(
      plugin,
      BSDay as unknown as {
        prototype: Record<string, unknown>;
        registerFormatToken(token: string, resolver: FormatTokenResolver): void;
      },
    );
  }

  static registerFormatToken(token: string, resolver: FormatTokenResolver): void {
    formatTokenRegistry[token] = resolver;
  }

  static setDataset(dataset: Record<string, BSDayData>): void {
    datasetStore = dataset;
  }

  static dataset(): Record<string, BSDayData> {
    return datasetStore;
  }

  static isLeapYear(year: number, calendar: CalendarType = 'ad'): boolean {
    return isLeapYear(year, calendar);
  }

  static isValid(input: string, pattern?: string, calendar?: CalendarType): boolean;
  static isValid(input: Date | BSDayInputBS): boolean;
  static isValid(year: number, month: number, day: number, calendar?: CalendarType): boolean;
  static isValid(arg1: any, arg2?: any, arg3?: any, arg4?: any): boolean {
    if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
      const cal = arg4 ?? 'ad';
      return cal === 'ad' ? isValidADDate(arg1, arg2, arg3) : isValidBSDate(arg1, arg2, arg3);
    }

    if (arg1 instanceof Date) {
      return !Number.isNaN(arg1.getTime());
    }

    if (arg1 && typeof arg1 === 'object' && 'bs' in arg1 && Array.isArray(arg1.bs)) {
      const [y, m, d] = arg1.bs;
      return isValidBSDate(y, m, d);
    }

    if (typeof arg1 === 'string') {
      if (arg2 && typeof arg2 === 'string') {
        try {
          parseDate(arg1, arg2, arg3 ?? DEFAULT_CALENDAR);
          return true;
        } catch {
          return false;
        }
      }
      return !Number.isNaN(new Date(arg1).getTime());
    }

    return false;
  }

  get year(): number {
    return this.toBS().year;
  }

  get month(): number {
    return this.toBS().month;
  }

  get day(): number {
    return this.toBS().day;
  }

  get dayOfWeek(): number {
    return this.adDate.getUTCDay();
  }

  get dayOfYear(): number {
    const bs = this.toBS();
    let dayIndex = bs.day;

    for (let month = 1; month < bs.month; month += 1) {
      dayIndex += getBsMonthDays(bs.year, month);
    }

    return dayIndex;
  }

  daysInMonth(calendar: CalendarType = DEFAULT_CALENDAR): number {
    if (calendar === 'ad') {
      const year = this.adDate.getUTCFullYear();
      const month = this.adDate.getUTCMonth();
      // passing month + 1 with day 0 returns the last day of the current month
      return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    const bs = this.toBS();
    return getBsMonthDays(bs.year, bs.month);
  }

  isWeekend(): boolean {
    const day = this.adDate.getUTCDay();
    // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
  }

  toAD(): Date {
    return new Date(this.adDate.getTime());
  }

  toBS(): BSDate {
    return adToBs(this.adDate);
  }

  clone(): BSDay {
    const next = new BSDay(this.toAD(), { mutable: this.mutableMode });
    (next as any)._locale = this._locale;
    return next;
  }

  isLeapYear(calendar: CalendarType = DEFAULT_CALENDAR): boolean {
    const year = calendar === 'ad' ? this.adDate.getUTCFullYear() : this.toBS().year;
    return BSDay.isLeapYear(year, calendar);
  }

  setYear(year: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCFullYear(year);
      return this.withDate(next);
    }

    const bs = this.toBS();
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  setMonth(month: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCMonth(month - 1);
      return this.withDate(next);
    }

    const bs = this.toBS();
    const normalizedMonth = clamp(month, 1, 12);
    const safeDay = clamp(bs.day, 1, getBsMonthDays(bs.year, normalizedMonth));
    return this.withBSDate({ year: bs.year, month: normalizedMonth, day: safeDay });
  }

  setDay(day: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCDate(day);
      return this.withDate(next);
    }

    const bs = this.toBS();
    const safeDay = clamp(day, 1, getBsMonthDays(bs.year, bs.month));
    return this.withBSDate({ year: bs.year, month: bs.month, day: safeDay });
  }

  setFullDate(
    year: number,
    month: number,
    day: number,
    calendar: CalendarType = DEFAULT_CALENDAR,
  ): BSDay {
    if (calendar === 'ad') {
      if (!isValidADDate(year, month, day)) {
        throw new RangeError(`Invalid AD date ${year}-${month}-${day}.`);
      }
      return this.withDate(new Date(Date.UTC(year, month - 1, day)));
    }

    if (!isValidBSDate(year, month, day)) {
      throw new RangeError(`Invalid BS date ${year}-${month}-${day}.`);
    }

    return this.withBSDate({ year, month, day });
  }

  private addDays(days: number): BSDay {
    return this.withDate(addUtcDays(this.adDate, days));
  }

  private addMonths(months: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCMonth(next.getUTCMonth() + months);
      return this.withDate(next);
    }

    const bs = this.toBS();
    const monthIndex = bs.month - 1 + months;
    const yearDelta = Math.floor(monthIndex / 12);
    const normalizedMonth = mod(monthIndex, 12) + 1;
    const year = bs.year + yearDelta;

    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, normalizedMonth));
    return this.withBSDate({ year, month: normalizedMonth, day: safeDay });
  }

  private addYears(years: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCFullYear(next.getUTCFullYear() + years);
      return this.withDate(next);
    }

    const bs = this.toBS();
    const year = bs.year + years;
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  add(value: number, unit: DateUnit, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    switch (unit) {
      case 'day':
        return this.addDays(value);
      case 'month':
        return this.addMonths(value, calendar);
      case 'year':
        return this.addYears(value, calendar);
      default:
        throw new Error(`Unknown date unit: ${unit}`);
    }
  }

  subtract(value: number, unit: DateUnit, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    return this.add(-value, unit, calendar);
  }

  isBefore(other: BSDay): boolean {
    return utcStartOfDay(this.adDate) < utcStartOfDay(other.adDate);
  }

  isAfter(other: BSDay): boolean {
    return utcStartOfDay(this.adDate) > utcStartOfDay(other.adDate);
  }

  isSame(other: BSDay): boolean {
    return utcStartOfDay(this.adDate) === utcStartOfDay(other.adDate);
  }

  locale(l?: LocaleType): LocaleType | BSDay {
    if (l === undefined) return this._locale;
    if (this.mutableMode) {
      this._locale = l;
      return this;
    }
    const next = this.clone();
    (next as any)._locale = l;
    return next;
  }

  format(
    pattern: string,
    calendar: CalendarType = DEFAULT_CALENDAR,
    locale: LocaleType = this._locale,
  ): string {
    return formatDate(pattern, calendar, this.adDate, this.toBS(), formatTokenRegistry, locale);
  }

  data(): BSDayData | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    return {
      tithi: data.tithi,
      paksha: data.paksha,
      // festivals: [...data.festivals],
      // events: [...data.events],
      // isHoliday: data.isHoliday,
      nakshatra: data.nakshatra,
      yoga: data.yoga,
      karana: data.karana,
    };
  }

  tithi(): string | null {
    return this.lookupDatasetEntry()?.tithi ?? null;
  }

  // festivals(): string[] {
  //   return [...(this.lookupDatasetEntry()?.festivals ?? [])];
  // }

  panchang(): Omit<BSDayData, 'tithi' | 'festivals' | 'isHoliday' | 'events'> | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    return {
      paksha: data.paksha,
      nakshatra: data.nakshatra,
      yoga: data.yoga,
      karana: data.karana,
    };
  }

  private lookupDatasetEntry(): BSDayData | null {
    const bs = this.toBS();
    const strictKey = buildBsKey(bs);
    const strict = datasetStore[strictKey];
    if (strict) {
      return strict;
    }

    // Allow non-padded keys too (e.g. 2082-1-1) to keep manual dataset edits ergonomic.
    const looseKey = `${bs.year}-${bs.month}-${bs.day}`;
    return datasetStore[looseKey] ?? null;
  }

  private withDate(date: Date): BSDay {
    if (this.mutableMode) {
      this.adDate = date;
      return this;
    }

    const next = new BSDay(date, { mutable: this.mutableMode });
    (next as any)._locale = this._locale;
    return next;
  }

  private withBSDate(bs: BSDate): BSDay {
    return this.withDate(bsToAd(bs));
  }

  toString(): string {
    const bs = this.toBS();
    return `${pad(bs.year, 4)}-${pad(bs.month)}-${pad(bs.day)}`;
  }
}
