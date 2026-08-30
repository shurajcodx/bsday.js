import { signal, computed, Injectable } from '@angular/core';
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
import type { BSCalendarOptions, BSCalendarSignalState } from './types';

export function createBSCalendar(
  options: BSCalendarOptions = {},
): BSCalendarSignalState {
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

  const year = signal<number>(initialYear ?? todayBS.year);
  const month = signal<number>(initialMonth ?? todayBS.month);
  const focusedDate = signal<BSDate | null>({
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
    if (month() === 12) {
      updateYearMonth(year() + 1, 1);
    } else {
      updateYearMonth(year(), month() + 1);
    }
  };

  const goToPrevMonth = () => {
    if (month() === 1) {
      updateYearMonth(year() - 1, 12);
    } else {
      updateYearMonth(year(), month() - 1);
    }
  };

  const goToNextYear = () => {
    updateYearMonth(year() + 1, month());
  };

  const goToPrevYear = () => {
    updateYearMonth(year() - 1, month());
  };

  const setYear = (newYear: number) => {
    updateYearMonth(newYear, month());
  };

  const setMonth = (newMonth: number) => {
    if (newMonth >= 1 && newMonth <= 12) {
      updateYearMonth(year(), newMonth);
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

  const matrix = computed(() => {
    return getCalendarMatrix(year(), month(), {
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
  const currentMonthName = computed(() => monthNames()[month() - 1] ?? '');

  const handleKeyDown = (event: KeyboardEvent) => {
    const current = focusedDate()
      ? BSDay.bs(focusedDate()!.year, focusedDate()!.month, focusedDate()!.day)
      : BSDay.bs(year(), month(), 1);
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
        target = BSDay.bs(year(), month(), 1);
        break;
      case 'End': {
        const maxDays = getBsMonthDays(year(), month());
        target = BSDay.bs(year(), month(), maxDays);
        break;
      }
      default:
        return;
    }

    if (target && target.isValid()) {
      event.preventDefault();
      const bs = target.toBS();
      focusedDate.set(bs);
      if (bs.year !== year() || bs.month !== month()) {
        updateYearMonth(bs.year, bs.month);
      }
    }
  };

  const getGridProps = () => ({
    role: 'grid',
    'aria-label': `${currentMonthName()} ${year()}`,
    onKeydown: handleKeyDown,
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

    const isFocused =
      focusedDate() !== null &&
      focusedDate()!.year === cell.bs.year &&
      focusedDate()!.month === cell.bs.month &&
      focusedDate()!.day === cell.bs.day;

    return {
      role: 'gridcell',
      'aria-selected': isSelected,
      'aria-disabled': cell.isDisabled,
      'aria-label': `${cell.dayText} ${monthNames()[cell.bs.month - 1]} ${cell.bs.year}`,
      tabindex: isFocused || (isSelected && !focusedDate()) ? 0 : -1,
      disabled: cell.isDisabled,
      onClick: () => {
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

@Injectable({
  providedIn: 'root',
})
export class BSCalendarService {
  createCalendar(options: BSCalendarOptions = {}): BSCalendarSignalState {
    return createBSCalendar(options);
  }
}

export const NepaliCalendarService = BSCalendarService;
