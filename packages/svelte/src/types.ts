import type { Writable, Readable } from 'svelte/store';
import type {
  BSDay,
  BSDate,
  CalendarCell,
  CalendarMatrixOptions,
  LocaleType,
  BSDayInput,
} from '@bsday.js/core';

export interface BSCalendarStoreOptions extends CalendarMatrixOptions {
  initialYear?: number;
  initialMonth?: number;
  selectedDate?: BSDayInput | null;
  onMonthChange?: (year: number, month: number) => void;
}

export interface BSCalendarStoreState {
  year: Writable<number>;
  month: Writable<number>;
  matrix: Readable<CalendarCell[][]>;
  monthNames: Readable<string[]>;
  currentMonthName: Readable<string>;
  weekdayNames: Readable<string[]>;
  focusedDate: Writable<BSDate | null>;
  setFocusedDate: (date: BSDate | null) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextYear: () => void;
  goToPrevYear: () => void;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  goToToday: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  getGridProps: () => Record<string, unknown>;
  getCellProps: (
    cell: CalendarCell,
    options?: { onSelect?: (cell: CalendarCell) => void },
  ) => Record<string, unknown>;
}

export interface BSDatePickerStoreOptions extends CalendarMatrixOptions {
  value?: BSDayInput;
  defaultValue?: BSDayInput;
  onChange?: (date: BSDay | null, formatted: string) => void;
  format?: string;
  calendar?: 'bs' | 'ad';
  locale?: LocaleType;
  closeOnSelect?: boolean;
}

export interface BSDatePickerStoreState {
  selectedDate: Writable<BSDay | null>;
  formattedValue: Readable<string>;
  isOpen: Writable<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (input: BSDayInput) => void;
  clear: () => void;
  calendar: BSCalendarStoreState;
  getInputProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface BSRangePickerStoreOptions extends CalendarMatrixOptions {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  format?: string;
  locale?: LocaleType;
}

export interface BSRangePickerStoreState {
  startDate: Readable<string | null>;
  endDate: Readable<string | null>;
  hoverDate: Writable<string | null>;
  setHoverDate: (date: string | null) => void;
  isOpen: Writable<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (cell: CalendarCell | string) => void;
  clear: () => void;
  isDateRangeStart: (dateStr: string) => boolean;
  isDateRangeEnd: (dateStr: string) => boolean;
  isDateInRange: (dateStr: string) => boolean;
  calendar: BSCalendarStoreState;
}

// Backward-compatible aliases
export type NepaliCalendarStoreOptions = BSCalendarStoreOptions;
export type NepaliCalendarStoreState = BSCalendarStoreState;
export type NepaliDatePickerStoreOptions = BSDatePickerStoreOptions;
export type NepaliDatePickerStoreState = BSDatePickerStoreState;
export type NepaliRangePickerStoreOptions = BSRangePickerStoreOptions;
export type NepaliRangePickerStoreState = BSRangePickerStoreState;
