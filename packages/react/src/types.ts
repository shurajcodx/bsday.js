import type {
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
} from 'react';
import type {
  BSDay,
  BSDate,
  CalendarCell,
  CalendarMatrixOptions,
  LocaleType,
  BSDayInput,
} from '@bsday.js/core';

export interface UseBSCalendarGridOptions extends CalendarMatrixOptions {
  /** Initial Bikram Sambat year (defaults to current year) */
  initialYear?: number;
  /** Initial Bikram Sambat month (1-12, defaults to current month) */
  initialMonth?: number;
  /** Currently selected date(s) to highlight */
  selectedDate?: BSDayInput | null;
  /** Callback fired when focused/navigated date changes */
  onMonthChange?: (year: number, month: number) => void;
}

export interface UseBSCalendarGridReturn {
  year: number;
  month: number;
  matrix: CalendarCell[][];
  monthNames: string[];
  currentMonthName: string;
  weekdayNames: string[];
  focusedDate: BSDate | null;
  setFocusedDate: (date: BSDate | null) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextYear: () => void;
  goToPrevYear: () => void;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  goToToday: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  getGridProps: () => HTMLAttributes<HTMLElement>;
  getCellProps: (
    cell: CalendarCell,
    options?: { onSelect?: (cell: CalendarCell) => void },
  ) => ButtonHTMLAttributes<HTMLButtonElement>;
}

export interface UseBSDatePickerOptions extends CalendarMatrixOptions {
  value?: BSDayInput;
  defaultValue?: BSDayInput;
  onChange?: (date: BSDay | null, formatted: string) => void;
  format?: string;
  calendar?: 'bs' | 'ad';
  locale?: LocaleType;
  closeOnSelect?: boolean;
}

export interface UseBSDatePickerReturn {
  selectedDate: BSDay | null;
  formattedValue: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (input: BSDayInput) => void;
  clear: () => void;
  calendar: UseBSCalendarGridReturn;
  getInputProps: () => InputHTMLAttributes<HTMLInputElement>;
  getTriggerProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface UseBSRangePickerOptions extends CalendarMatrixOptions {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  format?: string;
  locale?: LocaleType;
}

export interface UseBSRangePickerReturn {
  startDate: string | null;
  endDate: string | null;
  hoverDate: string | null;
  setHoverDate: (date: string | null) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (cell: CalendarCell | string) => void;
  clear: () => void;
  isDateRangeStart: (dateStr: string) => boolean;
  isDateRangeEnd: (dateStr: string) => boolean;
  isDateInRange: (dateStr: string) => boolean;
  calendar: UseBSCalendarGridReturn;
}

// Backward-compatible aliases
export type UseNepaliCalendarGridOptions = UseBSCalendarGridOptions;
export type UseNepaliCalendarGridReturn = UseBSCalendarGridReturn;
export type UseNepaliDatePickerOptions = UseBSDatePickerOptions;
export type UseNepaliDatePickerReturn = UseBSDatePickerReturn;
export type UseNepaliRangePickerOptions = UseBSRangePickerOptions;
export type UseNepaliRangePickerReturn = UseBSRangePickerReturn;
