# 🎨 Headless React + Tailwind CSS Nepali DatePicker

This recipe provides a complete, copy-pasteable React DatePicker component built with `getCalendarMatrix()` from `@bsday.js/core` and Tailwind CSS.

---

## Complete React Component

```tsx
// components/NepaliDatePicker.tsx
'use client';

import React, { useState } from 'react';
import {
  getCalendarMatrix,
  getMonthNames,
  getWeekdayNames,
  type CalendarCell,
  bsday,
} from '@bsday.js/core';

interface NepaliDatePickerProps {
  value?: string; // "YYYY/MM/DD"
  onChange?: (date: string, cell: CalendarCell) => void;
  locale?: 'en' | 'ne';
  minDate?: string;
  maxDate?: string;
}

export default function NepaliDatePicker({
  value,
  onChange,
  locale = 'ne',
  minDate,
  maxDate,
}: NepaliDatePickerProps) {
  const initial = value ? bsday.bs(value) : bsday();
  const [currentYear, setCurrentYear] = useState(initial.isValid() ? initial.year() : 2081);
  const [currentMonth, setCurrentMonth] = useState(initial.isValid() ? initial.month() : 5);
  const [selectedDate, setSelectedDate] = useState<string>(value || '');

  // Generate Matrix
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

  const handleSelect = (cell: CalendarCell) => {
    if (cell.isDisabled) return;
    setSelectedDate(cell.dateString);
    onChange?.(cell.dateString, cell);
  };

  return (
    <div className="w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Previous Month"
        >
          &larr;
        </button>

        <div className="text-center font-bold text-slate-800 dark:text-slate-100">
          {monthNames[currentMonth - 1]} {currentYear}
        </div>

        <button
          onClick={handleNextMonth}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Next Month"
        >
          &rarr;
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
        {weekdayNames.map((day, idx) => (
          <div key={idx} className={idx === 6 ? 'text-red-500 dark:text-red-400' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="mt-2 space-y-1">
        {matrix.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((cell, cIdx) => {
              const isSelected = selectedDate === cell.dateString;

              return (
                <button
                  key={cIdx}
                  disabled={cell.isDisabled}
                  onClick={() => handleSelect(cell)}
                  className={`relative flex h-9 w-full flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    !cell.isCurrentMonth
                      ? 'text-slate-300 dark:text-slate-600'
                      : cell.isSaturday
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-200'
                  } ${
                    isSelected
                      ? '!bg-indigo-600 !text-white shadow-md'
                      : cell.isToday
                      ? 'border border-indigo-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${cell.isDisabled ? 'cursor-not-allowed opacity-30' : ''}`}
                >
                  <span>{cell.dayText}</span>

                  {/* AD sub-date indicator */}
                  <span className="text-[9px] opacity-60">
                    {cell.ad.getUTCDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
```
