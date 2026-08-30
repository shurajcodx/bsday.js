# 🗓️ Headless React + Tailwind CSS Nepali Date Range Picker

This recipe provides a complete, production-ready **Nepali Date Range Picker** component built with `@bsday.js/core` and **Tailwind CSS**. It is ideal for booking engines, travel check-in / check-out, and financial reporting date range selections.

---

## Features

- ✅ Dual-Calendar date range selection (Start Date & End Date)
- ✅ Real-time hover preview for in-between dates
- ✅ Seamless previous/next month navigation
- ✅ Support for Devanagari (`locale="ne"`) and English numerals
- ✅ Min/Max date bounds and Saturday holiday indicators

---

## 1. Complete Range Picker Component

```tsx
// components/NepaliDateRangePicker.tsx
'use client';

import React, { useState } from 'react';
import {
  bsday,
  getCalendarMatrix,
  getMonthNames,
  getWeekdayNames,
  isDateInRange,
  isDateDisabled,
  type CalendarCell,
} from '@bsday.js/core';

export interface DateRange {
  startDate: string | null; // "YYYY/MM/DD"
  endDate: string | null;   // "YYYY/MM/DD"
}

interface NepaliDateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  locale?: 'en' | 'ne';
  minDate?: string;
  maxDate?: string;
}

export default function NepaliDateRangePicker({
  value = { startDate: null, endDate: null },
  onChange,
  locale = 'ne',
  minDate,
  maxDate,
}: NepaliDateRangePickerProps) {
  const initial = value.startDate ? bsday.bs(value.startDate) : bsday();
  const [currentYear, setCurrentYear] = useState(initial.isValid() ? initial.year() : 2081);
  const [currentMonth, setCurrentMonth] = useState(initial.isValid() ? initial.month() : 5);

  const [range, setRange] = useState<DateRange>(value);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Generate 42-cell matrix
  const matrix = getCalendarMatrix(currentYear, currentMonth, {
    locale,
    minDate,
    maxDate,
    fixedWeeks: true,
  });

  const monthNames = getMonthNames(locale, 'long');
  const weekdayNames = getWeekdayNames(locale, 'min');

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleCellClick = (cell: CalendarCell) => {
    if (cell.isDisabled) return;

    const clickedDate = cell.dateString;

    // Case 1: Start fresh if both are selected or none selected
    if ((range.startDate && range.endDate) || (!range.startDate && !range.endDate)) {
      const nextRange = { startDate: clickedDate, endDate: null };
      setRange(nextRange);
      onChange?.(nextRange);
      return;
    }

    // Case 2: Start date selected, selecting end date
    if (range.startDate && !range.endDate) {
      const start = bsday.bs(range.startDate);
      const end = bsday.bs(clickedDate);

      // If clicked date is before start, make it the new start date
      if (end.isBefore(start, 'date')) {
        const nextRange = { startDate: clickedDate, endDate: null };
        setRange(nextRange);
        onChange?.(nextRange);
      } else {
        const nextRange = { startDate: range.startDate, endDate: clickedDate };
        setRange(nextRange);
        onChange?.(nextRange);
      }
    }
  };

  const isSelectedStart = (dateStr: string) => range.startDate === dateStr;
  const isSelectedEnd = (dateStr: string) => range.endDate === dateStr;

  const isInSelectedRange = (dateStr: string) => {
    if (range.startDate && range.endDate) {
      return isDateInRange(dateStr, range.startDate, range.endDate, '()');
    }
    if (range.startDate && hoverDate) {
      const start = bsday.bs(range.startDate);
      const hover = bsday.bs(hoverDate);
      if (hover.isAfter(start, 'date')) {
        return isDateInRange(dateStr, range.startDate, hoverDate, '()');
      }
    }
    return false;
  };

  return (
    <div className="w-84 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      {/* Header Month / Year Navigation */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Previous Month"
        >
          &larr;
        </button>

        <div className="text-center font-bold text-slate-800 dark:text-slate-100">
          {monthNames[currentMonth - 1]} {currentYear}
        </div>

        <button
          onClick={handleNextMonth}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Next Month"
        >
          &rarr;
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
        {weekdayNames.map((day, idx) => (
          <div key={idx} className={idx === 6 ? 'text-red-500 dark:text-red-400' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* 42-Cell Calendar Matrix */}
      <div className="mt-2 space-y-1">
        {matrix.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, cIdx) => {
              const isStart = isSelectedStart(cell.dateString);
              const isEnd = isSelectedEnd(cell.dateString);
              const inRange = isInSelectedRange(cell.dateString);

              return (
                <button
                  key={cIdx}
                  disabled={cell.isDisabled}
                  onClick={() => handleCellClick(cell)}
                  onMouseEnter={() => setHoverDate(cell.dateString)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`relative flex h-10 w-full flex-col items-center justify-center text-sm font-medium transition-all ${
                    !cell.isCurrentMonth
                      ? 'text-slate-300 opacity-40 dark:text-slate-600'
                      : cell.isSaturday
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-200'
                  } ${
                    isStart
                      ? 'rounded-l-lg bg-indigo-600 !text-white shadow-md'
                      : isEnd
                      ? 'rounded-r-lg bg-indigo-600 !text-white shadow-md'
                      : inRange
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                      : 'rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${cell.isDisabled ? 'cursor-not-allowed opacity-20' : ''}`}
                >
                  <span>{cell.dayText}</span>
                  <span className="text-[9px] opacity-50">{cell.ad.getUTCDate()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Range Summary Footer */}
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex justify-between">
          <span>सुरु (Start): {range.startDate || '—'}</span>
          <span>अन्त्य (End): {range.endDate || '—'}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Usage Example in Next.js / React

```tsx
// app/bookings/page.tsx
'use client';

import React, { useState } from 'react';
import NepaliDateRangePicker, { type DateRange } from '@/components/NepaliDateRangePicker';
import { bsday } from '@bsday.js/core';

export default function BookingPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: '2081/05/10',
    endDate: '2081/05/18',
  });

  const totalNights =
    selectedRange.startDate && selectedRange.endDate
      ? bsday.bs(selectedRange.endDate).diff(bsday.bs(selectedRange.startDate), 'day')
      : 0;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">होटल बुकिङ मिति चयन (Hotel Booking)</h1>
      <NepaliDateRangePicker
        value={selectedRange}
        onChange={setSelectedRange}
        locale="ne"
      />
      {totalNights > 0 && (
        <p className="mt-4 text-sm font-medium text-indigo-600">
          कुल बसाइ (Total Duration): {totalNights} दिन (Days)
        </p>
      )}
    </div>
  );
}
```
