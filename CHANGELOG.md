# Changelog

## [1.1.1] - 2026-08-30

### 🐛 Bug Fixes & Packaging Improvements

#### @bsday.js/dataset

- **Fix Browser `fileURLToPath` Runtime Error**: Removed `--shims` and multi-entry chunk-splitting in `tsup`, completely eliminating `import { fileURLToPath } from 'url'` from all browser-facing bundles (`@bsday.js/dataset`, `@bsday.js/dataset/all`, `@bsday.js/dataset/month-data`).
- **Clean Standalone Bundles**: Bundled each subpath entry into isolated, self-contained files (`dist/index.js`, `dist/all.js`, `dist/monthData.js`, `dist/panchang-engine.js`) without intermediate runtime chunks.
- **Node Addon Isolation**: Externalized `swisseph-v2` and Node built-in modules (`path`, `fs`, `url`) to prevent native loader inlining.

#### @bsday.js/core

- **Fix CommonJS Named Exports**: Fixed CJS export footer with `Object.assign(module.exports.default, module.exports)`, enabling both callable default usage (`const bsday = require('@bsday.js/core')`) and destructured named exports (`const { isValidBSDate, BSDay, getBsMonthDays } = require('@bsday.js/core')`).
- **Clean Zero-Shim Build**: Removed unnecessary `--shims` flag for pure zero-dependency calendar math.

#### CI & Tooling

- **Pre-Publish Multi-Format Dist Verification**: Added `scripts/check-dist.mjs` and `pnpm run check:dist` to automatically validate all CJS, ESM, and browser sandbox imports before publishing.
- **Package Integrity & TypeScript Export Verification**: Integrated `publint` and `@arethetypeswrong/cli` (`attw`) into automated CI/Publish workflows (`pnpm run check:exports`).

---

## [1.1.0] - 2026-08-29

### 🚀 @bsday.js/core

- **Dual-Calendar Engine**: Full Day.js API parity with bidirectional Bikram Sambat (BS) and Gregorian (AD) conversions.
- **Nepali Fiscal Year (आर्थिक वर्ष) Engine**:
  - Support for `short` (`"2081/82"`), `full` (`"2081/2082"`), and `extended` (`"FY 2081/82"` / `"आ.व. २०८१/८२"`) formats.
  - Added `fiscalQuarter()` for quarterly tax and financial quarters (Q1: Shrawan–Ashwin, etc.).
  - Added unit bounds support for `startOf('fiscalYear')` and `endOf('fiscalYear')`.
- **KYC Chronological Age Calculation**:
  - Accurate calculation of years, months, and days with `age()`, `formatAge()`, and `isAdult(threshold)`.
- **Headless Calendar Matrix**:
  - Added `getCalendarMatrix()` producing a 42-cell 6×7 grid for building custom DatePickers and UI calendars.
- **Validation & Form Schema Support**:
  - Exported `isValidBSDate()`, `isValidADDate()`, `isBsLeapYear()`, and `validateBSDateString()` for direct integration with Zod, Yup, and React Hook Form.
- **Plugin System & Relative Time**:
  - Added plugin architecture with built-in `relativeTimePlugin` and `fiscalYearPlugin`.
- **Modern Packaging**:
  - Zero runtime dependencies with bundle size < 5KB.
  - Complete dual CommonJS (`.cjs` + `.d.cts`) and ESM (`.js` + `.d.ts`) exports with 100% `publint` and `attw` compatibility.

### 🕉️ @bsday.js/dataset

- **111-Year Astronomical Dataset (1990–2100 BS / 40,543 days)**:
  - 100% verified dataset with zero `Unknown` fields across the entire 111-year range.
- **Vedic Panchang Elements**:
  - High-precision sidereal Lahiri calculations for _Tithi_, _Paksha_, _Nakshatra_, _Yoga_, and _Karana_.
- **Nepali Cultural & Holiday Parity**:
  - Accurate multi-day public holiday blocks (Dashain 6-day continuous block, Tihar 4-day block).
  - Accurate lunar calculation for Teej, Dar Khane Din, Jitiya, Krishna Janmashtami, Janai Purnima, etc.
- **Dual Language Support**:
  - Instant Devanagari (नेपाली) localization via `datasetNepali` and `convertDayToNepali()`.
- **Modular Subpath Exports**:
  - Optimized tree-shakeable entries: `@bsday.js/dataset`, `@bsday.js/dataset/all`, `@bsday.js/dataset/month-data`, and `@bsday.js/dataset/panchang-engine`.

---

## [1.0.0] - 2026-08-25

### Added

- Initial release of BSDay dual-calendar JavaScript/TypeScript library.
- Basic BS ↔ AD date conversion and arithmetic.
- Core dataset with festival and holiday definitions for recent years.
