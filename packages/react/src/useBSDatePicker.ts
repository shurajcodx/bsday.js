import { useState, useCallback, useMemo } from 'react';
import { bsday, toBSDayHelper, type BSDay, type BSDayInput } from '@bsday.js/core';
import { useBSCalendarGrid } from './useBSCalendarGrid';
import type { UseBSDatePickerOptions, UseBSDatePickerReturn } from './types';

export function useBSDatePicker(options: UseBSDatePickerOptions = {}): UseBSDatePickerReturn {
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

  const initialDate = useMemo(() => {
    const raw = value !== undefined ? value : defaultValue;
    if (!raw) return null;
    const parsed = toBSDayHelper(raw);
    return parsed.isValid() ? parsed : null;
  }, [value, defaultValue]);

  const [internalDate, setInternalDate] = useState<BSDay | null>(initialDate);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectedDate = useMemo(() => {
    if (value !== undefined) {
      if (!value) return null;
      const parsed = toBSDayHelper(value);
      return parsed.isValid() ? parsed : null;
    }
    return internalDate;
  }, [value, internalDate]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const calendarGrid = useBSCalendarGrid({
    initialYear: selectedDate ? selectedDate.year() : undefined,
    initialMonth: selectedDate ? selectedDate.month() : undefined,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
    selectedDate,
  });

  const formattedValue = useMemo(() => {
    if (!selectedDate || !selectedDate.isValid()) return '';
    return selectedDate.locale(locale).format(format, calendar);
  }, [selectedDate, locale, format, calendar]);

  const selectDate = useCallback(
    (input: BSDayInput) => {
      if (!input) {
        setInternalDate(null);
        onChange?.(null, '');
        return;
      }
      const parsed = toBSDayHelper(input);
      if (parsed.isValid()) {
        const localized = parsed.locale(locale);
        const formatted = localized.format(format, calendar);
        if (value === undefined) {
          setInternalDate(localized);
        }
        onChange?.(localized, formatted);
        if (closeOnSelect) {
          setIsOpen(false);
        }
      }
    },
    [value, onChange, locale, format, calendar, closeOnSelect],
  );

  const clear = useCallback(() => {
    if (value === undefined) {
      setInternalDate(null);
    }
    onChange?.(null, '');
  }, [value, onChange]);

  const getInputProps = useCallback(
    () => ({
      value: formattedValue,
      placeholder: calendar === 'bs' ? 'YYYY/MM/DD' : 'YYYY-MM-DD',
      readOnly: true,
      onClick: open,
      onFocus: open,
      'aria-expanded': isOpen,
      'aria-haspopup': 'dialog' as const,
    }),
    [formattedValue, calendar, open, isOpen],
  );

  const getTriggerProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isOpen,
      onClick: toggle,
    }),
    [isOpen, toggle],
  );

  return {
    selectedDate,
    formattedValue,
    isOpen,
    open,
    close,
    toggle,
    selectDate,
    clear,
    calendar: calendarGrid,
    getInputProps,
    getTriggerProps,
  };
}

export const useNepaliDatePicker = useBSDatePicker;
