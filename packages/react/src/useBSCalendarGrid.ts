import { useState, useCallback, useMemo, type KeyboardEvent } from 'react';
import {
  bsday,
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

  const today = useMemo(() => new BSDay(), []);
  const todayBS = useMemo(() => today.toBS(), [today]);

  const [year, setYearState] = useState<number>(() => initialYear ?? todayBS.year);
  const [month, setMonthState] = useState<number>(() => initialMonth ?? todayBS.month);
  const [focusedDate, setFocusedDate] = useState<BSDate | null>(() => ({
    year: initialYear ?? todayBS.year,
    month: initialMonth ?? todayBS.month,
    day: todayBS.day,
  }));

  const updateYearMonth = useCallback(
    (newYear: number, newMonth: number) => {
      setYearState(newYear);
      setMonthState(newMonth);
      onMonthChange?.(newYear, newMonth);
    },
    [onMonthChange],
  );

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      updateYearMonth(year + 1, 1);
    } else {
      updateYearMonth(year, month + 1);
    }
  }, [year, month, updateYearMonth]);

  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      updateYearMonth(year - 1, 12);
    } else {
      updateYearMonth(year, month - 1);
    }
  }, [year, month, updateYearMonth]);

  const goToNextYear = useCallback(() => {
    updateYearMonth(year + 1, month);
  }, [year, month, updateYearMonth]);

  const goToPrevYear = useCallback(() => {
    updateYearMonth(year - 1, month);
  }, [year, month, updateYearMonth]);

  const setYear = useCallback(
    (newYear: number) => {
      updateYearMonth(newYear, month);
    },
    [month, updateYearMonth],
  );

  const setMonth = useCallback(
    (newMonth: number) => {
      if (newMonth >= 1 && newMonth <= 12) {
        updateYearMonth(year, newMonth);
      }
    },
    [year, updateYearMonth],
  );

  const goToToday = useCallback(() => {
    const nowBS = new BSDay().toBS();
    updateYearMonth(nowBS.year, nowBS.month);
    setFocusedDate(nowBS);
  }, [updateYearMonth]);

  const matrix = useMemo(() => {
    return getCalendarMatrix(year, month, {
      locale,
      startOfWeek,
      fixedWeeks,
      minDate,
      maxDate,
      disabledDates,
      disabledDaysOfWeek,
      disableHolidays,
    });
  }, [
    year,
    month,
    locale,
    startOfWeek,
    fixedWeeks,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    disableHolidays,
  ]);

  const monthNames = useMemo(() => getMonthNames(locale, 'long'), [locale]);
  const weekdayNames = useMemo(
    () => getWeekdayNames(locale, 'short', startOfWeek),
    [locale, startOfWeek],
  );
  const currentMonthName = monthNames[month - 1] ?? '';

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const current = focusedDate ? BSDay.bs(focusedDate.year, focusedDate.month, focusedDate.day) : BSDay.bs(year, month, 1);
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
          target = BSDay.bs(year, month, 1);
          break;
        case 'End': {
          const maxDays = getBsMonthDays(year, month);
          target = BSDay.bs(year, month, maxDays);
          break;
        }
        default:
          return;
      }

      if (target && target.isValid()) {
        event.preventDefault();
        const bs = target.toBS();
        setFocusedDate(bs);
        if (bs.year !== year || bs.month !== month) {
          updateYearMonth(bs.year, bs.month);
        }
      }
    },
    [focusedDate, year, month, updateYearMonth],
  );

  const getGridProps = useCallback(
    () => ({
      role: 'grid' as const,
      'aria-label': `${currentMonthName} ${year}`,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
    }),
    [currentMonthName, year, handleKeyDown],
  );

  const selectedBs = useMemo(() => {
    if (!selectedDate) return null;
    const d = toBSDayHelper(selectedDate);
    return d.isValid() ? d.toBS() : null;
  }, [selectedDate]);

  const getCellProps = useCallback(
    (cell: CalendarCell, cellOpts?: { onSelect?: (cell: CalendarCell) => void }) => {
      const isSelected =
        selectedBs !== null &&
        selectedBs.year === cell.bs.year &&
        selectedBs.month === cell.bs.month &&
        selectedBs.day === cell.bs.day;

      const isFocused =
        focusedDate !== null &&
        focusedDate.year === cell.bs.year &&
        focusedDate.month === cell.bs.month &&
        focusedDate.day === cell.bs.day;

      return {
        role: 'gridcell' as const,
        'aria-selected': isSelected,
        'aria-disabled': cell.isDisabled,
        'aria-label': `${cell.dayText} ${monthNames[cell.bs.month - 1]} ${cell.bs.year}`,
        tabIndex: isFocused || (isSelected && !focusedDate) ? 0 : -1,
        disabled: cell.isDisabled,
        onClick: () => {
          if (!cell.isDisabled) {
            setFocusedDate(cell.bs);
            cellOpts?.onSelect?.(cell);
          }
        },
      };
    },
    [selectedBs, focusedDate, monthNames],
  );

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
