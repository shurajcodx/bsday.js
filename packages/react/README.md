# ⚛️ @bsday.js/react

> **Headless, accessible (WAI-ARIA) React hooks and primitives for Bikram Sambat (BS) Nepali Calendar, Datepicker, and Range Picker.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/react.svg?style=flat-square&color=indigo)](https://www.npmjs.com/package/@bsday.js/react)
[![bundle size](<https://img.shields.io/badge/bundle%20size-~3KB%20(gzipped)-emerald.svg?style=flat-square>)](https://bundlephobia.com/package/@bsday.js/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
🗓️ **Dual-Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)

---

## ✨ Features

- 🎯 **Headless & Unstyled**: Works seamlessly with Tailwind CSS, shadcn/ui, Material UI, Chakra UI, or vanilla CSS.
- ♿ **WAI-ARIA Accessible**: Out-of-the-box `role="grid"`, `role="gridcell"`, `aria-selected`, `aria-disabled`, and localized `aria-label`.
- ⌨️ **Full Keyboard Navigation**: `ArrowLeft`/`ArrowRight` (±1 day), `ArrowUp`/`ArrowDown` (±1 week), `PageUp`/`PageDown` (±1 month, Shift for ±1 year), `Home`/`End` (start/end of month).
- 🇳🇵 **Bilingual & Devanagari**: Full support for Nepali numerals (`०-९`), month names (`वैशाख - चैत`), and English formatting.
- 📦 **Zero Runtime Overhead**: Lightweight, treeshakeable, dual ESM/CommonJS package built for React 18 and React 19.

---

## 📦 Installation

```bash
npm install @bsday.js/core @bsday.js/react
# or
pnpm add @bsday.js/core @bsday.js/react
# or
yarn add @bsday.js/core @bsday.js/react
```

---

## 🚀 Quick Start & Usage

### 1. Calendar Grid with Keyboard Navigation (`useBSCalendarGrid`)

```tsx
import React from 'react';
import { useBSCalendarGrid } from '@bsday.js/react';

export function BSCalendar() {
  const {
    year,
    month,
    matrix,
    currentMonthName,
    weekdayNames,
    goToNextMonth,
    goToPrevMonth,
    getGridProps,
    getCellProps,
  } = useBSCalendarGrid({
    initialYear: 2081,
    initialMonth: 5,
    locale: 'ne',
  });

  return (
    <div className="w-80 rounded-2xl border p-4 shadow-xl">
      {/* Month Header Navigation */}
      <div className="flex items-center justify-between pb-3">
        <button onClick={goToPrevMonth} aria-label="Previous Month">
          &larr;
        </button>
        <span className="font-bold">
          {currentMonthName} {year}
        </span>
        <button onClick={goToNextMonth} aria-label="Next Month">
          &rarr;
        </button>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
        {weekdayNames.map((day, idx) => (
          <div key={idx} className={idx === 6 ? 'text-red-500' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* 42-Cell Matrix with WAI-ARIA */}
      <div {...getGridProps()} className="mt-2 space-y-1 outline-none">
        {matrix.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((cell, cIdx) => (
              <button
                key={cIdx}
                {...getCellProps(cell, {
                  onSelect: (selected) => console.log('Selected BS Date:', selected.dateString),
                })}
                className={`h-9 w-full rounded text-sm ${
                  !cell.isCurrentMonth
                    ? 'text-gray-300'
                    : cell.isSaturday
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-800'
                } hover:bg-indigo-50`}
              >
                {cell.dayText}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 2. Single Datepicker (`useBSDatePicker`)

```tsx
import React from 'react';
import { useBSDatePicker } from '@bsday.js/react';

export function BSDatePickerField() {
  const { formattedValue, isOpen, selectDate, calendar, getInputProps, getTriggerProps } =
    useBSDatePicker({
      defaultValue: '2081/05/15',
      locale: 'ne',
      format: 'YYYY/MM/DD',
    });

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input {...getInputProps()} className="border px-3 py-2 rounded-lg" />
        <button {...getTriggerProps()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          📅
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white border p-4 rounded-xl shadow-2xl">
          <div className="flex justify-between pb-2">
            <button onClick={calendar.goToPrevMonth}>&larr;</button>
            <span className="font-bold">
              {calendar.currentMonthName} {calendar.year}
            </span>
            <button onClick={calendar.goToNextMonth}>&rarr;</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.matrix.flat().map((cell, idx) => (
              <button
                key={idx}
                {...calendar.getCellProps(cell, {
                  onSelect: (c) => selectDate(c.dateString),
                })}
                className="h-8 w-8 rounded text-xs hover:bg-indigo-100"
              >
                {cell.dayText}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Date Range Picker (`useBSRangePicker`)

```tsx
import React from 'react';
import { useBSRangePicker } from '@bsday.js/react';

export function HotelBookingRangePicker() {
  const {
    startDate,
    endDate,
    selectDate,
    setHoverDate,
    isDateInRange,
    isDateRangeStart,
    isDateRangeEnd,
    calendar,
  } = useBSRangePicker({
    defaultValue: { startDate: '2081/05/10', endDate: '2081/05/18' },
    locale: 'ne',
  });

  return (
    <div className="p-4 border rounded-2xl w-84 shadow-xl">
      <div className="flex justify-between mb-4 font-bold">
        <span>सुरु: {startDate || '—'}</span>
        <span>अन्त्य: {endDate || '—'}</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {calendar.matrix.flat().map((cell, idx) => {
          const isStart = isDateRangeStart(cell.dateString);
          const isEnd = isDateRangeEnd(cell.dateString);
          const inRange = isDateInRange(cell.dateString);

          return (
            <button
              key={idx}
              disabled={cell.isDisabled}
              onClick={() => selectDate(cell)}
              onMouseEnter={() => setHoverDate(cell.dateString)}
              onMouseLeave={() => setHoverDate(null)}
              className={`h-9 text-sm ${
                isStart || isEnd
                  ? 'bg-indigo-600 text-white rounded'
                  : inRange
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'hover:bg-gray-100 rounded'
              }`}
            >
              {cell.dayText}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 📖 API Reference

| Hook                             | Description                                                | Return Value                                                                                                   |
| :------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **`useBSCalendarGrid(options)`** | Full calendar matrix state, ARIA props & keyboard handlers | `year`, `month`, `matrix`, `monthNames`, `weekdayNames`, `goToNextMonth()`, `getGridProps()`, `getCellProps()` |
| **`useBSDatePicker(options)`**   | Single date picker state with popover toggle               | `selectedDate`, `formattedValue`, `isOpen`, `open()`, `close()`, `selectDate()`, `getInputProps()`             |
| **`useBSRangePicker(options)`**  | Date range selection with real-time hover preview          | `startDate`, `endDate`, `hoverDate`, `selectDate()`, `isDateInRange()`, `clear()`                              |

_(Note: `useNepaliCalendarGrid`, `useNepaliDatePicker`, and `useNepaliRangePicker` are exported as backward-compatible aliases)._

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
