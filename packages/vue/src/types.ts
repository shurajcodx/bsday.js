import type { Ref, ComputedRef } from 'vue';
import type {
  BSDay,
  BSDate,
  CalendarCell,
  CalendarMatrixOptions,
  LocaleType,
  BSDayInput,
} from '@bsday.js/core';

export interface UseBSCalendarGridOptions extends CalendarMatrixOptions {
  initialYear?: number | Ref<number>;
  initialMonth?: number | Ref<number>;
  selectedDate?: BSDayInput | Ref<BSDayInput | null | undefined> | null;
  onMonthChange?: (year: number, month: number) => void;
}

export interface UseBSCalendarGridReturn {
  year: Ref<number>;
  month: Ref<number>;
  matrix: ComputedRef<CalendarCell[][]>;
  monthNames: ComputedRef<string[]>;
  currentMonthName: ComputedRef<string>;
  weekdayNames: ComputedRef<string[]>;
  focusedDate: Ref<BSDate | null>;
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

export interface UseBSDatePickerOptions extends CalendarMatrixOptions {
  modelValue?: BSDayInput | Ref<BSDayInput | null | undefined>;
  defaultValue?: BSDayInput;
  onChange?: (date: BSDay | null, formatted: string) => void;
  format?: string;
  calendar?: 'bs' | 'ad';
  locale?: LocaleType;
  closeOnSelect?: boolean;
}

export interface UseBSDatePickerReturn {
  selectedDate: ComputedRef<BSDay | null>;
  formattedValue: ComputedRef<string>;
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectDate: (input: BSDayInput) => void;
  clear: () => void;
  calendar: UseBSCalendarGridReturn;
  getInputProps: () => Record<string, unknown>;
  getTriggerProps: () => Record<string, unknown>;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface UseBSRangePickerOptions extends CalendarMatrixOptions {
  modelValue?: DateRange | Ref<DateRange>;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  format?: string;
  locale?: LocaleType;
}

export interface UseBSRangePickerReturn {
  startDate: ComputedRef<string | null>;
  endDate: ComputedRef<string | null>;
  hoverDate: Ref<string | null>;
  setHoverDate: (date: string | null) => void;
  isOpen: Ref<boolean>;
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
