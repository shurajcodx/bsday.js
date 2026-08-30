import { adToBs } from '../converters/adToBs';
import { bsToAd } from '../converters/bsToAd';
import { getBsMonthDays } from '../converters/monthData';
import { formatDate } from '../formatting/formatter';
import { parseDate, type ParsedBSDateTime } from '../parsing/parser';
import { datasetManager } from './datasetManager';
import { pluginSystem } from './pluginSystem';
import type {
  BSAge,
  BSDate,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayObject,
  BSDayPlugin,
  BSDayPluginHost,
  BSDuration,
  CalendarType,
  DateUnit,
  FiscalYearFormat,
  FormatTokenResolver,
  LocaleType,
  WorkdayOptions,
} from '../types';
export type { BSAge, BSDuration, DateUnit, FiscalYearFormat, LocaleType, WorkdayOptions };

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
  localizeNumber,
  mod,
  nepalStartOfDay,
  normalizeNepaliDigits,
  pad,
  updateNepalDateTime,
} from '../utils/helpers';

import { isLeapYear, isValidADDate, isValidBSDate } from '../utils/validation';
import { normalizeUnit } from '../utils/units';
import {
  getCalendarMatrix,
  type CalendarCell,
  type CalendarMatrixOptions,
} from '../calendar/calendarGrid';
import {
  localizeBSDayData,
  TITHI_NE_MAP,
  PAKSHA_NE_MAP,
  NAKSHATRA_NE_MAP,
  YOGA_NE_MAP,
  KARANA_NE_MAP,
  FESTIVAL_NE_MAP,
  EVENT_NE_MAP,
} from '../utils/nepaliTerms';

interface BSDayOptions {
  mutable?: boolean;
}

function isBSDayInputBS(input: unknown): input is BSDayInputBS {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const candidate = input as { bs?: unknown };
  return (
    Array.isArray(candidate.bs) &&
    candidate.bs.length === 3 &&
    candidate.bs.every((part) => typeof part === 'number')
  );
}

function isBSDate(input: unknown): input is BSDate {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const candidate = input as Partial<Record<'year' | 'month' | 'day', unknown>>;
  return (
    typeof candidate.year === 'number' &&
    typeof candidate.month === 'number' &&
    typeof candidate.day === 'number'
  );
}

function parseAdLikeString(input: string): Date | null {
  if (/^\d{4}\/\d{1,2}\/\d{1,2}\b/.test(input.trim())) {
    return null;
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toBSDayInstance(input: BSDayInput): BSDay {
  if (input instanceof BSDay) {
    return input;
  }
  if (typeof input === 'string') {
    const normalized = normalizeNepaliDigits(input.trim());
    if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(normalized)) {
      try {
        return BSDay.bs(input);
      } catch {
        return new BSDay(NaN);
      }
    }
  }
  if (input && typeof input === 'object' && 'year' in input && 'month' in input && 'day' in input) {
    const bsObj = input as { year: number; month: number; day: number };
    return BSDay.bs(bsObj.year, bsObj.month, bsObj.day);
  }
  return new BSDay(input);
}

function parseBsString(input: string): BSDate {
  const normalized = normalizeNepaliDigits(input.trim());
  const slashMatch = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  const dashMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const match = slashMatch ?? dashMatch;

  if (!match) {
    throw new Error(`Invalid BS date string "${input}". Expected YYYY/MM/DD or YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!isValidBSDate(year, month, day)) {
    throw new RangeError(`Invalid BS date ${year}-${month}-${day}.`);
  }

  return { year, month, day };
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
      const parsed = parseAdLikeString(normalizeNepaliDigits(input));
      if (parsed) {
        this.adDate = parsed;
        return;
      }
    }

    if (typeof input === 'object') {
      try {
        if (isBSDayInputBS(input)) {
          const { bs } = input;
          this.adDate = bsToAd({ year: bs[0], month: bs[1], day: bs[2] });
          return;
        }
        if (isBSDate(input)) {
          this.adDate = bsToAd(input);
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

  static nowBS(pattern = 'YYYY/MM/DD', locale: LocaleType = 'en'): string {
    return new BSDay().format(pattern, 'bs', locale);
  }

  static fromAD(input: Date): BSDay {
    return new BSDay(input);
  }

  static bs(input: BSDate): BSDay;
  static bs(input: string): BSDay;
  static bs(year: number, month: number, day: number): BSDay;
  static bs(arg1: BSDate | string | number, arg2?: number, arg3?: number): BSDay {
    if (arg1 && typeof arg1 === 'object') {
      return new BSDay(arg1);
    }

    if (typeof arg1 === 'string') {
      return new BSDay(parseBsString(arg1));
    }

    if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
      return new BSDay({ year: arg1, month: arg2, day: arg3 });
    }

    return new BSDay(NaN);
  }

  static fromBS(bs: string | BSDate): BSDay {
    if (typeof bs === 'string') {
      return BSDay.bs(bs);
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

  static extend(plugin: BSDayPlugin, options?: unknown): void {
    BSDay.use(plugin, options);
  }

  static use(plugin: BSDayPlugin, options?: unknown): void {
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

  static addDataset(dataset: Record<string, BSDayData>): void {
    datasetManager.addDataset(dataset);
  }

  static registerYear(year: number, dataset: Record<string, BSDayData>): void {
    datasetManager.registerYear(year, dataset);
  }

  static dataset(): Record<string, BSDayData> {
    return datasetManager.getDataset();
  }

  static isLeapYear(year: number, calendar: CalendarType = 'ad'): boolean {
    return isLeapYear(year, calendar);
  }

  static startOfFiscalYear(year?: number): BSDay {
    const y = year ?? new BSDay().fiscalYearNumber();
    return new BSDay({ year: y, month: 4, day: 1 }).startOf('date');
  }

  static endOfFiscalYear(year?: number): BSDay {
    const y = year ?? new BSDay().fiscalYearNumber();
    const endYear = y + 1;
    const lastDay = getBsMonthDays(endYear, 3);
    return new BSDay({ year: endYear, month: 3, day: lastDay }).endOf('date');
  }

  static getCalendarMatrix(
    year: number,
    month: number,
    options?: CalendarMatrixOptions,
  ): CalendarCell[][] {
    return getCalendarMatrix(year, month, options);
  }

  static isBusinessDay(date: BSDayInput, options?: WorkdayOptions): boolean {
    return toBSDayInstance(date).isBusinessDay(options);
  }

  static addBusinessDays(date: BSDayInput, days: number, options?: WorkdayOptions): BSDay {
    return toBSDayInstance(date).addBusinessDays(days, options);
  }

  static isValid(input: string, pattern?: string, calendar?: CalendarType): boolean;
  static isValid(input: Date | BSDayInputBS | BSDate): boolean;
  static isValid(year: number, month: number, day: number, calendar?: CalendarType): boolean;
  static isValid(arg1: unknown, arg2?: unknown, arg3?: unknown, arg4?: unknown): boolean {
    if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
      const cal = arg4 ?? 'ad';
      return cal === 'ad' ? isValidADDate(arg1, arg2, arg3) : isValidBSDate(arg1, arg2, arg3);
    }

    if (arg1 instanceof Date) {
      return !Number.isNaN(arg1.getTime());
    }

    if (isBSDayInputBS(arg1)) {
      const [y, m, d] = arg1.bs;
      return isValidBSDate(y, m, d);
    }

    if (isBSDate(arg1)) {
      return isValidBSDate(arg1.year, arg1.month, arg1.day);
    }

    if (typeof arg1 === 'string') {
      if (arg2 && typeof arg2 === 'string') {
        try {
          const calendar = arg3 === 'ad' || arg3 === 'bs' ? arg3 : DEFAULT_CALENDAR;
          parseDate(arg1, arg2, calendar);
          return true;
        } catch {
          return false;
        }
      }
      return parseAdLikeString(arg1) !== null;
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

  quarter(): number;
  quarter(value: number): BSDay;
  quarter(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    const currentQ = Math.ceil(this.bs.month / 3);
    if (value === undefined) return currentQ;
    const targetMonth = (value - 1) * 3 + ((this.bs.month - 1) % 3) + 1;
    return this.setMonth(targetMonth);
  }

  month(): number;
  month(value: number): BSDay;
  month(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return this.bs.month;
    return this.setMonth(value);
  }

  day(): number;
  day(value: number): BSDay;
  day(value?: number): number | BSDay {
    if (!this.isValid()) return value === undefined ? NaN : this;
    if (value === undefined) return this.dayOfWeek();
    const currentDay = this.dayOfWeek();
    return this.add(value - currentDay, 'day');
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
    return this.withDate(
      updateNepalDateTime(this.adDate, (next) => next.setUTCMilliseconds(value)),
    );
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

  isWeekend(weekendDays: number[] = [6]): boolean {
    if (!this.isValid()) return false;
    return weekendDays.includes(this.dayOfWeek());
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
    next._locale = this._locale;
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
        updateNepalDateTime(this.adDate, (next) =>
          next.setUTCFullYear(next.getUTCFullYear() + years),
        ),
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
      case 'quarter':
        return this.addMonths(value * 3, calendar);
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
      case 'quarter': {
        const qMonth = (this.quarter() - 1) * 3 + 1;
        return this.withBSDate({ year: this.bs.year, month: qMonth, day: 1 }).startOf('date');
      }
      case 'fiscalYear': {
        const fy = this.fiscalYearNumber();
        return this.withBSDate({ year: fy, month: 4, day: 1 }).startOf('date');
      }
      case 'fiscalQuarter': {
        const fq = this.fiscalQuarter();
        const startYear = this.fiscalYearNumber();
        if (fq === 1) return this.withBSDate({ year: startYear, month: 4, day: 1 }).startOf('date');
        if (fq === 2) return this.withBSDate({ year: startYear, month: 7, day: 1 }).startOf('date');
        if (fq === 3)
          return this.withBSDate({ year: startYear, month: 10, day: 1 }).startOf('date');
        return this.withBSDate({ year: startYear + 1, month: 1, day: 1 }).startOf('date');
      }
      case 'month':
        return this.withBSDate({ year: this.bs.year, month: this.bs.month, day: 1 }).startOf(
          'date',
        );
      case 'date':
      case 'day':
        return this.withDate(new Date(nepalStartOfDay(this.adDate)));
      case 'hour':
        return this.withDate(
          updateNepalDateTime(this.adDate, (next) => next.setUTCMinutes(0, 0, 0)),
        );
      case 'minute':
        return this.withDate(updateNepalDateTime(this.adDate, (next) => next.setUTCSeconds(0, 0)));
      case 'second':
        return this.withDate(
          updateNepalDateTime(this.adDate, (next) => next.setUTCMilliseconds(0)),
        );
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
      case 'quarter':
        return this.add(1, 'quarter').startOf('quarter').subtract(1, 'millisecond');
      case 'fiscalYear': {
        const fy = this.fiscalYearNumber();
        const endYear = fy + 1;
        const lastDay = getBsMonthDays(endYear, 3);
        return this.withBSDate({ year: endYear, month: 3, day: lastDay }).endOf('date');
      }
      case 'fiscalQuarter': {
        const fq = this.fiscalQuarter();
        const startYear = this.fiscalYearNumber();
        if (fq === 1)
          return this.withBSDate({
            year: startYear,
            month: 6,
            day: getBsMonthDays(startYear, 6),
          }).endOf('date');
        if (fq === 2)
          return this.withBSDate({
            year: startYear,
            month: 9,
            day: getBsMonthDays(startYear, 9),
          }).endOf('date');
        if (fq === 3)
          return this.withBSDate({
            year: startYear,
            month: 12,
            day: getBsMonthDays(startYear, 12),
          }).endOf('date');
        return this.withBSDate({
          year: startYear + 1,
          month: 3,
          day: getBsMonthDays(startYear + 1, 3),
        }).endOf('date');
      }
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

  isSameOrBefore(other: BSDay, unit: DateUnit = 'millisecond'): boolean {
    return this.isSame(other, unit) || this.isBefore(other, unit);
  }

  isSameOrAfter(other: BSDay, unit: DateUnit = 'millisecond'): boolean {
    return this.isSame(other, unit) || this.isAfter(other, unit);
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
    const shouldReturnFloat = float;

    let result = 0;
    switch (u) {
      case 'year':
        result = this.diffInBsYears(other, shouldReturnFloat);
        break;
      case 'quarter':
        result = this.diffInBsMonths(other, shouldReturnFloat) / 3;
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
    const next = this.clone() as this;
    next._locale = l;
    return next;
  }

  format(
    pattern?: string,
    calendar: CalendarType = DEFAULT_CALENDAR,
    locale: LocaleType = this._locale,
  ): string {
    const resolvedPattern = pattern ?? (calendar === 'bs' ? 'YYYY/MM/DD' : 'YYYY-MM-DD HH:mm:ss');
    return formatDate(
      resolvedPattern,
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

  data(locale?: LocaleType): BSDayData | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    const loc = locale ?? this._locale ?? 'en';
    const cloned: BSDayData = {
      tithi: data.tithi,
      paksha: data.paksha,
      festivals: [...(data.festivals ?? [])],
      events: [...(data.events ?? [])],
      isHoliday: data.isHoliday ?? false,
      nakshatra: data.nakshatra,
      yoga: data.yoga,
      karana: data.karana,
    };

    return localizeBSDayData(cloned, loc);
  }

  get tithi(): string | null {
    const raw = this.lookupDatasetEntry()?.tithi ?? null;
    if (!raw) return null;
    if (this._locale === 'ne') {
      return TITHI_NE_MAP[raw] ?? raw;
    }
    return raw;
  }

  get festivals(): string[] {
    const raw = this.lookupDatasetEntry()?.festivals ?? [];
    if (this._locale === 'ne') {
      return raw.map((f) => FESTIVAL_NE_MAP[f] ?? f);
    }
    return [...raw];
  }

  get events(): string[] {
    const raw = this.lookupDatasetEntry()?.events ?? [];
    if (this._locale === 'ne') {
      return raw.map((e) => EVENT_NE_MAP[e] ?? e);
    }
    return [...raw];
  }

  get isHoliday(): boolean {
    return this.lookupDatasetEntry()?.isHoliday ?? false;
  }

  get isSaturday(): boolean {
    return this.day() === 6;
  }

  get isSunday(): boolean {
    return this.day() === 0;
  }

  isBusinessDay(options: WorkdayOptions = {}): boolean {
    if (!this.isValid()) return false;
    const includeSundays = options.includeSundays ?? true;
    const skipPublicHolidays = options.skipPublicHolidays ?? true;
    const weekendDays = options.weekendDays ?? (includeSundays ? [6] : [0, 6]);

    if (weekendDays.includes(this.day())) {
      return false;
    }

    if (skipPublicHolidays && this.isHoliday) {
      return false;
    }

    return true;
  }

  addBusinessDays(days: number, options: WorkdayOptions = {}): BSDay {
    if (!this.isValid() || days === 0) return this.clone();
    let current = this.clone();
    let count = 0;
    const direction = days >= 0 ? 1 : -1;
    const target = Math.abs(days);

    while (count < target) {
      current = current.add(direction, 'day');
      if (current.isBusinessDay(options)) {
        count++;
      }
    }

    return current;
  }

  subtractBusinessDays(days: number, options: WorkdayOptions = {}): BSDay {
    return this.addBusinessDays(-days, options);
  }

  businessDaysBetween(other: BSDayInput, options: WorkdayOptions = {}): number {
    const end = toBSDayInstance(other);
    if (!this.isValid() || !end.isValid()) return NaN;

    if (this.isSame(end, 'date')) return 0;

    const isForward = end.isAfter(this, 'date');
    const startInstance = isForward ? this : end;
    const endInstance = isForward ? end : this;

    let count = 0;
    let current = startInstance.clone().add(1, 'day');

    while (current.isSameOrBefore(endInstance, 'date')) {
      if (current.isBusinessDay(options)) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return isForward ? count : -count;
  }

  diffDuration(other: BSDayInput): BSDuration {
    const target = toBSDayInstance(other);
    if (!this.isValid() || !target.isValid()) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    }

    const start = this.isBefore(target) ? this : target;
    const end = this.isBefore(target) ? target : this;

    const startBS = start.toBS();
    const endBS = end.toBS();
    const startParts = getNepalDateTimeParts(start.adDate);
    const endParts = getNepalDateTimeParts(end.adDate);

    let years = endBS.year - startBS.year;
    let months = endBS.month - startBS.month;
    let days = endBS.day - startBS.day;

    let hours = endParts.hour - startParts.hour;
    let minutes = endParts.minute - startParts.minute;
    let seconds = endParts.second - startParts.second;
    let milliseconds = endParts.millisecond - startParts.millisecond;

    if (milliseconds < 0) {
      milliseconds += 1000;
      seconds -= 1;
    }

    if (seconds < 0) {
      seconds += 60;
      minutes -= 1;
    }

    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }

    if (hours < 0) {
      hours += 24;
      days -= 1;
    }

    if (days < 0) {
      months -= 1;
      const prevMonth = endBS.month === 1 ? 12 : endBS.month - 1;
      const prevYear = endBS.month === 1 ? endBS.year - 1 : endBS.year;
      days += getBsMonthDays(prevYear, prevMonth);
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
      milliseconds: Math.max(0, milliseconds),
    };
  }

  get panchang(): Omit<BSDayData, 'tithi' | 'festivals' | 'isHoliday' | 'events'> | null {
    const data = this.lookupDatasetEntry();
    if (!data) {
      return null;
    }

    if (this._locale === 'ne') {
      return {
        paksha: PAKSHA_NE_MAP[data.paksha] ?? data.paksha,
        nakshatra: NAKSHATRA_NE_MAP[data.nakshatra] ?? data.nakshatra,
        yoga: YOGA_NE_MAP[data.yoga] ?? data.yoga,
        karana: KARANA_NE_MAP[data.karana] ?? data.karana,
      };
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
    next._locale = this._locale;
    return next;
  }

  private withBSDate(bs: BSDate): BSDay {
    const next = bsToAd(bs);
    const { hour, minute, second, millisecond } = getNepalDateTimeParts(this.adDate);
    return this.withDate(
      updateNepalDateTime(next, (shifted) =>
        shifted.setUTCHours(hour, minute, second, millisecond),
      ),
    );
  }

  valueOf(): number {
    return this.adDate.getTime();
  }

  unix(): number {
    return Math.floor(this.adDate.getTime() / 1000);
  }

  toISOString(): string {
    return this.adDate.toISOString();
  }

  toObject(): BSDayObject {
    const bs = this.toBS();
    const { hour, minute, second, millisecond } = getNepalDateTimeParts(this.adDate);
    return {
      years: bs.year,
      months: bs.month,
      date: bs.day,
      hours: hour,
      minutes: minute,
      seconds: second,
      milliseconds: millisecond,
    };
  }

  fiscalYearNumber(): number {
    if (!this.isValid()) return NaN;
    const bs = this.toBS();
    return bs.month >= 4 ? bs.year : bs.year - 1;
  }

  fiscalQuarter(): number {
    if (!this.isValid()) return NaN;
    const bs = this.toBS();
    if (bs.month >= 4 && bs.month <= 6) return 1;
    if (bs.month >= 7 && bs.month <= 9) return 2;
    if (bs.month >= 10 && bs.month <= 12) return 3;
    return 4;
  }

  fiscalYear(format: FiscalYearFormat = 'short', locale?: LocaleType): string {
    if (!this.isValid()) return '';
    const loc = locale ?? this._locale ?? 'en';
    const startYear = this.fiscalYearNumber();
    const endYear = startYear + 1;
    const end2Digit = pad(endYear % 100);

    let result = '';
    if (format === 'full') {
      result = `${startYear}/${endYear}`;
    } else if (format === 'extended') {
      result = loc === 'ne' ? `आ.व. ${startYear}/${end2Digit}` : `FY ${startYear}/${end2Digit}`;
    } else {
      result = `${startYear}/${end2Digit}`;
    }

    return localizeNumber(result, loc);
  }

  age(relativeTo?: BSDay | Date): BSAge {
    if (!this.isValid()) return { years: 0, months: 0, days: 0 };
    const current = relativeTo
      ? relativeTo instanceof BSDay
        ? relativeTo
        : new BSDay(relativeTo)
      : new BSDay();
    if (!current.isValid()) return { years: 0, months: 0, days: 0 };

    const birth = this.toBS();
    const curr = current.toBS();

    if (current.isBefore(this)) {
      return { years: 0, months: 0, days: 0 };
    }

    let years = curr.year - birth.year;
    let months = curr.month - birth.month;
    let days = curr.day - birth.day;

    if (days < 0) {
      months -= 1;
      const prevMonth = curr.month === 1 ? 12 : curr.month - 1;
      const prevYear = curr.month === 1 ? curr.year - 1 : curr.year;
      days += getBsMonthDays(prevYear, prevMonth);
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  }

  formatAge(locale: LocaleType = this._locale, relativeTo?: BSDay | Date): string {
    const { years, months, days } = this.age(relativeTo);
    if (locale === 'ne') {
      return `${localizeNumber(years, 'ne')} वर्ष, ${localizeNumber(months, 'ne')} महिना, ${localizeNumber(days, 'ne')} दिन`;
    }
    const yearStr = `${years} ${years === 1 ? 'year' : 'years'}`;
    const monthStr = `${months} ${months === 1 ? 'month' : 'months'}`;
    const dayStr = `${days} ${days === 1 ? 'day' : 'days'}`;
    return `${yearStr}, ${monthStr}, ${dayStr}`;
  }

  isAdult(minAge = 18, relativeTo?: BSDay | Date): boolean {
    return this.age(relativeTo).years >= minAge;
  }

  getCalendarMatrix(options: CalendarMatrixOptions = {}): CalendarCell[][] {
    const bs = this.toBS();
    return getCalendarMatrix(bs.year, bs.month, { locale: this._locale, ...options });
  }

  toString(): string {
    const bs = this.toBS();
    const { hour, minute, second } = getNepalDateTimeParts(this.adDate);
    const time = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
    return `${pad(bs.year, 4)}/${pad(bs.month)}/${pad(bs.day)} ${time}`;
  }

  toJSON(): string {
    return this.toString();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `BSDay("${this.toString()}")`;
  }
}
