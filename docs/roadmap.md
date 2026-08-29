# 🗺️ bsday.js — Public Roadmap

**Project:** bsday.js  
**Purpose:** Ultra-fast, zero-dependency Day.js-compatible dual-calendar SDK (Bikram Sambat ↔ Gregorian AD) and Vedic Panchang ecosystem for JavaScript & TypeScript.

---

## 🚀 Shipped Milestones

### ✅ v1.0.0 — Initial Foundation
- **Dual-Calendar Conversion**: High-performance BS ↔ AD conversion engine.
- **Core Day.js API Parity**: `BSDay` class with standard getters, setters, arithmetic (`add`, `subtract`), and comparisons (`isBefore`, `isSameOrAfter`, `isBetween`, `diff`).
- **Formatting & Parsing Engine**: Formatting tokens (`YYYY`, `MMMM`, `DD`, `dddd`, etc.) with dual-calendar and locale support.
- **Plugin Architecture**: Extensible plugin manager via `bsday.extend(plugin)`.

### ✅ v1.1.0 — Enterprise & Fintech Capabilities (Current)
- **Nepali Fiscal Year (आर्थिक वर्ष) Engine**:
  - `short` (`2081/82`), `full` (`2081/2082`), and `extended` (`FY 2081/82` / `आ.व. २०८१/८२`) formats.
  - Tax quarter calculation (`fiscalQuarter()`) and unit bounds (`startOf('fiscalYear')`, `endOf('fiscalYear')`).
- **KYC & Chronological Age Calculation**:
  - `age()`, `formatAge()`, and `isAdult(threshold)` taking into account irregular Bikram Sambat month lengths without day drift.
- **Headless Calendar Matrix**:
  - `getCalendarMatrix()` producing 42-cell 6×7 grids with previous/next month padding and holiday tagging.
- **Form & Schema Validation**:
  - `isValidBSDate()`, `isValidADDate()`, `isBsLeapYear()`, and `validateBSDateString()` for direct Zod / React Hook Form integration.
- **111-Year Astronomical Dataset (`@bsday.js/dataset`)**:
  - 40,543 daily records (1990–2100 BS) with Hamro Patro & Panchang Nirnayak Samiti parity.
  - Sidereal Lahiri calculation for _Tithi_, _Paksha_, _Nakshatra_, _Yoga_, and _Karana_ with zero unknown fields.
  - Continuous multi-day public holiday blocks (Dashain 6 days, Tihar 4 days).
- **Dual-Language Localization**:
  - Seamless English and Devanagari (`locale('ne')` / `datasetNepali`) output.

---

## 🌟 Future Roadmap (v1.2.0+)

### 1. 🎨 UI & Framework Components (`@bsday.js/react` / `@bsday.js/vue`)
- Fully styled and headless accessible Nepali DatePicker components.
- Range picker for date ranges and booking applications.
- Month and Year selector popups with Nepali holiday indicators.

### 2. 🌍 Timezone & Internationalization Enhancements
- First-class timezone plugin (`@bsday.js/plugin-timezone`) with full `Asia/Kathmandu` offset handling.
- Additional ethnic Nepali language locales (Newari / Nepal Bhasa, Maithili, Bhojpuri).

### 3. ⏱️ Advanced Business Day & Workday Calculations
- `addBusinessDays(n)` and `isBusinessDay()` taking into account government public holidays and Saturdays.
- Custom working week configurations (e.g. 5-day vs 6-day work weeks).

### 4. 🧰 CLI Utilities
- `npx bsday today` - Print today's BS date, Tithi, and festival directly in the terminal.
- `npx bsday convert 2081-05-15` - Quick terminal conversion tool.

---

## 🏆 Milestone Overview

| Feature Area | Status | Target Release |
| :--- | :---: | :---: |
| **BS ↔ AD Core Dual Engine** | ✅ Shipped | `v1.0.0` |
| **Fiscal Year (आर्थिक वर्ष) Engine** | ✅ Shipped | `v1.1.0` |
| **KYC Chronological Age Calculation** | ✅ Shipped | `v1.1.0` |
| **Headless Calendar Matrix Grid** | ✅ Shipped | `v1.1.0` |
| **111-Year Panchang & Festival Dataset** | ✅ Shipped | `v1.1.0` |
| **Zod & Form Validation Utilities** | ✅ Shipped | `v1.1.0` |
| **React / Headless DatePicker Package** | ⚡ In Planning | `v1.2.0` |
| **Business Days & Workday Engine** | ⚡ In Planning | `v1.2.0` |
| **Official CLI Tool (`npx bsday`)** | ⚡ In Planning | `v1.3.0` |

