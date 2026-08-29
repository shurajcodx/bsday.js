import { BSDay } from './core/BSDay';
import { relativeTimePlugin } from './plugins/relativeTime';
import { fiscalYearPlugin } from './plugins/fiscalYear';
import { getCalendarMatrix } from './calendar/calendarGrid';
import { pluginSystem } from './core/pluginSystem';
import { datasetManager } from './core/datasetManager';
import type { BSDayInput, BSDate, BSDayFactoryLike, BSDayPlugin } from './types';

export { BSDay };

/**
 * BSDay Factory interface with helper functions and plugin extension methods.
 */
export interface BSDayFactory extends BSDayFactoryLike {
  /** Create a new BSDay instance */
  (input?: BSDayInput): BSDay;
  /** Create a BSDay instance directly from Bikram Sambat date */
  bs(year: number, month: number, day: number): BSDay;
  bs(bsDate: string | BSDate): BSDay;
  /** Create a BSDay instance from a Gregorian JavaScript Date */
  ad(adDate: Date): BSDay;
  /** Return the current Unix timestamp in milliseconds */
  now(): number;
  /** Extend BSDay with a custom plugin */
  extend(plugin: BSDayPlugin, options?: unknown): void;
  /** Hydrate external Panchang and festival dataset */
  setDataset: typeof BSDay.setDataset;
  /** Dataset manager instance */
  datasetManager: typeof datasetManager;
  /** BSDay class constructor */
  BSDay: typeof BSDay;
  /** Factory alias */
  bsday: BSDayFactory;
  /** Built-in relative time plugin */
  relativeTimePlugin: typeof relativeTimePlugin;
  /** Built-in fiscal year plugin */
  fiscalYearPlugin: typeof fiscalYearPlugin;
  /** Generate headless calendar matrix */
  getCalendarMatrix: typeof getCalendarMatrix;
}

const bsdayFactory = ((input?: BSDayInput) => new BSDay(input)) as BSDayFactory;

bsdayFactory.bs = ((arg1: string | BSDate | number, arg2?: number, arg3?: number) => {
  if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') {
    return BSDay.bs(arg1, arg2, arg3);
  }
  if (typeof arg1 === 'string') {
    return BSDay.bs(arg1);
  }
  if (arg1 && typeof arg1 === 'object') {
    return BSDay.bs(arg1);
  }
  return new BSDay(NaN);
}) as BSDayFactory['bs'];
bsdayFactory.ad = (ad: Date) => BSDay.fromAD(ad);
bsdayFactory.now = () => BSDay.now();
bsdayFactory.extend = (plugin: BSDayPlugin, options?: unknown) =>
  pluginSystem.extend(plugin, BSDay, bsdayFactory, options);
bsdayFactory.setDataset = (dataset) => BSDay.setDataset(dataset);
bsdayFactory.datasetManager = datasetManager;
bsdayFactory.BSDay = BSDay;
bsdayFactory.bsday = bsdayFactory;
bsdayFactory.relativeTimePlugin = relativeTimePlugin;
bsdayFactory.fiscalYearPlugin = fiscalYearPlugin;
bsdayFactory.getCalendarMatrix = getCalendarMatrix;

/**
 * Main BSDay factory instance with Day.js API parity.
 *
 * @example
 * ```ts
 * import bsday from '@bsday.js/core';
 *
 * // Create BS date
 * const d = bsday.bs(2081, 5, 15);
 * console.log(d.format('YYYY/MM/DD')); // "2081/05/15"
 *
 * // Convert to Gregorian AD Date
 * const ad = d.toAD();
 *
 * // Nepali Fiscal Year
 * console.log(d.fiscalYear('extended')); // "FY 2081/82"
 * ```
 */
export const bsday = bsdayFactory;

export default bsday;

export { relativeTimePlugin, fiscalYearPlugin, datasetManager };
export {
  isValidBSDate,
  isValidADDate,
  isLeapYear,
  validateBSDateString,
  type BSDateValidationOptions,
  type BSDateValidationResult,
} from './utils/validation';

export {
  getCalendarMatrix,
  type CalendarCell,
  type CalendarMatrixOptions,
} from './calendar/calendarGrid';

export { getBsMonthDays, getBsYearDays, isBsLeapYear } from './converters/monthData';

export {
  isDateInRange,
  isDateDisabled,
  getDateRange,
  getMonthNames,
  getWeekdayNames,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  type DateDisabledOptions,
} from './calendar/range';

export type {
  BSAge,
  BSDate,
  BSDayFactoryLike,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayObject,
  BSDayPlugin,
  BSDayPluginHost,
  CalendarType,
  DateUnit,
  FiscalYearFormat,
  FormatTokenResolver,
  LocaleType,
} from './types';
