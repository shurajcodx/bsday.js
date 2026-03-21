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

export type DateUnit = 'year' | 'month' | 'date' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
export type LocaleType = 'en' | 'ne';

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

export type BSDayPluginFunction = (
  option: any,
  bsday: any, // BSDay class
  factory: any, // bsday() factory
) => void;

export type BSDayPlugin =
  | {
      name: string;
      initialize: (host: BSDayPluginHost, options?: any) => void;
    }
  | BSDayPluginFunction;

export interface BSDayPluginHost {
  prototype: Record<string, unknown>;
  registerFormatToken(token: string, resolver: FormatTokenResolver): void;
}
