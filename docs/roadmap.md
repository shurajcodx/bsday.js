# bsday.js Roadmap

**Project Name:** bsday.js
**Purpose:** Outline **development phases, milestones, and priorities** for the dual-calendar BS ↔ AD library with dataset and plugin support.

---

## 1. Phase 1: Core Library

**Objective:** Build the foundation of BSDay.js with core date functionality.

**Tasks:**

* [ ] Implement **AD ↔ BS conversion engine**
* [ ] Develop **BSDay class** with constructors, getters, and setters
* [ ] Implement **date arithmetic** (`addDays`, `addMonths`, `addYears`, etc.)
* [ ] Implement **comparison methods** (`isBefore`, `isAfter`, `isSame`)
* [ ] Develop **formatting engine** with standard tokens
* [ ] Implement **parsing engine** for string → BSDay
* [ ] Add **static helpers and constants** (`MONTHS_NEPALI`, `WEEKDAYS_NEPALI`, `isLeapYear`)
* [ ] Write **unit tests** (conversion, formatting, parsing, arithmetic, comparison)
* [ ] Prepare **basic documentation & examples**

**Deliverable:**

* `@bsday/core` package with fully functional BSDay class

---

## 2. Phase 2: Dataset Integration

**Objective:** Integrate **BS dataset** for tithi, festivals, and Panchang.

**Tasks:**

* [ ] Build **dataset structure** with O(1) lookup

```ts
interface BSDayData {
  tithi: string
  festivals: string[]
  nakshatra: string
  yoga: string
  karana: string
}
```

* [ ] Populate **tithi, festivals, Panchang** for supported BS years (1970–2100)
* [ ] Connect **dataset to BSDay instances** (`.tithi()`, `.festivals()`, `.panchang()`)
* [ ] Optimize **dataset size & performance**
* [ ] Add **static access** via `BSDay.dataset()`
* [ ] Unit tests for dataset accuracy and access

**Deliverable:**

* `@bsday/dataset` package
* API integrated in `@bsday/core`

---

## 3. Phase 3: Plugin System

**Objective:** Enable **extensibility** for developers.

**Tasks:**

* [ ] Define **plugin interface**

```ts
interface BSDayPlugin {
  name: string
  initialize(bsday: typeof BSDay): void
}
```

* [ ] Implement **PluginManager & registration system** (`BSDay.use()`)
* [ ] Provide example plugins:

  * Nepali numeral formatting
  * Holiday / festival utilities
  * Lunar calendar
  * Fiscal year / workday calculations
* [ ] Unit tests and **developer guide for plugin creation**

**Deliverable:**

* Plugin-ready BSDay.js core

---

## 4. Phase 4: Monorepo & Packages

**Objective:** Organize the project for **modularity and future extensions**.

**Packages:**

* `@bsday/core` → main library
* `@bsday/dataset` → optional BS date dataset (tithi, Panchang, festivals)
* `@bsday/festivals` → optional plugin for festival utilities
* `@bsday/holidays` → optional plugin for holidays

**Tasks:**

* [ ] Set up **pnpm workspace**
* [ ] Configure **TypeScript paths** and package dependencies
* [ ] Ensure **tree-shaking & minimal bundle size**
* [ ] Unit tests for cross-package integration

---

## 5. Phase 5: Finalization & Optional Features

**Objective:** Polish, optimize, and prepare for release.

**Tasks:**

* [ ] ESLint & Prettier enforcement
* [ ] Build bundling: **ESM + CJS + type definitions**
* [ ] Optional features:

  * Time support (hours, minutes, seconds)
  * Timezone awareness (`Asia/Kathmandu`)
  * Localization (month/day names, formats)
  * Datepicker integration (React / Vue / Angular)
* [ ] Documentation: README, usage examples, plugin guide
* [ ] Publish to NPM

---

## 6. Milestones

| Milestone               | Target Package   | Status  |
| ----------------------- | ---------------- | ------- |
| Core library completion | `@bsday/core`    | Pending |
| Dataset integration     | `@bsday/dataset` | Pending |
| Plugin system ready     | `@bsday/core`    | Pending |
| Monorepo setup          | All packages     | Pending |
| Optional features       | All packages     | Pending |
| NPM Release             | All packages     | Pending |

---

## 7. Notes

* Dataset **does not include AD dates or weekday** to reduce size
* Festivals, Panchang info, and tithi are **dynamic via dataset**
* Core API is **lightweight and fast**; optional packages extend features
