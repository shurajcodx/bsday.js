# bsday.js Technical Documentation (Monorepo + Dataset)

**Library Name:** bsday.js
**Purpose:** Modern dual-calendar date library supporting **Bikram Sambat (BS)** and **AD (Gregorian)** with a **JavaScript Date-like API**, formatting engine, parsing engine, plugin architecture, and optional dataset for tithi, festivals, and Panchang.

---

## 1. Technology Stack

| Tool          | Purpose               |
| ------------- | --------------------- |
| TypeScript    | Type-safe development |
| ESLint        | Code linting          |
| Prettier      | Code formatting       |
| Vitest / Jest | Unit testing          |
| Rollup / tsup | Library bundling      |
| pnpm          | Monorepo management   |

**Target Environment:** Node.js, Browser, TypeScript / JavaScript projects

**Output Formats:** ESM, CommonJS, Type Definitions

---

## 2. Monorepo Structure (pnpm Workspaces)

```text
bsday-monorepo/
├─ packages/
│  ├─ core/                # @bsday.js/core
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ core/BSDay.ts
│  │  │  ├─ converters/adToBs.ts
│  │  │  ├─ converters/bsToAd.ts
│  │  │  ├─ formatting/formatter.ts
│  │  │  ├─ formatting/formatTokens.ts
│  │  │  ├─ parsing/parser.ts
│  │  │  ├─ plugins/PluginManager.ts
│  │  │  └─ utils/{validation.ts, constants.ts, helpers.ts}
│  │  ├─ tests/
│  │  └─ package.json
│  │
│  ├─ dataset/             # @bsday.js/dataset
│  │  ├─ src/index.ts
│  │  ├─ src/data/1970-2100.json
│  │  ├─ types/index.ts
│  │  └─ package.json
│  │
│  └─ plugins/             # Optional external plugins
│     ├─ nepali-number/
│     └─ holidays/
│
├─ package.json
└─ pnpm-workspace.yaml
```

**pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

---

## 3. Core Architecture

* **BSDay Class:** Stores **internal AD date**, converts to BS dynamically.
* **Dataset (@bsday.js/dataset):** Optional day-data package providing **tithi, festivals, Panchang**.
* **Plugins:** Extend BSDay prototype, static helpers, or formatting tokens.

**Internal Flow:**

```
BSDay instance
├─ internalDate (AD)
├─ dataset lookup (BS date → tithi, festivals, Panchang)
├─ converters (AD ↔ BS)
├─ formatter / parser
└─ plugin manager
```

---

## 4. Dataset Structure

### 4.1 Day Entry (per BS date)

```ts
export interface BSDayData {
  tithi: string        // Lunar day
  festivals: string[]  // Festivals on this day
  nakshatra: string    // Nakshatra
  yoga: string         // Yoga
  karana: string       // Karana
}
```

### 4.2 Example Entry

```json
"2082-12-01": {
  "tithi": "Pratipada",
  "festivals": ["Holi"],
  "nakshatra": "Chitra",
  "yoga": "Shukla",
  "karana": "Bava"
}
```

✅ Notes:

* **No AD duplication** → smaller dataset, faster lookup
* **No weekday** → calculated dynamically in core
* **O(1) lookup** using `"YYYY-MM-DD"` key
* Supports **tithi, festivals, Panchang, lunar info**

---

## 5. Core BSDay Class (@bsday.js/core)

### Constructor

```ts
new BSDay()
new BSDay(Date)
new BSDay(string)
new BSDay({ bs: [year, month, day] })
```

### Access Dataset

```ts
import { dataset } from '@bsday.js/dataset'

class BSDay {
  static setDataset(data) {
    datasetManager.setDataset(data)
  }

  data() {
    return this.lookupDatasetEntry()
  }

  get tithi() { return this.lookupDatasetEntry()?.tithi ?? null }
  get festivals() { return [...(this.lookupDatasetEntry()?.festivals ?? [])] }
  get events() { return [...(this.lookupDatasetEntry()?.events ?? [])] }
  get isHoliday() { return this.lookupDatasetEntry()?.isHoliday ?? false }
}
```

* Dataset-backed access is **opt-in** via `BSDay.setDataset(dataset)`
* Weekday is **calculated dynamically** from internal AD date

---

## 6. Formatting Engine

* `formatter.ts` + `formatTokens.ts`
* Supports `YYYY, YY, MM, MMM, MMMM, DD, dddd` etc.
* Users can specify **calendar type** (`bs` | `ad`)

---

## 7. Parsing Engine

* Converts strings → BSDay instances
* Example:

```ts
BSDay.parse('2082-12-01', 'YYYY-MM-DD', 'bs')
```

---

## 8. Date Arithmetic & Comparison

Methods:

* `add(value, unit, calendar?)`
* `subtract(value, unit, calendar?)`
* `isBefore()`, `isAfter()`, `isSame()`, `diff()`

Operations return **new BSDay instances (immutable)**

---

## 9. Plugin System

* Plugin interface:

```ts
export interface BSDayPlugin {
  name: string
  initialize(bsday: typeof BSDay): void
}
```

* Register plugin:

```ts
BSDay.use(plugin)
```

* Example plugin: **Nepali numerals**

---

## 10. TypeScript Types

```ts
export type CalendarType = 'bs' | 'ad'

export interface BSDate {
  year: number
  month: number
  day: number
}

export interface BSDayData {
  tithi: string
  festivals: string[]
  nakshatra: string
  yoga: string
  karana: string
}
```

---

## 11. Testing Strategy

* Conversion accuracy
* Dataset lookup (tithi, festivals, Panchang)
* Formatting & parsing
* Arithmetic & comparison
* Plugins

Tools: **Vitest / Jest**

---

## 12. Build System & Development

* Bundler: **tsup / Rollup**
* Output: `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts`

**Commands**

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm -r lint
```

---

## 13. Benefits of This Architecture

* **Fast API calls** → dataset optimized, no AD duplication
* **Extensible plugin-friendly architecture**
* **Monorepo ready** → core, dataset, plugins separated
* **Full BS info** → tithi, festivals, Panchang
