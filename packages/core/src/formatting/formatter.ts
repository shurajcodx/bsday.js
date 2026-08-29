import type { BSDate, CalendarType, FormatTokenResolver, LocaleType } from '../types';

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatDate(
  pattern: string,
  calendar: CalendarType,
  ad: Date,
  bs: BSDate,
  tokens: Record<string, FormatTokenResolver>,
  locale: LocaleType,
): string {
  const tokenList = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const tokenPattern = tokenList.map(escapeRegex).join('|');
  const regex = new RegExp(`\\[([^\\]]+)\\]|(${tokenPattern})`, 'g');

  return pattern.replace(regex, (match, escapedLiteral, token) => {
    if (escapedLiteral !== undefined) {
      return escapedLiteral;
    }

    const resolver = tokens[token];
    if (!resolver) {
      return match;
    }

    return resolver({ calendar, locale, ad, bs });
  });
}

