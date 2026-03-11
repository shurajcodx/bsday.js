# @bsday/dataset

Bikram Sambat (BS) calendar dataset keyed by `YYYY-MM-DD`, including **tithi, nakshatra, yoga, karana, festivals, events, and holiday info**.
Supports **dynamic Nepali translations** for all core fields.

---

## Features

* **BS date keyed dataset**: Access any date from 2000–2089.
* **English & Nepali support**: Includes `dataset` (English) and `datasetNepali`.
* **TypeScript ready**: Types exported for safer usage.
* **Complete dataset**: All dates include tithi, nakshatra, yoga, karana, festivals, events, and holiday info.

---

## Schema

```ts
interface BSDayData {
  tithi: string;        // Lunar day
  festivals: string[];  // Religious/cultural festivals (Dashain, Tihar, Holi, etc.)
  events: string[];     // Secular/cultural observances (Women's Day, Labour Day, etc.)
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
# or
pnpm add @bsday/dataset
# or
yarn add @bsday/dataset
```

---

## Usage

```ts
import { dataset, datasetNepali, BSDayData } from '@bsday/dataset';

// English dataset
const englishDay: BSDayData = dataset['2082-11-24'];
console.log(englishDay.tithi);      // "Panchami"
console.log(englishDay.festivals);  // ["Nari Divas"]
console.log(englishDay.isHoliday);  // true/false

// Nepali dataset (dynamic translation)
const nepaliDay: BSDayData = datasetNepali['2082-11-24'];
console.log(nepaliDay.tithi);       // "पञ्चमी"
console.log(nepaliDay.festivals);   // ["नारी दिवस"]
console.log(nepaliDay.isHoliday);   // true/false
```

* `dataset` → English names
* `datasetNepali` → Nepali translations (tithi, nakshatra, yoga, karana, festivals, events, isHoliday)

---

## Notes

* Dataset coverage: **BS 2000–2089**.
* Fully typed for **TypeScript** users.
* Includes **all known festivals, events, and public holidays**.

---

## Type Exports

```ts
import type { BSDayData, BSDayDataset } from '@bsday/dataset';
```

* `BSDayData` → type for a single day
* `BSDayDataset` → type for the entire dataset

---

## Examples

### Get all festivals on a date

```ts
const festivalsToday = dataset['2082-11-24'].festivals;
console.log(festivalsToday); // ["Nari Divas"]
```

### Check if a date is a public holiday

```ts
const isHoliday = dataset['2082-11-24'].isHoliday;
console.log(isHoliday); // true/false
```
