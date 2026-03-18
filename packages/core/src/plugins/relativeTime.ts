import { localizeNumber } from '../utils/helpers';
import type { BSDayPlugin, BSDayPluginHost } from '../types';

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
};

export const relativeTimePlugin: BSDayPlugin = {
  name: 'relativeTime',
  initialize(host: BSDayPluginHost) {
    const proto = host.prototype as any;

    proto.fromNow = function (withoutSuffix?: boolean): string {
      const locale = (this as any)._locale || 'en';
      const now = new (this.constructor)();
      return this.from(now, withoutSuffix, locale);
    };

    proto.toNow = function (withoutSuffix?: boolean): string {
      const locale = (this as any)._locale || 'en';
      const now = new (this.constructor)();
      return this.to(now, withoutSuffix, locale);
    };

    proto.from = function (other: any, withoutSuffix?: boolean, locale = 'en'): string {
      return formatRelative(this.diffInMs(other), withoutSuffix, false, locale);
    };

    proto.to = function (other: any, withoutSuffix?: boolean, locale = 'en'): string {
      return formatRelative(this.diffInMs(other), withoutSuffix, true, locale);
    };

    proto.diffInMs = function (other: any): number {
      return this.toAD().getTime() - other.toAD().getTime();
    };
  },
};

function formatRelative(
  diffMs: number,
  withoutSuffix: boolean | undefined,
  isTo: boolean,
  locale: string,
): string {
  const absDiff = Math.abs(diffMs);
  const seconds = absDiff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30; // Approximation
  const years = days / 365;

  const loc = (L as any)[locale] || L.en;

  let unitKey = 's';
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

  let result = loc[unitKey].replace('%d', localizeNumber(value, locale));

  if (withoutSuffix) return result;

  const past = diffMs < 0;
  const suffixKey = isTo ? (past ? 'future' : 'past') : (past ? 'past' : 'future');
  return loc[suffixKey].replace('%s', result);
}
