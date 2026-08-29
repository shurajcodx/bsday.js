# @bsday.js/core

Core library for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates in JavaScript and TypeScript.

`@bsday.js/core` provides ultra-fast, zero-bloat (< 5KB) dual-calendar operations with **Day.js syntax parity**, **Nepali Fiscal Year engine**, **KYC chronological age calculation**, **headless calendar grid generation**, and **Zod/Form validation**.

---

## Installation

```bash
npm install @bsday.js/core
# or
pnpm add @bsday.js/core
# or
yarn add @bsday.js/core
```

---

## Features & Quick Reference

### 1. Dual-Calendar Creation & Conversion
```typescript
import { bsday, BSDay } from '@bsday.js/core';

// Current time
const now = bsday();

// Explicit BS date (1-indexed months: 1=Baisakh, 5=Bhadra)
const bs = bsday.bs(2081, 5, 15);
const ad = bs.toAD(); // Native JavaScript Date
console.log(bs.format('YYYY/MM/DD')); // "2081/05/15"

// Explicit AD date
const fromAd = bsday('2024-08-30');
console.log(fromAd.format('YYYY/MM/DD')); // "2081/05/14"
```

### 2. Day.js Compatible Date Arithmetic & Comparison
```typescript
const d = bsday.bs(2081, 5, 15);

// Arithmetic
d.add(1, 'month');
d.subtract(7, 'day');
d.startOf('month'); // 2081/05/01 00:00:00.000
d.endOf('month');   // 2081/05/31 23:59:59.999

// Comparison
d.isBefore(other);
d.isSameOrAfter(other, 'day');
d.diff(other, 'year');
```

### 3. Nepali Fiscal Year (आर्थिक वर्ष)
```typescript
const date = bsday.bs(2081, 5, 10);

date.fiscalYear('short');    // "2081/82"
date.fiscalYear('full');     // "2081/2082"
date.fiscalYear('extended'); // "FY 2081/82"
date.locale('ne').fiscalYear('extended'); // "आ.व. २०८१/८२"

date.fiscalQuarter(); // 1 (Q1: Shrawan-Ashwin)
date.startOf('fiscalYear'); // 2081/04/01 00:00:00.000
date.endOf('fiscalYear');   // 2082/03/31 23:59:59.999
```

### 4. KYC & Chronological Age Calculation
```typescript
const birth = bsday.bs(2057, 5, 15);

birth.age(); // { years: 24, months: 3, days: 5 }
birth.formatAge('en'); // "24 years, 3 months, 5 days"
birth.formatAge('ne'); // "२४ वर्ष, ३ महिना, ५ दिन"
birth.isAdult(18);     // true
```

### 5. Headless Calendar Grid Generator
```typescript
import { getCalendarMatrix } from '@bsday.js/core';

const matrix = getCalendarMatrix(2081, 5, {
  locale: 'ne',
  minDate: '2081/05/01',
  maxDate: '2081/05/30',
  fixedWeeks: true,
});
```

### 6. Form & Zod Validation Helper
```typescript
import { validateBSDateString } from '@bsday.js/core';

const res = validateBSDateString('2081/05/10', { minYear: 2000, maxYear: 2081 });
console.log(res.isValid); // true
```

---

## License

MIT © [shurajcodx](https://github.com/shurajcodx)
