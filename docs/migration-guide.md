# 🔄 Migrating to bsday.js

This guide explains how to migrate from legacy Nepali date libraries (`nepali-date-converter`, `bikram-sambat-js`, `nepali-datetime`) or Day.js/Moment.js to **`bsday.js`**.

---

## 🚀 Why Migrate to `bsday.js`?

| Feature / Metric | `nepali-date-converter` | `bikram-sambat` | `nepali-datetime` | **`bsday.js`** |
|---|---|---|---|---|
| **API Design** | Custom legacy API | Custom class API | Python-style format | **Day.js Parity & Fluent API** |
| **Dual Calendar (BS & AD)** | Separate classes | Basic | Basic | **Unified Dual-Calendar Engine** |
| **TypeScript Support** | Basic `.d.ts` | Partial | Basic | **100% Native TypeScript** |
| **Tree-Shaking & Zero-Bloat** | ❌ No | ❌ No | ❌ No | **✅ `~12KB (gzipped)` & `sideEffects: false`** |
| **Fiscal Year (आर्थिक वर्ष)** | ❌ No | ❌ No | ❌ No | **✅ Built-in (`.fiscalYear()`, Quarters)** |
| **KYC Age Calculator** | ❌ No | ❌ No | ❌ No | **✅ Exact Chronological BS Age** |
| **Headless Calendar Grid** | ❌ No | ❌ No | ❌ No | **✅ `getCalendarMatrix()` for UI** |
| **Zod / Form Validation** | ❌ No | ❌ No | ❌ No | **✅ `validateBSDateString()`** |

---

## 1. Migrating from `nepali-date-converter`

### Installation
```bash
# Remove old library
npm uninstall nepali-date-converter

# Install bsday.js
npm install @bsday.js/core
```

### Side-by-Side Code Comparison

#### Creating BS Date & Converting to AD
```typescript
// ❌ OLD: nepali-date-converter
import NepaliDate from 'nepali-date-converter';

const bs = new NepaliDate(2081, 4, 15); // Month is 0-indexed (4 = Bhadra)!
const ad = bs.toJsDate();
console.log(bs.format('YYYY/MM/DD')); // "2081/05/15"

// ✅ NEW: bsday.js (1-indexed, intuitive months)
import { bsday, BSDay } from '@bsday.js/core';

const bs = bsday.bs(2081, 5, 15); // Month is 1-indexed (5 = Bhadra)
const ad = bs.toAD(); // Native JavaScript Date
console.log(bs.format('YYYY/MM/DD')); // "2081/05/15"
```

#### Converting AD to BS
```typescript
// ❌ OLD: nepali-date-converter
const bs = new NepaliDate(new Date('2024-08-30'));
const bsYear = bs.getYear();
const bsMonth = bs.getMonth() + 1; // Had to manually add 1

// ✅ NEW: bsday.js
const bs = bsday('2024-08-30'); // Or BSDay.fromAD(new Date())
const { year, month, day } = bs.toBS();
console.log(bs.year(), bs.month(), bs.date());
```

#### Date Arithmetic
```typescript
// ❌ OLD: nepali-date-converter
const bs = new NepaliDate(2081, 4, 15);
bs.setDate(bs.getDate() + 7); // Mutates original object

// ✅ NEW: bsday.js (Immutable by default, Day.js style)
const bs = bsday.bs(2081, 5, 15);
const nextWeek = bs.add(7, 'day'); // Returns new BSDay instance
```

### Method Mapping Table

| `nepali-date-converter` | `bsday.js` Equivalent | Notes |
|---|---|---|
| `new NepaliDate(y, m, d)` | `bsday.bs(y, m, d)` | `bsday.js` uses **1-indexed** months (1=Baisakh, 12=Chaitra) |
| `new NepaliDate(adDate)` | `bsday(adDate)` or `BSDay.fromAD(adDate)` | Standardized constructor |
| `date.toJsDate()` | `date.toAD()` | Returns standard JS `Date` |
| `date.format('YYYY-MM-DD')` | `date.format('YYYY-MM-DD')` | Day.js compliant format tokens |
| `date.getYear()` | `date.year()` | Getter / Setter |
| `date.getMonth()` | `date.month()` | 1-indexed in `bsday.js` |
| `date.getDate()` | `date.date()` | Day of month |
| `date.getDay()` | `date.day()` or `date.dayOfWeek()` | 0 = Sunday, 6 = Saturday |

---

## 2. Migrating from `bikram-sambat` / `bikram-sambat-js`

### Installation
```bash
# Remove old library
npm uninstall bikram-sambat bikram-sambat-js

# Install bsday.js
npm install @bsday.js/core
```

### Side-by-Side Code Comparison

#### Creating & Formatting Dates
```typescript
// ❌ OLD: bikram-sambat
import BikramSambat from 'bikram-sambat';

const bs = new BikramSambat('2081-05-15', 'YYYY-MM-DD');
const formatted = bs.toGregorian();

// ✅ NEW: bsday.js
import { bsday } from '@bsday.js/core';

const bs = bsday.bs('2081/05/15');
const ad = bs.toAD();
const nepaliText = bs.locale('ne').format('YYYY MMMM DD, dddd');
// "२०८१ भाद्र १५, आइतबार"
```

#### Comparison and Validation
```typescript
// ❌ OLD: bikram-sambat
bs.isAfter(other);
bs.isBefore(other);

// ✅ NEW: bsday.js
bs.isAfter(other, 'day');
bs.isBefore(other, 'month');
bs.isSame(other, 'year');
bs.isSameOrAfter(other, 'day');
bs.isSameOrBefore(other, 'day');
```

---

## 3. Migrating from `nepali-datetime`

### Installation
```bash
# Remove old library
npm uninstall nepali-datetime

# Install bsday.js
npm install @bsday.js/core
```

### Side-by-Side Code Comparison

#### Formatting Token Differences
`nepali-datetime` used Python `strftime`-style tokens (`%Y-%M-%D`). `bsday.js` uses standard Day.js / ISO tokens (`YYYY/MM/DD`).

```typescript
// ❌ OLD: nepali-datetime
import NepaliDate from 'nepali-datetime';

const npDate = new NepaliDate();
const str = npDate.format('%Y/%M/%d %h:%m:%s');

// ✅ NEW: bsday.js
import { bsday } from '@bsday.js/core';

const now = bsday();
const str = now.format('YYYY/MM/DD HH:mm:ss');
const strNe = now.locale('ne').format('YYYY/MM/DD [समय:] hh:mm A');
```

### Token Translation Reference

| Formatting Goal | `nepali-datetime` | `bsday.js` | Example Output |
|---|---|---|---|
| 4-digit Year | `%Y` | `YYYY` | `2081` |
| 2-digit Year | `%y` | `YY` | `81` |
| 2-digit Month | `%M` | `MM` | `05` |
| 1-digit Month | `%m` | `M` | `5` |
| Month Full Name | `%B` | `MMMM` | `Bhadra` / `भाद्र` |
| 2-digit Day | `%d` | `DD` | `15` |
| 1-digit Day | `%j` | `D` | `15` |
| Weekday Name | `%A` | `dddd` | `Sunday` / `आइतबार` |
| 24-hour Hour | `%H` | `HH` | `14` |
| 12-hour Hour | `%I` | `hh` | `02` |
| Minute | `%i` | `mm` | `30` |
| Second | `%s` | `ss` | `45` |
| Escaped Literal | N/A | `[Literal]` | `bsday.format('YYYY [साल]')` |

---

## 4. Upgrading from Day.js to `bsday.js`

If your project currently uses `dayjs` for Gregorian dates, `bsday.js` was designed specifically as a **drop-in dual calendar replacement**. You can keep your existing Day.js habits while seamlessly gaining Bikram Sambat powers:

```typescript
import { bsday } from '@bsday.js/core';

// Day.js style syntax
const d = bsday()
  .add(1, 'month')
  .startOf('month')
  .locale('ne');

console.log(d.format('YYYY/MM/DD')); // "२०८१/०६/०१"
console.log(d.fiscalYear('extended')); // "आ.व. २०८१/८२"
console.log(d.age()); // { years: 24, months: 3, days: 5 }
```
