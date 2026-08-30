# 🔌 BSDay.js Plugin Development Guide

**Library:** `bsday.js`  
**Purpose:** Provide developers a clear, modern guide to **create, register, and type-safe extend BSDay.js functionality** via plugins.

---

## 1. Introduction

`bsday.js` features a modular, Day.js-compatible **plugin architecture** allowing developers to extend the core library without modifying source code. Plugins can:

* Add **custom formatting tokens** (e.g., Devanagari ordinals, astrological tokens)
* Add **new prototype methods** on `BSDay` instances (e.g., relative time, calendar conversions)
* Add **static helpers** on `bsday` / `BSDay` (e.g., fiscal year generators, date range builders)
* Hook into formatting and lifecycle pipelines

**Goal:** Keep `@bsday.js/core` ultra-lightweight (~12KB gzipped) while allowing rich, opt-in ecosystem extensions.

---

## 2. Plugin Interfaces

`bsday.js` supports two plugin formats: **Functional Plugins** (recommended, Day.js style) and **Object Plugins**.

### A. Functional Plugin (Recommended)

A function receiving `(options, BSDay, bsdayFactory)`:

```typescript
import type { BSDayPluginFunction, BSDayPluginHost, BSDayFactoryLike } from '@bsday.js/core';

export const myPlugin: BSDayPluginFunction = (options, BSDay, bsdayFactory) => {
  // 1. Extend prototype
  (BSDay.prototype as any).myMethod = function () {
    return `BS Year: ${this.year()}`;
  };

  // 2. Register custom format token
  BSDay.registerFormatToken('XX', ({ bs, locale }) => {
    return `BS-${bs.year}`;
  });
};
```

### B. Object Plugin

An object implementing `{ name, initialize(host, options) }`:

```typescript
import type { BSDayPlugin, BSDayPluginHost } from '@bsday.js/core';

export const myObjectPlugin: BSDayPlugin = {
  name: 'myObjectPlugin',
  initialize(host: BSDayPluginHost, options?: unknown) {
    (host.prototype as any).customGreeting = function () {
      return `नमस्ते! Today is ${this.format('YYYY/MM/DD')}`;
    };

    host.registerFormatToken('ZE', ({ locale }) => (locale === 'ne' ? 'ने.सं.' : 'N.S.'));
  },
};
```

---

## 3. Registering Plugins

Use `bsday.extend()` or `BSDay.extend()` to register any plugin:

```typescript
import bsday, { BSDay } from '@bsday.js/core';
import { relativeTimePlugin } from '@bsday.js/core'; // built-in plugin example
import { myPlugin } from './myPlugin';

// Register via factory
bsday.extend(myPlugin, { customOption: true });

// Or register via BSDay class directly
BSDay.extend(relativeTimePlugin);
```

> 💡 **Plugin Idempotency:** Registering the same plugin multiple times is safely deduplicated.

---

## 4. TypeScript Typing & Module Augmentation

To provide seamless TypeScript autocompletion and type checking for your plugin methods, use **TypeScript Module Augmentation**:

```typescript
// plugins/workdayPlugin.ts
import { BSDay, type BSDayPluginFunction } from '@bsday.js/core';

// 1. Declare interface additions
declare module '@bsday.js/core' {
  interface BSDay {
    /** Returns true if the day is a standard working day (Sunday–Friday and not a holiday) */
    isWorkday(): boolean;
    /** Adds `n` working days skipping Saturdays */
    addWorkdays(days: number): BSDay;
  }
}

// 2. Implement plugin logic
export interface WorkdayPluginOptions {
  saturdayOnlyWeekend?: boolean;
}

export const workdayPlugin: BSDayPluginFunction = (options, BSDayHost) => {
  const proto = BSDayHost.prototype as any;

  proto.isWorkday = function (this: BSDay): boolean {
    const isSaturday = this.day() === 6;
    return !isSaturday && !this.isHoliday;
  };

  proto.addWorkdays = function (this: BSDay, days: number): BSDay {
    let current = this.clone();
    let added = 0;
    const direction = days >= 0 ? 1 : -1;
    const target = Math.abs(days);

    while (added < target) {
      current = current.add(direction, 'day');
      if (current.isWorkday()) {
        added++;
      }
    }

    return current;
  };
};
```

---

## 5. Complete Plugin Examples

### Example 1: Custom Format Token Plugin (Nepal Sambat Year Token `NNNN`)

```typescript
// plugins/nepalSambatPlugin.ts
import type { BSDayPluginFunction } from '@bsday.js/core';
import { localizeNumber } from '@bsday.js/core'; // or internal helper

export const nepalSambatPlugin: BSDayPluginFunction = (_opts, BSDayHost) => {
  // Nepal Sambat is approximately BS year - 937 (starting Kartik Shukla Pratipada)
  BSDayHost.registerFormatToken('NNNN', ({ bs, locale }) => {
    const nsYear = bs.year - 937;
    return localizeNumber(nsYear, locale);
  });
};
```

**Usage:**
```typescript
import bsday from '@bsday.js/core';
import { nepalSambatPlugin } from './nepalSambatPlugin';

bsday.extend(nepalSambatPlugin);

const date = bsday.bs(2081, 5, 15);
console.log(date.format('YYYY [BS] / NNNN [NS]')); // "2081 BS / 1144 NS"
console.log(date.locale('ne').format('YYYY [वि.सं.] / NNNN [ने.सं.]')); // "२०८१ वि.सं. / ११४४ ने.सं."
```

---

### Example 2: Buddhist Era (BE) Year Plugin

```typescript
// plugins/buddhistEraPlugin.ts
import type { BSDayPluginFunction } from '@bsday.js/core';

declare module '@bsday.js/core' {
  interface BSDay {
    buddhistYear(): number;
  }
}

export const buddhistEraPlugin: BSDayPluginFunction = (_opts, BSDayHost) => {
  const proto = BSDayHost.prototype as any;

  proto.buddhistYear = function (): number {
    // AD Year + 543
    return this.toAD().getFullYear() + 543;
  };

  BSDayHost.registerFormatToken('BBBB', ({ ad, locale }) => {
    const beYear = ad.getFullYear() + 543;
    return String(beYear);
  });
};
```

---

## 6. Testing Plugins with Vitest

Write unit tests for your plugins to guarantee immutability, timezone stability, and format token accuracy:

```typescript
// plugins/__tests__/workdayPlugin.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import bsday, { BSDay } from '@bsday.js/core';
import { workdayPlugin } from '../workdayPlugin';

describe('workdayPlugin', () => {
  beforeAll(() => {
    bsday.extend(workdayPlugin);
  });

  it('correctly identifies working days and Saturdays', () => {
    const friday = bsday.bs(2081, 5, 14); // Friday
    const saturday = bsday.bs(2081, 5, 15); // Saturday
    const sunday = bsday.bs(2081, 5, 16); // Sunday

    expect(friday.isWorkday()).toBe(true);
    expect(saturday.isWorkday()).toBe(false);
    expect(sunday.isWorkday()).toBe(true);
  });

  it('skips Saturdays when adding workdays', () => {
    const friday = bsday.bs(2081, 5, 14);
    const nextWorkday = friday.addWorkdays(1);

    expect(nextWorkday.format('YYYY/MM/DD')).toBe('2081/05/16'); // Skips Saturday (15) to Sunday (16)
  });
});
```

---

## 7. Best Practices Checklist

- [x] **Preserve Immutability**: Methods adding/subtracting dates should always return a new `BSDay` instance (via `this.clone()` or `this.add()`), never mutating `this`.
- [x] **Avoid Global State**: Use `options` passed to `extend(plugin, options)` instead of global variables.
- [x] **Handle Dual-Calendar**: If your plugin interacts with calendar units, consider both BS and Gregorian AD contexts.
- [x] **Provide TypeScript Types**: Always ship ambient `declare module '@bsday.js/core'` declarations with your plugin package.
