# 🇳🇵 bsday.js

> **Ultra-fast, zero-dependency Day.js-compatible dual calendar (Bikram Sambat ↔ Gregorian) SDK and astronomical Panchang engine.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm (core)](https://img.shields.io/npm/v/@bsday.js/core.svg?style=flat-square&label=@bsday.js/core&color=indigo)](https://www.npmjs.com/package/@bsday.js/core)
[![npm (dataset)](https://img.shields.io/npm/v/@bsday.js/dataset.svg?style=flat-square&label=@bsday.js/dataset&color=purple)](https://www.npmjs.com/package/@bsday.js/dataset)
[![bundle size](<https://img.shields.io/badge/bundle%20size-~12KB%20(gzipped)-emerald.svg?style=flat-square>)](https://bundlephobia.com/package/@bsday.js/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-81%2F81%20passing-brightgreen.svg?style=flat-square)](https://vitest.dev)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📖 **Full Documentation & API Reference**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)  
📅 **Calendar Explorer**: [https://bsdayjs.vercel.app/calendar](https://bsdayjs.vercel.app/calendar)

---

## 📦 Packages

| Package                                     | Version | Description                                                                              |
| :------------------------------------------ | :-----: | :--------------------------------------------------------------------------------------- |
| **[@bsday.js/core](./packages/core)**       | `1.1.0` | Ultra-fast (~12KB gzipped), zero-dependency dual calendar SDK with Day.js syntax parity. |
| **[@bsday.js/dataset](./packages/dataset)** | `1.1.0` | 111-Year (1990–2100 BS / 40,543 days) astronomical Panchang & Nepali festival dataset.   |

---

## ⚡ Quick Usage

```bash
npm install @bsday.js/core
```

```typescript
import bsday from '@bsday.js/core';

// Create explicit BS Date
const date = bsday.bs(2081, 5, 15);

// Format date in English & Devanagari (नेपाली)
console.log(date.format('YYYY/MM/DD')); // "2081/05/15"
console.log(date.locale('ne').format('YYYY MMMM DD, dddd')); // "२०८१ भाद्र १५, शनिबार"

// Convert to Gregorian AD Date
const adDate = date.toAD(); // JavaScript Date: 2024-08-31

// Nepali Fiscal Year Engine (आर्थिक वर्ष)
console.log(date.fiscalYear('extended')); // "FY 2081/82"
```

> 💡 _For complete API reference, React / Next.js recipes, and guides, visit the [official documentation](https://bsdayjs.vercel.app/docs)._

---

## 🛠️ Local Development & Setup

This repository is a monorepo managed with **pnpm workspaces**.

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 10.0.0`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/shurajcodx/bsday.js.git
cd bsday.js

# Install dependencies across all packages
pnpm install
```

### 2. Available Commands

You can run commands directly using `pnpm` or via the provided [`Makefile`](./Makefile):

| Task                 | pnpm Command                                           | Make Shortcut       | Description                                                              |
| :------------------- | :----------------------------------------------------- | :------------------ | :----------------------------------------------------------------------- |
| **Run All Checks**   | `pnpm run typecheck && pnpm run lint && pnpm run test` | `make check`        | Runs full formatting, linting, typechecking, tests, and builds.          |
| **Build Packages**   | `pnpm run build`                                       | `make build`        | Builds `@bsday.js/core` and `@bsday.js/dataset` using `tsup`.            |
| **Run Tests**        | `pnpm run test`                                        | `make test`         | Runs unit and accuracy test suites via `vitest`.                         |
| **Type Check**       | `pnpm run typecheck`                                   | `make typecheck`    | Type-checks all TypeScript packages with `--noEmit`.                     |
| **Lint Code**        | `pnpm run lint`                                        | `make lint`         | Runs ESLint across all workspace packages.                               |
| **Format Code**      | `pnpm run format`                                      | `make format`       | Formats all files using Prettier.                                        |
| **Check Formatting** | `pnpm run format:check`                                | `make format-check` | Verifies code style compliance without modifying files.                  |
| **Run Benchmarks**   | `pnpm run benchmark`                                   | `make benchmark`    | Runs operations-per-second performance suite.                            |
| **Release & Merge**  | —                                                      | `make release`      | Merges development into master, tags `v<version>`, and pushes to origin. |

---

## 📁 Repository Structure

```text
bsday.js/
├── packages/
│   ├── core/                  # @bsday.js/core (~12KB gzipped dual calendar engine)
│   │   ├── src/               # BSDay class, converters, fiscal year, KYC age, calendar grid
│   │   └── tests/             # Unit tests
│   └── dataset/               # @bsday.js/dataset (111-Year Panchang & festival data)
│       ├── src/               # Raw JSON data (1990-2100), Panchang engine, translation
│       ├── ephe/              # Swiss Ephemeris astronomical tables
│       ├── scripts/           # Data generation, validation, and aggregation scripts
│       └── tests/             # Panchang accuracy & structure tests
├── docs/                      # Developer documentation & framework integration recipes
├── benchmarks/                # Performance benchmark scripts
├── Makefile                   # Development & release automation shortcuts
└── .github/                   # CI/CD workflows and issue templates
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Please review our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) before submitting a PR.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.
