# bsday.js Library - Requirement Document

**Project Name:** bsday.js
**Purpose:** Provide a **modern, dual-calendar JavaScript library** for **Bikram Sambat (BS)** and **AD (Gregorian)** with a **Date-like API**, formatting/parsing, tithi/festival/Panchang dataset, and **extensible plugin architecture**.

---

## 1. Objective

* Create a **lightweight, accurate dual-calendar date library** for JS/TS.
* Seamless **AD ↔ BS conversion**.
* **Date manipulation, comparison, formatting, and parsing** utilities.
* Familiar API for JavaScript Date users.
* Fully support **all standard formatting tokens**.
* Enable **plugin-based extensibility** for custom tokens, calendars, holidays, and utilities.
* Include **dataset** for BS dates containing **tithi, festivals, Panchang info**.

---

## 2. Functional Requirements

### 2.1 Core Features

1. **Current Date & Time**

   * `BSDay.now()` → current Unix timestamp
   * `BSDay.nowAD()` → current AD `Date`
   * `BSDay.nowBS(pattern?, locale?)` → formatted BS string

2. **Date Creation**

   * `new BSDay()` → current date/time
   * `new BSDay(Date)` → from AD
   * `new BSDay(string)` → from AD-like string input
   * `BSDay.bs('YYYY/MM/DD')` → explicit BS input
   * `BSDay.bs(year, month, day)` → explicit BS input
   * `BSDay.fromAD(date)` → convert AD → BSDay
   * `BSDay.fromBS(...)` → compatibility alias for BS input

3. **Conversion**

   * `.toAD()` → JS Date object
   * `.toBS()` → BS object `{ year, month, day }`

4. **Dataset Access (Optional)**

   * Register optional day data via `BSDay.setDataset(dataset)`
   * Access **tithi, festivals, events, isHoliday, Panchang info** via instance getters or `data()`

5. **Getters**

   * `.year()`, `.month()`, `.date()` for BS values
   * `.hour()`, `.minute()`, `.second()`, `.millisecond()` for Nepal-local time
   * `.dayOfWeek()` → 0–6 (calculated dynamically)
   * `.dayOfYear()` → 1–365/366
   * `.isLeapYear(calendar?)` → boolean

6. **Setters / Mutators**

   * `.setYear(y, calendar?)`, `.setMonth(m, calendar?)`, `.setDay(d, calendar?)`
   * Supports **immutable** and **mutable** variants

7. **Date Arithmetic**

   * `.add(value, unit, calendar?)`, `.subtract(value, unit, calendar?)`

8. **Comparison**

   * `.isBefore(other)`, `.isAfter(other)`, `.isSame(other)`
   * Works **cross-calendar (AD ↔ BS)**

9. **Formatting & Parsing**

   * `.format(pattern, calendar='bs'|'ad')` → all standard tokens
   * Parsing strings → BSDay instance
   * Supports **custom tokens** via plugins

10. **Static Helpers / Constants**

    * `BSDay.MONTHS_NEPALI`, `BSDay.WEEKDAYS_NEPALI`
    * `BSDay.MIN_YEAR = 1970`, `BSDay.MAX_YEAR = 2100`
    * `BSDay.isLeapYear(year, calendar?)`
    * `BSDay.isValid(year, month, day, calendar?)`

---

### 2.2 Plugin System

* **Plugin Interface:**

```ts
interface BSDayPlugin {
  name: string
  initialize(bsday: typeof BSDay): void
}
```

* **Register Plugin:** `BSDay.use(plugin)`
* **Plugin Types:**

  * Formatting token plugins (e.g., Nepali numerals)
  * Holiday/Event plugins (e.g., `isHoliday()`)
  * Calendar plugins (e.g., Lunar)
  * Utility plugins (fiscal year, workdays)
* Plugins can extend **BSDay prototype**, **static helpers**, or **formatting tokens**.

---

## 3. Non-Functional Requirements

* **Performance:** Lightweight, minimal dependencies, fast dataset lookup
* **Accuracy:** Correct AD ↔ BS conversion
* **Compatibility:** JS + TS
* **Maintainability:** Modular, clear architecture
* **Extensibility:** Supports plugins, new tokens, calendars, dataset additions
* **Dataset Efficiency:** Use **O(1) lookup** via `YYYY-MM-DD` key

---

## 4. Supported Range

* **BS Years:** 1970–2100
* **AD Years:** Corresponding Gregorian years
* Leap years handled correctly

---

## 5. Dataset Structure (@bsday/dataset)

* Each BS date key (`YYYY-MM-DD`) contains:

```ts
interface BSDayData {
  tithi: string
  paksha: string
  festivals: string[]
  events: string[]
  isHoliday: boolean
  nakshatra: string
  yoga: string
  karana: string
}
```

* Example:

```json
"2082-12-01": {
  "tithi": "Pratipada",
  "festivals": ["Holi"],
  "nakshatra": "Chitra",
  "yoga": "Shukla",
  "karana": "Bava"
}
```

* **Notes:**

  * No AD duplication → smaller dataset
  * Weekday calculated dynamically
  * Optimized for **fast API calls**

---

## 6. Example Usage

```ts
import { BSDay } from '@bsday.js/core'
import { dataset } from '@bsday/dataset'

BSDay.setDataset(dataset)

// Create a BS date
const bsDate = BSDay.bs('2082/12/01')
console.log(bsDate.tithi)         // 'Pratipada'
console.log(bsDate.festivals)     // ['Holi']

// AD date
const adDate = new BSDay('2026-03-28')

// Formatting
console.log(bsDate.format()) // '2082/12/01'

// Arithmetic
bsDate.add(5, 'day').add(1, 'month')

// Comparison
console.log(bsDate.isBefore(adDate))

// Plugin example
BSDay.use(new NepaliNumberPlugin())
console.log(bsDate.format('NN/MM/YYYY', 'bs'))
```

---

## 7. API Overview Table

| Method / Property                   | Type     | Description                                       |
| ----------------------------------- | -------- | ------------------------------------------------- |
| `BSDay.now()`                       | static   | Returns current Unix timestamp                    |
| `BSDay.nowAD()`                     | static   | Returns current AD `Date`                         |
| `BSDay.nowBS()`                     | static   | Returns formatted BS string                       |
| `BSDay.bs(input)` / `BSDay.bs(y,m,d)` | static | Create BSDay from explicit BS input               |
| `BSDay.fromAD(date)`                | static   | Convert AD Date → BSDay                           |
| `BSDay.fromBS(value)`               | static   | Compatibility alias for BS → BSDay                |
| `BSDay.parse(string, pattern, cal)` | static   | Parse string into BSDay instance                  |
| `.toAD()`                           | instance | Returns JS Date                                   |
| `.toBS()`                           | instance | Returns BS object `{year, month, day}`            |
| `.year()`                           | instance | BS year number                                    |
| `.month()`                          | instance | BS month number (1–12)                            |
| `.date()`                           | instance | BS day number                                     |
| `.dayOfWeek()`                      | instance | 0–6 Sunday–Saturday                               |
| `.dayOfYear()`                      | instance | Day index in year                                 |
| `.isLeapYear(calendar?)`            | instance | Checks leap year                                  |
| `.add(value, unit, calendar?)`      | instance | Add a unit                                        |
| `.subtract(value, unit, calendar?)` | instance | Subtract a unit                                   |
| `.setYear(y, calendar?)`            | instance | Set year                                          |
| `.setMonth(m, calendar?)`           | instance | Set month                                         |
| `.setDay(d, calendar?)`             | instance | Set day                                           |
| `.isBefore(other)`                  | instance | Check if date is before another                   |
| `.isAfter(other)`                   | instance | Check if date is after another                    |
| `.isSame(other)`                    | instance | Check if dates are equal                          |
| `.tithi`                            | instance | Returns tithi from dataset                        |
| `.festivals`                        | instance | Returns festivals array for this BS date          |
| `.events`                           | instance | Returns events array for this BS date             |
| `.isHoliday`                        | instance | Returns holiday flag for this BS date             |
| `.panchang`                         | instance | Returns Panchang info `{nakshatra, yoga, karana}` |
| `.data()`                           | instance | Returns the full registered day record            |
| `BSDay.dataset()`                   | static   | Access full dataset (tithi, festivals, Panchang)  |
| `BSDay.use(plugin)`                 | static   | Register a plugin                                 |

---

## 8. Roadmap / Development Phases

### Phase 1: Core Library

* AD ↔ BS conversion engine
* BSDay class (constructors, getters, setters)
* Formatting & parsing engine
* Arithmetic & comparison
* Static helpers & constants
* Unit tests & documentation

### Phase 2: Dataset Integration

* Add tithi, festivals, Panchang dataset
* Optimize O(1) lookup
* Connect dataset to BSDay instances

### Phase 3: Plugin System

* Plugin interface & registration (`BSDay.use()`)
* Example plugins (Nepali numbers, holidays, lunar calendar)
* Unit tests & developer guide

### Phase 4: Finalization & Optional Features

* ESLint & Prettier enforcement
* Bundling (ESM + CJS) + type definitions
* Optional: time support, timezone awareness, localization

---

## 9. License

* MIT
