import { signal, computed, Injectable } from '@angular/core';
import { bsday, toBSDayHelper, isDateInRange as isDateBetween, type BSDay, type BSDayInput, type CalendarCell } from '@bsday.js/core';
import { createBSCalendar } from './calendar.service';
import type {
  BSDatePickerOptions,
  BSDatePickerSignalState,
  BSRangePickerOptions,
  BSRangePickerSignalState,
  DateRange,
} from './types';

export function createBSDatePicker(
  options: BSDatePickerOptions = {},
): BSDatePickerSignalState {
  const {
    value,
    defaultValue,
    onChange,
    format = 'YYYY/MM/DD',
    calendar = 'bs',
    locale = 'ne',
    closeOnSelect = true,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
    startOfWeek = 0,
    fixedWeeks = true,
  } = options;

  const getInitial = (): BSDay | null => {
    const raw = value !== undefined ? value : defaultValue;
    if (!raw) return null;
    const parsed = toBSDayHelper(raw);
    return parsed.isValid() ? parsed : null;
  };

  const selectedDate = signal<BSDay | null>(getInitial());
  const isOpen = signal<boolean>(false);

  const open = () => isOpen.set(true);
  const close = () => isOpen.set(false);
  const toggle = () => isOpen.update((prev) => !prev);

  const calendarSignal = createBSCalendar({
    initialYear: selectedDate() ? selectedDate()!.year() : undefined,
    initialMonth: selectedDate() ? selectedDate()!.month() : undefined,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
    selectedDate: selectedDate(),
  });

  const formattedValue = computed(() => {
    const current = selectedDate();
    if (!current || !current.isValid()) return '';
    return current.locale(locale).format(format, calendar);
  });

  const selectDate = (input: BSDayInput) => {
    if (!input) {
      selectedDate.set(null);
      onChange?.(null, '');
      return;
    }
    const parsed = toBSDayHelper(input);
    if (parsed.isValid()) {
      const localized = parsed.locale(locale);
      const formatted = localized.format(format, calendar);
      selectedDate.set(localized);
      onChange?.(localized, formatted);
      if (closeOnSelect) {
        isOpen.set(false);
      }
    }
  };

  const clear = () => {
    selectedDate.set(null);
    onChange?.(null, '');
  };

  const getInputProps = () => ({
    value: formattedValue(),
    placeholder: calendar === 'bs' ? 'YYYY/MM/DD' : 'YYYY-MM-DD',
    readonly: true,
    onClick: open,
    onFocus: open,
    'aria-expanded': isOpen(),
    'aria-haspopup': 'dialog',
  });

  const getTriggerProps = () => ({
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen(),
    onClick: toggle,
  });

  return {
    selectedDate,
    formattedValue,
    isOpen,
    open,
    close,
    toggle,
    selectDate,
    clear,
    calendar: calendarSignal,
    getInputProps,
    getTriggerProps,
  };
}

export const createNepaliDatePicker = createBSDatePicker;

export function createBSRangePicker(
  options: BSRangePickerOptions = {},
): BSRangePickerSignalState {
  const {
    value,
    defaultValue = { startDate: null, endDate: null },
    onChange,
    locale = 'ne',
    startOfWeek = 0,
    fixedWeeks = true,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
  } = options;

  const range = signal<DateRange>(value ?? defaultValue);
  const hoverDate = signal<string | null>(null);
  const isOpen = signal<boolean>(false);

  const startDate = computed(() => range().startDate);
  const endDate = computed(() => range().endDate);

  const open = () => isOpen.set(true);
  const close = () => isOpen.set(false);
  const toggle = () => isOpen.update((prev) => !prev);

  const calendarSignal = createBSCalendar({
    initialYear: range().startDate ? toBSDayHelper(range().startDate).year() : undefined,
    initialMonth: range().startDate ? toBSDayHelper(range().startDate).month() : undefined,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
  });

  const setHoverDate = (date: string | null) => {
    hoverDate.set(date);
  };

  const selectDate = (cellOrString: CalendarCell | string) => {
    const clicked = typeof cellOrString === 'string' ? cellOrString : cellOrString.dateString;
    if (!clicked) return;

    const currentRange = range();
    let nextRange: DateRange;

    if ((currentRange.startDate && currentRange.endDate) || (!currentRange.startDate && !currentRange.endDate)) {
      nextRange = { startDate: clicked, endDate: null };
    } else if (currentRange.startDate && !currentRange.endDate) {
      const start = toBSDayHelper(currentRange.startDate);
      const end = toBSDayHelper(clicked);

      if (end.isBefore(start, 'date')) {
        nextRange = { startDate: clicked, endDate: null };
      } else {
        nextRange = { startDate: currentRange.startDate, endDate: clicked };
      }
    } else {
      nextRange = { startDate: clicked, endDate: null };
    }

    range.set(nextRange);
    onChange?.(nextRange);
  };

  const clear = () => {
    const empty = { startDate: null, endDate: null };
    range.set(empty);
    onChange?.(empty);
    hoverDate.set(null);
  };

  const isDateRangeStart = (dateStr: string) => range().startDate === dateStr;
  const isDateRangeEnd = (dateStr: string) => range().endDate === dateStr;

  const isDateInRange = (dateStr: string) => {
    const current = range();
    if (current.startDate && current.endDate) {
      return isDateBetween(dateStr, current.startDate, current.endDate, '()');
    }
    if (current.startDate && hoverDate()) {
      const start = toBSDayHelper(current.startDate);
      const hover = toBSDayHelper(hoverDate()!);
      if (hover.isAfter(start, 'date')) {
        return isDateBetween(dateStr, current.startDate, hoverDate()!, '()');
      }
    }
    return false;
  };

  return {
    startDate,
    endDate,
    hoverDate,
    setHoverDate,
    isOpen,
    open,
    close,
    toggle,
    selectDate,
    clear,
    isDateRangeStart,
    isDateRangeEnd,
    isDateInRange,
    calendar: calendarSignal,
  };
}

export const createNepaliRangePicker = createBSRangePicker;

@Injectable({
  providedIn: 'root',
})
export class BSDatePickerService {
  createDatePicker(options: BSDatePickerOptions = {}): BSDatePickerSignalState {
    return createBSDatePicker(options);
  }

  createRangePicker(options: BSRangePickerOptions = {}): BSRangePickerSignalState {
    return createBSRangePicker(options);
  }
}

export const NepaliDatePickerService = BSDatePickerService;
