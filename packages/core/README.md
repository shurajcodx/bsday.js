# @bsday.js/core

Core library for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates in JavaScript and TypeScript.

`@bsday.js/core` provides utilities for creating, converting, formatting, and manipulating BS dates while keeping full compatibility with the JavaScript `Date` object.

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
pnpm add @bsday.js/core
```

## Quick Start

```typescript
import { BSDay } from '@bsday.js/core';
import { dataset } from '@bsday/dataset';

BSDay.setDataset(dataset);

// Create a BS Date from AD
const today = BSDay.fromAD(new Date());
console.log(`Today in BS is: ${today.format('YYYY-MM-DD')}`);

// Create a BS Date directly
const dashain = BSDay.fromBS({ year: 2081, month: 6, day: 27 });

// Convert BS to AD
console.log(dashain.toAD().toISOString()); // "2024-10-11T18:15:00.000Z"

// Format the date
console.log(dashain.format('YYYY/MM/DD', 'bs')); // "2081/06/27"

// Access Panchang data
console.log(dashain.tithi); // e.g. "Dashami"
console.log(dashain.festivals); // []
console.log(dashain.events); // []
console.log(dashain.isHoliday); // false
console.log(dashain.panchang);
console.log(dashain.data());
/*
{
  tithi: 'Dashami',
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
import { BSDay } from '@bsday.js/core';

// Current AD time as a JS Date
const nowAd = BSDay.nowAD();

// From AD Date
const fromAd = BSDay.fromAD(new Date('2024-10-12'));

// From a BS object
const fromBs = BSDay.fromBS({ year: 2081, month: 6, day: 27 });

// From the tuple-style constructor form
const tupleStyle = new BSDay({ bs: [2081, 6, 27] });

// Parse string
const parsed = BSDay.parse('2081-06-26', 'YYYY-MM-DD', 'bs');
```

## Formatting

Format dates easily in both BS or AD calendars.

```typescript
const d = BSDay.fromBS({ year: 2081, month: 6, day: 27 });

d.format('YYYY-MM-DD', 'bs');            // 2081-06-27
d.format('YYYY/MM/DD', 'bs');            // 2081/06/27
d.format('DD-MM-YYYY', 'ad');            // 12-10-2024
d.locale('ne').format('YYYY MMMM DD');   // २०८१ असोज २७
```

## Date Arithmetic

Add or subtract units from the date. Dates are immutable, so all methods return a new instance.

```typescript
const a = BSDay.fromBS({ year: 2081, month: 1, day: 1 });

const b = a.add(10, 'day');
const c = a.add(1, 'month');
const d = b.subtract(1, 'year');
```

## Date Comparison

Compare BSDay instances easily.

```typescript
const a = BSDay.fromBS({ year: 2081, month: 1, day: 1 });
const b = BSDay.fromBS({ year: 2081, month: 1, day: 10 });

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
| `BSDay.now()`                          | Returns the current Unix timestamp      |
| `BSDay.nowAD()`                        | Get current AD date as a JS `Date`      |
| `BSDay.nowBS(format?)`                 | Get current BS date as formatted string |
| `BSDay.fromAD(date)`                   | Create instance from an AD Date         |
| `BSDay.fromBS({ year, month, day })`   | Create instance from a BS date object   |
| `BSDay.parse(value, format, calendar)` | Parse a formatted string                |
| `BSDay.setDataset(dataset)`            | Register optional panchang/day data     |
| `BSDay.use(plugin)`                    | Register a plugin                       |

### Instance Methods

| Method                          | Description                               |
| ------------------------------- | ----------------------------------------- |
| `toAD()`                        | Returns the equivalent JS Date            |
| `toBS()`                        | Returns `{ year, month, day }` object     |
| `format(formatStr, calendar?)`  | Returns formatted string representation   |
| `add(value, unit)` / `subtract(value, unit)` | Date arithmetic                |
| `setYear(n)` / `setMonth(n)` / `setDay(n)` | Set an individual date part    |
| `isBefore(date)`                | Check if date is before another           |
| `isAfter(date)`                 | Check if date is after another            |
| `isSame(date)`                  | Check if dates are exactly equal          |
| `isLeapYear()`                  | Returns true if current year is leap year |
| `tithi`                         | Optional tithi getter from dataset        |
| `festivals`                     | Optional festivals getter from dataset    |
| `events`                        | Optional events getter from dataset       |
| `isHoliday`                     | Optional holiday flag from dataset        |
| `panchang`                      | Optional panchang getter from dataset     |
| `data()`                        | Returns the current registered day record |

## License

MIT © BSDay.js Contributors
