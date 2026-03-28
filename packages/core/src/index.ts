import { BSDay } from './core/BSDay';
import { relativeTimePlugin } from './plugins/relativeTime';
import { pluginSystem } from './core/pluginSystem';
import type { BSDayInput, BSDate, BSDayFactoryLike, BSDayPlugin } from './types';

export { BSDay };

export interface BSDayFactory extends BSDayFactoryLike {
  bsday: BSDayFactory;
  relativeTimePlugin: typeof relativeTimePlugin;
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
bsdayFactory.BSDay = BSDay;
bsdayFactory.bsday = bsdayFactory;
bsdayFactory.relativeTimePlugin = relativeTimePlugin;

export const bsday = bsdayFactory;

export default bsday;

export { relativeTimePlugin };
export type {
  BSDate,
  BSDayFactoryLike,
  BSDayData,
  BSDayInput,
  BSDayInputBS,
  BSDayPlugin,
  BSDayPluginHost,
  CalendarType,
  FormatTokenResolver,
  LocaleType,
} from './types';
