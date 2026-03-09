# bsday.js

A modern **TypeScript toolkit** for working with **Bikram Sambat (BS)** and **Gregorian (AD)** dates.

`bsday.js` provides accurate BS ↔ AD conversion, formatting, parsing, date arithmetic, and Nepali Panchang data.
It is built as a **modular monorepo** designed to support plugins, datasets, and future ecosystem extensions.

🌐 Documentation: <https://bsdayjs.github.io>

---

# Features

* 📅 Accurate **BS ↔ AD date conversion**
* 🔢 **Formatting and parsing** utilities
* ➕ **Date arithmetic** (add, subtract)
* 🔍 **Date comparison** helpers
* 🧩 **Plugin architecture**
* 🪔 Panchang dataset support
* ⚡ Fully typed with **TypeScript**
* 🧱 Modular **monorepo architecture**

---

# Packages

## `@bsday/core`

The main library providing:

* `BSDay` class
* BS ↔ AD conversion
* formatting and parsing
* date arithmetic
* comparison utilities
* plugin system

---

## `@bsday/dataset`

Daily Bikram Sambat dataset keyed by:

```
YYYY-MM-DD
```

Dataset fields include:

* `tithi`
* `festivals`
* `nakshatra`
* `yoga`
* `karana`

The dataset is automatically loaded by `@bsday/core`.

---

# Monorepo Structure

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

# Development Setup

Clone the repository:

```bash
git clone https://github.com/bsdayjs/bsday.js.git
cd bsday.js
```

Install dependencies:

```bash
pnpm install
```

---

# Build

Build all packages:

```bash
pnpm -r build
```

---

# Testing

Run tests for all packages:

```bash
pnpm -r test
```

---

# Development Scripts

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

# Working on a Single Package

Example for `@bsday/core`:

Build:

```bash
pnpm --filter @bsday/core build
```

Run tests:

```bash
pnpm --filter @bsday/core test
```

Type check:

```bash
pnpm --filter @bsday/core typecheck
```

---

# Dataset Loading

`@bsday/core` automatically loads the dataset from `@bsday/dataset`.

You can override the dataset manually if needed:

```ts
import { BSDay } from "@bsday/core"

BSDay.setDataset(customDataset)
```

---

# Documentation

Detailed documentation is available in the `docs/` directory.

* `docs/requirement.md` — project requirements and goals
* `docs/technical.md` — architecture and implementation details
* `docs/plugin-development.md` — how to develop BSDay plugins
* `docs/roadmap.md` — planned features and future direction

---

# Contributing

Contributions are welcome! 🎉

Please read the full contribution guide before submitting changes:

👉 `docs/contribution.md`

Typical workflow:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Run tests and linting
5. Open a pull request

---

# Requirements

* Node.js ≥ 24
* pnpm ≥ 10

---

# License

MIT © BSDay.js Contributors
