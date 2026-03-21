export type UnitType =
  | 'year'
  | 'month'
  | 'date'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

const unitAliases: Record<string, UnitType> = {
  y: 'year',
  yr: 'year',
  year: 'year',
  years: 'year',
  M: 'month',
  mon: 'month',
  month: 'month',
  months: 'month',
  d: 'date',
  date: 'date',
  dates: 'date',
  D: 'date',
  day: 'day',
  days: 'day',
  h: 'hour',
  hr: 'hour',
  hour: 'hour',
  hours: 'hour',
  m: 'minute',
  min: 'minute',
  minute: 'minute',
  minutes: 'minute',
  s: 'second',
  sec: 'second',
  second: 'second',
  seconds: 'second',
  ms: 'millisecond',
  millisecond: 'millisecond',
  milliseconds: 'millisecond',
};

export function normalizeUnit(unit: string): UnitType {
  const normalized = unitAliases[unit.toLowerCase()];
  if (!normalized) {
    throw new Error(`Invalid unit: ${unit}`);
  }
  return normalized;
}

export function prettyUnit(unit: UnitType): string {
  return unit.charAt(0).toUpperCase() + unit.slice(1);
}
