# 🧡 @bsday.js/svelte

> **Headless, accessible (WAI-ARIA) Svelte stores and runes primitives for Bikram Sambat (BS) Nepali Calendar, Datepicker, and Range Picker.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/svelte.svg?style=flat-square&color=orange)](https://www.npmjs.com/package/@bsday.js/svelte)
[![bundle size](https://img.shields.io/badge/bundle%20size-~3KB%20(gzipped)-emerald.svg?style=flat-square)](https://bundlephobia.com/package/@bsday.js/svelte)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
🗓️ **Dual-Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)

---

## ✨ Features

- 🎯 **Headless & Unstyled**: Built with lightweight Svelte reactive stores (`writable`, `derived`), compatible with Svelte 4 and Svelte 5 (Runes).
- ♿ **WAI-ARIA Accessible**: Semantic `role="grid"`, `role="gridcell"`, `aria-selected`, `aria-disabled`, and localized `aria-label`.
- ⌨️ **Full Keyboard Navigation**: `ArrowLeft`/`ArrowRight` (±1 day), `ArrowUp`/`ArrowDown` (±1 week), `PageUp`/`PageDown` (±1 month/year), `Home`/`End`.
- 🇳🇵 **Bilingual & Devanagari**: Full support for Nepali numerals (`०-९`), month names (`वैशाख - चैत`), and English formatting.

---

## 📦 Installation

```bash
npm install @bsday.js/core @bsday.js/svelte
# or
pnpm add @bsday.js/core @bsday.js/svelte
# or
yarn add @bsday.js/core @bsday.js/svelte
```

---

## 🚀 Quick Start & Usage

### 1. Calendar Grid Component (`createNepaliCalendar`)

```svelte
<script lang="ts">
  import { createNepaliCalendar } from '@bsday.js/svelte';

  const cal = createNepaliCalendar({
    initialYear: 2081,
    initialMonth: 5,
    locale: 'ne',
  });

  const { year, month, matrix, currentMonthName, weekdayNames, goToNextMonth, goToPrevMonth, getGridProps, getCellProps } = cal;
</script>

<div class="w-80 rounded-2xl border p-4 shadow-xl">
  <!-- Month Navigation Header -->
  <div class="flex items-center justify-between pb-3">
    <button on:click={goToPrevMonth} aria-label="Previous Month">&larr;</button>
    <span class="font-bold">{$currentMonthName} {$year}</span>
    <button on:click={goToNextMonth} aria-label="Next Month">&rarr;</button>
  </div>

  <!-- Weekday Labels -->
  <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
    {#each $weekdayNames as day, idx}
      <div class={idx === 6 ? 'text-red-500' : ''}>{day}</div>
    {/each}
  </div>

  <!-- 42-Cell Grid Matrix -->
  <div {...getGridProps()} class="mt-2 space-y-1 outline-none">
    {#each $matrix as week}
      <div class="grid grid-cols-7 gap-1">
        {#each week as cell}
          <button
            {...getCellProps(cell, { onSelect: (c) => console.log('Selected BS Date:', c.dateString) })}
            class="h-9 w-full rounded text-sm hover:bg-orange-50 {!cell.isCurrentMonth ? 'text-gray-300' : cell.isSaturday ? 'text-red-600 font-semibold' : 'text-gray-800'}"
          >
            {cell.dayText}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>
```

---

### 2. Single Datepicker (`createNepaliDatePicker`)

```svelte
<script lang="ts">
  import { createNepaliDatePicker } from '@bsday.js/svelte';

  const picker = createNepaliDatePicker({
    defaultValue: '2081/05/15',
    locale: 'ne',
    format: 'YYYY/MM/DD',
  });

  const { formattedValue, isOpen, open, toggle, selectDate, calendar, getInputProps, getTriggerProps } = picker;
</script>

<div class="relative">
  <div class="flex gap-2">
    <input {...getInputProps()} class="border px-3 py-2 rounded-lg" />
    <button {...getTriggerProps()} class="bg-orange-600 text-white px-4 py-2 rounded-lg">
      📅
    </button>
  </div>

  {#if $isOpen}
    <div class="absolute top-12 left-0 z-50 bg-white border p-4 rounded-xl shadow-2xl">
      <div class="flex justify-between pb-2">
        <button on:click={calendar.goToPrevMonth}>&larr;</button>
        <span class="font-bold">{$calendar.currentMonthName} {$calendar.year}</span>
        <button on:click={calendar.goToNextMonth}>&rarr;</button>
      </div>
      <div class="grid grid-cols-7 gap-1">
        {#each $calendar.matrix.flat() as cell}
          <button
            {...calendar.getCellProps(cell, { onSelect: (c) => selectDate(c.dateString) })}
            class="h-8 w-8 rounded text-xs hover:bg-orange-100"
          >
            {cell.dayText}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
```

---

## 📖 API Reference

| Store Primitive | Description | Return Stores / Methods |
| :--- | :--- | :--- |
| **`createBSCalendar(options)`** | Svelte stores for calendar matrix, navigation & ARIA handlers | `$year`, `$month`, `$matrix`, `$currentMonthName`, `goToNextMonth()`, `getGridProps()`, `getCellProps()` |
| **`createBSDatePicker(options)`** | Svelte stores for single date selection with popover state | `$selectedDate`, `$formattedValue`, `$isOpen`, `open()`, `close()`, `selectDate()`, `getInputProps()` |
| **`createBSRangePicker(options)`** | Svelte stores for date range selection and hover preview | `$startDate`, `$endDate`, `$hoverDate`, `selectDate()`, `isDateInRange()`, `clear()` |

*(Note: `createNepaliCalendar`, `createNepaliDatePicker`, and `createNepaliRangePicker` are exported as backward-compatible aliases).*

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
