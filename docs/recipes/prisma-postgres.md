# 🗄️ Database & Prisma Integration (UTC Storage with BS Display)

This recipe covers the industry best practice for handling Nepali dates in relational and NoSQL databases (PostgreSQL, MySQL, SQLite, MongoDB) using **Prisma ORM**.

---

## 1. Golden Rule of Dual-Calendar Persistence

> **Always store timestamps in the database as standard UTC Gregorian (`DateTime` / `TIMESTAMP WITH TIME ZONE`).**
> Convert to Bikram Sambat (BS) when:
> 1. Rendering in UI or printing invoices.
> 2. Querying by BS Fiscal Year, BS Month, or BS Quarter boundaries.

---

## 2. Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Transaction {
  id          String   @id @default(cuid())
  amount      Float
  description String
  createdAt   DateTime @default(now()) // Stored as UTC timestamp
  updatedAt   DateTime @updatedAt
}
```

---

## 3. Querying by Nepali Fiscal Year with Prisma

```typescript
// services/transactionService.ts
import { bsday, BSDay } from '@bsday.js/core';
import prisma from '@/lib/prisma';

export async function getTransactionsByFiscalYear(bsYear: number) {
  // 1. Calculate exact UTC start and end of the BS Fiscal Year
  const startOfFY = BSDay.startOfFiscalYear(bsYear).toAD();
  const endOfFY = BSDay.endOfFiscalYear(bsYear).toAD();

  // 2. Query PostgreSQL with high performance indexed timestamp range
  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: startOfFY,
        lte: endOfFY,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Attach formatted BS dates for client presentation
  return transactions.map((tx) => {
    const bs = bsday(tx.createdAt);
    return {
      ...tx,
      dateBS: bs.format('YYYY/MM/DD'),
      dateBSNepali: bs.locale('ne').format('YYYY MMMM DD, dddd'),
      fiscalYear: bs.fiscalYear('extended'),
      fiscalQuarter: `Q${bs.fiscalQuarter()}`,
    };
  });
}
```

---

## 4. Querying by BS Month (e.g. Bhadra 2081)

```typescript
export async function getMonthlyReport(year: number, month: number) {
  const startOfMonth = bsday.bs(year, month, 1).startOf('date').toAD();
  const endOfMonth = bsday.bs(year, month, 1).endOf('month').toAD();

  return prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });
}
```
