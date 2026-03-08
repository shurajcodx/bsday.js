export type CalendarType = 'bs' | 'ad';

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

export interface BSDayInputBS {
  bs: [number, number, number];
}

export type BSDayInput = Date | string | BSDayInputBS | undefined;

export interface BSDayData {
  tithi: string;
  festivals: string[];
  nakshatra: string;
  yoga: string;
  karana: string;
}

export type FormatTokenResolver = (ctx: { calendar: CalendarType; ad: Date; bs: BSDate }) => string;

export interface BSDayPlugin {
  name: string;
  initialize(bsday: BSDayPluginHost): void;
}

export interface BSDayPluginHost {
  prototype: Record<string, unknown>;
  registerFormatToken(token: string, resolver: FormatTokenResolver): void;
}
