# 💚 @bsday.js/vue

> **Headless, accessible (WAI-ARIA) Vue 3 Composition API composables for Bikram Sambat (BS) Nepali Calendar, Datepicker, and Range Picker.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/vue.svg?style=flat-square&color=emerald)](https://www.npmjs.com/package/@bsday.js/vue)
[![bundle size](<https://img.shields.io/badge/bundle%20size-~3KB%20(gzipped)-emerald.svg?style=flat-square>)](https://bundlephobia.com/package/@bsday.js/vue)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
🗓️ **Dual-Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)

---

## ✨ Features

- 🎯 **Headless & Unstyled**: Built for Vue 3 Composition API (`ref`, `computed`, `shallowRef`), fully compatible with Tailwind CSS, PrimeVue, Vuetify, or custom CSS.
- 🔄 **`v-model` Ready**: Native reactive binding with `modelValue` support for seamless two-way binding.
- ♿ **WAI-ARIA Accessible**: Built-in accessibility attributes (`role="grid"`, `role="gridcell"`, `aria-selected`, `aria-label`).
- ⌨️ **Full Keyboard Navigation**: `ArrowLeft`/`ArrowRight` (±1 day), `ArrowUp`/`ArrowDown` (±1 week), `PageUp`/`PageDown` (±1 month/year), `Home`/`End`.
- 🇳🇵 **Bilingual & Devanagari**: Full support for Nepali numerals (`०-९`), months (`वैशाख - चैत`), and English formatting.

---

## 📦 Installation

```bash
npm install @bsday.js/core @bsday.js/vue
# or
pnpm add @bsday.js/core @bsday.js/vue
# or
yarn add @bsday.js/core @bsday.js/vue
```

---

## 🚀 Quick Start & Usage

### 1. Calendar Grid with Keyboard Navigation (`useNepaliCalendarGrid`)

```vue
<script setup lang="ts">
import { useNepaliCalendarGrid } from '@bsday.js/vue';

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
} = useNepaliCalendarGrid({
  initialYear: 2081,
  initialMonth: 5,
  locale: 'ne',
});
</script>

<template>
  <div class="w-80 rounded-2xl border p-4 shadow-xl">
    <!-- Month Header Navigation -->
    <div class="flex items-center justify-between pb-3">
      <button @click="goToPrevMonth" aria-label="Previous Month">&larr;</button>
      <span class="font-bold">{{ currentMonthName }} {{ year }}</span>
      <button @click="goToNextMonth" aria-label="Next Month">&rarr;</button>
    </div>

    <!-- Weekday Header -->
    <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
      <div v-for="(day, idx) in weekdayNames" :key="idx" :class="{ 'text-red-500': idx === 6 }">
        {{ day }}
      </div>
    </div>

    <!-- 42-Cell Matrix with WAI-ARIA -->
    <div v-bind="getGridProps()" class="mt-2 space-y-1 outline-none">
      <div v-for="(week, wIdx) in matrix" :key="wIdx" class="grid grid-cols-7 gap-1">
        <button
          v-for="(cell, cIdx) in week"
          :key="cIdx"
          v-bind="getCellProps(cell, { onSelect: (c) => console.log('Selected:', c.dateString) })"
          class="h-9 w-full rounded text-sm hover:bg-emerald-50"
          :class="{
            'text-gray-300': !cell.isCurrentMonth,
            'text-red-600 font-semibold': cell.isSaturday,
            'text-gray-800': cell.isCurrentMonth && !cell.isSaturday,
          }"
        >
          {{ cell.dayText }}
        </button>
      </div>
    </div>
  </div>
</template>
```

---

### 2. Single Datepicker with `v-model` (`useNepaliDatePicker`)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useNepaliDatePicker } from '@bsday.js/vue';

const selectedDate = ref('2081/05/15');

const { formattedValue, isOpen, selectDate, calendar, getInputProps, getTriggerProps } =
  useNepaliDatePicker({
    modelValue: selectedDate,
    locale: 'ne',
    format: 'YYYY/MM/DD',
  });
</script>

<template>
  <div class="relative">
    <div class="flex gap-2">
      <input v-bind="getInputProps()" class="border px-3 py-2 rounded-lg" />
      <button v-bind="getTriggerProps()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg">
        📅
      </button>
    </div>

    <div
      v-if="isOpen"
      class="absolute top-12 left-0 z-50 bg-white border p-4 rounded-xl shadow-2xl"
    >
      <div class="flex justify-between pb-2">
        <button @click="calendar.goToPrevMonth">&larr;</button>
        <span class="font-bold">{{ calendar.currentMonthName }} {{ calendar.year }}</span>
        <button @click="calendar.goToNextMonth">&rarr;</button>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(cell, idx) in calendar.matrix.flat()"
          :key="idx"
          v-bind="calendar.getCellProps(cell, { onSelect: (c) => selectDate(c.dateString) })"
          class="h-8 w-8 rounded text-xs hover:bg-emerald-100"
        >
          {{ cell.dayText }}
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## 📖 API Reference

| Composable                       | Description                                                        | Return Values                                                                                                  |
| :------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **`useBSCalendarGrid(options)`** | Full reactive calendar matrix state and ARIA keyboard handlers     | `year`, `month`, `matrix`, `monthNames`, `weekdayNames`, `goToNextMonth()`, `getGridProps()`, `getCellProps()` |
| **`useBSDatePicker(options)`**   | Single date picker state with popover toggle and `v-model` support | `selectedDate`, `formattedValue`, `isOpen`, `open()`, `close()`, `selectDate()`, `getInputProps()`             |
| **`useBSRangePicker(options)`**  | Date range selection composable with real-time hover preview       | `startDate`, `endDate`, `hoverDate`, `selectDate()`, `isDateInRange()`, `clear()`                              |

_(Note: `useNepaliCalendarGrid`, `useNepaliDatePicker`, and `useNepaliRangePicker` are exported as backward-compatible aliases)._

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
