import rawDataset from './data/dataset.json';
import type { BSDayDataset, BSDayData } from './types/bsday';
import { convertDatasetToNepali } from './convert-to-nepali';

const dataset = rawDataset as BSDayDataset;
const datasetNepali = convertDatasetToNepali(dataset);

export {
    dataset,
    datasetNepali
}

export * from './monthData';
export * from './festival-engine.js';
export * from './types/festival.js';

export type { BSDayDataset, BSDayData }
