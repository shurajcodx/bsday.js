import rawDataset from './data/dataset.json';
import type { BSDayDataset, BSDayData } from './types/bsday';
import { convertDatasetToNepali } from './convert-to-nepali';

/**
 * 111-Year (1990–2100 BS) verified Nepali calendar & astronomical Panchang dataset in English.
 */
export const dataset = rawDataset as BSDayDataset;

/**
 * 111-Year (1990–2100 BS) verified Nepali calendar & astronomical Panchang dataset localized in authentic Devanagari (नेपाली).
 */
export const datasetNepali = convertDatasetToNepali(dataset);

export default dataset;
export type { BSDayDataset, BSDayData };
