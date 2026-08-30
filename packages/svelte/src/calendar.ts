import { writable, derived, get } from 'svelte/store';
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
import type { BSCalendarStoreOptions, BSCalendarStoreState } from './types';

export function createBSCalendar(options: BSCalendarStoreOptions = {}): BSCalendarStoreState {
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

  const year = writable<number>(initialYear ?? todayBS.year);
  const month = writable<number>(initialMonth ?? todayBS.month);
  const focusedDate = writable<BSDate | null>({
    year: initialYear ?? todayBS.year,
    month: initialMonth ?? todayBS.month,
    day: todayBS.day,
  });

  const updateYearMonth = (newYear: number, newMonth: number) => {
    year.set(newYear);
    month.set(newMonth);
    onMonthChange?.(newYear, newMonth);
  };

  const goToNextMonth = () => {
    const currentMonth = get(month);
    const currentYear = get(year);
    if (currentMonth === 12) {
      updateYearMonth(currentYear + 1, 1);
    } else {
      updateYearMonth(currentYear, currentMonth + 1);
    }
  };

  const goToPrevMonth = () => {
    const currentMonth = get(month);
    const currentYear = get(year);
    if (currentMonth === 1) {
      updateYearMonth(currentYear - 1, 12);
    } else {
      updateYearMonth(currentYear, currentMonth - 1);
    }
  };

  const goToNextYear = () => {
    updateYearMonth(get(year) + 1, get(month));
  };

  const goToPrevYear = () => {
    updateYearMonth(get(year) - 1, get(month));
  };

  const setYear = (newYear: number) => {
    updateYearMonth(newYear, get(month));
  };

  const setMonth = (newMonth: number) => {
    if (newMonth >= 1 && newMonth <= 12) {
      updateYearMonth(get(year), newMonth);
    }
  };

  const goToToday = () => {
    const nowBS = new BSDay().toBS();
    updateYearMonth(nowBS.year, nowBS.month);
    focusedDate.set(nowBS);
  };

  const setFocusedDate = (date: BSDate | null) => {
    focusedDate.set(date);
  };

  const matrix = derived([year, month], ([$y, $m]) => {
    return getCalendarMatrix($y, $m, {
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

  const monthNames = derived([], () => getMonthNames(locale, 'long'));
  const weekdayNames = derived([], () => getWeekdayNames(locale, 'short', startOfWeek));
  const currentMonthName = derived([month], ([$m]) => getMonthNames(locale, 'long')[$m - 1] ?? '');

  const handleKeyDown = (event: KeyboardEvent) => {
    const focused = get(focusedDate);
    const current = focused
      ? BSDay.bs(focused.year, focused.month, focused.day)
      : BSDay.bs(get(year), get(month), 1);
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
        target = BSDay.bs(get(year), get(month), 1);
        break;
      case 'End': {
        const maxDays = getBsMonthDays(get(year), get(month));
        target = BSDay.bs(get(year), get(month), maxDays);
        break;
      }
      default:
        return;
    }

    if (target && target.isValid()) {
      event.preventDefault();
      const bs = target.toBS();
      focusedDate.set(bs);
      if (bs.year !== get(year) || bs.month !== get(month)) {
        updateYearMonth(bs.year, bs.month);
      }
    }
  };

  const getGridProps = () => ({
    role: 'grid',
    'aria-label': `${get(currentMonthName)} ${get(year)}`,
    onkeydown: handleKeyDown,
    tabindex: 0,
  });

  const getCellProps = (
    cell: CalendarCell,
    cellOpts?: { onSelect?: (cell: CalendarCell) => void },
  ) => {
    const selBs = selectedDate ? toBSDayHelper(selectedDate) : null;
    const isSelected =
      selBs !== null &&
      selBs.isValid() &&
      selBs.year() === cell.bs.year &&
      selBs.month() === cell.bs.month &&
      selBs.date() === cell.bs.day;

    const focused = get(focusedDate);
    const isFocused =
      focused !== null &&
      focused.year === cell.bs.year &&
      focused.month === cell.bs.month &&
      focused.day === cell.bs.day;

    const mNames = get(monthNames);

    return {
      role: 'gridcell',
      'aria-selected': isSelected,
      'aria-disabled': cell.isDisabled,
      'aria-label': `${cell.dayText} ${mNames[cell.bs.month - 1]} ${cell.bs.year}`,
      tabindex: isFocused || (isSelected && !focused) ? 0 : -1,
      disabled: cell.isDisabled,
      onclick: () => {
        if (!cell.isDisabled) {
          focusedDate.set(cell.bs);
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

export const createNepaliCalendar = createBSCalendar;
