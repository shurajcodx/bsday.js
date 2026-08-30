# 🅰️ @bsday.js/angular

> **Headless, accessible (WAI-ARIA) Angular Signals, Services, and Form Directives for Bikram Sambat (BS) Nepali Calendar & Datepicker.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/angular.svg?style=flat-square&color=red)](https://www.npmjs.com/package/@bsday.js/angular)
[![bundle size](<https://img.shields.io/badge/bundle%20size-~3KB%20(gzipped)-emerald.svg?style=flat-square>)](https://bundlephobia.com/package/@bsday.js/angular)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
🗓️ **Dual-Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)

---

## ✨ Features

- ⚡ **Angular Signals Ready**: Built for modern Angular (v16–v19+) with signal-based reactive state (`signal`, `computed`).
- 📝 **ControlValueAccessor Directives**: Out-of-the-box integration with Angular Reactive Forms (`[formControl]`, `formControlName`) and Template Forms (`[(ngModel)]`).
- 🎯 **Headless & Unstyled**: Integrate with Tailwind CSS, Angular Material, PrimeNG, or custom UI styles.
- ♿ **WAI-ARIA Accessible**: Semantic `role="grid"`, `role="gridcell"`, `aria-selected`, `aria-disabled`, and localized `aria-label`.
- ⌨️ **Full Keyboard Navigation**: `ArrowLeft`/`ArrowRight` (±1 day), `ArrowUp`/`ArrowDown` (±1 week), `PageUp`/`PageDown` (±1 month/year), `Home`/`End`.

---

## 📦 Installation

```bash
npm install @bsday.js/core @bsday.js/angular
# or
pnpm add @bsday.js/core @bsday.js/angular
# or
yarn add @bsday.js/core @bsday.js/angular
```

---

## 🚀 Quick Start & Usage

### 1. Signal-Based Calendar Component (`createNepaliCalendar`)

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createNepaliCalendar } from '@bsday.js/angular';

@Component({
  selector: 'app-nepali-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-80 rounded-2xl border p-4 shadow-xl">
      <!-- Month Header -->
      <div class="flex items-center justify-between pb-3">
        <button (click)="cal.goToPrevMonth()" aria-label="Previous Month">&larr;</button>
        <span class="font-bold">{{ cal.currentMonthName() }} {{ cal.year() }}</span>
        <button (click)="cal.goToNextMonth()" aria-label="Next Month">&rarr;</button>
      </div>

      <!-- Weekday Header -->
      <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
        <div *ngFor="let day of cal.weekdayNames(); let i = index" [class.text-red-500]="i === 6">
          {{ day }}
        </div>
      </div>

      <!-- 42-Cell Matrix with WAI-ARIA -->
      <div class="mt-2 space-y-1">
        <div *ngFor="let week of cal.matrix()" class="grid grid-cols-7 gap-1">
          <button
            *ngFor="let cell of week"
            [disabled]="cell.isDisabled"
            (click)="onSelect(cell)"
            class="h-9 w-full rounded text-sm hover:bg-red-50"
            [class.text-gray-300]="!cell.isCurrentMonth"
            [class.text-red-600]="cell.isSaturday"
          >
            {{ cell.dayText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NepaliCalendarComponent {
  cal = createNepaliCalendar({ initialYear: 2081, initialMonth: 5, locale: 'ne' });

  onSelect(cell: any) {
    console.log('Selected BS Date:', cell.dateString);
  }
}
```

---

### 2. Angular Reactive & Template Forms Directive (`bsdayNepaliDatePicker`)

```typescript
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NepaliDatePickerDirective } from '@bsday.js/angular';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NepaliDatePickerDirective],
  template: `
    <form class="space-y-4 max-w-sm">
      <label class="block text-sm font-medium">जन्म मिति (Date of Birth - BS):</label>
      <input
        type="text"
        bsdayNepaliDatePicker
        locale="ne"
        format="YYYY/MM/DD"
        [formControl]="dobControl"
        class="w-full border px-3 py-2 rounded-lg"
      />
      <p class="text-xs text-gray-500">Form Value: {{ dobControl.value }}</p>
    </form>
  `,
})
export class BookingFormComponent {
  dobControl = new FormControl('2081/05/15');
}
```

---

## 📖 API Reference

| Service / Directive                | Description                                      | Usage                                                               |
| :--------------------------------- | :----------------------------------------------- | :------------------------------------------------------------------ |
| **`createBSCalendar(options)`**    | Signal-based calendar matrix state engine        | `cal.year()`, `cal.month()`, `cal.matrix()`, `cal.goToNextMonth()`  |
| **`createBSDatePicker(options)`**  | Signal-based single datepicker state engine      | `picker.selectedDate()`, `picker.formattedValue()`, `picker.open()` |
| **`createBSRangePicker(options)`** | Signal-based date range picker state engine      | `range.startDate()`, `range.endDate()`, `range.selectDate()`        |
| **`BSDatePickerDirective`**        | Standalone `ControlValueAccessor` form directive | `<input bsdayDatePicker [formControl]="ctrl" />`                    |

_(Note: `NepaliCalendarService`, `NepaliDatePickerService`, and `NepaliDatePickerDirective` are exported as backward-compatible aliases)._

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
