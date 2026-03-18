# @bsday/dataset

Bikram Sambat (BS) calendar dataset and engine, including **tithi, paksha, nakshatra, yoga, karana, festivals, events, and holiday info**.

Supports **dynamic Nepali translations** for all core fields and provides astronomical engines for on-the-fly calculations.

---

## Features

* **BS date keyed dataset**: Access any date from 2000–2090.
* **Panchang Engine**: High-level astronomical engine for Tithi, Nakshatra, etc.
* **Festival Engine**: Advanced rule-based festival generator (Sunrise, Sunset, Night, Relative rules).
* **English & Nepali support**: Includes `dataset` (English) and `datasetNepali`.
* **TypeScript ready**: Fully typed interfaces for all data and engines.

---

## Schema

```ts
interface BSDayData {
  tithi: string;        // Lunar day (Pratipada, Dvitiya, etc.)
  paksha: string;       // Lunar phase (Shukla, Krishna)
  festivals: string[];  // Religious/cultural festivals (Dashain, Tihar, Holi, etc.)
  events: string[];     // Secular/cultural observances (Women's Day, Sankranti, etc.)
  isHoliday: boolean;   // True if it's a public/government holiday
  nakshatra: string;    // Lunar mansion
  yoga: string;         // Astrological yoga
  karana: string;       // Half-lunar day
}

type BSDayDataset = Record<string, BSDayData>;
```

---

## Installation

```bash
npm install @bsday/dataset
```

---

## Basic Usage

```ts
import { dataset, datasetNepali, BSDayData } from '@bsday/dataset';

// English dataset
const day: BSDayData = dataset['2081-06-25'];
console.log(day.tithi);      // "Navami"
console.log(day.festivals);  // ["Vijaya Dashami"]
console.log(day.isHoliday);  // true

// Nepali dataset
const nepaliDay = datasetNepali['2081-06-25'];
console.log(nepaliDay.tithi); // "नवमी"
```

---

## Advanced: Engines

The package exports robust engines for astronomical and calendrical calculations.

### Panchang Engine
Calculate astronomical data for any date/time using the Swiss Ephemeris.

```ts
import { PanchangEngine } from '@bsday/dataset';

const date = new Date('2024-10-12');
const panchang = PanchangEngine.computePanchang(date);

console.log(panchang.tithi); // "Dashami"
console.log(panchang.paksha); // "Shukla"
```

### Festival Engine
Generate festivals based on complex rules including Sunrise, Sunset, Night, and Relative rules.

```ts
import { FestivalEngine, FestivalRule } from '@bsday/dataset';

const rules: FestivalRule[] = [...]; // Your festival rules
const engine = new FestivalEngine();
const results = engine.computeFestivals(yearData, rules, overrides);
```

---

## Dataset Coverage
* Coverage: **BS 2000–2090**.
* Includes **all major Nepali festivals** (Dashain, Tihar, Shivaratri, etc.) accurately calculated using rule-based timing.
