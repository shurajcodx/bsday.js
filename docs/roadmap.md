# 🗺️ bsday.js — Public Roadmap

**Project:** `bsday.js`  
**Purpose:** Ultra-fast, zero-dependency Day.js-compatible dual-calendar SDK (Bikram Sambat ↔ Gregorian AD) and Vedic Panchang ecosystem for JavaScript & TypeScript.

---

## 🚀 Shipped Milestones

### ✅ v1.0.0 — Foundation & Dual Engine
- **Dual-Calendar Conversion**: High-performance, zero-drift BS ↔ AD conversion engine (1970–2100 BS).
- **Core Day.js API Parity**: `BSDay` class with standard getters, setters, arithmetic (`add`, `subtract`), and comparisons (`isBefore`, `isSameOrAfter`, `isBetween`, `diff`).
- **Formatting Engine**: Tokens (`YYYY`, `MMMM`, `DD`, `dddd`, `HH`, `mm`, `ss`, etc.) with dual-calendar and locale support.
- **Plugin Architecture**: Extensible plugin system via `bsday.extend(plugin, options)` supporting functional and object plugins.

### ✅ v1.1.0 — Enterprise & Fintech Capabilities
- **Nepali Fiscal Year (आर्थिक वर्ष) Engine**:
  - `short` (`2081/82`), `full` (`2081/2082`), and `extended` (`FY 2081/82` / `आ.व. २०८१/८२`) formats.
  - Tax quarter calculation (`fiscalQuarter()`) and unit bounds (`startOf('fiscalYear')`, `endOf('fiscalYear')`).
- **KYC & Chronological Age Calculation**:
  - `age()`, `formatAge()`, and `isAdult(threshold)` taking into account irregular Bikram Sambat month lengths without day drift.
- **Headless Calendar Matrix & Range Helpers**:
  - `getCalendarMatrix()` producing 42-cell 6×7 grids with previous/next month padding and holiday tagging.
  - `isDateInRange()`, `isDateDisabled()`, and `getDateRange()`.
- **Form & Schema Validation**:
  - `isValidBSDate()`, `isValidADDate()`, `isBsLeapYear()`, and `validateBSDateString()` for direct Zod / React Hook Form integration.
- **111-Year Astronomical Dataset (`@bsday.js/dataset`)**:
  - 40,543 daily records (1990–2100 BS) with Hamro Patro & Panchang Nirnayak Samiti parity.
  - Sidereal Lahiri calculation for _Tithi_, _Paksha_, _Nakshatra_, _Yoga_, and _Karana_ with zero unknown fields.
  - Multi-day continuous public holiday blocks (Dashain, Tihar, Chhath).
- **Relative Time Plugin (`relativeTimePlugin`)**:
  - Humanized relative time formatting (`.fromNow()`, `.toNow()`, `.from()`, `.to()`) in English and Devanagari.

---

## 🌟 Current & Upcoming Development (v1.2.0+)

### 1. 🧮 Devanagari Numeral String Parsing
- Direct parsing of strings containing Devanagari digits (e.g. `bsday.bs('२०८१/०५/१५')` or `BSDay.parse('२०८१/०५/१५', 'YYYY/MM/DD')`) without requiring manual transliteration.

### 2. ⏱️ Advanced Business Day & Workday Engine
- `.isBusinessDay()`, `.isSaturday()`, `.isHoliday()`, and `.addBusinessDays(n)`.
- Banking settlement calculations skipping government holidays and Saturdays.

### 3. 🎨 UI Framework Headless Adapters (`@bsday.js/react`)
- Headless accessible hooks: `useNepaliDatePicker` and `useNepaliCalendarGrid`.
- Keyboard navigation (`ArrowLeft`, `ArrowRight`, `PageUp`, `PageDown`) and ARIA accessibility compliance.

### 4. 🧰 Official CLI Utilities (`npx bsday`)
- `npx bsday today` — Print today's BS date, Tithi, and Panchang directly in the terminal.
- `npx bsday convert 2081-05-15` — Instant command-line conversion.

---

## 🏆 Milestone Overview

| Feature Area | Status | Target Release |
| :--- | :---: | :---: |
| **BS ↔ AD Core Dual Engine** | ✅ Shipped | `v1.0.0` |
| **Fiscal Year (आर्थिक वर्ष) Engine** | ✅ Shipped | `v1.1.0` |
| **KYC Chronological Age Calculation** | ✅ Shipped | `v1.1.0` |
| **Headless Calendar Matrix Grid** | ✅ Shipped | `v1.1.0` |
| **111-Year Panchang & Festival Dataset** | ✅ Shipped | `v1.1.0` |
| **Relative Time Plugin (`relativeTimePlugin`)** | ✅ Shipped | `v1.1.0` |
| **Zod & Form Validation Utilities** | ✅ Shipped | `v1.1.0` |
| **Devanagari Numeral String Parsing** | ⚡ In Progress | `v1.2.0` |
| **Business Days & Workday Engine** | ⚡ In Progress | `v1.2.0` |
| **React Headless Hooks (`@bsday.js/react`)** | ⚡ In Planning | `v1.2.0` |
| **Official CLI Tool (`npx bsday`)** | ⚡ In Planning | `v1.3.0` |
