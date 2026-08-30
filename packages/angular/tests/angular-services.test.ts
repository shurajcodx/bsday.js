import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import {
  createBSCalendar,
  createBSDatePicker,
  createBSRangePicker,
  BSDatePickerDirective,
  BSCalendarService,
  BSDatePickerService,
  createNepaliCalendar,
  createNepaliDatePicker,
  createNepaliRangePicker,
  NepaliDatePickerDirective,
  NepaliCalendarService,
  NepaliDatePickerService,
} from '../src';

describe('@bsday.js/angular Signals & Services', () => {
  describe('createNepaliCalendar', () => {
    it('initializes signal state with given year and month', () => {
      const cal = createNepaliCalendar({ initialYear: 2081, initialMonth: 5, locale: 'ne' });

      expect(cal.year()).toBe(2081);
      expect(cal.month()).toBe(5);
      expect(cal.currentMonthName()).toBe('भाद्र');
      expect(cal.matrix().length).toBe(6);
    });

    it('navigates next and previous months across year boundaries', () => {
      const cal = createNepaliCalendar({ initialYear: 2080, initialMonth: 12 });

      cal.goToNextMonth();
      expect(cal.year()).toBe(2081);
      expect(cal.month()).toBe(1);

      cal.goToPrevMonth();
      expect(cal.year()).toBe(2080);
      expect(cal.month()).toBe(12);
    });

    it('navigates years and sets specific month', () => {
      const cal = createNepaliCalendar({ initialYear: 2080, initialMonth: 5 });

      cal.goToNextYear();
      expect(cal.year()).toBe(2081);

      cal.goToPrevYear();
      expect(cal.year()).toBe(2080);

      cal.setYear(2085);
      expect(cal.year()).toBe(2085);

      cal.setMonth(10);
      expect(cal.month()).toBe(10);
    });

    it('provides accessible ARIA grid props and cell props', () => {
      const cal = createNepaliCalendar({ initialYear: 2081, initialMonth: 1, locale: 'en' });

      const gridProps = cal.getGridProps();
      expect(gridProps.role).toBe('grid');
      expect(gridProps['aria-label']).toBe('Baisakh 2081');

      const firstCell = cal.matrix()[0][0];
      const onSelect = vi.fn();
      const cellProps = cal.getCellProps(firstCell, { onSelect });

      expect(cellProps.role).toBe('gridcell');
      expect(typeof cellProps.onClick).toBe('function');

      if (!firstCell.isDisabled) {
        (cellProps.onClick as () => void)();
        expect(onSelect).toHaveBeenCalledWith(firstCell);
      }
    });

    it('handles keyboard navigation (ArrowRight, ArrowDown)', () => {
      const cal = createNepaliCalendar({ initialYear: 2081, initialMonth: 5 });

      const eventRight = {
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      cal.handleKeyDown(eventRight);
      expect(eventRight.preventDefault).toHaveBeenCalled();

      const eventDown = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      cal.handleKeyDown(eventDown);
      expect(eventDown.preventDefault).toHaveBeenCalled();
    });
  });

  describe('createNepaliDatePicker', () => {
    it('manages open/close toggle state and formatted value', () => {
      const onChange = vi.fn();
      const picker = createNepaliDatePicker({
        defaultValue: '2081/05/15',
        onChange,
        locale: 'en',
        format: 'YYYY/MM/DD',
      });

      expect(picker.isOpen()).toBe(false);
      expect(picker.formattedValue()).toBe('2081/05/15');

      picker.open();
      expect(picker.isOpen()).toBe(true);

      picker.toggle();
      expect(picker.isOpen()).toBe(false);

      picker.selectDate('2081/06/20');
      expect(onChange).toHaveBeenCalled();
      expect(picker.formattedValue()).toBe('2081/06/20');

      picker.clear();
      expect(onChange).toHaveBeenCalledWith(null, '');
    });

    it('generates input and trigger props', () => {
      const picker = createNepaliDatePicker({ defaultValue: '2081/05/15' });

      const inputProps = picker.getInputProps();
      expect(inputProps.readonly).toBe(true);
      expect(inputProps['aria-haspopup']).toBe('dialog');

      const triggerProps = picker.getTriggerProps();
      expect(triggerProps.type).toBe('button');
    });
  });

  describe('createNepaliRangePicker', () => {
    it('handles two-step range selection and hover states', () => {
      const onChange = vi.fn();
      const rangePicker = createNepaliRangePicker({
        defaultValue: { startDate: '2081/05/10', endDate: '2081/05/15' },
        onChange,
      });

      expect(rangePicker.startDate()).toBe('2081/05/10');
      expect(rangePicker.endDate()).toBe('2081/05/15');
      expect(rangePicker.isDateRangeStart('2081/05/10')).toBe(true);
      expect(rangePicker.isDateRangeEnd('2081/05/15')).toBe(true);
      expect(rangePicker.isDateInRange('2081/05/12')).toBe(true);
      expect(rangePicker.isDateInRange('2081/05/20')).toBe(false);

      // Select new start
      rangePicker.selectDate('2081/05/20');
      expect(rangePicker.startDate()).toBe('2081/05/20');
      expect(rangePicker.endDate()).toBeNull();

      // Set hover
      rangePicker.setHoverDate('2081/05/25');
      expect(rangePicker.hoverDate()).toBe('2081/05/25');
      expect(rangePicker.isDateInRange('2081/05/22')).toBe(true);

      // Select end
      rangePicker.selectDate('2081/05/28');
      expect(rangePicker.startDate()).toBe('2081/05/20');
      expect(rangePicker.endDate()).toBe('2081/05/28');

      // Clear
      rangePicker.clear();
      expect(rangePicker.startDate()).toBeNull();
      expect(rangePicker.endDate()).toBeNull();
    });
  });

  describe('NepaliDatePickerDirective (Forms CVA)', () => {
    it('implements ControlValueAccessor writeValue, onChange, and setDisabledState', () => {
      const mockElement = {
        nativeElement: {
          value: '',
          disabled: false,
        },
      };

      const directive = new NepaliDatePickerDirective(mockElement as any);
      const fnChange = vi.fn();
      const fnTouched = vi.fn();

      directive.registerOnChange(fnChange);
      directive.registerOnTouched(fnTouched);

      directive.writeValue('2081/05/15');
      expect(mockElement.nativeElement.value).toBe('२०८१/०५/१५');
      expect(directive.getDate()?.year()).toBe(2081);

      directive.setDate('2081/06/10');
      expect(fnChange).toHaveBeenCalledWith('२०८१/०६/१०');
      expect(fnTouched).toHaveBeenCalled();

      directive.setDisabledState(true);
      expect(mockElement.nativeElement.disabled).toBe(true);
    });
  });

  describe('BS Prefix & Backward Compatibility Aliases', () => {
    it('ensures BS* services and directives match Nepali* aliases', () => {
      expect(createBSCalendar).toBe(createNepaliCalendar);
      expect(createBSDatePicker).toBe(createNepaliDatePicker);
      expect(createBSRangePicker).toBe(createNepaliRangePicker);
      expect(BSCalendarService).toBe(NepaliCalendarService);
      expect(BSDatePickerService).toBe(NepaliDatePickerService);
      expect(BSDatePickerDirective).toBe(NepaliDatePickerDirective);
    });
  });
});
