import { adToBs } from '../converters/adToBs';
import { bsToAd } from '../converters/bsToAd';
import { getBsMonthDays } from '../converters/monthData';
import { formatDate } from '../formatting/formatter';
import { parseDate, type ParsedBSDateTime } from '../parsing/parser';
import { datasetManager } from './datasetManager';
import { pluginSystem } from './pluginSystem';
import type {
  BSDate,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayPlugin,
  BSDayPluginHost,
  CalendarType,
  FormatTokenResolver,
} from '../types';
export type DateUnit = 'year' | 'month' | 'date' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
export type LocaleType = 'en' | 'ne';
import {
  DEFAULT_CALENDAR,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS_NEPALI,
  WEEKDAYS_NEPALI,
} from '../utils/constants';
import {
  addCalendarDays,
  clamp,
  getNepalDateTimeParts,
  mod,
  nepalStartOfDay,
  pad,
  updateNepalDateTime,
} from '../utils/helpers';
import { isLeapYear, isValidADDate, isValidBSDate } from '../utils/validation';
import { normalizeUnit } from '../utils/units';

interface BSDayOptions {
  mutable?: boolean;
}

type CalendarResolution = 'bs' | 'ad' | 'ambiguous' | 'invalid';

function resolveIsoLikeDateString(input: string): {
  resolution: CalendarResolution;
  year: number;
  month: number;
  day: number;
} | null {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const validBS = isValidBSDate(year, month, day);
  const validAD = isValidADDate(year, month, day);

  if (validBS && validAD) {
    return { resolution: 'ambiguous', year, month, day };
  }

  if (validBS) {
    return { resolution: 'bs', year, month, day };
  }

  if (validAD) {
    return { resolution: 'ad', year, month, day };
  }

  return { resolution: 'invalid', year, month, day };
}

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

    if (input === undefined) {
      this.adDate = new Date();
      return;
    }

    if (input === null) {
      this.adDate = new Date(NaN);
      return;
    }

    if (typeof input === 'number') {
      this.adDate = new Date(input);
      return;
    }

    if (input instanceof Date) {
      this.adDate = new Date(input.getTime());
      return;
    }

    if (typeof input === 'string') {
      try {
        const isoLikeDate = resolveIsoLikeDateString(input);
        if (isoLikeDate) {
          if (isoLikeDate.resolution === 'bs') {
            this.adDate = bsToAd({ year: isoLikeDate.year, month: isoLikeDate.month, day: isoLikeDate.day });
            return;
          }

          if (isoLikeDate.resolution === 'ad') {
            this.adDate = parseDate(input, 'YYYY-MM-DD', 'ad') as Date;
            return;
          }

          if (isoLikeDate.resolution === 'ambiguous') {
            this.adDate = new Date(NaN);
            return;
          }
        }
      } catch {
        // Fallback to AD parsing
      }

      const parsed = new Date(input);
      if (!Number.isNaN(parsed.getTime())) {
        this.adDate = parsed;
        return;
      }
    }

    if (typeof input === 'object') {
      try {
        if ('bs' in input && Array.isArray((input as any).bs)) {
          const { bs } = input as BSDayInputBS;
          this.adDate = bsToAd({ year: bs[0], month: bs[1], day: bs[2] });
          return;
        }
        if ('year' in input && 'month' in input && 'day' in input) {
          this.adDate = bsToAd(input as BSDate);
          return;
        }
      } catch {
        // Fall through to invalid
      }
    }

    if (input instanceof BSDay) {
      this.adDate = new Date(input.adDate.getTime());
      this._locale = input._locale;
      return;
    }

    // Default to invalid date if no match
    this.adDate = new Date(NaN);
  }

  isValid(): boolean {
    return !Number.isNaN(this.adDate.getTime());
  }

  static now(): number {
    return Date.now();
  }

  static nowAD(): Date {
    return new BSDay().toAD();
  }

  static nowBS(pattern = 'YYYY-MM-DD HH:mm', locale: LocaleType = 'en'): string {
    return new BSDay().format(pattern, 'bs', locale);
  }

  static fromAD(input: Date): BSDay {
    return new BSDay(input);
  }

  static fromBS(bs: string | BSDate): BSDay {
    if (typeof bs === 'string') {
      return BSDay.parse(bs, 'YYYY-MM-DD', 'bs');
    }
    return new BSDay(bs);
  }

  static parse(input: string, pattern: string, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    const parsed = parseDate(input, pattern, calendar);
    if (parsed instanceof Date) {
      return BSDay.fromAD(parsed);
    }

    const parsedBS = parsed as ParsedBSDateTime;
    let result = BSDay.fromBS({ year: parsedBS.year, month: parsedBS.month, day: parsedBS.day });
    result = result.hour(parsedBS.hour) as BSDay;
    result = result.minute(parsedBS.minute) as BSDay;
    result = result.second(parsedBS.second) as BSDay;
    return result;
  }

  static extend(plugin: BSDayPlugin, options?: any): void {
    BSDay.use(plugin, options);
  }

  static use(plugin: BSDayPlugin, options?: any): void {
    pluginSystem.use(
      plugin,
      BSDay as unknown as BSDayPluginHost,
      // The actual factory will be passed from index.ts if available
      undefined,
      options,
    );
  }

  static registerFormatToken(token: string, resolver: FormatTokenResolver): void {
    pluginSystem.registerFormatToken(token, resolver);
  }

  static setDataset(dataset: Record<string, BSDayData>): void {
    datasetManager.setDataset(dataset);
  }

  static dataset(): Record<string, BSDayData> {
    return datasetManager.getDataset();
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
      const isoLikeDate = resolveIsoLikeDateString(arg1);
      if (isoLikeDate) {
        return isoLikeDate.resolution === 'bs' || isoLikeDate.resolution === 'ad';
      }

      return !Number.isNaN(new Date(arg1).getTime());
    }

    return false;
  }

  private get bs(): BSDate {
    return this.toBS();
  }

  // Getters / Setters
  year(): number;
  year(value: number): BSDay;
  year(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return this.bs.year;
    return this.setYear(value);
  }

  month(): number;
  month(value: number): BSDay;
  month(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return this.bs.month;
    return this.setMonth(value);
  }

  date(): number;
  date(value: number): BSDay;
  date(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return this.bs.day;
    return this.setDay(value);
  }

  hour(): number;
  hour(value: number): BSDay;
  hour(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return getNepalDateTimeParts(this.adDate).hour;
    return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCHours(value)));
  }

  minute(): number;
  minute(value: number): BSDay;
  minute(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return getNepalDateTimeParts(this.adDate).minute;
    return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCMinutes(value)));
  }

  second(): number;
  second(value: number): BSDay;
  second(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return getNepalDateTimeParts(this.adDate).second;
    return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCSeconds(value)));
  }

  millisecond(): number;
  millisecond(value: number): BSDay;
  millisecond(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return getNepalDateTimeParts(this.adDate).millisecond;
    return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCMilliseconds(value)));
  }

  // Getters / Setters (Day.js style)
  dayOfWeek(): number {
    return getNepalDateTimeParts(this.adDate).dayOfWeek;
  }

  dayOfYear(): number {
    const bs = this.toBS();
    let dayIndex = bs.day;

    for (let m = 1; m < bs.month; m += 1) {
      dayIndex += getBsMonthDays(bs.year, m);
    }

    return dayIndex;
  }

  daysInMonth(calendar: CalendarType = DEFAULT_CALENDAR): number {
    if (calendar === 'ad') {
      const { year, month } = getNepalDateTimeParts(this.adDate);
      // passing month + 1 with day 0 returns the last day of the current month
      return new Date(Date.UTC(year, month, 0)).getUTCDate();
    }
    const bs = this.toBS();
    return getBsMonthDays(bs.year, bs.month);
  }

  isWeekend(): boolean {
    const day = this.dayOfWeek();
    // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
  }

  toAD(): Date {
    return new Date(this.adDate.getTime());
  }

  toBS(): BSDate {
    if (!this.isValid()) {
      return { year: NaN, month: NaN, day: NaN };
    }
    return adToBs(this.adDate);
  }

  clone(): BSDay {
    const next = new BSDay(this.toAD(), { mutable: this.mutableMode });
    (next as any)._locale = this._locale;
    return next;
  }

  isLeapYear(calendar: CalendarType = DEFAULT_CALENDAR): boolean {
    const year = calendar === 'ad' ? getNepalDateTimeParts(this.adDate).year : this.toBS().year;
    return BSDay.isLeapYear(year, calendar);
  }

  setYear(year: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCFullYear(year)));
    }

    const bs = this.toBS();
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  setMonth(month: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCMonth(month - 1)));
    }

    const bs = this.toBS();
    const normalizedMonth = clamp(month, 1, 12);
    const safeDay = clamp(bs.day, 1, getBsMonthDays(bs.year, normalizedMonth));
    return this.withBSDate({ year: bs.year, month: normalizedMonth, day: safeDay });
  }

  setDay(day: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCDate(day)));
    }

    const bs = this.toBS();
    const safeDay = clamp(day, 1, getBsMonthDays(bs.year, bs.month));
    return this.withBSDate({ year: bs.year, month: bs.month, day: safeDay });
  }

  private addDays(days: number): BSDay {
    return this.withDate(addCalendarDays(this.adDate, days));
  }

  private addMonths(months: number, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (calendar === 'ad') {
      return this.withDate(
        updateNepalDateTime(this.adDate, (next) => next.setUTCMonth(next.getUTCMonth() + months)),
      );
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
      return this.withDate(
        updateNepalDateTime(this.adDate, (next) => next.setUTCFullYear(next.getUTCFullYear() + years)),
      );
    }

    const bs = this.toBS();
    const year = bs.year + years;
    const safeDay = clamp(bs.day, 1, getBsMonthDays(year, bs.month));
    return this.withBSDate({ year, month: bs.month, day: safeDay });
  }

  add(value: number, unit: DateUnit, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    if (!this.isValid()) return this;
    const u = normalizeUnit(unit);
    switch (u) {
      case 'year':
        return this.addYears(value, calendar);
      case 'month':
        return this.addMonths(value, calendar);
      case 'date':
      case 'day':
        return this.addDays(value);
      case 'hour':
        return this.hour((this.hour() as number) + value);
      case 'minute':
        return this.minute((this.minute() as number) + value);
      case 'second':
        return this.second((this.second() as number) + value);
      case 'millisecond':
        return this.millisecond((this.millisecond() as number) + value);
      default:
        return this;
    }
  }

  subtract(value: number, unit: DateUnit, calendar: CalendarType = DEFAULT_CALENDAR): BSDay {
    return this.add(-value, unit, calendar);
  }

  startOf(unit: DateUnit): BSDay {
    if (!this.isValid()) return this;
    const u = normalizeUnit(unit);

    switch (u) {
      case 'year':
        return this.withBSDate({ year: this.bs.year, month: 1, day: 1 }).startOf('date');
      case 'month':
        return this.withBSDate({ year: this.bs.year, month: this.bs.month, day: 1 }).startOf('date');
      case 'date':
      case 'day':
        return this.withDate(new Date(nepalStartOfDay(this.adDate)));
      case 'hour':
        return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCMinutes(0, 0, 0)));
      case 'minute':
        return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCSeconds(0, 0)));
      case 'second':
        return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCMilliseconds(0)));
      default:
        return this;
    }
  }

  endOf(unit: DateUnit): BSDay {
    if (!this.isValid()) return this;
    const u = normalizeUnit(unit);
    // Shortcut: start of next unit - 1ms
    switch (u) {
      case 'year':
        return this.add(1, 'year').startOf('year').subtract(1, 'millisecond');
      case 'month':
        return this.add(1, 'month').startOf('month').subtract(1, 'millisecond');
      case 'date':
      case 'day':
        return this.add(1, 'day').startOf('day').subtract(1, 'millisecond');
      case 'hour':
        return this.add(1, 'hour').startOf('hour').subtract(1, 'millisecond');
      case 'minute':
        return this.add(1, 'minute').startOf('minute').subtract(1, 'millisecond');
      case 'second':
        return this.add(1, 'second').startOf('second').subtract(1, 'millisecond');
      default:
        return this;
    }
  }

  isBefore(other: BSDay, unit: DateUnit = 'millisecond'): boolean {
    if (!this.isValid() || !other.isValid()) return false;
    if (unit === 'millisecond') {
      return this.adDate.getTime() < other.adDate.getTime();
    }
    return this.endOf(unit).adDate.getTime() < other.startOf(unit).adDate.getTime();
  }

  isAfter(other: BSDay, unit: DateUnit = 'millisecond'): boolean {
    if (!this.isValid() || !other.isValid()) return false;
    if (unit === 'millisecond') {
      return this.adDate.getTime() > other.adDate.getTime();
    }
    return this.startOf(unit).adDate.getTime() > other.endOf(unit).adDate.getTime();
  }

  isSame(other: BSDay, unit: DateUnit = 'millisecond'): boolean {
    if (!this.isValid() || !other.isValid()) return false;
    const u = normalizeUnit(unit);
    if (u === 'millisecond') {
      return this.adDate.getTime() === other.adDate.getTime();
    }
    return (
      this.startOf(u).adDate.getTime() <= this.adDate.getTime() &&
      this.adDate.getTime() <= this.endOf(u).adDate.getTime() &&
      this.startOf(u).adDate.getTime() === other.startOf(u).adDate.getTime()
    );
  }

  isBetween(start: BSDay, end: BSDay, unit: DateUnit = 'millisecond', inclusivity = '[]'): boolean {
    if (!this.isValid() || !start.isValid() || !end.isValid()) return false;
    const u = normalizeUnit(unit);
    const leftBound = inclusivity[0] === '[';
    const rightBound = inclusivity[1] === ']';

    return (
      (leftBound ? !this.isBefore(start, u) : this.isAfter(start, u)) &&
      (rightBound ? !this.isAfter(end, u) : this.isBefore(end, u))
    );
  }

  private diffInBsMonths(other: BSDay, float: boolean): number {
    if (this.adDate.getTime() === other.adDate.getTime()) {
      return 0;
    }

    if (this.adDate.getTime() < other.adDate.getTime()) {
      return -other.diffInBsMonths(this, float);
    }

    const current = this.toBS();
    const base = other.toBS();
    let wholeMonths = (current.year - base.year) * 12 + (current.month - base.month);
    let anchor = other.add(wholeMonths, 'month');

    if (anchor.adDate.getTime() > this.adDate.getTime()) {
      wholeMonths -= 1;
      anchor = other.add(wholeMonths, 'month');
    }

    if (!float) {
      return wholeMonths;
    }

    const nextAnchor = other.add(wholeMonths + 1, 'month');
    const spanMs = nextAnchor.adDate.getTime() - anchor.adDate.getTime();
    const fraction = spanMs === 0 ? 0 : (this.adDate.getTime() - anchor.adDate.getTime()) / spanMs;

    return wholeMonths + fraction;
  }

  private diffInBsYears(other: BSDay, float: boolean): number {
    if (this.adDate.getTime() === other.adDate.getTime()) {
      return 0;
    }

    if (this.adDate.getTime() < other.adDate.getTime()) {
      return -other.diffInBsYears(this, float);
    }

    const current = this.toBS();
    const base = other.toBS();
    let wholeYears = current.year - base.year;
    let anchor = other.add(wholeYears, 'year');

    if (anchor.adDate.getTime() > this.adDate.getTime()) {
      wholeYears -= 1;
      anchor = other.add(wholeYears, 'year');
    }

    if (!float) {
      return wholeYears;
    }

    const nextAnchor = other.add(wholeYears + 1, 'year');
    const spanMs = nextAnchor.adDate.getTime() - anchor.adDate.getTime();
    const fraction = spanMs === 0 ? 0 : (this.adDate.getTime() - anchor.adDate.getTime()) / spanMs;

    return wholeYears + fraction;
  }

  diff(other: BSDay, unit: DateUnit = 'millisecond', float = false): number {
    if (!this.isValid() || !other.isValid()) return NaN;
    const u = normalizeUnit(unit);
    const diffMs = this.adDate.getTime() - other.adDate.getTime();
    const isLargeUnit = u === 'year' || u === 'month';
    const shouldReturnFloat = arguments.length >= 3 ? float : isLargeUnit;

    let result = 0;
    switch (u) {
      case 'year':
        result = this.diffInBsYears(other, shouldReturnFloat);
        break;
      case 'month': {
        result = this.diffInBsMonths(other, shouldReturnFloat);
        break;
      }
      case 'date':
      case 'day':
        result = diffMs / (24 * 60 * 60 * 1000);
        break;
      case 'hour':
        result = diffMs / (60 * 60 * 1000);
        break;
      case 'minute':
        result = diffMs / (60 * 1000);
        break;
      case 'second':
        result = diffMs / 1000;
        break;
      default:
        result = diffMs;
    }

    // Years and months return fractional BS-calendar diffs by default.
    // Other units are truncated by default to match Day.js behavior.
    return shouldReturnFloat ? result : Math.trunc(result);
  }

  locale(): LocaleType;
  locale(l: LocaleType): this;
  locale(l?: LocaleType): LocaleType | this {
    if (l === undefined) return this._locale;
    if (this.mutableMode) {
      this._locale = l;
      return this;
    }
    const next = this.clone();
    (next as any)._locale = l;
    return next as this;
  }

  format(
    pattern = 'YYYY-MM-DD HH:mm:ss',
    calendar: CalendarType = DEFAULT_CALENDAR,
    locale: LocaleType = this._locale,
  ): string {
    return formatDate(
      pattern,
      calendar,
      this.adDate,
      this.toBS(),
      pluginSystem.getFormatTokenRegistry(),
      locale,
    );
  }

  private lookupDatasetEntry(): BSDayData | null {
    return datasetManager.lookupEntry(this.toBS());
  }

  data(): BSDayData | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    return {
      tithi: data.tithi,
      paksha: data.paksha,
      festivals: [...(data.festivals ?? [])],
      events: [...(data.events ?? [])],
      isHoliday: data.isHoliday ?? false,
      nakshatra: data.nakshatra,
      yoga: data.yoga,
      karana: data.karana,
    };
  }

  get tithi(): string | null {
    return this.lookupDatasetEntry()?.tithi ?? null;
  }

  get festivals(): string[] {
    return [...(this.lookupDatasetEntry()?.festivals ?? [])];
  }

  get events(): string[] {
    return [...(this.lookupDatasetEntry()?.events ?? [])];
  }

  get isHoliday(): boolean {
    return this.lookupDatasetEntry()?.isHoliday ?? false;
  }

  get panchang(): Omit<BSDayData, 'tithi' | 'festivals' | 'isHoliday' | 'events'> | null {
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
    const next = bsToAd(bs);
    const { hour, minute, second, millisecond } = getNepalDateTimeParts(this.adDate);
    return this.withDate(
      updateNepalDateTime(next, (shifted) => shifted.setUTCHours(hour, minute, second, millisecond)),
    );
  }

  toString(): string {
    const bs = this.toBS();
    const { hour, minute, second } = getNepalDateTimeParts(this.adDate);
    const time = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
    return `${pad(bs.year, 4)}-${pad(bs.month)}-${pad(bs.day)} ${time}`;
  }

  toJSON(): string {
    return this.toString();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `BSDay("${this.toString()}")`;
  }
}
