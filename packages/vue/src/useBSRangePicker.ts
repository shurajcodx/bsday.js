import { ref, computed, unref } from 'vue';
import { bsday, isDateInRange as isDateBetween, toBSDayHelper, type CalendarCell } from '@bsday.js/core';
import { useBSCalendarGrid } from './useBSCalendarGrid';
import type { UseBSRangePickerOptions, UseBSRangePickerReturn, DateRange } from './types';

export function useBSRangePicker(
  options: UseBSRangePickerOptions = {},
): UseBSRangePickerReturn {
  const {
    modelValue,
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

  const internalRange = ref<DateRange>(defaultValue);
  const hoverDate = ref<string | null>(null);
  const isOpen = ref<boolean>(false);

  const range = computed<DateRange>(() => {
    return modelValue !== undefined ? unref(modelValue) : internalRange.value;
  });

  const startDate = computed(() => range.value.startDate);
  const endDate = computed(() => range.value.endDate);

  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const calendarGrid = useBSCalendarGrid({
    initialYear: range.value.startDate ? toBSDayHelper(range.value.startDate).year() : undefined,
    initialMonth: range.value.startDate ? toBSDayHelper(range.value.startDate).month() : undefined,
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
    hoverDate.value = date;
  };

  const selectDate = (cellOrString: CalendarCell | string) => {
    const clicked = typeof cellOrString === 'string' ? cellOrString : cellOrString.dateString;
    if (!clicked) return;

    let nextRange: DateRange;

    if ((range.value.startDate && range.value.endDate) || (!range.value.startDate && !range.value.endDate)) {
      nextRange = { startDate: clicked, endDate: null };
    } else if (range.value.startDate && !range.value.endDate) {
      const start = toBSDayHelper(range.value.startDate);
      const end = toBSDayHelper(clicked);

      if (end.isBefore(start, 'date')) {
        nextRange = { startDate: clicked, endDate: null };
      } else {
        nextRange = { startDate: range.value.startDate, endDate: clicked };
      }
    } else {
      nextRange = { startDate: clicked, endDate: null };
    }

    if (modelValue === undefined) {
      internalRange.value = nextRange;
    }
    onChange?.(nextRange);
  };

  const clear = () => {
    const empty = { startDate: null, endDate: null };
    if (modelValue === undefined) {
      internalRange.value = empty;
    }
    onChange?.(empty);
    hoverDate.value = null;
  };

  const isDateRangeStart = (dateStr: string) => range.value.startDate === dateStr;
  const isDateRangeEnd = (dateStr: string) => range.value.endDate === dateStr;

  const isDateInRange = (dateStr: string) => {
    if (range.value.startDate && range.value.endDate) {
      return isDateBetween(dateStr, range.value.startDate, range.value.endDate, '()');
    }
    if (range.value.startDate && hoverDate.value) {
      const start = toBSDayHelper(range.value.startDate);
      const hover = toBSDayHelper(hoverDate.value);
      if (hover.isAfter(start, 'date')) {
        return isDateBetween(dateStr, range.value.startDate, hoverDate.value, '()');
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
    calendar: calendarGrid,
  };
}

export const useNepaliRangePicker = useBSRangePicker;
