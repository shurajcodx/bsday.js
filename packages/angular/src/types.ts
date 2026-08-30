import type { Signal, WritableSignal } from '@angular/core';
import type { BSDay, BSDate, CalendarCell, CalendarMatrixOptions, LocaleType, BSDayInput } from '@bsday.js/core';

export interface BSCalendarOptions extends CalendarMatrixOptions {
  initialYear?: number;
  initialMonth?: number;
  selectedDate?: BSDayInput | null;
  onMonthChange?: (year: number, month: number) => void;
}

export interface BSCalendarSignalState {
  year: WritableSignal<number>;
  month: WritableSignal<number>;
  matrix: Signal<CalendarCell[][]>;
  monthNames: Signal<string[]>;
  currentMonthName: Signal<string>;
  weekdayNames: Signal<string[]>;
  focusedDate: WritableSignal<BSDate | null>;
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
  getCellProps: (cell: CalendarCell, options?: { onSelect?: (cell: CalendarCell) => void }) => Record<string, unknown>;
}

export interface BSDatePickerOptions extends CalendarMatrixOptions {
  value?: BSDayInput;
  defaultValue?: BSDayInput;
  onChange?: (date: BSDay | null, formatted: string) => void;
  format?: string;
  calendar?: 'bs' | 'ad';
  locale?: LocaleType;
  closeOnSelect?: boolean;
}

export interface BSDatePickerSignalState {
  selectedDate: WritableSignal<BSDay | null>;
  formattedValue: Signal<string>;
  isOpen: WritableSignal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (input: BSDayInput) => void;
  clear: () => void;
  calendar: BSCalendarSignalState;
  getInputProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface BSRangePickerOptions extends CalendarMatrixOptions {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  format?: string;
  locale?: LocaleType;
}

export interface BSRangePickerSignalState {
  startDate: Signal<string | null>;
  endDate: Signal<string | null>;
  hoverDate: WritableSignal<string | null>;
  setHoverDate: (date: string | null) => void;
  isOpen: WritableSignal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (cell: CalendarCell | string) => void;
  clear: () => void;
  isDateRangeStart: (dateStr: string) => boolean;
  isDateRangeEnd: (dateStr: string) => boolean;
  isDateInRange: (dateStr: string) => boolean;
  calendar: BSCalendarSignalState;
}

// Backward-compatible aliases
export type NepaliCalendarOptions = BSCalendarOptions;
export type NepaliCalendarSignalState = BSCalendarSignalState;
export type NepaliDatePickerOptions = BSDatePickerOptions;
export type NepaliDatePickerSignalState = BSDatePickerSignalState;
export type NepaliRangePickerOptions = BSRangePickerOptions;
export type NepaliRangePickerSignalState = BSRangePickerSignalState;
