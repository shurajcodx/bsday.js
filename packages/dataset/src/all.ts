import rawDataset from './data/dataset.json';
import type { BSDayDataset, BSDayData } from './types/bsday';
import { convertDatasetToNepali } from './convert-to-nepali';

export const dataset = rawDataset as BSDayDataset;
export const datasetNepali = convertDatasetToNepali(dataset);

export default dataset;
export type { BSDayDataset, BSDayData };
