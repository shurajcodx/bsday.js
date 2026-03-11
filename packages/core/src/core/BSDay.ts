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
  FormatTokenResolver,
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

  static today(): BSDay {
    return BSDay.now();
  }

  static nowAD(): Date {
    return BSDay.now().toAD();
  }

  static nowBS(pattern = 'YYYY-MM-DD HH:mm'): string {
    const now = BSDay.now();
    const bs = now.toBS();
    const ad = now.toAD();

    const replacements: Record<string, string> = {
      YYYY: pad(bs.year, 4),
      MM: pad(bs.month),
      DD: pad(bs.day),
      HH: pad(ad.getHours()),
      mm: pad(ad.getMinutes()),
    };

    return pattern.replace(/YYYY|MM|DD|HH|mm/g, (token) => replacements[token] ?? token);
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

  static isValid(year: number, month: number, day: number, calendar: CalendarType = 'ad'): boolean {
    return calendar === 'ad' ? isValidADDate(year, month, day) : isValidBSDate(year, month, day);
  }

  get ad(): Date {
    return this.toAD();
  }

  get bs(): BSDate {
    return this.toBS();
  }

  get year(): number {
    return this.bs.year;
  }

  get month(): number {
    return this.bs.month;
  }

  get day(): number {
    return this.bs.day;
  }

  get dayOfWeek(): number {
    return this.adDate.getUTCDay();
  }

  get dayOfYear(): number {
    const bs = this.bs;
    let dayIndex = bs.day;

    for (let month = 1; month < bs.month; month += 1) {
      dayIndex += getBsMonthDays(bs.year, month);
    }

    return dayIndex;
  }

  toAD(): Date {
    return new Date(this.adDate.getTime());
  }

  toBS(): BSDate {
    return adToBs(this.adDate);
  }

  clone(): BSDay {
    return new BSDay(this.toAD(), { mutable: this.mutableMode });
  }

  isLeapYear(calendar: CalendarType = DEFAULT_CALENDAR): boolean {
    const year = calendar === 'ad' ? this.adDate.getUTCFullYear() : this.bs.year;
    return BSDay.isLeapYear(year, calendar);
  }

  setYear(year: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCFullYear(year);
      return this.withDate(next);
    }

    const bs = this.bs;
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  setMonth(month: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCMonth(month - 1);
      return this.withDate(next);
    }

    const bs = this.bs;
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

    const bs = this.bs;
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

  addDays(days: number): BSDay {
    return this.withDate(addUtcDays(this.adDate, days));
  }

  subtractDays(days: number): BSDay {
    return this.addDays(-days);
  }

  addMonths(months: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCMonth(next.getUTCMonth() + months);
      return this.withDate(next);
    }

    const bs = this.bs;
    const monthIndex = bs.month - 1 + months;
    const yearDelta = Math.floor(monthIndex / 12);
    const normalizedMonth = mod(monthIndex, 12) + 1;
    const year = bs.year + yearDelta;

    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, normalizedMonth));
    return this.withBSDate({ year, month: normalizedMonth, day: safeDay });
  }

  subtractMonths(months: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    return this.addMonths(-months, calendar);
  }

  addYears(years: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      const next = this.toAD();
      next.setUTCFullYear(next.getUTCFullYear() + years);
      return this.withDate(next);
    }

    const bs = this.bs;
    const year = bs.year + years;
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  subtractYears(years: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    return this.addYears(-years, calendar);
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

  format(pattern: string, calendar: CalendarType = DEFAULT_CALENDAR): string {
    return formatDate(pattern, calendar, this.adDate, this.bs, formatTokenRegistry);
  }

  data(): BSDayData | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    return {
      tithi: data.tithi,
      paksha: data.paksha,
      festivals: [...data.festivals],
      events: [...data.events],
      isHoliday: data.isHoliday,
      nakshatra: data.nakshatra,
      yoga: data.yoga,
      karana: data.karana,
    };
  }

  tithi(): string | null {
    return this.lookupDatasetEntry()?.tithi ?? null;
  }

  festivals(): string[] {
    return [...(this.lookupDatasetEntry()?.festivals ?? [])];
  }

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
    const bs = this.bs;
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

    return new BSDay(date, { mutable: this.mutableMode });
  }

  private withBSDate(bs: BSDate): BSDay {
    return this.withDate(bsToAd(bs));
  }

  toString(): string {
    const bs = this.bs;
    return `${pad(bs.year, 4)}-${pad(bs.month)}-${pad(bs.day)}`;
  }
}
