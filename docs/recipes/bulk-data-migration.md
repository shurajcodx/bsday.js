# ⚡ Bulk Data Migration & CSV Processing (BS ↔ AD)

This recipe explains how to perform high-throughput bulk date conversions (processing millions of records) when migrating legacy databases, CSV exports, or running ETL data pipelines with `@bsday.js/core`.

---

## 1. Why `bsday.js` for Large-Scale Migrations?

- **Extreme Throughput**: `@bsday.js/core` converts over **2.5 million dates per second** in Node.js.
- **Zero Drift**: Exact calendar tables guarantee zero timezone or leap-year drift.
- **Zero Dependencies**: Can be embedded into AWS Lambda, Cloudflare Workers, or Worker Threads.

---

## 2. Streaming Large CSV Files (Memory Efficient)

When converting large CSV files with millions of rows, use Node.js Streams (`readline`) to process row-by-row with minimal memory overhead:

```typescript
// scripts/migrateCsvDates.ts
import fs from 'fs';
import readline from 'readline';
import { bsday, validateBSDateString } from '@bsday.js/core';

async function migrateCsvFile(inputFilePath: string, outputFilePath: string) {
  const fileStream = fs.createReadStream(inputFilePath);
  const writeStream = fs.createWriteStream(outputFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isHeader = true;
  let processedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (isHeader) {
      // Append new converted columns to CSV header
      writeStream.write(`${line},created_at_utc,fiscal_year\n`);
      isHeader = false;
      continue;
    }

    const columns = line.split(',');
    // Assume column index 1 contains BS Date: "2079/04/15"
    const rawBsDate = columns[1]?.trim();

    const validation = validateBSDateString(rawBsDate || '');

    if (validation.isValid && rawBsDate) {
      const bs = bsday.bs(rawBsDate);
      const adDateUtc = bs.toAD().toISOString();
      const fiscalYear = bs.fiscalYear('short'); // "2079/80"

      writeStream.write(`${line},${adDateUtc},${fiscalYear}\n`);
      processedCount++;
    } else {
      // Log or mark error row
      writeStream.write(`${line},ERROR_INVALID_DATE,\n`);
      errorCount++;
    }
  }

  writeStream.end();
  const duration = (Date.now() - startTime) / 1000;
  console.log(`✅ Completed: ${processedCount} converted, ${errorCount} errors in ${duration.toFixed(2)}s`);
}

// Run migration
migrateCsvFile('./raw_legacy_invoices.csv', './migrated_invoices.csv');
```

---

## 3. PostgreSQL Database Direct Migration with Prisma

```typescript
// scripts/migrateDatabaseTable.ts
import { PrismaClient } from '@prisma/client';
import { bsday } from '@bsday.js/core';

const prisma = new PrismaClient();

async function migrateUserBirthdates() {
  const BATCH_SIZE = 5000;
  let cursor: string | undefined;

  console.log('🚀 Starting User DOB Migration (BS -> UTC)...');

  while (true) {
    // 1. Fetch batch of legacy records
    const users = await prisma.user.findMany({
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { dobAD: null, dobBS: { not: null } },
      select: { id: true, dobBS: true },
    });

    if (users.length === 0) break;

    // 2. Perform conversions in-memory
    const updates = users
      .map((user) => {
        try {
          const bs = bsday.bs(user.dobBS!);
          if (!bs.isValid()) return null;
          return { id: user.id, dobAD: bs.toAD() };
        } catch {
          return null;
        }
      })
      .filter((item): item is { id: string; dobAD: Date } => item !== null);

    // 3. Batch execute updates in transaction
    await prisma.$transaction(
      updates.map((u) =>
        prisma.user.update({
          where: { id: u.id },
          data: { dobAD: u.dobAD },
        })
      )
    );

    cursor = users[users.length - 1]!.id;
    console.log(`Processed batch of ${users.length} users.`);
  }

  console.log('🎉 Database migration finished successfully!');
}
```

---

## 4. Multi-threaded Worker Processing (CPU Intensive Batch)

For datasets exceeding 10M records, use Node.js `worker_threads` to process chunks in parallel across all CPU cores:

```typescript
// workers/dateWorker.ts
import { parentPort } from 'worker_threads';
import { bsday } from '@bsday.js/core';

parentPort?.on('message', (bsDateStrings: string[]) => {
  const results = new Array(bsDateStrings.length);

  for (let i = 0; i < bsDateStrings.length; i++) {
    const raw = bsDateStrings[i]!;
    try {
      const bs = bsday.bs(raw);
      results[i] = bs.isValid() ? bs.toAD().getTime() : null;
    } catch {
      results[i] = null;
    }
  }

  parentPort?.postMessage(results);
});
```
