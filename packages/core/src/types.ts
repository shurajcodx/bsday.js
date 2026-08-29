export type CalendarType = 'bs' | 'ad';

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

export interface BSDayInputBS {
  bs: [number, number, number];
}

import type { BSDay } from './core/BSDay';

export interface ConfigTypeMap {
  default: string | number | Date | BSDay | null | undefined;
}

export type BSDayInput = string | number | Date | BSDate | BSDayInputBS | BSDay | null | undefined;

export type DateUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'date'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'
  | 'fiscalYear'
  | 'fiscalQuarter';
export type LocaleType = 'en' | 'ne';
export type FiscalYearFormat = 'short' | 'full' | 'extended';

export interface BSDayObject {
  years: number;
  months: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface BSAge {
  years: number;
  months: number;
  days: number;
}



export interface BSDayData {
  tithi: string;
  paksha: string;
  festivals?: string[];
  events?: string[];
  isHoliday?: boolean;
  nakshatra: string;
  yoga: string;
  karana: string;
}

export type FormatTokenResolver = (ctx: {
  calendar: CalendarType;
  locale: LocaleType;
  ad: Date;
  bs: BSDate;
}) => string;

export interface BSDayFactoryLike {
  (input?: BSDayInput): BSDay;
  bs(bs: string | BSDate): BSDay;
  bs(year: number, month: number, day: number): BSDay;
  ad(ad: Date): BSDay;
  now(): number;
  extend(plugin: BSDayPlugin, options?: unknown): void;
  BSDay: typeof BSDay;
}

export type BSDayPluginFunction = (
  option: unknown,
  bsday: BSDayPluginHost,
  factory?: BSDayFactoryLike,
) => void;

export type BSDayPlugin =
  | {
      name: string;
      initialize: (host: BSDayPluginHost, options?: unknown) => void;
    }
  | BSDayPluginFunction;

export interface BSDayPluginHost {
  prototype: object;
  registerFormatToken(token: string, resolver: FormatTokenResolver): void;
}
