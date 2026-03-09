# Contributing to bsday.js

Thank you for your interest in contributing to **bsday.js**.

This project aims to provide a modern toolkit for working with **Bikram Sambat (BS)** dates in JavaScript and TypeScript.

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

Build packages:

```bash
pnpm -r build
```

Run tests:

```bash
pnpm -r test
```

---

# Code Style

This project uses:

* ESLint
* Prettier
* TypeScript

Run before committing:

```bash
pnpm lint
pnpm format
pnpm typecheck
```

---

# Project Structure

```
packages/
  core/
  dataset/
```

### `@bsday/core`

Contains the main BSDay implementation:

* BS ↔ AD conversion
* formatting/parsing
* date utilities
* plugin system

### `@bsday/dataset`

Contains the Panchang dataset including:

* tithi
* festivals
* nakshatra
* yoga
* karana

---

# Adding Features

When adding new features:

* Keep the **core library lightweight**
* Prefer **plugins for optional functionality**
* Add **tests for all new behavior**

---

# Dataset Updates

Dataset changes should be made inside:

```
packages/dataset
```

Make sure to:

* maintain the `YYYY-MM-DD` key format
* validate Panchang fields
* update tests if required

---

# Pull Requests

Before submitting a PR:

1. Ensure all tests pass
2. Ensure linting passes
3. Write clear commit messages
4. Add tests for new functionality

---

# Questions

If you have questions or ideas, open a **GitHub issue**.
