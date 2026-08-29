import type { BSDayData, BSDate } from '../types';
import { buildBsKey } from '../utils/helpers';

let datasetStore: Record<string, BSDayData> = {};

export const datasetManager = {
  getDataset(): Record<string, BSDayData> {
    return datasetStore;
  },

  setDataset(dataset: Record<string, BSDayData>): void {
    datasetStore = dataset;
  },

  addDataset(dataset: Record<string, BSDayData>): void {
    datasetStore = { ...datasetStore, ...dataset };
  },

  registerYear(year: number, dataset: Record<string, BSDayData>): void {
    datasetStore = { ...datasetStore, ...dataset };
  },


  lookupEntry(bs: BSDate): BSDayData | null {
    const strictKey = buildBsKey(bs);
    const strict = datasetStore[strictKey];
    if (strict) {
      return strict;
    }

    // Allow non-padded keys too (e.g. 2082-1-1) to keep manual dataset edits ergonomic.
    const looseKey = `${bs.year}-${bs.month}-${bs.day}`;
    return datasetStore[looseKey] ?? null;
  },
};
