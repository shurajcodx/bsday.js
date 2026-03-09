# @bsday/core

Core library for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates in JavaScript.

`@bsday/core` provides utilities for creating, converting, formatting, and manipulating BS dates while keeping full compatibility with the JavaScript `Date` object.

---

## Features

* BS ↔ AD date conversion
* Lightweight and fast
* Immutable date instances
* Formatting and parsing
* Date arithmetic
* Dataset integration (tithi, festivals, panchang)
* Plugin system for extensibility
* Works in Node.js and browsers

---

## Installation

```bash
pnpm add @bsday/core
```

or

```bash
npm install @bsday/core
```

---

## Quick Start

```ts
import { BSDay } from '@bsday/core';

const date = BSDay.fromBS([2082, 11, 24]);

console.log(date.toAD());
// → JS Date object

console.log(date.format('YYYY-MM-DD', 'bs'));
// → 2082-11-24
```

---

# Creating Dates

Create BSDay instances from AD or BS dates.

```ts
import { BSDay } from '@bsday/core';

const now = BSDay.now();

const fromAd = BSDay.fromAD(new Date());

const fromBs = BSDay.fromBS([2082, 11, 24]);
```

---

# Current Date Helpers

Get the current date in AD or BS format.

```ts
const ad = BSDay.nowAD(); 
// Returns native Date

const bs = BSDay.nowBS(); 
// Returns "YYYY-MM-DD HH:mm"

const bsCustom = BSDay.nowBS('YYYY/MM/DD HH:mm');
```

---

# Conversion

Convert between BS and AD calendars.

```ts
const d = BSDay.fromBS([2082, 11, 24]);

const adDate = d.toAD();
// JavaScript Date

const bsDate = d.toBS();
// { year, month, day }
```

---

# Formatting

Format dates in BS or AD.

```ts
const d = BSDay.fromBS([2082, 11, 24]);

d.format('YYYY-MM-DD', 'bs');
// 2082-11-24

d.format('YYYY/MM/DD', 'bs');
// 2082/11/24

d.format('YYYY-MM-DD', 'ad');
// 2026-03-08
```

---

# Parsing

Convert formatted strings into BSDay instances.

```ts
const d = BSDay.parse('2082-11-24', 'YYYY-MM-DD', 'bs');
```

---

# Date Arithmetic

Add or manipulate dates.

```ts
const a = BSDay.fromBS([2082, 1, 1]);

const b = a.addDays(10);

const c = a.addMonths(1);

const d = a.addYears(1);
```

---

# Date Comparison

Compare BSDay instances.

```ts
const a = BSDay.fromBS([2082, 1, 1]);
const b = BSDay.fromBS([2082, 1, 10]);

a.isBefore(b);
b.isAfter(a);
a.isSame(b);
```

---

# Dataset Methods

`@bsday/core` automatically loads calendar data from `@bsday/dataset`.

This dataset includes:

* tithi
* festivals
* panchang data (nakshatra, yoga, karana)

Example:

```ts
const d = BSDay.fromBS([2082, 11, 24]);

d.tithi();
// "Panchami"

d.festivals();
// ["नारी दिवस"]

d.panchang();
// { nakshatra, yoga, karana }
```

Override dataset if needed:

```ts
BSDay.setDataset(customDataset);
```

---

# API Reference

## Static Methods

| Method                                 | Description                             |
| -------------------------------------- | --------------------------------------- |
| `BSDay.now()`                          | Create BSDay instance for current time  |
| `BSDay.nowAD()`                        | Get current AD date                     |
| `BSDay.nowBS(format?)`                 | Get current BS date as formatted string |
| `BSDay.fromAD(date)`                   | Create instance from AD Date            |
| `BSDay.fromBS([y,m,d])`                | Create instance from BS date            |
| `BSDay.parse(value, format, calendar)` | Parse formatted string                  |
| `BSDay.setDataset(dataset)`            | Override default dataset                |
| `BSDay.use(plugin)`                    | Register plugin                         |

---

## Instance Methods

| Method                      | Description                     |
| --------------------------- | ------------------------------- |
| `toAD()`                    | Convert to JS Date              |
| `toBS()`                    | Convert to BS object            |
| `format(format, calendar?)` | Format date                     |
| `addDays(n)`                | Add days                        |
| `addMonths(n)`              | Add months                      |
| `addYears(n)`               | Add years                       |
| `isBefore(date)`            | Check if date is before another |
| `isAfter(date)`             | Check if date is after another  |
| `isSame(date)`              | Check if dates are equal        |
| `tithi()`                   | Get tithi                       |
| `festivals()`               | Get festivals                   |
| `panchang()`                | Get panchang data               |

---

# Plugin System

BSDay can be extended with plugins.

Plugin structure:

```ts
interface BSDayPlugin {
  name: string;
  initialize(bsday: typeof BSDay): void;
}
```

Register a plugin:

```ts
BSDay.use(plugin);
```

Example plugin:

```ts
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

---

# Ecosystem

| Package           | Description       |
| ----------------- | ----------------- |
| `@bsday/core`     | Core date library |
| `@bsday/dataset`  | Calendar dataset  |
| `@bsday/plugin-*` | Optional plugins  |

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

# License

MIT
