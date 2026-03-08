# BSDay.js Plugin Development Guide

**Library:** bsday.js
**Purpose:** Provide developers a clear guideline to **create, register, and extend BSDay.js functionality** via plugins.

---

## 1. Introduction

BSDay.js has a **plugin architecture** allowing developers to extend the core library without modifying its source code. Plugins can:

* Add **custom formatting tokens** (e.g., Nepali numerals)
* Add **holiday or lunar calendar calculations**
* Provide **utility functions** (e.g., fiscal year, workdays)

**Goal:** Keep core library **lightweight** while allowing rich, optional extensions.

---

## 2. Plugin Interface

All plugins must implement the following interface:

```ts
export interface BSDayPlugin {
  name: string
  initialize(bsday: typeof BSDay): void
}
```

* `name`: Unique plugin name
* `initialize(bsday)`: Function called when the plugin is registered. Can extend BSDay prototype, static methods, or formatting tokens.

---

## 3. Registering a Plugin

Use `BSDay.use()` to register any plugin:

```ts
import { BSDay } from '@bsday/core';
import { MyPlugin } from './myPlugin';

BSDay.use(new MyPlugin());
```

**Notes:**

* Multiple plugins can be registered in sequence.
* Plugins should **not overwrite core methods** unless intentional.

---

## 4. Plugin Development Steps

1. **Create plugin class**

```ts
export class NepaliNumberPlugin implements BSDayPlugin {
  name = 'nepali-number';

  initialize(BSDay) {
    BSDay.prototype.formatNepali = function () {
      const bs = this.toBS();
      return `${convertToNepali(bs.year)}-${convertToNepali(bs.month)}-${convertToNepali(bs.day)}`;
    };
  }
}
```

2. **Add helper functions if needed**

```ts
function convertToNepali(num: number): string {
  const nepaliNums = ['०','१','२','३','४','५','६','७','८','९'];
  return num.toString().split('').map(d => nepaliNums[+d]).join('');
}
```

3. **Register the plugin**

```ts
BSDay.use(new NepaliNumberPlugin());
const date = new BSDay({ bs: [2082, 2, 1] });
console.log(date.formatNepali()); // Output: २०८२-०२-०१
```

---

## 5. Types of Plugins

| Type                 | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| **Formatting Token** | Add new format tokens like Nepali numerals                                 |
| **Holiday / Lunar**  | Add methods for lunar calculations, holidays not included in core          |
| **Calendar**         | Introduce a new calendar system, e.g., Lunar calendar                      |
| **Utility**          | Custom helper methods, e.g., fiscal year calculations, workdays, or events |

---

## 6. Best Practices

* **Unique names**: Avoid conflicts with other plugins
* **Immutable methods**: Prefer returning new instances rather than mutating
* **Minimal dependencies**: Keep plugins lightweight
* **Validation**: Always validate inputs before adding methods
* **Documentation**: Provide clear usage instructions for plugin users
* **Unit Tests**: Test for cross-calendar compatibility

---

## 7. Testing Plugins

* Use **Vitest or Jest** for unit tests
* Test **prototype extensions**, **static methods**, and **dataset integration**
* Example:

```ts
import { describe, it, expect } from 'vitest';
import { BSDay } from '@bsday/core';
import { NepaliNumberPlugin } from './NepaliNumberPlugin';

BSDay.use(new NepaliNumberPlugin());

describe('NepaliNumberPlugin', () => {
  it('formats date in Nepali numerals', () => {
    const date = new BSDay({ bs: [2082, 2, 1] });
    expect(date.formatNepali()).toBe('२०८२-०२-०१');
  });
});
```

---

## 8. Notes

* Plugins are **optional**; core library works independently.
* Avoid **heavy operations** inside the plugin’s `initialize` method.
* Plugins can also extend **static helpers** via `BSDay.<method>()`.
