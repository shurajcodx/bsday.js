# @bsday/core

Core library for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates in JavaScript and TypeScript.

`@bsday/core` provides utilities for creating, converting, formatting, and manipulating BS dates while keeping full compatibility with the JavaScript `Date` object.

## Features

* 📅 **Accurate BS ↔ AD date conversion**
* ⚡ Lightweight and fast
* 🔒 Immutable date instances
* 🔢 **Formatting and parsing** routines
* ➕ **Date arithmetic** (add, subtract days/months/years)
* 🔍 **Date comparisons** (isBefore, isAfter, isSame)
* 🪔 Embedded **Panchang capability** (Tithi, Nakshatra, Yoga, Karana)
* 🧩 Plugin system for extensibility
* 💻 Works in Node.js and browsers

## Installation

```bash
pnpm add @bsday/core
```

## Quick Start

```typescript
import { BSDay } from '@bsday/core';

// Create a BS Date from AD
const today = BSDay.fromAD(new Date());
console.log(`Today in BS is: ${today.format('YYYY-MM-DD')}`);

// Create a BS Date directly
const dashain = BSDay.fromBS([2081, 6, 26]);

// Convert BS to AD
console.log(dashain.toAD().toISOString()); // "2024-10-12T00:00:00.000Z"

// Format the date
console.log(dashain.format('YYYY/MM/DD', 'bs')); // "2081/06/26"

// Access Panchang data
console.log(dashain.tithi()); // "Dashami"
console.log(dashain.panchang());
/*
{
  paksha: 'Shukla',
  nakshatra: 'Dhanishta',
  yoga: 'Shoola',
  karana: 'Garaja'
}
*/
```

## Creating Dates

Create BSDay instances from AD Date objects, BS tuples, or parsing.

```typescript
import { BSDay } from '@bsday/core';

// Current time
const now = BSDay.now();

// From AD Date
const fromAd = BSDay.fromAD(new Date('2024-10-12'));

// From BS Tuple [Year, Month, Day]
const fromBs = BSDay.fromBS([2081, 6, 26]);

// Parse string
const parsed = BSDay.parse('2081-06-26', 'YYYY-MM-DD', 'bs');
```

## Formatting

Format dates easily in both BS or AD calendars.

```typescript
const d = BSDay.fromBS([2081, 6, 26]);

d.format('YYYY-MM-DD', 'bs');  // 2081-06-26
d.format('YYYY/MM/DD', 'bs');  // 2081/06/26
d.format('DD-MM-YYYY', 'ad');  // 12-10-2024
```

## Date Arithmetic

Add or subtract units from the date. Dates are immutable, so all methods return a new instance.

```typescript
const a = BSDay.fromBS([2081, 1, 1]);

const b = a.addDays(10);
const c = a.addMonths(1);
const d = b.subtractYears(1);
```

## Date Comparison

Compare BSDay instances easily.

```typescript
const a = BSDay.fromBS([2081, 1, 1]);
const b = BSDay.fromBS([2081, 1, 10]);

a.isBefore(b); // true
b.isAfter(a);  // true
a.isSame(b);   // false
```

## Plugin System

BSDay can be extended with custom formatting tokens and methods using plugins.

```typescript
interface BSDayPlugin {
  name: string;
  initialize(bsday: typeof BSDay): void;
}

const MyPlugin = {
  name: 'my-plugin',
  initialize(BSDayClass) {
    BSDayClass.prototype.hello = function () {
      return 'Hello BSDay';
    };
  }
};

BSDay.use(MyPlugin);
```

## API Reference

### Static Methods

| Method                                 | Description                             |
| -------------------------------------- | --------------------------------------- |
| `BSDay.now()`                          | Create BSDay instance for current time  |
| `BSDay.nowAD()`                        | Get current AD date as a JS `Date`      |
| `BSDay.nowBS(format?)`                 | Get current BS date as formatted string |
| `BSDay.fromAD(date)`                   | Create instance from an AD Date         |
| `BSDay.fromBS([year, month, day])`     | Create instance from a BS tuple         |
| `BSDay.parse(value, format, calendar)` | Parse a formatted string                |
| `BSDay.setDataset(dataset)`            | Override the dataset with custom data   |
| `BSDay.use(plugin)`                    | Register a plugin                       |

### Instance Methods

| Method                          | Description                               |
| ------------------------------- | ----------------------------------------- |
| `toAD()`                        | Returns the equivalent JS Date            |
| `toBS()`                        | Returns `{ year, month, day }` object     |
| `format(formatStr, calendar?)`  | Returns formatted string representation   |
| `addDays(n)` / `subtractDays`   | Days arithmetic                           |
| `addMonths(n)` / `subtractMonths`| Months arithmetic                        |
| `addYears(n)` / `subtractYears` | Years arithmetic                          |
| `setYear(n)` / `setMonth(n)` / `setDay(n)` | Set an individual date part    |
| `isBefore(date)`                | Check if date is before another           |
| `isAfter(date)`                 | Check if date is after another            |
| `isSame(date)`                  | Check if dates are exactly equal          |
| `isLeapYear()`                  | Returns true if current year is leap year |
| `tithi()`                       | Returns the tithi (e.g. "Dashami")        |
| `panchang()`                    | Returns `{ paksha, nakshatra, yoga, karana }`|

## License

MIT © BSDay.js Contributors
