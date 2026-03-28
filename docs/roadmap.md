# bsday.js — Full roadmap

**Project:** bsday.js
**Purpose:** A modern, modular toolkit for **Bikram Sambat ↔ Gregorian (AD) dates**, dataset, and plugin support.

## ✅ v1.0.0 — Initial Release

**Objective:** Publish a stable, fully functional BS ↔ AD library with dataset and plugin support.

**Core Features:**

* AD ↔ BS conversion engine
* `BSDay` class (constructors, getters, setters)
* Date arithmetic (`add`, `subtract`)
* Comparison methods (`isBefore`, `isAfter`, `isSame`)
* Formatting engine (standard tokens)
* Parsing engine (string → BSDay)
* Static helpers & constants (`MONTHS_NEPALI`, `WEEKDAYS_NEPALI`, `isLeapYear`)

**Dataset features:**

* BS dataset integrated (1970–2100)
* Panchang info: tithi, festivals, nakshatra, yoga, karana
* Static access: `BSDay.dataset()`
* Optimized size & performance
* Unit-tested for accuracy

**Plugin system:**

* Plugin interface ready (`BSDay.use()`)
* PluginManager included
* Developer guide available (`docs/plugin-development.md`)
* Example plugins included in guide

**Monorepo & Packaging:**

* `@bsday.js/core` → core library
* `@bsday.js/dataset` → optional dataset package
* pnpm workspace setup
* TypeScript paths & package dependencies configured
* Build outputs: ESM + CJS + type definitions
* ESLint & Prettier enforced

**Developer utilities:**

* Unit tests for all core features
* TypeScript type safety
* Easy dataset override (`BSDay.setDataset(customDataset)`)

---

## 🌟 Upcoming / Priority features

**High-Priority enhancements:**

1. **BS Date picker component plugin**

   * Fully interactive UI component to select BS dates
   * Highlights festivals, tithis, and Panchang info from the dataset
   * Automatic conversion to AD for form submission or APIs
   * Framework agnostic: vanilla JS / Web Component
   * Optional adapters for React, Vue, Angular
   * Localization-ready (month/day names in Nepali or other locales)

2. **Time & Extended Date Support**

   * Millisecond token support
   * Additional timezone APIs beyond Nepal-local behavior
   * Extended date calculations: workdays, fiscal year, lunar calendar

3. **Localization & Formatting**

   * Locale-aware formatting for month/day names

4. **Optional Plugins / Packages**

   * Festival utilities plugin (`@bsday/festivals`)
   * Holiday utilities plugin (`@bsday/holidays`)
   * Lunar calendar plugin
   * Nepali numeral formatting plugin

5. **Developer & Ecosystem Improvements**

   * Example plugin library / playground
   * Improved dataset management and lazy loading
   * Tree-shaking & minimal bundle size for plugins
   * Advanced documentation: guides, migration examples

---

## 🏆 Milestones

| Milestone                                 | Status      |
| ----------------------------------------- | ----------  |
| Core library completion                   | ✅ Done     |
| Dataset integration                       | ✅ Done     |
| Plugin system ready                       | ✅ Done     |
| BS Date Picker plugin & framework support | ⚡ Upcoming |
| Time & extended date support              | ⚡ Upcoming |
| Localization & formatting                 | ⚡ Upcoming |
| Optional plugins / packages               | ⚡ Upcoming |
| Developer & ecosystem improvements        | ⚡ Upcoming |

---

## Notes

* Dataset **does not include AD dates or weekdays** to reduce size
* Festivals, Panchang info, and tithi are **dynamic via dataset**
* Core API is **lightweight and fast**; optional packages extend features
* v1.0 focuses on **core stability**, upcoming features focus on **UI and ecosystem expansion**
