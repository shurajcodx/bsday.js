import { useState, useCallback, useMemo } from 'react';
import { bsday, isDateInRange as isDateBetween, toBSDayHelper, type CalendarCell } from '@bsday.js/core';
import { useBSCalendarGrid } from './useBSCalendarGrid';
import type { UseBSRangePickerOptions, UseBSRangePickerReturn, DateRange } from './types';

export function useBSRangePicker(
  options: UseBSRangePickerOptions = {},
): UseBSRangePickerReturn {
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

  const [internalRange, setInternalRange] = useState<DateRange>(defaultValue);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const range = useMemo(() => value ?? internalRange, [value, internalRange]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const calendarGrid = useBSCalendarGrid({
    initialYear: range.startDate ? toBSDayHelper(range.startDate).year() : undefined,
    initialMonth: range.startDate ? toBSDayHelper(range.startDate).month() : undefined,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
  });

  const selectDate = useCallback(
    (cellOrString: CalendarCell | string) => {
      const clicked = typeof cellOrString === 'string' ? cellOrString : cellOrString.dateString;
      if (!clicked) return;

      let nextRange: DateRange;

      if ((range.startDate && range.endDate) || (!range.startDate && !range.endDate)) {
        nextRange = { startDate: clicked, endDate: null };
      } else if (range.startDate && !range.endDate) {
        const start = toBSDayHelper(range.startDate);
        const end = toBSDayHelper(clicked);

        if (end.isBefore(start, 'date')) {
          nextRange = { startDate: clicked, endDate: null };
        } else {
          nextRange = { startDate: range.startDate, endDate: clicked };
        }
      } else {
        nextRange = { startDate: clicked, endDate: null };
      }

      if (value === undefined) {
        setInternalRange(nextRange);
      }
      onChange?.(nextRange);
    },
    [range, value, onChange],
  );

  const clear = useCallback(() => {
    const empty = { startDate: null, endDate: null };
    if (value === undefined) {
      setInternalRange(empty);
    }
    onChange?.(empty);
    setHoverDate(null);
  }, [value, onChange]);

  const isDateRangeStart = useCallback(
    (dateStr: string) => range.startDate === dateStr,
    [range.startDate],
  );

  const isDateRangeEnd = useCallback(
    (dateStr: string) => range.endDate === dateStr,
    [range.endDate],
  );

  const isDateInRange = useCallback(
    (dateStr: string) => {
      if (range.startDate && range.endDate) {
        return isDateBetween(dateStr, range.startDate, range.endDate, '()');
      }
      if (range.startDate && hoverDate) {
        const start = toBSDayHelper(range.startDate);
        const hover = toBSDayHelper(hoverDate);
        if (hover.isAfter(start, 'date')) {
          return isDateBetween(dateStr, range.startDate, hoverDate, '()');
        }
      }
      return false;
    },
    [range.startDate, range.endDate, hoverDate],
  );

  return {
    startDate: range.startDate,
    endDate: range.endDate,
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
