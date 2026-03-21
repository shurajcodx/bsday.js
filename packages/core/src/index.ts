import { BSDay } from './core/BSDay';
import type { BSDayInput, BSDate } from './types';

export { BSDay };

export interface BSDayFactory {
  (input?: BSDayInput): BSDay;
  bs(bs: string | BSDate): BSDay;
  ad(ad: Date): BSDay;
  now(): number;
  extend(plugin: any): void; // Adding extend to the factory
  BSDay: typeof BSDay;
}

import { pluginSystem } from './core/pluginSystem';

const bsdayFactory = ((input?: BSDayInput) => new BSDay(input)) as BSDayFactory;

bsdayFactory.bs = (bs: string | BSDate) => BSDay.fromBS(bs);
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
