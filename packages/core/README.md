# @bsday/core

Core BSDay library for BS/AD date operations.

## Install

```bash
pnpm add @bsday/core
```

## Create Dates

```ts
import { BSDay } from '@bsday/core';

const now = BSDay.now();
const fromAd = BSDay.fromAD(new Date());
const fromBs = BSDay.fromBS([2082, 11, 24]);
```

## Current Date Helpers

```ts
const ad = BSDay.nowAD(); // Date
const bs = BSDay.nowBS(); // "YYYY-MM-DD HH:mm"
const bsCustom = BSDay.nowBS('YYYY/MM/DD HH:mm');
```

## Conversion

```ts
const d = BSDay.fromBS([2082, 11, 24]);

const adDate = d.toAD();
const bsDate = d.toBS(); // { year, month, day }
```

## Dataset Methods

`@bsday/core` auto-loads dataset from `@bsday/dataset`.

```ts
const d = BSDay.fromBS([2082, 11, 24]);

d.tithi(); // 'Panchami'
d.festivals(); // ['नारी दिवस']
d.panchang(); // { nakshatra, yoga, karana }
```

Override dataset if needed:

```ts
BSDay.setDataset(customDataset);
```

## Formatting and Parsing

```ts
const d = BSDay.fromBS([2082, 11, 24]);

d.format('YYYY-MM-DD', 'bs');
BSDay.parse('2082-11-24', 'YYYY-MM-DD', 'bs');
```

## Arithmetic and Comparison

```ts
const a = BSDay.fromBS([2082, 1, 1]);
const b = a.addDays(10);

a.isBefore(b);
b.isAfter(a);
a.isSame(b);
```

## Plugin API

```ts
interface BSDayPlugin {
  name: string;
  initialize(bsday: typeof BSDay): void;
}

BSDay.use(plugin);
```
