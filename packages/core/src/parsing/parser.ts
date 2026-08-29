import type { BSDate, CalendarType } from '../types';
import { MONTHS_AD, MONTHS_AD_NE, MONTHS_NEPALI, MONTHS_NEPALI_NE } from '../utils/constants';
import { createNepalDate } from '../utils/helpers';
import { isValidADDate, isValidBSDate } from '../utils/validation';

interface ParsedDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface ParsedBSDateTime extends BSDate {
  hour: number;
  minute: number;
  second: number;
}

const NEPALI_TO_ENGLISH_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

const TOKEN_PARTS: Record<string, string> = {
  YYYY: '(\\d{4})',
  YY: '(\\d{2})',
  MM: '(\\d{2})',
  M: '(\\d{1,2})',
  DD: '(\\d{2})',
  D: '(\\d{1,2})',
  HH: '(\\d{2})',
  mm: '(\\d{2})',
  ss: '(\\d{2})',
  MMM: '([^\\s\\d]+)',
  MMMM: '([^\\s\\d]+)',
};

const TOKENS = Object.keys(TOKEN_PARTS).sort((a, b) => b.length - a.length);

function escapeRegex(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDigits(value: string): string {
  return value.replace(/[०-९]/g, (digit) => NEPALI_TO_ENGLISH_DIGITS[digit]!);
}

function normalizeLabel(value: string): string {
  return normalizeDigits(value).trim().toLowerCase();
}

function monthNameToIndex(label: string, calendar: CalendarType): number {
  const collections =
    calendar === 'ad' ? [MONTHS_AD, MONTHS_AD_NE] : [MONTHS_NEPALI, MONTHS_NEPALI_NE];
  const normalized = normalizeLabel(label);

  for (const collection of collections) {
    const fullMatch = collection.findIndex((item) => normalizeLabel(item) === normalized);
    if (fullMatch >= 0) {
      return fullMatch + 1;
    }

    const shortMatch = collection.findIndex((item) => normalizeLabel(item).startsWith(normalized));
    if (shortMatch >= 0) {
      return shortMatch + 1;
    }
  }
  return -1;
}

export function parseDate(
  input: string,
  pattern: string,
  calendar: CalendarType,
): Date | ParsedBSDateTime {
  const usedTokens: string[] = [];
  const normalizedInput = normalizeDigits(input);

  let regex = '^';
  for (let i = 0; i < pattern.length; ) {
    let matchedToken: string | undefined;

    for (const token of TOKENS) {
      if (pattern.startsWith(token, i)) {
        matchedToken = token;
        break;
      }
    }

    if (matchedToken) {
      regex += TOKEN_PARTS[matchedToken]!;
      usedTokens.push(matchedToken);
      i += matchedToken.length;
      continue;
    }

    regex += escapeRegex(pattern[i]!);
    i += 1;
  }

  regex += '$';

  const matches = normalizedInput.match(new RegExp(regex, 'u'));
  if (!matches) {
    throw new Error(`Input "${input}" does not match pattern "${pattern}".`);
  }

  const values = matches.slice(1);

  const parsed: ParsedDateTimeParts = {
    year: new Date().getUTCFullYear(),
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
  };

  values.forEach((value, index) => {
    const token = usedTokens[index]!;

    if (token === 'YYYY') {
      parsed.year = Number(value);
      return;
    }

    if (token === 'YY') {
      parsed.year = 2000 + Number(value);
      return;
    }

    if (token === 'M' || token === 'MM') {
      parsed.month = Number(value);
      return;
    }

    if (token === 'MMM' || token === 'MMMM') {
      const month = monthNameToIndex(value, calendar);
      if (month < 1) {
        throw new Error(`Unknown month label "${value}".`);
      }
      parsed.month = month;
      return;
    }

    if (token === 'D' || token === 'DD') {
      parsed.day = Number(value);
      return;
    }

    if (token === 'HH') {
      parsed.hour = Number(value);
      return;
    }

    if (token === 'mm') {
      parsed.minute = Number(value);
      return;
    }

    if (token === 'ss') {
      parsed.second = Number(value);
    }
  });

  if (
    parsed.hour < 0 ||
    parsed.hour > 23 ||
    parsed.minute < 0 ||
    parsed.minute > 59 ||
    parsed.second < 0 ||
    parsed.second > 59
  ) {
    throw new RangeError(`Invalid time ${parsed.hour}:${parsed.minute}:${parsed.second}.`);
  }

  if (calendar === 'ad') {
    if (!isValidADDate(parsed.year, parsed.month, parsed.day)) {
      throw new RangeError(`Invalid AD date ${parsed.year}-${parsed.month}-${parsed.day}.`);
    }
    return createNepalDate(
      parsed.year,
      parsed.month,
      parsed.day,
      parsed.hour,
      parsed.minute,
      parsed.second,
    );
  }

  if (!isValidBSDate(parsed.year, parsed.month, parsed.day)) {
    throw new RangeError(`Invalid BS date ${parsed.year}-${parsed.month}-${parsed.day}.`);
  }

  return {
    year: parsed.year,
    month: parsed.month,
    day: parsed.day,
    hour: parsed.hour,
    minute: parsed.minute,
    second: parsed.second,
  };
}
