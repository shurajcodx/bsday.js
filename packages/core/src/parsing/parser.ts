import type { BSDate, CalendarType } from '../types';
import { MONTHS_AD, MONTHS_NEPALI } from '../utils/constants';
import { isValidADDate, isValidBSDate } from '../utils/validation';

interface ParsedDateParts {
  year: number;
  month: number;
  day: number;
}

const TOKEN_PARTS: Record<string, string> = {
  YYYY: '(\\d{4})',
  YY: '(\\d{2})',
  MM: '(\\d{2})',
  M: '(\\d{1,2})',
  DD: '(\\d{2})',
  D: '(\\d{1,2})',
  MMM: '([A-Za-z]{3})',
  MMMM: '([A-Za-z]+)',
};

const TOKENS = Object.keys(TOKEN_PARTS).sort((a, b) => b.length - a.length);

function escapeRegex(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function monthNameToIndex(label: string, calendar: CalendarType): number {
  const collection = calendar === 'ad' ? MONTHS_AD : MONTHS_NEPALI;
  const normalized = label.toLowerCase();

  const fullMatch = collection.findIndex((item) => item.toLowerCase() === normalized);
  if (fullMatch >= 0) {
    return fullMatch + 1;
  }

  const shortMatch = collection.findIndex((item) => item.toLowerCase().startsWith(normalized));
  return shortMatch >= 0 ? shortMatch + 1 : -1;
}

export function parseDate(input: string, pattern: string, calendar: CalendarType): Date | BSDate {
  const usedTokens: string[] = [];

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

  const matches = input.match(new RegExp(regex));
  if (!matches) {
    throw new Error(`Input "${input}" does not match pattern "${pattern}".`);
  }

  const values = matches.slice(1);

  const parsed: ParsedDateParts = {
    year: new Date().getUTCFullYear(),
    month: 1,
    day: 1,
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
    }
  });

  if (calendar === 'ad') {
    if (!isValidADDate(parsed.year, parsed.month, parsed.day)) {
      throw new RangeError(`Invalid AD date ${parsed.year}-${parsed.month}-${parsed.day}.`);
    }
    return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  }

  if (!isValidBSDate(parsed.year, parsed.month, parsed.day)) {
    throw new RangeError(`Invalid BS date ${parsed.year}-${parsed.month}-${parsed.day}.`);
  }

  return {
    year: parsed.year,
    month: parsed.month,
    day: parsed.day,
  };
}
