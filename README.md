# bsday.js

A modern **TypeScript toolkit** for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates.

`bsday.js` provides accurate BS ↔ AD conversion, formatting, parsing, date arithmetic, and Nepali Panchang data.
It is built as a **modular monorepo** designed to support plugins, datasets, and future ecosystem extensions.

🌐 Documentation: <[https://bsdayjs.github.io](https://bsdayjs.vercel.app/)>

---

## Features

* 📅 Accurate **BS ↔ AD date conversion**
* 🔢 **Formatting and parsing** utilities
* ➕ **Date arithmetic** (add, subtract)
* 🔍 **Date comparison** helpers
* 🧩 **Plugin architecture**
* 🪔 Panchang dataset support (Tithi, Nakshatra, Yoga, Festivals)
* ⚡ Fully typed with **TypeScript**
* 🧱 Modular **monorepo architecture**

---

## Installation

Install via npm, pnpm, or yarn:

```bash
pnpm add @bsday/core @bsday/dataset
```
*(Note: `@bsday/core` can be used standalone, but `@bsday/dataset` provides the full Panchang and festival data).*

---

## Quick Start / Usage

### Basic Conversion & Manipulation
```typescript
import { BSDay } from '@bsday/core';
import '@bsday/dataset'; // imports panchang and festival dataset automatically

// Create a BS Date
const bsDate = BSDay.fromBS([2081, 6, 26]);
console.log(bsDate.format('YYYY-MM-DD')); // "2081-06-26"

// Convert to AD
const adDate = bsDate.toAD();
console.log(adDate.toISOString()); // "2024-10-12T00:00:00.000Z"

// Create from AD Date
const today = BSDay.fromAD(new Date());
console.log(`Today in BS is: ${today.format('YYYY-MM-DD')}`);

// Date Arithmetic
const nextWeek = bsDate.addDays(7);
console.log(nextWeek.format('YYYY-MM-DD'));
```

### Accessing Panchang & Festival Data
```typescript
import { BSDay } from '@bsday/core';

const dashain = BSDay.fromBS([2081, 6, 26]);

console.log(dashain.isHoliday()); // true
console.log(dashain.getFestivals()); // ["Vijaya Dashami"]
console.log(dashain.getPanchang());
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

---

## Packages

### `@bsday/core`
The main library providing:
* `BSDay` class
* BS ↔ AD conversion
* formatting and parsing
* date arithmetic
* comparison utilities
* plugin system

### `@bsday/dataset`
Daily Bikram Sambat dataset keyed by `YYYY-MM-DD`. Dataset fields include:
* `tithi`, `festivals`, `nakshatra`, `yoga`, `karana`, `events`, `isHoliday`
The dataset is automatically loaded by `@bsday/core` when imported.

---

## Monorepo Structure

```
packages/
  core/
  dataset/

docs/
  plugin-development.md
  requirement.md
  technical.md
  roadmap.md
  contribution.md
```

The repository uses **pnpm workspaces** for package management.

---

## Development Setup

Clone the repository:

```bash
git clone https://github.com/shurajcodx/bsday.js.git
cd bsday.js
```

Install dependencies:

```bash
pnpm install
```

---

## Build & Test

Build all packages:
```bash
pnpm -r build
```

Run tests for all packages:
```bash
pnpm -r test
```

Available at repository root:
```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
pnpm format:check
```

---

## Documentation

Detailed documentation is available in the `docs/` directory.

* `docs/requirement.md` — project requirements and goals
* `docs/technical.md` — architecture and implementation details
* `docs/plugin-development.md` — how to develop BSDay plugins
* `docs/roadmap.md` — planned features and future direction

---

## Contributing

Contributions are welcome! 🎉
Please read the full contribution guide before submitting changes: 👉 `docs/contribution.md`

Typical workflow:
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Run tests and linting
5. Open a pull request

---

## Requirements

* Node.js ≥ 24
* pnpm ≥ 10

---

## License

MIT © BSDay.js Contributors
