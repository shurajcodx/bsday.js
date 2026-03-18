# 🚀 bsday.js Improvement Checklist

A structured checklist to make **bsday.js** production-ready, scalable, and widely adoptable.

---

## ✅ 1. Core Stability & Edge Cases

### 🔹 Date Edge Cases

* [ ] End-of-month rollover handling
* [ ] Year boundary transitions (e.g., 2082 → 2083)
* [ ] Leap year correctness (BS-specific logic)
* [ ] Invalid dates handling (e.g., month 13, day 40)

### 🔹 Validation API

* [x] `BSDay.isValid(input)`
* [ ] Strict vs loose parsing modes

---

## ⚡ 2. Performance

* [ ] Benchmark vs native `Date`
* [ ] Benchmark vs other BS libraries (if available)
* [ ] Optimize conversion logic
* [ ] Add performance section in README

---

## 📦 3. Bundle & Packaging

* [ ] Ensure ESM support (`module` field)
* [ ] Ensure CommonJS compatibility
* [ ] Add `"sideEffects": false` for tree-shaking
* [ ] Minimize bundle size
* [ ] Measure gzipped size

---

## 🧩 4. API Consistency & DX

### 🔹 Unified API

* [x] Add generic methods:

  * [x] `add(value, unit)`
  * [x] `subtract(value, unit)`

### 🔹 Immutability

* [x] Ensure all operations return new instances
* [x] Document immutability clearly

### 🔹 Utility Methods

* [x] `daysInMonth()`
* [x] `isWeekend()`
* [ ] `isHoliday()`

---

## 🧪 5. Testing Improvements

* [ ] Add edge-case tests
* [ ] Add invalid input tests
* [ ] Add stress tests for large date ranges
* [ ] Ensure 100% critical path coverage

---

## 🌐 6. Localization (High Impact)

* [x] Nepali numerals support (०१२३४५६७८९)
* [x] Nepali month names
* [x] Locale option in `format()`
* [x] English fallback

---

## 📅 7. Advanced Features

### 🔹 Relative Time

* [x] `fromNow()`
* [x] `toNow()`

### 🔹 Timezone (Future)

* [ ] Basic timezone support
* [ ] Default to Asia/Kathmandu

---

## 🧠 8. Dataset System (Your Strength)

* [ ] Validate dataset schema

* [ ] Prevent mutation (deep clone safety)

* [ ] Add helper:

  * [ ] `hasFestival()`
  * [ ] `hasEvent()`

* [ ] Expand dataset coverage (years range clarity)

* [ ] Document dataset format

---

## 🧩 9. Plugin System

* [x] Introduce:

  * [x] `BSDay.extend(plugin)`
* [x] Create example plugins:

  * [x] Relative time plugin
  * [ ] Localization plugin (Done via core now)
* [x] Document plugin API

---

## 🔐 10. TypeScript Excellence

* [x] Strong typing for units (`'day' | 'month' | 'year'`)
* [ ] Autocomplete for format tokens
* [ ] Strict return types
* [x] Export public types

---

## 📚 11. Documentation Readiness

* [ ] Quick start examples
* [ ] API reference
* [ ] Real-world usage examples
* [ ] Clear feature list

---

## 🎯 12. Real-world Helpers

* [ ] Banking/date display examples
* [ ] Festival-based UI examples
* [ ] Calendar integration examples

---

## 🧷 13. CLI Tool (Optional but Powerful)

* [ ] `npx bsday convert <date>`
* [ ] `npx bsday today`

---

## 🧱 14. Architecture (Future Scaling)

* [ ] Plan package split:

  * [ ] `@bsday/core`
  * [ ] `@bsday/panchang`
  * [ ] `@bsday/react` (future)

---

## 🌟 15. Positioning (Important)

* [ ] Define as:

  * "Nepali Calendar SDK"
* [ ] Highlight:

  * BS ↔ AD conversion
  * Panchang system
  * Festival dataset

---

## ✅ Final Goal

✔ Accurate
✔ Fast
✔ Developer-friendly
✔ Extensible
✔ Trusted for production

---

> Once all major items are checked, proceed to:
>
> * README creation
> * npm publishing
> * branding & launch 🚀
