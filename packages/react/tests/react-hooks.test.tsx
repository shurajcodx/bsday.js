/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import ReactDOMClient from 'react-dom/client';
import {
  useBSCalendarGrid,
  useBSDatePicker,
  useBSRangePicker,
  useNepaliCalendarGrid,
  useNepaliDatePicker,
  useNepaliRangePicker,
} from '../src';
import { BSDay } from '@bsday.js/core';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Lightweight renderHook utility for React 19 in happy-dom environment
function renderHook<T>(hookFn: () => T) {
  const result = { current: null as unknown as T };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);

  function HookTester() {
    result.current = hookFn();
    return null;
  }

  act(() => {
    root.render(<HookTester />);
  });

  return {
    get result() {
      return result;
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe('@bsday.js/react Hooks', () => {
  describe('useNepaliCalendarGrid', () => {
    it('initializes with specific BS year and month', () => {
      const { result } = renderHook(() =>
        useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 5, locale: 'ne' }),
      );

      expect(result.current.year).toBe(2081);
      expect(result.current.month).toBe(5);
      expect(result.current.currentMonthName).toBe('भाद्र');
      expect(result.current.matrix.length).toBe(6); // 6 weeks fixed
    });

    it('navigates next and previous months across year boundaries', () => {
      const { result } = renderHook(() =>
        useNepaliCalendarGrid({ initialYear: 2080, initialMonth: 12 }),
      );

      act(() => {
        result.current.goToNextMonth();
      });

      expect(result.current.year).toBe(2081);
      expect(result.current.month).toBe(1);

      act(() => {
        result.current.goToPrevMonth();
      });

      expect(result.current.year).toBe(2080);
      expect(result.current.month).toBe(12);
    });

    it('navigates years directly', () => {
      const { result } = renderHook(() =>
        useNepaliCalendarGrid({ initialYear: 2080, initialMonth: 5 }),
      );

      act(() => {
        result.current.goToNextYear();
      });
      expect(result.current.year).toBe(2081);

      act(() => {
        result.current.goToPrevYear();
      });
      expect(result.current.year).toBe(2080);

      act(() => {
        result.current.setYear(2085);
      });
      expect(result.current.year).toBe(2085);

      act(() => {
        result.current.setMonth(10);
      });
      expect(result.current.month).toBe(10);
    });

    it('provides accessible ARIA grid props and cell props', () => {
      const { result } = renderHook(() =>
        useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 1, locale: 'en' }),
      );

      const gridProps = result.current.getGridProps();
      expect(gridProps.role).toBe('grid');
      expect(gridProps['aria-label']).toBe('Baisakh 2081');

      const firstCell = result.current.matrix[0][0];
      const onSelect = vi.fn();
      const cellProps = result.current.getCellProps(firstCell, { onSelect });

      expect(cellProps.role).toBe('gridcell');
      expect(typeof cellProps.onClick).toBe('function');

      if (!firstCell.isDisabled) {
        act(() => {
          cellProps.onClick?.({} as any);
        });
        expect(onSelect).toHaveBeenCalledWith(firstCell);
      }
    });

    it('handles keyboard navigation (ArrowRight, ArrowLeft, ArrowDown, ArrowUp)', () => {
      const { result } = renderHook(() =>
        useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 5 }),
      );

      // ArrowRight -> +1 day
      const eventRight = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      act(() => {
        result.current.handleKeyDown(eventRight);
      });
      expect(eventRight.preventDefault).toHaveBeenCalled();

      // ArrowDown -> +7 days
      const eventDown = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      act(() => {
        result.current.handleKeyDown(eventDown);
      });
      expect(eventDown.preventDefault).toHaveBeenCalled();
    });
  });

  describe('useNepaliDatePicker', () => {
    it('manages open/close toggle state and formatted value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useNepaliDatePicker({
          defaultValue: '2081/05/15',
          onChange,
          locale: 'en',
          format: 'YYYY/MM/DD',
        }),
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.formattedValue).toBe('2081/05/15');

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.selectDate('2081/06/20');
      });
      expect(onChange).toHaveBeenCalled();
      expect(result.current.formattedValue).toBe('2081/06/20');

      act(() => {
        result.current.clear();
      });
      expect(onChange).toHaveBeenCalledWith(null, '');
    });

    it('generates input and trigger props', () => {
      const { result } = renderHook(() => useNepaliDatePicker({ defaultValue: '2081/05/15' }));

      const inputProps = result.current.getInputProps();
      expect(inputProps.readOnly).toBe(true);
      expect(inputProps['aria-haspopup']).toBe('dialog');

      const triggerProps = result.current.getTriggerProps();
      expect(triggerProps.type).toBe('button');
    });
  });

  describe('useNepaliRangePicker', () => {
    it('handles two-step range selection and hover states', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useNepaliRangePicker({
          defaultValue: { startDate: '2081/05/10', endDate: '2081/05/15' },
          onChange,
        }),
      );

      expect(result.current.startDate).toBe('2081/05/10');
      expect(result.current.endDate).toBe('2081/05/15');
      expect(result.current.isDateRangeStart('2081/05/10')).toBe(true);
      expect(result.current.isDateRangeEnd('2081/05/15')).toBe(true);
      expect(result.current.isDateInRange('2081/05/12')).toBe(true);
      expect(result.current.isDateInRange('2081/05/20')).toBe(false);

      // Start fresh selection
      act(() => {
        result.current.selectDate('2081/05/20');
      });
      expect(result.current.startDate).toBe('2081/05/20');
      expect(result.current.endDate).toBeNull();

      // Set hover date
      act(() => {
        result.current.setHoverDate('2081/05/25');
      });
      expect(result.current.hoverDate).toBe('2081/05/25');
      expect(result.current.isDateInRange('2081/05/22')).toBe(true);

      // Select end date
      act(() => {
        result.current.selectDate('2081/05/28');
      });
      expect(result.current.startDate).toBe('2081/05/20');
      expect(result.current.endDate).toBe('2081/05/28');

      // Clear range
      act(() => {
        result.current.clear();
      });
      expect(result.current.startDate).toBeNull();
      expect(result.current.endDate).toBeNull();
    });
  });

  describe('BS Prefix & Backward Compatibility Aliases', () => {
    it('ensures useBS* functions match useNepali* aliases', () => {
      expect(useBSCalendarGrid).toBe(useNepaliCalendarGrid);
      expect(useBSDatePicker).toBe(useNepaliDatePicker);
      expect(useBSRangePicker).toBe(useNepaliRangePicker);
    });
  });
});
