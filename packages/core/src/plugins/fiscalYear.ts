import type { BSDayPlugin, BSDayPluginHost, FiscalYearFormat, LocaleType } from '../types';
import { localizeNumber, pad } from '../utils/helpers';

export interface FiscalYearMethods {
  fiscalYear(format?: FiscalYearFormat, locale?: LocaleType): string;
  fiscalYearNumber(): number;
  fiscalQuarter(): number;
}

export const fiscalYearPlugin: BSDayPlugin = {
  name: 'fiscalYear',
  initialize(host: BSDayPluginHost) {
    const proto = host.prototype as unknown as {
      toBS(): { year: number; month: number; day: number };
      _locale?: LocaleType;
      fiscalYear(format?: FiscalYearFormat, locale?: LocaleType): string;
      fiscalYearNumber(): number;
      fiscalQuarter(): number;
    };

    proto.fiscalYearNumber = function (): number {
      const bs = this.toBS();
      return bs.month >= 4 ? bs.year : bs.year - 1;
    };

    proto.fiscalQuarter = function (): number {
      const bs = this.toBS();
      if (bs.month >= 4 && bs.month <= 6) return 1;
      if (bs.month >= 7 && bs.month <= 9) return 2;
      if (bs.month >= 10 && bs.month <= 12) return 3;
      return 4; // Months 1, 2, 3 (Baisakh, Jestha, Ashadh)
    };

    proto.fiscalYear = function (format: FiscalYearFormat = 'short', locale?: LocaleType): string {
      const loc = locale ?? this._locale ?? 'en';
      const startYear = this.fiscalYearNumber();
      const endYear = startYear + 1;
      const end2Digit = pad(endYear % 100);

      let result = '';
      if (format === 'full') {
        result = `${startYear}/${endYear}`;
      } else if (format === 'extended') {
        result = loc === 'ne' ? `आ.व. ${startYear}/${end2Digit}` : `FY ${startYear}/${end2Digit}`;
      } else {
        // 'short'
        result = `${startYear}/${end2Digit}`;
      }

      return localizeNumber(result, loc);
    };
  },
};
