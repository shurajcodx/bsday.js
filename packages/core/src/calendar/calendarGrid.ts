import { BSDay } from '../core/BSDay';
import { getBsMonthDays } from '../converters/monthData';
import { localizeNumber, pad } from '../utils/helpers';
import type { BSDate, LocaleType } from '../types';
import { isDateDisabled, type DateDisabledOptions } from './range';

export interface CalendarCell {
  bs: BSDate;
  ad: Date;
  dateString: string;
  adDateString: string;
  dayNumber: number;
  dayText: string;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
  isWeekend: boolean;
  isDisabled: boolean;
  isHoliday: boolean;
  tithi?: string;
  paksha?: string;
  festivals?: string[];
  events?: string[];
}

export interface CalendarMatrixOptions extends DateDisabledOptions {
  startOfWeek?: 0 | 1 | 'sun' | 'mon';
  locale?: LocaleType;
  fixedWeeks?: boolean;
  weekendDays?: number[];
}

export function getCalendarMatrix(
  year: number,
  month: number,
  options: CalendarMatrixOptions = {},
): CalendarCell[][] {
  const locale = options.locale ?? 'en';
  const startOfWeek = options.startOfWeek === 1 || options.startOfWeek === 'mon' ? 1 : 0;
  const weekendDays = options.weekendDays ?? [6]; // Saturday by default in Nepal

  const today = new BSDay();
  const todayBS = today.toBS();

  const daysInCurrentMonth = getBsMonthDays(year, month);
  const firstDayBS = BSDay.bs(year, month, 1);
  const firstDayOfWeek = firstDayBS.day(); // 0 = Sun, 6 = Sat

  // Offset from start of row
  const leadingDays = startOfWeek === 1
    ? (firstDayOfWeek + 6) % 7
    : firstDayOfWeek;

  const cells: CalendarCell[] = [];

  // 1. Previous Month Leading Days
  if (leadingDays > 0) {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevMonthDays = getBsMonthDays(prevYear, prevMonth);

    for (let i = leadingDays - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      cells.push(buildCell(prevYear, prevMonth, day, false, options, locale, weekendDays, todayBS));
    }
  }

  // 2. Current Month Days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    cells.push(buildCell(year, month, day, true, options, locale, weekendDays, todayBS));
  }

  // 3. Next Month Trailing Days
  const totalCells = cells.length;
  const targetTotal = options.fixedWeeks ? 42 : (totalCells % 7 === 0 ? totalCells : totalCells + (7 - (totalCells % 7)));
  const trailingDays = targetTotal - totalCells;

  if (trailingDays > 0) {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    for (let day = 1; day <= trailingDays; day++) {
      cells.push(buildCell(nextYear, nextMonth, day, false, options, locale, weekendDays, todayBS));
    }
  }

  // 4. Split into Weeks of 7
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function buildCell(
  year: number,
  month: number,
  day: number,
  isCurrentMonth: boolean,
  options: CalendarMatrixOptions,
  locale: LocaleType,
  weekendDays: number[],
  todayBS: BSDate,
): CalendarCell {
  const bsInstance = BSDay.bs(year, month, day).locale(locale);
  const ad = bsInstance.toAD();
  const dayOfWeek = bsInstance.day();

  const isToday = todayBS.year === year && todayBS.month === month && todayBS.day === day;
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isWeekend = weekendDays.includes(dayOfWeek);
  const isHoliday = bsInstance.isHoliday;
  const isDisabled = isDateDisabled(bsInstance, options);

  const tithi = bsInstance.tithi;
  const data = bsInstance.data(locale);
  const paksha = data?.paksha;
  const festivals = bsInstance.festivals;
  const events = bsInstance.events;


  const adYear = ad.getUTCFullYear();
  const adMonth = pad(ad.getUTCMonth() + 1);
  const adDay = pad(ad.getUTCDate());
  const adDateString = `${adYear}-${adMonth}-${adDay}`;

  return {
    bs: { year, month, day },
    ad,
    dateString: `${year}/${pad(month)}/${pad(day)}`,
    adDateString,
    dayNumber: day,
    dayText: localizeNumber(day, locale),
    dayOfWeek,
    isCurrentMonth,
    isToday,
    isSaturday,
    isSunday,
    isWeekend,
    isDisabled,
    isHoliday,
    tithi: tithi || undefined,
    paksha: paksha || undefined,
    festivals: festivals.length > 0 ? festivals : undefined,
    events: events.length > 0 ? events : undefined,
  };
}
