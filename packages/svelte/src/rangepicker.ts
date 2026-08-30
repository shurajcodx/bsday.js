import { writable, derived, get } from 'svelte/store';
import { bsday, isDateInRange as isDateBetween, toBSDayHelper, type CalendarCell } from '@bsday.js/core';
import { createBSCalendar } from './calendar';
import type { BSRangePickerStoreOptions, BSRangePickerStoreState, DateRange } from './types';

export function createBSRangePicker(
  options: BSRangePickerStoreOptions = {},
): BSRangePickerStoreState {
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

  const range = writable<DateRange>(value ?? defaultValue);
  const hoverDate = writable<string | null>(null);
  const isOpen = writable<boolean>(false);

  const startDate = derived([range], ([$r]) => $r.startDate);
  const endDate = derived([range], ([$r]) => $r.endDate);

  const open = () => isOpen.set(true);
  const close = () => isOpen.set(false);
  const toggle = () => isOpen.update((prev) => !prev);

  const currentRange = get(range);
  const calendarStore = createBSCalendar({
    initialYear: currentRange.startDate ? toBSDayHelper(currentRange.startDate).year() : undefined,
    initialMonth: currentRange.startDate ? toBSDayHelper(currentRange.startDate).month() : undefined,
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

    const cur = get(range);
    let nextRange: DateRange;

    if ((cur.startDate && cur.endDate) || (!cur.startDate && !cur.endDate)) {
      nextRange = { startDate: clicked, endDate: null };
    } else if (cur.startDate && !cur.endDate) {
      const start = toBSDayHelper(cur.startDate);
      const end = toBSDayHelper(clicked);

      if (end.isBefore(start, 'date')) {
        nextRange = { startDate: clicked, endDate: null };
      } else {
        nextRange = { startDate: cur.startDate, endDate: clicked };
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

  const isDateRangeStart = (dateStr: string) => get(range).startDate === dateStr;
  const isDateRangeEnd = (dateStr: string) => get(range).endDate === dateStr;

  const isDateInRange = (dateStr: string) => {
    const cur = get(range);
    if (cur.startDate && cur.endDate) {
      return isDateBetween(dateStr, cur.startDate, cur.endDate, '()');
    }
    const hover = get(hoverDate);
    if (cur.startDate && hover) {
      const start = toBSDayHelper(cur.startDate);
      const h = toBSDayHelper(hover);
      if (h.isAfter(start, 'date')) {
        return isDateBetween(dateStr, cur.startDate, hover, '()');
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
    calendar: calendarStore,
  };
}

export const createNepaliRangePicker = createBSRangePicker;
