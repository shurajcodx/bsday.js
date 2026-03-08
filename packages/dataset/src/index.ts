import rawDataset from './data/1970-2100.json';
import rawMetadata from './data/metadata.json';

export interface BSDayData {
  tithi: string;
  festivals: string[];
  nakshatra: string;
  yoga: string;
  karana: string;
}

export type BSDayDataset = Record<string, BSDayData>;

export const dataset = rawDataset as BSDayDataset;
export const metadata = rawMetadata as {
  source: string;
  sourceEndpoint: string;
  generatedAt: string;
  coverage: {
    startYear: number;
    endYear: number;
    keys: number;
  };
  requestedRange?: {
    startYear: number;
    endYear: number;
  };
  quality?: {
    unknownTithiCount: number;
    unknownYogaCount: number;
    unknownKaranaCount: number;
    unknownNakshatraCount: number;
  };
  warnings?: string[];
};

export default dataset;
