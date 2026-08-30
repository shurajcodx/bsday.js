import { ref, computed, unref } from 'vue';
import {
  BSDay,
  getCalendarMatrix,
  getMonthNames,
  getWeekdayNames,
  getBsMonthDays,
  toBSDayHelper,
  type CalendarCell,
  type BSDate,
} from '@bsday.js/core';
import type { UseBSCalendarGridOptions, UseBSCalendarGridReturn } from './types';

export function useBSCalendarGrid(
  options: UseBSCalendarGridOptions = {},
): UseBSCalendarGridReturn {
  const {
    initialYear,
    initialMonth,
    locale = 'ne',
    startOfWeek = 0,
    fixedWeeks = true,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
    selectedDate,
    onMonthChange,
  } = options;

  const today = new BSDay();
  const todayBS = today.toBS();

  const year = ref<number>(unref(initialYear) ?? todayBS.year);
  const month = ref<number>(unref(initialMonth) ?? todayBS.month);
  const focusedDate = ref<BSDate | null>({
    year: unref(initialYear) ?? todayBS.year,
    month: unref(initialMonth) ?? todayBS.month,
    day: todayBS.day,
  });

  const updateYearMonth = (newYear: number, newMonth: number) => {
    year.value = newYear;
    month.value = newMonth;
    onMonthChange?.(newYear, newMonth);
  };

  const goToNextMonth = () => {
    if (month.value === 12) {
      updateYearMonth(year.value + 1, 1);
    } else {
      updateYearMonth(year.value, month.value + 1);
    }
  };

  const goToPrevMonth = () => {
    if (month.value === 1) {
      updateYearMonth(year.value - 1, 12);
    } else {
      updateYearMonth(year.value, month.value - 1);
    }
  };

  const goToNextYear = () => {
    updateYearMonth(year.value + 1, month.value);
  };

  const goToPrevYear = () => {
    updateYearMonth(year.value - 1, month.value);
  };

  const setYear = (newYear: number) => {
    updateYearMonth(newYear, month.value);
  };

  const setMonth = (newMonth: number) => {
    if (newMonth >= 1 && newMonth <= 12) {
      updateYearMonth(year.value, newMonth);
    }
  };

  const goToToday = () => {
    const nowBS = new BSDay().toBS();
    updateYearMonth(nowBS.year, nowBS.month);
    focusedDate.value = nowBS;
  };

  const setFocusedDate = (date: BSDate | null) => {
    focusedDate.value = date;
  };

  const matrix = computed(() => {
    return getCalendarMatrix(year.value, month.value, {
      locale,
      startOfWeek,
      fixedWeeks,
      minDate,
      maxDate,
      disabledDates,
      disabledDaysOfWeek,
      disableHolidays,
    });
  });

  const monthNames = computed(() => getMonthNames(locale, 'long'));
  const weekdayNames = computed(() => getWeekdayNames(locale, 'short', startOfWeek));
  const currentMonthName = computed(() => monthNames.value[month.value - 1] ?? '');

  const handleKeyDown = (event: KeyboardEvent) => {
    const current = focusedDate.value
      ? BSDay.bs(focusedDate.value.year, focusedDate.value.month, focusedDate.value.day)
      : BSDay.bs(year.value, month.value, 1);
    let target: BSDay | null = null;

    switch (event.key) {
      case 'ArrowRight':
        target = current.add(1, 'day');
        break;
      case 'ArrowLeft':
        target = current.subtract(1, 'day');
        break;
      case 'ArrowDown':
        target = current.add(7, 'day');
        break;
      case 'ArrowUp':
        target = current.subtract(7, 'day');
        break;
      case 'PageDown':
        target = event.shiftKey ? current.add(1, 'year') : current.add(1, 'month');
        break;
      case 'PageUp':
        target = event.shiftKey ? current.subtract(1, 'year') : current.subtract(1, 'month');
        break;
      case 'Home':
        target = BSDay.bs(year.value, month.value, 1);
        break;
      case 'End': {
        const maxDays = getBsMonthDays(year.value, month.value);
        target = BSDay.bs(year.value, month.value, maxDays);
        break;
      }
      default:
        return;
    }

    if (target && target.isValid()) {
      event.preventDefault();
      const bs = target.toBS();
      focusedDate.value = bs;
      if (bs.year !== year.value || bs.month !== month.value) {
        updateYearMonth(bs.year, bs.month);
      }
    }
  };

  const getGridProps = () => ({
    role: 'grid',
    'aria-label': `${currentMonthName.value} ${year.value}`,
    onKeydown: handleKeyDown,
    tabindex: 0,
  });

  const getCellProps = (
    cell: CalendarCell,
    cellOpts?: { onSelect?: (cell: CalendarCell) => void },
  ) => {
    const selVal = unref(selectedDate);
    const selBs = selVal ? toBSDayHelper(selVal) : null;
    const isSelected =
      selBs !== null &&
      selBs.isValid() &&
      selBs.year() === cell.bs.year &&
      selBs.month() === cell.bs.month &&
      selBs.date() === cell.bs.day;

    const isFocused =
      focusedDate.value !== null &&
      focusedDate.value.year === cell.bs.year &&
      focusedDate.value.month === cell.bs.month &&
      focusedDate.value.day === cell.bs.day;

    return {
      role: 'gridcell',
      'aria-selected': isSelected,
      'aria-disabled': cell.isDisabled,
      'aria-label': `${cell.dayText} ${monthNames.value[cell.bs.month - 1]} ${cell.bs.year}`,
      tabindex: isFocused || (isSelected && !focusedDate.value) ? 0 : -1,
      disabled: cell.isDisabled,
      onClick: () => {
        if (!cell.isDisabled) {
          focusedDate.value = cell.bs;
          cellOpts?.onSelect?.(cell);
        }
      },
    };
  };

  return {
    year,
    month,
    matrix,
    monthNames,
    currentMonthName,
    weekdayNames,
    focusedDate,
    setFocusedDate,
    goToNextMonth,
    goToPrevMonth,
    goToNextYear,
    goToPrevYear,
    setYear,
    setMonth,
    goToToday,
    handleKeyDown,
    getGridProps,
    getCellProps,
  };
}

export const useNepaliCalendarGrid = useBSCalendarGrid;
