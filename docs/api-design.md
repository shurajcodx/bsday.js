# 📖 BSDay API Reference & Specification

Complete API documentation for **`@bsday.js/core`** and **`@bsday.js/dataset`**.

---

## 📦 1. `@bsday.js/core`

### 1.1 Date Instantiation & Factory

#### `bsday(input?)`
Creates a `BSDay` instance.
- **No arguments**: Returns the current date and time.
- **Gregorian Date / timestamp / ISO string**: Initializes from AD.
- **BSDay instance**: Returns a cloned instance.

```typescript
import bsday, { BSDay } from '@bsday.js/core';

const now = bsday();
const fromDate = bsday(new Date('2024-08-31'));
const fromTimestamp = bsday(1725096600000);
const fromIso = bsday('2024-08-31T12:00:00Z');
```

#### `bsday.bs(year, month, day)` | `bsday.bs(dateString)` | `bsday.bs(bsObject)`
Explicit Bikram Sambat date constructor. **Months are 1-indexed (1 = Baisakh, 12 = Chaitra).**

```typescript
const d1 = bsday.bs(2081, 5, 15);
const d2 = bsday.bs('2081/05/15');
const d3 = bsday.bs('2081-05-15');
const d4 = bsday.bs({ year: 2081, month: 5, day: 15 });
```

#### `bsday.ad(date)` / `BSDay.fromAD(date)`
Explicit Gregorian AD date constructor.

```typescript
const d = bsday.ad(new Date('2024-08-31'));
```

#### `BSDay.parse(input, pattern, calendar?)`
Parses a custom formatted date string into a `BSDay` instance.

```typescript
const d = BSDay.parse('2081-05-15 14:30', 'YYYY-MM-DD HH:mm', 'bs');
```

#### `bsday.now()`
Returns the current Unix timestamp in milliseconds.

```typescript
const ms = bsday.now(); // 1725096600000
```

---

### 1.2 Dual-Calendar Conversion

#### `.toAD(): Date`
Converts the current instance to a native JavaScript Gregorian `Date` object (representing 00:00:00.000 or the instance time in Nepal timezone).

```typescript
const bs = bsday.bs(2081, 5, 15);
const ad = bs.toAD(); // Date: 2024-08-31
```

#### `.toBS(): BSDate`
Returns the Bikram Sambat components `{ year, month, day }`.

```typescript
const ad = bsday('2024-08-31');
console.log(ad.toBS()); // { year: 2081, month: 5, day: 15 }
```

---

### 1.3 Getters & Setters

All setter operations are **immutable** and return a new `BSDay` instance.

| Method | Description | Example |
| :--- | :--- | :--- |
| `.year()` / `.year(val)` | BS Year (e.g. 2081) | `d.year()` / `d.year(2082)` |
| `.quarter()` / `.quarter(val)` | BS Quarter (1–4) | `d.quarter()` / `d.quarter(2)` |
| `.month()` / `.month(val)` | BS Month (1–12, 1-indexed) | `d.month()` / `d.month(6)` |
| `.date()` / `.date(val)` | BS Day of month (1–32) | `d.date()` / `d.date(1)` |
| `.day()` / `.day(val)` | Day of week (0=Sunday ... 6=Saturday) | `d.day()` / `d.day(0)` |
| `.dayOfWeek()` | Numeric weekday (0–6) | `d.dayOfWeek()` |
| `.dayOfYear()` | Day of the BS year (1–366) | `d.dayOfYear()` |
| `.hour()` / `.hour(val)` | Hour of day (0–23) | `d.hour()` / `d.hour(14)` |
| `.minute()` / `.minute(val)` | Minute (0–59) | `d.minute()` / `d.minute(30)` |
| `.second()` / `.second(val)` | Second (0–59) | `d.second()` / `d.second(45)` |
| `.millisecond()` / `.millisecond(val)` | Millisecond (0–999) | `d.millisecond()` / `d.millisecond(500)` |
| `.daysInMonth(calendar?)` | Total days in current month (`'bs'` or `'ad'`) | `bsday.bs(2081, 5, 1).daysInMonth()` // 31 |
| `.clone()` | Returns an identical clone | `const copy = d.clone();` |
| `.isValid()` | Checks whether date is valid | `bsday.bs(2081, 5, 15).isValid()` // true |

---

### 1.4 Date Arithmetic & Bounds

#### `.add(value, unit)` / `.subtract(value, unit)`
Units supported: `'year'`, `'quarter'`, `'month'`, `'date'` / `'day'`, `'hour'`, `'minute'`, `'second'`, `'millisecond'`.

```typescript
const d = bsday.bs(2081, 5, 15);

const nextMonth = d.add(1, 'month'); // 2081/06/15
const prevWeek = d.subtract(7, 'day'); // 2081/05/08
const nextYear = d.add(1, 'year'); // 2082/05/15
```

#### `.startOf(unit)` / `.endOf(unit)`
Units supported: `'year'`, `'quarter'`, `'month'`, `'date'` / `'day'`, `'fiscalYear'`.

```typescript
const monthStart = d.startOf('month'); // 2081/05/01 00:00:00.000
const monthEnd = d.endOf('month'); // 2081/05/31 23:59:59.999
const yearStart = d.startOf('year'); // 2081/01/01 00:00:00.000
const fyStart = d.startOf('fiscalYear'); // 2081/04/01 00:00:00.000 (Shrawan 1)
const fyEnd = d.endOf('fiscalYear'); // 2082/03/31 23:59:59.999 (Ashadh end)
```

---

### 1.5 Date Comparison

```typescript
const d1 = bsday.bs(2081, 5, 15);
const d2 = bsday.bs(2081, 6, 1);

d1.isBefore(d2); // true
d1.isAfter(d2); // false
d1.isSame(d2, 'year'); // true (same year)
d1.isSame(d2, 'month'); // false (different month)
d1.isSameOrBefore(d2, 'month'); // true
d1.isSameOrAfter(d2, 'year'); // true

// Between checks with custom boundary inclusivity:
// '()' = exclusive, '[]' = inclusive, '[)' = start inclusive, '(]' = end inclusive
d1.isBetween(bsday.bs(2081, 1, 1), bsday.bs(2081, 12, 30), 'date', '[]'); // true

// Numeric difference
d2.diff(d1, 'day'); // 17
d2.diff(d1, 'month'); // 1
```

---

### 1.6 Formatting Engine

#### `.format(pattern?, calendar?, locale?)`
- **Default pattern**: `'YYYY/MM/DD'`
- **Calendar**: `'bs'` (default) | `'ad'`
- **Locale**: `'en'` (default) | `'ne'` (Devanagari)

```typescript
const d = bsday.bs(2081, 5, 15);

d.format(); // "2081/05/15"
d.format('YYYY MMMM DD, dddd'); // "2081 Bhadra 15, Saturday"
d.locale('ne').format('YYYY MMMM DD, dddd'); // "२०८१ भाद्र १५, शनिबार"
d.format('YYYY-MM-DD', 'ad'); // "2024-08-31"

// Escaped literal strings with brackets [...]
d.format('YYYY [साल] MMMM DD [गते]'); // "2081 साल Bhadra 15 गते"
d.locale('ne').format('YYYY [साल] MMMM DD [गते]'); // "२०८१ साल भाद्र १५ गते"
```

#### Complete Formatting Tokens Table

| Token | Description | Output (EN) | Output (NE) |
| :--- | :--- | :--- | :--- |
| `YYYY` | 4-digit year | `2081` | `२०८१` |
| `YY` | 2-digit year | `81` | `८१` |
| `MMMM` | Full month name | `Bhadra` | `भाद्र` |
| `MMM` | Short month name | `Bha` | `भा` |
| `MM` | 2-digit month (01–12) | `05` | `०५` |
| `M` | 1-digit month (1–12) | `5` | `५` |
| `DD` | 2-digit day of month (01–32) | `15` | `१५` |
| `D` | 1-digit day of month (1–32) | `15` | `१५` |
| `dddd` | Full weekday name | `Saturday` | `शनिबार` |
| `ddd` | Short weekday name | `Sat` | `शनि` |
| `d` | Day of week number (0=Sun ... 6=Sat) | `6` | `६` |
| `HH` | 2-digit 24-hour (00–23) | `14` | `१४` |
| `hh` | 2-digit 12-hour (01–12) | `02` | `०२` |
| `h` | 1-digit 12-hour (1–12) | `2` | `२` |
| `mm` | 2-digit minute (00–59) | `30` | `३०` |
| `m` | 1-digit minute (0–59) | `30` | `३०` |
| `ss` | 2-digit second (00–59) | `45` | `४५` |
| `s` | 1-digit second (0–59) | `45` | `४५` |
| `SSS` | 3-digit millisecond (000–999) | `120` | `१२०` |
| `Q` | Quarter of the year (1–4) | `2` | `२` |
| `A` | Uppercase AM / PM | `PM` | `दिउँसो` / `अपराह्न` |
| `a` | Lowercase am / pm | `pm` | `दिउँसो` / `अपराह्न` |
| `[text]` | Escaped literal text | `text` | `text` |

---

### 1.7 Relative Time Plugin (`relativeTimePlugin`)

Provides human-readable relative time formatting (`"2 days ago"`, `"३ दिन अघि"`):

```typescript
import bsday, { relativeTimePlugin } from '@bsday.js/core';

bsday.extend(relativeTimePlugin);

const pastDate = bsday().subtract(3, 'day');
const futureDate = bsday().add(2, 'month');

pastDate.fromNow(); // "3 days ago"
pastDate.locale('ne').fromNow(); // "३ दिन अघि"

pastDate.from(futureDate); // "2 months ago"
pastDate.to(futureDate); // "in 2 months"

pastDate.fromNow(true); // "3 days" (without suffix)
```

---

### 1.8 Nepali Fiscal Year (आर्थिक वर्ष)

Fiscal year runs from **Shrawan 1 (Month 4)** to **Ashadh end (Month 3 next year)**.

```typescript
const invoice = bsday.bs(2081, 5, 10);

invoice.fiscalYear('short'); // "2081/82"
invoice.fiscalYear('full'); // "2081/2082"
invoice.fiscalYear('extended'); // "FY 2081/82"
invoice.locale('ne').fiscalYear('extended'); // "आ.व. २०८१/८२"

invoice.fiscalQuarter(); // 1 (Q1: Shrawan-Ashwin, Q2: Kartik-Poush, Q3: Magh-Chaitra, Q4: Baisakh-Ashadh)
invoice.fiscalYearNumber(); // 2081

// Static bounds
BSDay.startOfFiscalYear(2081); // 2081/04/01 00:00:00.000
BSDay.endOfFiscalYear(2081); // 2082/03/31 23:59:59.999
```

---

### 1.9 KYC Chronological Age Calculation

Exact Bikram Sambat chronological age taking into account irregular BS month lengths:

```typescript
const dob = bsday.bs(2055, 6, 12);
const reference = bsday.bs(2081, 5, 15);

const ageObj = dob.age(reference); // { years: 25, months: 11, days: 3 }
dob.formatAge(reference); // "25 years, 11 months, 3 days"
dob.locale('ne').formatAge(reference); // "२५ वर्ष, ११ महिना, ३ दिन"

dob.isAdult(18, reference); // true
```

---

### 1.10 Headless Calendar Matrix

Generates a 42-cell (6×7) calendar matrix for building custom UI DatePickers:

```typescript
import { getCalendarMatrix, type CalendarCell } from '@bsday.js/core';

const grid = getCalendarMatrix(2081, 5, {
  locale: 'ne',
  minDate: '2081/01/01',
  maxDate: '2081/12/30',
  disabledDates: ['2081/05/10'],
  fixedWeeks: true, // 42 cells (6 rows x 7 cols)
  startOfWeek: 0, // 0 = Sunday, 1 = Monday
});

// Returns CalendarCell[][] (6 weeks x 7 days)
```

#### `CalendarCell` Interface
```typescript
export interface CalendarCell {
  bs: { year: number; month: number; day: number };
  ad: Date;
  dateString: string; // "2081/05/15"
  adDateString: string; // "2024-08-31"
  dayNumber: number; // 15
  dayText: string; // "१५" (if locale='ne')
  dayOfWeek: number; // 0..6
  isCurrentMonth: boolean;
  isToday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
  isWeekend: boolean;
  isDisabled: boolean;
  isHoliday: boolean;
  tithi?: string;
  paksha?: string;
  festivals?: string[];
  events?: string[];
}
```

---

### 1.11 Calendar Range & Utility Helpers

```typescript
import {
  isDateInRange,
  isDateDisabled,
  getDateRange,
  getMonthNames,
  getWeekdayNames,
} from '@bsday.js/core';

// 1. Range check
isDateInRange('2081/05/15', '2081/05/01', '2081/05/31', '[]'); // true

// 2. Disabled check
isDateDisabled('2081/05/15', {
  minDate: '2081/05/01',
  maxDate: '2081/05/30',
  disabledDaysOfWeek: [6], // Disable Saturdays
});

// 3. Generate consecutive date array
const days = getDateRange('2081/05/01', '2081/05/07', 1); // Array of 7 BSDay instances

// 4. Month and Weekday names
getMonthNames('ne', 'long'); // ['वैशाख', 'जेठ', 'असार', ...]
getWeekdayNames('en', 'short'); // ['Sun', 'Mon', 'Tue', ...]
getWeekdayNames('ne', 'min'); // ['आ', 'सो', 'मं', ...]
```

---

### 1.12 Month & Year Metadata Utilities

```typescript
import { getBsMonthDays, getBsYearDays, isBsLeapYear, isLeapYear } from '@bsday.js/core';

getBsMonthDays(2081, 5); // 31 (Bhadra 2081 has 31 days)
getBsYearDays(2081); // 365
isBsLeapYear(2081); // false
isLeapYear(2024, 'ad'); // true
```

---

### 1.13 Validation Utilities

```typescript
import {
  isValidBSDate,
  isValidADDate,
  validateBSDateString,
  BSDay,
} from '@bsday.js/core';

isValidBSDate(2081, 5, 31); // true
isValidBSDate(2081, 5, 32); // false

isValidADDate(2024, 2, 29); // true (2024 is leap year)
isValidADDate(2023, 2, 29); // false

const res = validateBSDateString('2081/05/15', { minYear: 1990, maxYear: 2100 });
console.log(res.isValid); // true
console.log(res.bs); // { year: 2081, month: 5, day: 15 }

// Static isValid check
BSDay.isValid(2081, 5, 15, 'bs'); // true
```

---

## 🕉️ 2. `@bsday.js/dataset`

### 2.1 Complete Dataset Lookup

```typescript
import { dataset, datasetNepali, type BSDayData } from '@bsday.js/dataset/all';

const day = dataset['2081-06-26'];
console.log(day.tithi); // "Dashami"
console.log(day.paksha); // "Shukla"
console.log(day.nakshatra); // "Shravana"
console.log(day.yoga); // "Dhriti"
console.log(day.karana); // "Garaja"
console.log(day.festivals); // ["Vijaya Dashami"]
console.log(day.isHoliday); // true
```

### 2.2 Hydration with Core Library

```typescript
import { bsday, BSDay, datasetManager } from '@bsday.js/core';
import { dataset } from '@bsday.js/dataset/all';

// Hydrate dataset globally
BSDay.setDataset(dataset);

const today = bsday.bs(2081, 6, 26);
console.log(today.tithi); // "Dashami"
console.log(today.festivals); // ["Vijaya Dashami"]
console.log(today.isHoliday); // true
console.log(today.nakshatra); // "Shravana"
```

### 2.3 Standalone Panchang Engine

```typescript
import { computePanchang } from '@bsday.js/dataset/panchang-engine';

// Julian Date (UT)
const panchang = computePanchang(2460413.5);
console.log(panchang.tithi, panchang.nakshatra, panchang.yoga);
```

---

## 📋 3. Exported TypeScript Types Summary

| Type / Interface | Import Source | Purpose |
| :--- | :--- | :--- |
| `BSDay` | `@bsday.js/core` | Core date manipulation class |
| `BSDate` | `@bsday.js/core` | Plain object `{ year, month, day }` |
| `BSAge` | `@bsday.js/core` | Age object `{ years, months, days }` |
| `BSDayInput` | `@bsday.js/core` | Permissive date input types |
| `CalendarCell` | `@bsday.js/core` | Calendar matrix cell structure |
| `CalendarMatrixOptions` | `@bsday.js/core` | Options for `getCalendarMatrix()` |
| `BSDateValidationOptions` | `@bsday.js/core` | Options for `validateBSDateString()` |
| `BSDateValidationResult` | `@bsday.js/core` | Return type of `validateBSDateString()` |
| `DateDisabledOptions` | `@bsday.js/core` | Options for `isDateDisabled()` |
| `BSDayPlugin` | `@bsday.js/core` | Plugin definition type |
| `FormatTokenResolver` | `@bsday.js/core` | Custom format token callback |
| `BSDayData` | `@bsday.js/dataset` | Daily Panchang and festival data |
