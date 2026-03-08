# @bsday/dataset

BS day dataset keyed by `YYYY-MM-DD`.

## Schema

```ts
interface BSDayData {
  tithi: string;
  festivals: string[];
  nakshatra: string;
  yoga: string;
  karana: string;
}
```

## Data Layout

- Canonical editable files:
  `src/data/years/<year>.json`
- Built aggregate export file:
  `src/data/1970-2100.json`
- Metadata:
  `src/data/metadata.json`

## Usage

```ts
import { dataset, metadata } from '@bsday/dataset';

const data = dataset['2082-11-24'];
```

## Maintenance Workflow

1. Create a year template:
   `pnpm --filter @bsday/dataset create:year 2090`
2. Fill `src/data/years/2090.json`.
3. Rebuild aggregate file:
   `pnpm --filter @bsday/dataset build:aggregate`
4. (Optional) Re-split aggregate to year files:
   `pnpm --filter @bsday/dataset split:years`
5. Run tests:
   `pnpm --filter @bsday/dataset test`

## Scripts

- `create:year`
- `build:aggregate`
- `split:years`
