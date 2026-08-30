import { ref, shallowRef, computed, unref, isRef } from 'vue';
import { bsday, toBSDayHelper, type BSDay, type BSDayInput } from '@bsday.js/core';
import { useBSCalendarGrid } from './useBSCalendarGrid';
import type { UseBSDatePickerOptions, UseBSDatePickerReturn } from './types';

export function useBSDatePicker(options: UseBSDatePickerOptions = {}): UseBSDatePickerReturn {
  const {
    modelValue,
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
    const raw = modelValue !== undefined ? unref(modelValue) : defaultValue;
    if (!raw) return null;
    const parsed = toBSDayHelper(raw);
    return parsed.isValid() ? parsed : null;
  };

  const internalDate = shallowRef<BSDay | null>(getInitial());
  const isOpen = ref<boolean>(false);

  const selectedDate = computed<BSDay | null>(() => {
    if (modelValue !== undefined) {
      const raw = unref(modelValue);
      if (!raw) return null;
      const parsed = toBSDayHelper(raw);
      return parsed.isValid() ? parsed : null;
    }
    return internalDate.value;
  });

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
    initialYear: selectedDate.value ? selectedDate.value.year() : undefined,
    initialMonth: selectedDate.value ? selectedDate.value.month() : undefined,
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

  const formattedValue = computed(() => {
    if (!selectedDate.value || !selectedDate.value.isValid()) return '';
    return selectedDate.value.locale(locale).format(format, calendar);
  });

  const selectDate = (input: BSDayInput) => {
    if (!input) {
      internalDate.value = null;
      if (modelValue !== undefined && isRef(modelValue)) {
        modelValue.value = null;
      }
      onChange?.(null, '');
      return;
    }
    const parsed = toBSDayHelper(input);
    if (parsed.isValid()) {
      const localized = parsed.locale(locale);
      const formatted = localized.format(format, calendar);
      internalDate.value = localized;
      if (modelValue !== undefined && isRef(modelValue)) {
        modelValue.value = localized;
      }
      onChange?.(localized, formatted);
      if (closeOnSelect) {
        isOpen.value = false;
      }
    }
  };

  const clear = () => {
    internalDate.value = null;
    if (modelValue !== undefined && isRef(modelValue)) {
      modelValue.value = null;
    }
    onChange?.(null, '');
  };

  const getInputProps = () => ({
    value: formattedValue.value,
    placeholder: calendar === 'bs' ? 'YYYY/MM/DD' : 'YYYY-MM-DD',
    readonly: true,
    onClick: open,
    onFocus: open,
    'aria-expanded': isOpen.value,
    'aria-haspopup': 'dialog',
  });

  const getTriggerProps = () => ({
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen.value,
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
    calendar: calendarGrid,
    getInputProps,
    getTriggerProps,
  };
}

export const useNepaliDatePicker = useBSDatePicker;
