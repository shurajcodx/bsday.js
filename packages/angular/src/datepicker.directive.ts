import {
  Directive,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { bsday, toBSDayHelper, type BSDay, type BSDayInput, type LocaleType } from '@bsday.js/core';

export const BS_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => BSDatePickerDirective),
  multi: true,
};

export const NEPALI_DATEPICKER_VALUE_ACCESSOR = BS_DATEPICKER_VALUE_ACCESSOR;

@Directive({
  selector: '[bsdayDatePicker], [bsdayBSDatePicker], [bsdayNepaliDatePicker]',
  standalone: true,
  providers: [BS_DATEPICKER_VALUE_ACCESSOR],
})
export class BSDatePickerDirective implements ControlValueAccessor {
  @Input() format = 'YYYY/MM/DD';
  @Input() calendar: 'bs' | 'ad' = 'bs';
  @Input() locale: LocaleType = 'ne';

  @Output() dateChange = new EventEmitter<BSDay | null>();

  private currentDate: BSDay | null = null;
  private isDisabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  writeValue(value: BSDayInput): void {
    if (!value) {
      this.currentDate = null;
      this.setInputValue('');
      return;
    }

    const parsed = toBSDayHelper(value);
    if (parsed.isValid()) {
      this.currentDate = parsed.locale(this.locale);
      this.setInputValue(this.currentDate.format(this.format, this.calendar));
    } else {
      this.currentDate = null;
      this.setInputValue('');
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  public setDate(date: BSDayInput): void {
    if (this.isDisabled) return;

    if (!date) {
      this.currentDate = null;
      this.setInputValue('');
      this.onChange(null);
      this.dateChange.emit(null);
      this.onTouched();
      return;
    }

    const parsed = toBSDayHelper(date);
    if (parsed.isValid()) {
      this.currentDate = parsed.locale(this.locale);
      const formatted = this.currentDate.format(this.format, this.calendar);
      this.setInputValue(formatted);
      this.onChange(formatted);
      this.dateChange.emit(this.currentDate);
      this.onTouched();
    }
  }

  public getDate(): BSDay | null {
    return this.currentDate;
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private setInputValue(val: string): void {
    if (this.elementRef && this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = val;
    }
  }
}

export const NepaliDatePickerDirective = BSDatePickerDirective;
