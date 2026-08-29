# 📖 BSDay API Reference & Specification

Complete API documentation for **`@bsday.js/core`** and **`@bsday.js/dataset`**.

---

## 📦 1. `@bsday.js/core`

### 1.1 Date Instantiation & Factory

#### `bsday(input?)`
Creates a `BSDay` instance.
- If called with no arguments: returns the current date and time.
- If called with a Gregorian `Date`, timestamp, or ISO string: initializes from AD.

```typescript
import bsday from '@bsday.js/core';

const now = bsday();
const fromDate = bsday(new Date('2024-08-31'));
const fromString = bsday('2024-08-31T12:00:00Z');
```

#### `bsday.bs(year, month, day)` | `bsday.bs(dateString)` | `bsday.bs(bsObject)`
Explicit Bikram Sambat date constructor. **Months are 1-indexed (1 = Baisakh, 12 = Chaitra).**

```typescript
const d1 = bsday.bs(2081, 5, 15);
const d2 = bsday.bs('2081/05/15');
const d3 = bsday.bs({ year: 2081, month: 5, day: 15 });
```

#### `bsday.ad(date)`
Explicit Gregorian AD date constructor.

```typescript
const d = bsday.ad(new Date('2024-08-31'));
```

---

### 1.2 Dual-Calendar Conversion

#### `.toAD(): Date`
Converts the current instance to a native JavaScript Gregorian `Date`.

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

| Getter / Setter | Description | Example |
| :--- | :--- | :--- |
| `.year()` / `.year(value)` | BS Year (e.g. 2081) | `d.year()` / `d.year(2082)` |
| `.month()` / `.month(value)` | BS Month (1–12) | `d.month()` / `d.month(6)` |
| `.date()` / `.date(value)` | BS Day of month (1–32) | `d.date()` / `d.date(1)` |
| `.day()` | Day of week (0=Sunday ... 6=Saturday) | `d.day()` |
| `.hour()` / `.minute()` / `.second()` | Time components | `d.hour(10).minute(30)` |
| `.daysInMonth()` | Total days in current BS month | `bsday.bs(2081, 1, 1).daysInMonth()` |

---

### 1.4 Date Arithmetic & Bounds

#### `.add(value, unit)` / `.subtract(value, unit)`
Units: `'day'`, `'month'`, `'year'`, `'hour'`, `'minute'`, `'second'`.

```typescript
const nextMonth = d.add(1, 'month');
const prevWeek = d.subtract(7, 'day');
```

#### `.startOf(unit)` / `.endOf(unit)`
Units: `'year'`, `'month'`, `'date'` / `'day'`, `'fiscalYear'`.

```typescript
const monthStart = d.startOf('month'); // 2081/05/01 00:00:00.000
const monthEnd = d.endOf('month'); // 2081/05/31 23:59:59.999
const fyStart = d.startOf('fiscalYear'); // 2081/04/01 00:00:00.000
const fyEnd = d.endOf('fiscalYear'); // 2082/03/31 23:59:59.999
```

---

### 1.5 Date Comparison

```typescript
d1.isBefore(d2);
d1.isAfter(d2);
d1.isSame(d2, 'date');
d1.isSameOrBefore(d2, 'month');
d1.isSameOrAfter(d2, 'year');
d1.isBetween(start, end, 'date', '[]'); // Inclusive bounds: '()', '[]', '[)', '(]'
d1.diff(d2, 'month'); // Returns numeric difference
```

---

### 1.6 Formatting Engine

#### `.format(pattern?, calendar?, locale?)`
- Default pattern: `'YYYY/MM/DD'`
- Calendar: `'bs'` (default) | `'ad'`
- Locale: `'en'` (default) | `'ne'` (Devanagari)

```typescript
const d = bsday.bs(2081, 5, 15);

d.format(); // "2081/05/15"
d.format('YYYY MMMM DD, dddd'); // "2081 Bhadra 15, Saturday"
d.locale('ne').format('YYYY MMMM DD, dddd'); // "२०८१ भाद्र १५, शनिबार"
d.format('YYYY-MM-DD', 'ad'); // "2024-08-31"
```

#### Formatting Tokens Table

| Token | Description | Output (EN) | Output (NE) |
| :--- | :--- | :--- | :--- |
| `YYYY` | 4-digit year | `2081` | `२०८१` |
| `YY` | 2-digit year | `81` | `८१` |
| `MMMM` | Full month name | `Bhadra` | `भाद्र` |
| `MMM` | Short month name | `Bha` | `भा` |
| `MM` | 2-digit month (padded) | `05` | `०५` |
| `M` | 1-digit month | `5` | `५` |
| `DD` | 2-digit day of month | `15` | `१५` |
| `D` | 1-digit day of month | `15` | `१५` |
| `dddd` | Full weekday name | `Saturday` | `शनिबार` |
| `ddd` | Short weekday name | `Sat` | `शनि` |
| `HH` | 2-digit 24-hour | `14` | `१४` |
| `mm` | 2-digit minute | `30` | `३०` |
| `ss` | 2-digit second | `45` | `४५` |

---

### 1.7 Nepali Fiscal Year (आर्थिक वर्ष)

Fiscal year runs from **Shrawan 1 (Month 4)** to **Ashadh end (Month 3 next year)**.

```typescript
const invoice = bsday.bs(2081, 5, 10);

invoice.fiscalYear('short'); // "2081/82"
invoice.fiscalYear('full'); // "2081/2082"
invoice.fiscalYear('extended'); // "FY 2081/82"
invoice.locale('ne').fiscalYear('extended'); // "आ.व. २०८१/८२"

invoice.fiscalQuarter(); // 1 (Q1: Shrawan-Ashwin, Q2: Kartik-Poush, Q3: Magh-Chaitra, Q4: Baisakh-Ashadh)
```

---

### 1.8 KYC Chronological Age Calculation

```typescript
const dob = bsday.bs(2055, 6, 12);
const reference = bsday.bs(2081, 5, 15);

const ageObj = dob.age(reference); // { years: 25, months: 11, days: 3 }
dob.formatAge(reference); // "25 years, 11 months, 3 days"
dob.locale('ne').formatAge(reference); // "२५ वर्ष, ११ महिना, ३ दिन"

dob.isAdult(18, reference); // true
```

---

### 1.9 Headless Calendar Matrix

Generates a 42-cell (6×7) calendar matrix for building UI DatePickers:

```typescript
import { getCalendarMatrix } from '@bsday.js/core';

const grid = getCalendarMatrix(2081, 5, {
  minDate: '2081/01/01',
  maxDate: '2081/12/30',
  disabledDates: ['2081/05/10'],
});

// Returns CalendarCell[] (42 items):
// {
//   year: 2081,
//   month: 5,
//   day: 15,
//   isCurrentMonth: true,
//   isToday: false,
//   isDisabled: false,
//   isWeekend: true,
//   isHoliday: false
// }
```

---

### 1.10 Validation Utilities

```typescript
import { isValidBSDate, isValidADDate, validateBSDateString } from '@bsday.js/core';

isValidBSDate(2081, 5, 31); // true
isValidBSDate(2081, 5, 32); // false (Bhadra 2081 has 31 days)

const res = validateBSDateString('2081/05/15', { minYear: 1990, maxYear: 2100 });
console.log(res.isValid); // true
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

datasetManager.setDataset(dataset);

const today = bsday.bs(2081, 6, 26);
console.log(today.tithi); // "Dashami"
console.log(today.festivals); // ["Vijaya Dashami"]
console.log(today.isHoliday); // true
```

### 2.3 Standalone Panchang Engine

```typescript
import { computePanchang } from '@bsday.js/dataset/panchang-engine';

// Julian Date (UT)
const panchang = computePanchang(2460413.5);
console.log(panchang.tithi, panchang.nakshatra, panchang.yoga);
```
