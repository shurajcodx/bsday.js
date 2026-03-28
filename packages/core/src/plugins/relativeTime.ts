import { localizeNumber } from '../utils/helpers';
import type { BSDayPlugin, BSDayPluginHost, LocaleType } from '../types';

const L = {
  en: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
  ne: {
    future: '%s पछि',
    past: '%s अघि',
    s: 'केही सेकेन्ड',
    m: 'एक मिनेट',
    mm: '%d मिनेट',
    h: 'एक घण्टा',
    hh: '%d घण्टा',
    d: 'एक दिन',
    dd: '%d दिन',
    M: 'एक महिना',
    MM: '%d महिना',
    y: 'एक वर्ष',
    yy: '%d वर्ष',
  },
} as const;

type RelativeTimeLocale = keyof typeof L;
type RelativeTimePhraseKey = keyof typeof L.en;
type RelativeTimeComparable = {
  toAD(): Date;
};

interface RelativeTimeInstance extends RelativeTimeComparable {
  _locale?: LocaleType;
  constructor: new () => RelativeTimeInstance;
  from(other: RelativeTimeComparable, withoutSuffix?: boolean, locale?: RelativeTimeLocale): string;
  to(other: RelativeTimeComparable, withoutSuffix?: boolean, locale?: RelativeTimeLocale): string;
  diffInMs(other: RelativeTimeComparable): number;
}

type RelativeTimePrototype = BSDayPluginHost['prototype'] & {
  fromNow?: (this: RelativeTimeInstance, withoutSuffix?: boolean) => string;
  toNow?: (this: RelativeTimeInstance, withoutSuffix?: boolean) => string;
  from?: (
    this: RelativeTimeInstance,
    other: RelativeTimeComparable,
    withoutSuffix?: boolean,
    locale?: RelativeTimeLocale,
  ) => string;
  to?: (
    this: RelativeTimeInstance,
    other: RelativeTimeComparable,
    withoutSuffix?: boolean,
    locale?: RelativeTimeLocale,
  ) => string;
  diffInMs?: (this: RelativeTimeInstance, other: RelativeTimeComparable) => number;
};

export const relativeTimePlugin: BSDayPlugin = {
  name: 'relativeTime',
  initialize(host: BSDayPluginHost) {
    const proto = host.prototype as RelativeTimePrototype;

    proto.fromNow = function (this: RelativeTimeInstance, withoutSuffix?: boolean): string {
      const locale = this._locale ?? 'en';
      const now = new this.constructor();
      return this.from(now, withoutSuffix, locale);
    };

    proto.toNow = function (this: RelativeTimeInstance, withoutSuffix?: boolean): string {
      const locale = this._locale ?? 'en';
      const now = new this.constructor();
      return this.to(now, withoutSuffix, locale);
    };

    proto.from = function (
      this: RelativeTimeInstance,
      other: RelativeTimeComparable,
      withoutSuffix?: boolean,
      locale: RelativeTimeLocale = 'en',
    ): string {
      return formatRelative(this.diffInMs(other), withoutSuffix, false, locale);
    };

    proto.to = function (
      this: RelativeTimeInstance,
      other: RelativeTimeComparable,
      withoutSuffix?: boolean,
      locale: RelativeTimeLocale = 'en',
    ): string {
      return formatRelative(this.diffInMs(other), withoutSuffix, true, locale);
    };

    proto.diffInMs = function (this: RelativeTimeInstance, other: RelativeTimeComparable): number {
      return this.toAD().getTime() - other.toAD().getTime();
    };
  },
};

function formatRelative(
  diffMs: number,
  withoutSuffix: boolean | undefined,
  isTo: boolean,
  locale: RelativeTimeLocale,
): string {
  const absDiff = Math.abs(diffMs);
  const seconds = absDiff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30; // Approximation
  const years = days / 365;

  const loc = L[locale] ?? L.en;

  let unitKey: RelativeTimePhraseKey = 's';
  let value = 0;

  if (seconds < 45) {
    unitKey = 's';
  } else if (minutes < 45) {
    value = Math.round(minutes);
    unitKey = value === 1 ? 'm' : 'mm';
  } else if (hours < 22) {
    value = Math.round(hours);
    unitKey = value === 1 ? 'h' : 'hh';
  } else if (days < 26) {
    value = Math.round(days);
    unitKey = value === 1 ? 'd' : 'dd';
  } else if (months < 11) {
    value = Math.round(months);
    unitKey = value === 1 ? 'M' : 'MM';
  } else {
    value = Math.round(years);
    unitKey = value === 1 ? 'y' : 'yy';
  }

  const result = loc[unitKey].replace('%d', localizeNumber(value, locale));

  if (withoutSuffix) return result;

  const past = diffMs < 0;
  const suffixKey: 'future' | 'past' = isTo ? (past ? 'future' : 'past') : (past ? 'past' : 'future');
  return loc[suffixKey].replace('%s', result);
}
