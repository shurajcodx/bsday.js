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
  const tokenRegex = new RegExp(tokenList.map(escapeRegex).join('|'), 'g');

  return pattern.replace(tokenRegex, (token) => {
    const resolver = tokens[token];
    if (!resolver) {
      return token;
    }

    return resolver({ calendar, locale, ad, bs });
  });
}
