interface BSDayData {
  tithi: string; // lunar day
  paksha: string;
  festivals: string[]; // religious/cultural festivals (Dashain, Tihar, Holi, etc.)
  events: string[]; // secular/cultural observances (Women’s Day, Labour Day, etc.)
  isHoliday: boolean; // true if it’s a public/government holiday
  nakshatra: string; // lunar mansion
  yoga: string; // astrological yoga
  karana: string; // half-lunar day
}

type BSDayDataset = Record<string, BSDayData>;

export type { BSDayData, BSDayDataset };
