# 🇳🇵 Devanagari Numerals & Nepali Localization Guide

This guide covers complete localization practices for Bikram Sambat dates, Devanagari digits (`०-९`), Tithi names, and festival labels using `@bsday.js/core` and `@bsday.js/dataset`.

---

## 1. Devanagari Numerals (`०-९`)

`bsday.js` automatically renders Devanagari numerals whenever `locale('ne')` is specified.

### Formatting with Devanagari Digits
```typescript
import bsday from '@bsday.js/core';

const date = bsday.bs(2081, 5, 15);

console.log(date.locale('ne').format('YYYY/MM/DD'));
// Output: "२०८१/०५/१५"

console.log(date.locale('ne').format('YYYY MMMM DD, dddd'));
// Output: "२०८१ भाद्र १५, शनिबार"

console.log(date.locale('ne').format('YYYY [साल] MMMM DD [गते], hh:mm A'));
// Output: "२०८१ साल भाद्र १५ गते, ०२:३० अपराह्न"
```

---

## 2. Utility: Converting Between ASCII & Devanagari Digits

If you need to convert standalone numbers (amounts, page numbers, serial numbers):

```typescript
const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const DEVANAGARI_MAP: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/**
 * Converts English digits (0-9) to Devanagari (०-९).
 */
export function toDevanagariDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]!);
}

/**
 * Converts Devanagari digits (०-९) back to ASCII (0-9).
 */
export function toAsciiDigits(input: string): string {
  return input.replace(/[०-९]/g, (char) => DEVANAGARI_MAP[char] ?? char);
}

// Example
console.log(toDevanagariDigits(2081)); // "२०८१"
console.log(toAsciiDigits('२०८१/०५/१५')); // "2081/05/15"
```

---

## 3. Nepali Month & Weekday Terminology

`@bsday.js/core` provides standardized month and weekday name helpers:

```typescript
import { getMonthNames, getWeekdayNames } from '@bsday.js/core';

// Nepali Months
console.log(getMonthNames('ne', 'long'));
// ['वैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'असोज', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत']

// Nepali Short Weekdays
console.log(getWeekdayNames('ne', 'short'));
// ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि']

// Single-letter Min Weekdays (for compact calendar headers)
console.log(getWeekdayNames('ne', 'min'));
// ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']
```

---

## 4. Devanagari Panchang & Astrological Data

When hydrated with `@bsday.js/dataset`, `BSDay` provides Devanagari astronomical properties:

```typescript
import { bsday, BSDay } from '@bsday.js/core';
import { dataset } from '@bsday.js/dataset/all';

BSDay.setDataset(dataset);

const festivalDay = bsday.bs(2081, 6, 26).locale('ne');

// Localized Panchang Data
console.log(festivalDay.tithi); // "दशमी" (Dashami)
console.log(festivalDay.data('ne')?.paksha); // "शुक्ल" (Shukla)
console.log(festivalDay.data('ne')?.nakshatra); // "श्रवण" (Shravana)
console.log(festivalDay.festivals); // ["विजया दशमी"] (Vijaya Dashami)
console.log(festivalDay.isHoliday); // true
```

---

## 5. React Component: Localized Header Card

```tsx
// components/NepaliTodayCard.tsx
'use client';

import React from 'react';
import { bsday, BSDay } from '@bsday.js/core';
import { dataset } from '@bsday.js/dataset/all';

// Initialize dataset
BSDay.setDataset(dataset);

export default function NepaliTodayCard() {
  const today = bsday().locale('ne');
  const festivals = today.festivals;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          आजको पञ्चाङ्ग (Today)
        </span>
        <span className="text-xs text-slate-500">
          {today.fiscalYear('extended')}
        </span>
      </div>

      <div className="mt-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {today.format('YYYY MMMM DD, dddd')}
        </h2>
        <p className="text-sm text-slate-500">
          AD: {today.format('YYYY-MM-DD', 'ad')} ({today.format('dddd', 'ad')})
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
        {today.tithi && (
          <span className="rounded-md bg-indigo-100/70 px-2 py-1 font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            तिथि: {today.tithi}
          </span>
        )}
        {festivals.map((fest, idx) => (
          <span
            key={idx}
            className="rounded-md bg-red-100/80 px-2 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            🎉 {fest}
          </span>
        ))}
      </div>
    </div>
  );
}
```
