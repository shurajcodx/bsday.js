import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import {
  useBSCalendarGrid,
  useBSDatePicker,
  useBSRangePicker,
  useNepaliCalendarGrid,
  useNepaliDatePicker,
  useNepaliRangePicker,
} from '../src';

describe('@bsday.js/vue Composables', () => {
  describe('useNepaliCalendarGrid', () => {
    it('initializes with specific BS year and month reactively', () => {
      const grid = useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 5, locale: 'ne' });

      expect(grid.year.value).toBe(2081);
      expect(grid.month.value).toBe(5);
      expect(grid.currentMonthName.value).toBe('भाद्र');
      expect(grid.matrix.value.length).toBe(6);
    });

    it('navigates next and previous months across year boundaries', () => {
      const grid = useNepaliCalendarGrid({ initialYear: 2080, initialMonth: 12 });

      grid.goToNextMonth();
      expect(grid.year.value).toBe(2081);
      expect(grid.month.value).toBe(1);

      grid.goToPrevMonth();
      expect(grid.year.value).toBe(2080);
      expect(grid.month.value).toBe(12);
    });

    it('navigates years directly', () => {
      const grid = useNepaliCalendarGrid({ initialYear: 2080, initialMonth: 5 });

      grid.goToNextYear();
      expect(grid.year.value).toBe(2081);

      grid.goToPrevYear();
      expect(grid.year.value).toBe(2080);

      grid.setYear(2085);
      expect(grid.year.value).toBe(2085);

      grid.setMonth(10);
      expect(grid.month.value).toBe(10);
    });

    it('provides accessible ARIA grid props and cell props', () => {
      const grid = useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 1, locale: 'en' });

      const gridProps = grid.getGridProps();
      expect(gridProps.role).toBe('grid');
      expect(gridProps['aria-label']).toBe('Baisakh 2081');

      const firstCell = grid.matrix.value[0][0];
      const onSelect = vi.fn();
      const cellProps = grid.getCellProps(firstCell, { onSelect });

      expect(cellProps.role).toBe('gridcell');
      expect(typeof cellProps.onClick).toBe('function');

      if (!firstCell.isDisabled) {
        (cellProps.onClick as () => void)();
        expect(onSelect).toHaveBeenCalledWith(firstCell);
      }
    });

    it('handles keyboard navigation (ArrowRight, ArrowLeft, ArrowDown, ArrowUp)', () => {
      const grid = useNepaliCalendarGrid({ initialYear: 2081, initialMonth: 5 });

      const eventRight = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      grid.handleKeyDown(eventRight);
      expect(eventRight.preventDefault).toHaveBeenCalled();

      const eventDown = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      grid.handleKeyDown(eventDown);
      expect(eventDown.preventDefault).toHaveBeenCalled();
    });
  });

  describe('useNepaliDatePicker', () => {
    it('manages open/close toggle state and formatted value', () => {
      const onChange = vi.fn();
      const picker = useNepaliDatePicker({
        defaultValue: '2081/05/15',
        onChange,
        locale: 'en',
        format: 'YYYY/MM/DD',
      });

      expect(picker.isOpen.value).toBe(false);
      expect(picker.formattedValue.value).toBe('2081/05/15');

      picker.open();
      expect(picker.isOpen.value).toBe(true);

      picker.toggle();
      expect(picker.isOpen.value).toBe(false);

      picker.selectDate('2081/06/20');
      expect(onChange).toHaveBeenCalled();
      expect(picker.formattedValue.value).toBe('2081/06/20');

      picker.clear();
      expect(onChange).toHaveBeenCalledWith(null, '');
    });

    it('supports v-model reactive binding (modelValue Ref)', () => {
      const model = ref('2081/05/10');
      const picker = useNepaliDatePicker({
        modelValue: model,
      });

      expect(picker.formattedValue.value).toBe('२०८१/०५/१०');

      picker.selectDate('2081/05/20');
      expect(picker.formattedValue.value).toBe('२०८१/०५/२०');
    });

    it('generates input and trigger props', () => {
      const picker = useNepaliDatePicker({ defaultValue: '2081/05/15' });

      const inputProps = picker.getInputProps();
      expect(inputProps.readonly).toBe(true);
      expect(inputProps['aria-haspopup']).toBe('dialog');

      const triggerProps = picker.getTriggerProps();
      expect(triggerProps.type).toBe('button');
    });
  });

  describe('useNepaliRangePicker', () => {
    it('handles two-step range selection and hover states', () => {
      const onChange = vi.fn();
      const rangePicker = useNepaliRangePicker({
        defaultValue: { startDate: '2081/05/10', endDate: '2081/05/15' },
        onChange,
      });

      expect(rangePicker.startDate.value).toBe('2081/05/10');
      expect(rangePicker.endDate.value).toBe('2081/05/15');
      expect(rangePicker.isDateRangeStart('2081/05/10')).toBe(true);
      expect(rangePicker.isDateRangeEnd('2081/05/15')).toBe(true);
      expect(rangePicker.isDateInRange('2081/05/12')).toBe(true);
      expect(rangePicker.isDateInRange('2081/05/20')).toBe(false);

      // Start fresh selection
      rangePicker.selectDate('2081/05/20');
      expect(rangePicker.startDate.value).toBe('2081/05/20');
      expect(rangePicker.endDate.value).toBeNull();

      // Set hover date
      rangePicker.setHoverDate('2081/05/25');
      expect(rangePicker.hoverDate.value).toBe('2081/05/25');
      expect(rangePicker.isDateInRange('2081/05/22')).toBe(true);

      // Select end date
      rangePicker.selectDate('2081/05/28');
      expect(rangePicker.startDate.value).toBe('2081/05/20');
      expect(rangePicker.endDate.value).toBe('2081/05/28');

      // Clear range
      rangePicker.clear();
      expect(rangePicker.startDate.value).toBeNull();
      expect(rangePicker.endDate.value).toBeNull();
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
