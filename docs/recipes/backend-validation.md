# 🛡️ Backend API Validation & Dual-Calendar Serialization

This recipe demonstrates how to validate Bikram Sambat (BS) date parameters and request bodies across modern Node.js & TypeScript backend frameworks (**Express.js**, **Fastify**, and **Hono**), normalize dates to standard UTC for database storage, and serialize responses.

---

## 1. Core Validation Utility

Create a reusable validation helper using `validateBSDateString` from `@bsday.js/core`:

```typescript
// src/utils/bsValidator.ts
import { validateBSDateString, bsday, type BSDateValidationOptions } from '@bsday.js/core';

export interface ValidatedBSDate {
  raw: string;
  year: number;
  month: number;
  day: number;
  adDate: Date; // UTC Gregorian Date for Database
  isoString: string;
}

export function parseAndValidateBS(
  input: unknown,
  options: BSDateValidationOptions = { minYear: 2000, maxYear: 2100 },
): { valid: true; data: ValidatedBSDate } | { valid: false; error: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'BS date must be a string in YYYY/MM/DD or YYYY-MM-DD format.' };
  }

  const result = validateBSDateString(input, options);
  if (!result.isValid || !result.bs) {
    return { valid: false, error: result.error || 'Invalid Bikram Sambat date.' };
  }

  const bsInstance = bsday.bs(result.bs.year, result.bs.month, result.bs.day);
  const adDate = bsInstance.toAD();

  return {
    valid: true,
    data: {
      raw: input,
      year: result.bs.year,
      month: result.bs.month,
      day: result.bs.day,
      adDate,
      isoString: adDate.toISOString(),
    },
  };
}
```

---

## 2. Express.js Middleware

```typescript
// src/middleware/expressBSValidator.ts
import { Request, Response, NextFunction } from 'express';
import { parseAndValidateBS } from '../utils/bsValidator';

/**
 * Validates req.body[fieldName] as a BS date and attaches normalized UTC date to req.
 */
export function validateBSBodyField(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawVal = req.body?.[fieldName];
    const validation = parseAndValidateBS(rawVal);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: { field: fieldName, message: validation.error },
      });
    }

    // Attach normalized UTC date
    req.body[`${fieldName}_AD`] = validation.data.adDate;
    next();
  };
}

// Example Express Route
import express from 'express';
const app = express();
app.use(express.json());

app.post('/api/invoices', validateBSBodyField('invoiceDateBS'), async (req, res) => {
  const { invoiceDateBS, invoiceDateBS_AD, amount } = req.body;

  // Store invoiceDateBS_AD directly in Prisma / TypeORM / Drizzle as UTC DateTime
  // const invoice = await db.invoice.create({ data: { amount, date: invoiceDateBS_AD } });

  res.json({
    success: true,
    invoiceDateBS,
    storedUTCDate: invoiceDateBS_AD,
  });
});
```

---

## 3. Fastify Validation & Route Hook

```typescript
// src/routes/kyc.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { parseAndValidateBS } from '../utils/bsValidator';

export async function kycRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.post('/api/kyc', async (request, reply) => {
    const body = request.body as { dobBS: string; fullName: string };

    const validation = parseAndValidateBS(body.dobBS, { minYear: 1990, maxYear: 2081 });
    if (!validation.valid) {
      return reply.status(400).send({ error: validation.error });
    }

    return {
      status: 'success',
      fullName: body.fullName,
      dobBS: validation.data.raw,
      dobAD: validation.data.adDate.toISOString(),
    };
  });
}
```

---

## 4. Hono Middleware (Edge & Serverless Compatible)

```typescript
// src/index.ts (Hono for Cloudflare Workers / Bun / Node.js)
import { Hono } from 'hono';
import { parseAndValidateBS } from './utils/bsValidator';

const app = new Hono();

app.post('/api/leave-requests', async (c) => {
  const { startDateBS, endDateBS } = await c.req.json();

  const startVal = parseAndValidateBS(startDateBS);
  const endVal = parseAndValidateBS(endDateBS);

  if (!startVal.valid) return c.json({ error: `Start Date: ${startVal.error}` }, 400);
  if (!endVal.valid) return c.json({ error: `End Date: ${endVal.error}` }, 400);

  if (startVal.data.adDate > endVal.data.adDate) {
    return c.json({ error: 'End Date cannot be before Start Date' }, 400);
  }

  return c.json({
    success: true,
    leave: {
      startDateBS,
      endDateBS,
      startDateUTC: startVal.data.isoString,
      endDateUTC: endVal.data.isoString,
    },
  });
});

export default app;
```

---

## 5. Dual-Calendar Response Serializer

When returning data to clients, enrich UTC timestamps with formatted BS dates and fiscal metadata:

```typescript
import { bsday } from '@bsday.js/core';

export function serializeWithBS(record: { id: string; createdAt: Date; [key: string]: any }) {
  const bs = bsday(record.createdAt);

  return {
    ...record,
    dates: {
      utc: record.createdAt.toISOString(),
      bs: bs.format('YYYY/MM/DD'),
      bsNepali: bs.locale('ne').format('YYYY MMMM DD, dddd'),
      fiscalYear: bs.fiscalYear('extended'),
      quarter: `Q${bs.fiscalQuarter()}`,
    },
  };
}
```
