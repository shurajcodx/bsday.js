import type { BSDayData, BSDayDataset } from './types/bsday';
import {
  TITHI_NE,
  PAKSHA_NE,
  NAKSHATRA_NE,
  YOGA_NE,
  KARANA_NE,
  FESTIVAL_NE,
  EVENT_NE,
} from './data/translation';

const convertDayToNepali = (day: BSDayData): BSDayData => {
  return {
    ...day,
    tithi: TITHI_NE[day.tithi] ?? day.tithi,
    paksha: PAKSHA_NE[day.paksha] ?? day.paksha,
    nakshatra: NAKSHATRA_NE[day.nakshatra] ?? day.nakshatra,
    yoga: YOGA_NE[day.yoga] ?? day.yoga,
    karana: KARANA_NE[day.karana] ?? day.karana,
    festivals: (day.festivals ?? []).map((f) => FESTIVAL_NE[f] ?? f),
    events: (day.events ?? []).map((e) => EVENT_NE[e] ?? e),
  };
};

const convertDatasetToNepali = (dataset: BSDayDataset): BSDayDataset => {
  const newDataset: BSDayDataset = {};

  for (const date in dataset) {
    newDataset[date] = convertDayToNepali(dataset[date]);
  }
  return newDataset;
};

export { convertDayToNepali, convertDatasetToNepali };
