import { writable, derived, get } from 'svelte/store';
import { bsday, toBSDayHelper, type BSDay, type BSDayInput } from '@bsday.js/core';
import { createBSCalendar } from './calendar';
import type { BSDatePickerStoreOptions, BSDatePickerStoreState } from './types';

export function createBSDatePicker(
  options: BSDatePickerStoreOptions = {},
): BSDatePickerStoreState {
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

  const selectedDate = writable<BSDay | null>(getInitial());
  const isOpen = writable<boolean>(false);

  const open = () => isOpen.set(true);
  const close = () => isOpen.set(false);
  const toggle = () => isOpen.update((prev) => !prev);

  const current = get(selectedDate);
  const calendarStore = createBSCalendar({
    initialYear: current ? current.year() : undefined,
    initialMonth: current ? current.month() : undefined,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
    selectedDate: current,
  });

  const formattedValue = derived([selectedDate], ([$date]) => {
    if (!$date || !$date.isValid()) return '';
    return $date.locale(locale).format(format, calendar);
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
    value: get(formattedValue),
    placeholder: calendar === 'bs' ? 'YYYY/MM/DD' : 'YYYY-MM-DD',
    readonly: true,
    onclick: open,
    onfocus: open,
    'aria-expanded': get(isOpen),
    'aria-haspopup': 'dialog',
  });

  const getTriggerProps = () => ({
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': get(isOpen),
    onclick: toggle,
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
    calendar: calendarStore,
    getInputProps,
    getTriggerProps,
  };
}

export const createNepaliDatePicker = createBSDatePicker;
