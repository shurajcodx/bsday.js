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

   * `BSDay.now()` → current date/time (BSDay instance)
   * `BSDay.today()` → alias for now()

2. **Date Creation**

   * `new BSDay()` → current date/time
   * `new BSDay(Date)` → from AD
   * `new BSDay(string)` → parse date string
   * `new BSDay({ bs: [year, month, day] })` → from BS
   * `BSDay.fromAD(date)` → convert AD → BSDay
   * `BSDay.fromBS([year, month, day])` → convert BS → BSDay

3. **Conversion**

   * `.toAD()` → JS Date object
   * `.toBS()` → BS object `{ year, month, day }`
   * `.ad` / `.bs` getters for convenience

4. **Dataset Access (Optional)**

   * Access **tithi, festivals, Panchang info** via `BSDay.dataset()` or instance methods

5. **Getters**

   * `.year`, `.month`, `.day` (calendar optional)
   * `.dayOfWeek` → 0–6 (calculated dynamically)
   * `.dayOfYear` → 1–365/366
   * `.isLeapYear(calendar?)` → boolean

6. **Setters / Mutators**

   * `.setYear(y, calendar?)`, `.setMonth(m, calendar?)`, `.setDay(d, calendar?)`
   * `.setFullDate(y, m, d, calendar?)`
   * Supports **immutable** and **mutable** variants

7. **Date Arithmetic**

   * `.addDays(n, calendar?)`, `.subtractDays(n, calendar?)`
   * `.addMonths(n, calendar?)`, `.subtractMonths(n, calendar?)`
   * `.addYears(n, calendar?)`, `.subtractYears(n, calendar?)`

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
  festivals: string[]
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
import { BSDay } from '@bsday/core'
import { dataset } from '@bsday/dataset'

// Create a BS date
const bsDate = new BSDay({ bs: [2082, 12, 1] })
console.log(bsDate.tithi())       // 'Pratipada'
console.log(bsDate.festivals())   // ['Holi']

// AD date
const adDate = new BSDay(new Date())

// Formatting
console.log(bsDate.format('YYYY-MM-DD', 'bs')) // '2082-12-01'

// Arithmetic
bsDate.addDays(5).addMonths(1)

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
| `BSDay.now()`                       | static   | Returns current date/time as BSDay instance       |
| `BSDay.today()`                     | static   | Alias for `now()`                                 |
| `BSDay.fromAD(date)`                | static   | Convert AD Date → BSDay                           |
| `BSDay.fromBS([y,m,d])`             | static   | Convert BS → BSDay                                |
| `BSDay.parse(string, pattern, cal)` | static   | Parse string into BSDay instance                  |
| `.toAD()`                           | instance | Returns JS Date                                   |
| `.toBS()`                           | instance | Returns BS object `{year, month, day}`            |
| `.ad`                               | instance | AD getter                                         |
| `.bs`                               | instance | BS getter                                         |
| `.year`                             | instance | Year number                                       |
| `.month`                            | instance | Month number (1–12)                               |
| `.day`                              | instance | Day number (1–31)                                 |
| `.dayOfWeek`                        | instance | 0–6 Sunday–Saturday                               |
| `.dayOfYear`                        | instance | Day index in year                                 |
| `.isLeapYear(calendar?)`            | instance | Checks leap year                                  |
| `.addDays(n, calendar?)`            | instance | Add n days                                        |
| `.addMonths(n, calendar?)`          | instance | Add n months                                      |
| `.addYears(n, calendar?)`           | instance | Add n years                                       |
| `.subtractDays(n, calendar?)`       | instance | Subtract n days                                   |
| `.subtractMonths(n, calendar?)`     | instance | Subtract n months                                 |
| `.subtractYears(n, calendar?)`      | instance | Subtract n years                                  |
| `.setYear(y, calendar?)`            | instance | Set year                                          |
| `.setMonth(m, calendar?)`           | instance | Set month                                         |
| `.setDay(d, calendar?)`             | instance | Set day                                           |
| `.setFullDate(y,m,d,calendar?)`     | instance | Set full date                                     |
| `.isBefore(other)`                  | instance | Check if date is before another                   |
| `.isAfter(other)`                   | instance | Check if date is after another                    |
| `.isSame(other)`                    | instance | Check if dates are equal                          |
| `.tithi()`                          | instance | Returns tithi from dataset                        |
| `.festivals()`                      | instance | Returns festivals array for this BS date          |
| `.panchang()`                       | instance | Returns Panchang info `{nakshatra, yoga, karana}` |
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
