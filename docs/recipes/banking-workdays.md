# 🏦 Nepali Banking, Workdays & Financial Calculations

This recipe covers how to implement financial, banking, and business day logic in Nepal using `@bsday.js/core` and `@bsday.js/dataset`.

---

## 1. Overview of Nepali Business Days & Holidays

- **Standard Nepali Workweek**: Sunday through Friday (6 working days).
- **Weekly Off**: Saturday (शनिबार).
- **Public Holidays**: Multi-day festivals (Dashain, Tihar, Chhath), Shivaratri, Teej, Buddha Jayanti, and Government gazetted holidays.

---

## 2. Setting Up Holiday Awareness

To make `bsday` automatically aware of all Nepali national holidays across 111 years (1990–2100 BS), hydrate `BSDay` with `@bsday.js/dataset`:

```typescript
// lib/banking/workdays.ts
import { bsday, BSDay } from '@bsday.js/core';
import { dataset } from '@bsday.js/dataset/all';

// Hydrate public holiday and festival dataset
BSDay.setDataset(dataset);
```

---

## 3. Business Day Verification (`isBusinessDay`)

```typescript
export interface WorkdayOptions {
  includeSundays?: boolean;    // Default true (Sunday is a working day in Nepal)
  skipPublicHolidays?: boolean; // Default true
}

/**
 * Checks if a given date is a valid banking / business day.
 */
export function isBusinessDay(
  input: string | BSDay,
  options: WorkdayOptions = { includeSundays: true, skipPublicHolidays: true },
): boolean {
  const d = typeof input === 'string' ? bsday.bs(input) : input;
  if (!d.isValid()) return false;

  const dayOfWeek = d.day(); // 0 = Sun, 6 = Sat

  // 1. Check Saturday (National Weekend)
  if (dayOfWeek === 6) {
    return false;
  }

  // 2. Check Sunday if 5-day week organization
  if (!options.includeSundays && dayOfWeek === 0) {
    return false;
  }

  // 3. Check Public Holidays from Dataset
  if (options.skipPublicHolidays && d.isHoliday) {
    return false;
  }

  return true;
}
```

---

## 4. Adding Business Days (Banking T+2 Settlement / SLAs)

```typescript
/**
 * Adds `n` business days, skipping Saturdays and national public holidays.
 */
export function addBusinessDays(
  startDateInput: string | BSDay,
  businessDaysToAdd: number,
  options: WorkdayOptions = { includeSundays: true, skipPublicHolidays: true },
): BSDay {
  let current = (typeof startDateInput === 'string' ? bsday.bs(startDateInput) : startDateInput).clone();
  let added = 0;
  const direction = businessDaysToAdd >= 0 ? 1 : -1;
  const target = Math.abs(businessDaysToAdd);

  while (added < target) {
    current = current.add(direction, 'day');
    if (isBusinessDay(current, options)) {
      added++;
    }
  }

  return current;
}
```

### Example Usage: T+2 Stock Settlement (NEPSE)
```typescript
const tradeDate = bsday.bs(2081, 6, 23); // Day before Dashain break
const settlementDate = addBusinessDays(tradeDate, 2);

console.log('Trade Date:', tradeDate.format('YYYY/MM/DD'));
console.log('Settlement Date (after Dashain):', settlementDate.format('YYYY/MM/DD'));
```

---

## 5. Loan EMI Schedule Generator (Bikram Sambat)

Generates monthly loan installments on fixed BS dates (e.g. 1st of every BS month), skipping to the next working day if the due date falls on Saturday or a public holiday:

```typescript
export interface EMIRow {
  installmentNumber: number;
  dueDateBS: string;
  actualPaymentDateBS: string; // Adjusted for holidays
  isHolidayAdjusted: boolean;
  principalAmount: number;
  interestAmount: number;
  totalEMI: number;
}

export function generateBSEmiSchedule(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
  startBSYear: number,
  startBSMonth: number,
  dueDayOfMonth: number = 1,
): EMIRow[] {
  const monthlyRate = annualRatePct / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  let remainingPrincipal = principal;
  const schedule: EMIRow[] = [];

  let currentYear = startBSYear;
  let currentMonth = startBSMonth;

  for (let i = 1; i <= tenureMonths; i++) {
    const rawDueDate = bsday.bs(currentYear, currentMonth, dueDayOfMonth);
    
    // Adjust to next business day if due date is a Saturday or Holiday
    let paymentDate = rawDueDate.clone();
    let wasAdjusted = false;
    while (!isBusinessDay(paymentDate)) {
      paymentDate = paymentDate.add(1, 'day');
      wasAdjusted = true;
    }

    const interest = remainingPrincipal * monthlyRate;
    const principalPaid = emi - interest;
    remainingPrincipal -= principalPaid;

    schedule.push({
      installmentNumber: i,
      dueDateBS: rawDueDate.format('YYYY/MM/DD'),
      actualPaymentDateBS: paymentDate.format('YYYY/MM/DD'),
      isHolidayAdjusted: wasAdjusted,
      principalAmount: Math.round(principalPaid),
      interestAmount: Math.round(interest),
      totalEMI: Math.round(emi),
    });

    // Advance BS Month
    if (currentMonth === 12) {
      currentYear++;
      currentMonth = 1;
    } else {
      currentMonth++;
    }
  }

  return schedule;
}
```

---

## 6. Financial Fiscal Year Quarter Analysis

```typescript
import { bsday } from '@bsday.js/core';

export function getQuarterlyTaxBounds(bsYear: number, quarter: 1 | 2 | 3 | 4) {
  // Q1: Shrawan 1 – Ashwin End (Months 4..6)
  // Q2: Kartik 1 – Poush End (Months 7..9)
  // Q3: Magh 1 – Chaitra End (Months 10..12)
  // Q4: Baisakh 1 – Ashadh End (Months 1..3)
  
  const quarterStartMonthMap = { 1: 4, 2: 7, 3: 10, 4: 1 };
  const startYear = quarter === 4 ? bsYear + 1 : bsYear;
  const startMonth = quarterStartMonthMap[quarter];

  const start = bsday.bs(startYear, startMonth, 1).startOf('date');
  const end = start.add(2, 'month').endOf('month');

  return {
    fiscalYear: `FY ${bsYear}/${String(bsYear + 1).slice(-2)}`,
    quarter: `Q${quarter}`,
    startBS: start.format('YYYY/MM/DD'),
    endBS: end.format('YYYY/MM/DD'),
    startAD: start.toAD(),
    endAD: end.toAD(),
  };
}
```
