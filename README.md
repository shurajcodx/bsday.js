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
pnpm add @bsday.js/core @bsday/dataset
```
`@bsday.js/core` works by itself for BS/AD conversion and date math.
`@bsday/dataset` is optional and is only needed when you want panchang/day data.

---

## Quick Start / Usage

### Basic Conversion & Manipulation
```typescript
import { BSDay, bsday } from '@bsday.js/core';
import { dataset } from '@bsday/dataset';

BSDay.setDataset(dataset);

// Create a BS Date explicitly
const bsDate = BSDay.bs('2081/06/27');
console.log(bsDate.format()); // "2081/06/27"

// Convert to AD
const adDate = bsDate.toAD();
console.log(adDate.toISOString()); // "2024-10-11T18:15:00.000Z"

// Create from familiar AD-like input
const today = bsday('2024-10-12');
console.log(`Today in BS is: ${today.format()}`);

// Date Arithmetic
const nextWeek = bsDate.add(7, 'day');
console.log(nextWeek.format());
```

### Accessing Panchang & Festival Data
```typescript
import { BSDay } from '@bsday.js/core';
import { dataset } from '@bsday/dataset';

BSDay.setDataset(dataset);

const dashain = BSDay.bs('2081/06/27');

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

---

## Packages

### `@bsday.js/core`
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
Load it explicitly with `BSDay.setDataset(dataset)`.

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
* `docs/api-design.md` — API shape options and ergonomics tradeoffs
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

* Node.js ≥ 20
* pnpm ≥ 10

---

## License

MIT © BSDay.js Contributors
