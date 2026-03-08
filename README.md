# bsday.js

`bsday.js` is a TypeScript monorepo for Bikram Sambat (BS) and AD date handling.

## Packages

- `@bsday/core`:
  BSDay class, AD/BS conversion, formatting/parsing, arithmetic/comparison, plugin interface.
- `@bsday/dataset`:
  Daily BS dataset keyed by `YYYY-MM-DD` with `tithi`, `festivals`, `nakshatra`, `yoga`, `karana`.

## Workspace

```text
packages/
  core/
  dataset/
```

## Quick Start

```bash
pnpm install
pnpm -r build
pnpm -r test
```

## Scripts

At repository root:

- `pnpm build`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format`
- `pnpm format:check`

## Linting and Formatting

This repo uses a shared root configuration:

- ESLint: `eslint.config.mjs`
- Prettier: `.prettierrc.json`

All package-level `lint` scripts use the root ESLint config.

## Notes

- `@bsday/core` auto-loads dataset from `@bsday/dataset` by default.
- You can still override dataset manually using `BSDay.setDataset(...)`.
