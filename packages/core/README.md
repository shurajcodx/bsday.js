# 🇳🇵 @bsday.js/core

> **Ultra-fast, zero-dependency (< 5KB), Day.js-compatible dual calendar (Bikram Sambat ↔ Gregorian) SDK for JavaScript and TypeScript.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/core.svg?style=flat-square&color=indigo)](https://www.npmjs.com/package/@bsday.js/core)
[![bundle size](https://img.shields.io/badge/bundle%20size-<5KB-emerald.svg?style=flat-square)](https://bundlephobia.com/package/@bsday.js/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)
[![tests](https://img.shields.io/badge/tests-77%2F77%20passing-brightgreen.svg?style=flat-square)](https://vitest.dev)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **API Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
📅 **Interactive Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)

`@bsday.js/core` is built from the ground up for modern Nepali web applications, fintech, banking, tax accounting, and UI libraries. It provides seamless **Day.js API parity**, **Nepali Fiscal Year (आर्थिक वर्ष) engine**, **KYC chronological age calculation**, **headless calendar grid generation**, and **Zod/Form validation**.

---

## 📦 Installation

```bash
npm install @bsday.js/core
# or
pnpm add @bsday.js/core
# or
yarn add @bsday.js/core
```

---

## ⚡ Performance

Tested on Node.js v24 (macOS ARM64, 200,000 operations each):

| Benchmark Operation                   | Throughput           | Avg Latency |
| ------------------------------------- | -------------------- | ----------- |
| **BS ➔ AD Date Conversion**           | **~483,000 ops/sec** | `2.0 μs`    |
| **AD ➔ BS Date Conversion**           | **~281,000 ops/sec** | `3.5 μs`    |
| **Fiscal Year (आर्थिक वर्ष) Engine**  | **~207,000 ops/sec** | `4.8 μs`    |
| **KYC Chronological Age Calculation** | **~157,000 ops/sec** | `6.3 μs`    |
| **Full Date Formatting (`format`)**   | **~125,000 ops/sec** | `8.0 μs`    |

---

## 🚀 Quick Reference & Examples

### 1. Dual-Calendar Creation & Conversion

```typescript
import { bsday, BSDay } from '@bsday.js/core';

// Current time
const now = bsday();

// Explicit BS date (1-indexed months: 1=Baisakh, 5=Bhadra)
const bs = bsday.bs(2081, 5, 15);
const ad = bs.toAD(); // Native JavaScript Date: 2024-08-31T00:00:00.000Z
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
d.endOf('month'); // 2081/05/31 23:59:59.999

// Comparison
d.isBefore(other);
d.isSameOrAfter(other, 'day');
d.isBetween(start, end, 'day', '[]');
d.diff(other, 'year');
```

### 3. Nepali Fiscal Year Engine (आर्थिक वर्ष)

```typescript
const date = bsday.bs(2081, 5, 10);

date.fiscalYear('short'); // "2081/82"
date.fiscalYear('full'); // "2081/2082"
date.fiscalYear('extended'); // "FY 2081/82"
date.locale('ne').fiscalYear('extended'); // "आ.व. २०८१/८२"

date.fiscalQuarter(); // 1 (Q1: Shrawan-Ashwin)
date.startOf('fiscalYear'); // 2081/04/01 00:00:00.000
date.endOf('fiscalYear'); // 2082/03/31 23:59:59.999
```

### 4. KYC & Chronological Age Calculation

```typescript
const birth = bsday.bs(2057, 5, 15);

birth.age(); // { years: 24, months: 3, days: 5 }
birth.formatAge('en'); // "24 years, 3 months, 5 days"
birth.formatAge('ne'); // "२४ वर्ष, ३ महिना, ५ दिन"
birth.isAdult(18); // true
```

### 5. Headless Calendar Grid Generator (React / Vue / Svelte / Vanilla)

```typescript
import { getCalendarMatrix } from '@bsday.js/core';

// Returns a 6-week matrix (42 cells) with complete day metadata
const matrix = getCalendarMatrix(2083, 7, {
  locale: 'ne',
  minDate: '2083/07/01',
  maxDate: '2083/07/30',
  fixedWeeks: true,
});

matrix.forEach((week) => {
  week.forEach((cell) => {
    console.log(cell.dateString, cell.isCurrentMonth, cell.isHoliday);
  });
});
```

### 6. Authentic Devanagari / Nepali Localization

```typescript
const d = bsday.bs(2081, 1, 1).locale('ne');

console.log(d.format('dddd, MMMM D, YYYY')); // "शनिबार, वैशाख १, २०८१"
console.log(d.tithi); // "पञ्चमी"
console.log(d.festivals); // ["नयाँ वर्ष / बिस्का जात्रा"]
```

### 7. Form & Zod Validation Helper

```typescript
import { validateBSDateString } from '@bsday.js/core';

const res = validateBSDateString('2081/05/10', { minYear: 1990, maxYear: 2100 });
console.log(res.isValid); // true
```

---

## 📚 Ecosystem Packages

- **[@bsday.js/dataset](https://www.npmjs.com/package/@bsday.js/dataset)**: 111-year astronomical Panchang (_Tithi, Nakshatra, Yoga, Karana_), Nepali cultural festivals, and government public holidays (1990–2100 BS).

---

## 🔗 Useful Links

- 🌐 **Website**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)
- 📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)
- 🧪 **Interactive Playground**: [https://bsdayjs.vercel.app/playground](https://bsdayjs.vercel.app/playground)
- 💡 **Integration Recipes**: [https://bsdayjs.vercel.app/recipes](https://bsdayjs.vercel.app/recipes)
- 🐙 **GitHub Repository**: [https://github.com/shurajcodx/bsday.js](https://github.com/shurajcodx/bsday.js)

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
