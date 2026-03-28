import { BSDay } from './core/BSDay';
import type { BSDayInput, BSDate } from './types';

export { BSDay };

export interface BSDayFactory {
  (input?: BSDayInput): BSDay;
  bs(bs: string | BSDate): BSDay;
  bs(year: number, month: number, day: number): BSDay;
  ad(ad: Date): BSDay;
  now(): number;
  extend(plugin: any): void; // Adding extend to the factory
  BSDay: typeof BSDay;
}

import { pluginSystem } from './core/pluginSystem';

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
bsdayFactory.extend = (plugin: any, options?: any) =>
  pluginSystem.extend(plugin, BSDay as any, bsdayFactory, options);
bsdayFactory.BSDay = BSDay;

export const bsday = bsdayFactory;

export default bsday;

export { relativeTimePlugin } from './plugins/relativeTime';
export type {
  BSDate,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayPlugin,
  CalendarType,
  FormatTokenResolver,
  LocaleType,
} from './types';
