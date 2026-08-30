# ⚡ Using bsday.js in Next.js (App Router & SSR)

This recipe demonstrates how to use `bsday.js` in Next.js 14 and 15 (App Router, Server Components, Client Components, and API Route Handlers) without timezone hydration mismatches.

---

## 1. Server Components vs Client Components

Because `bsday.js` is pure TypeScript and lightweight (~12KB gzipped), it runs identically on Node.js server runtimes, Edge runtimes, and the browser.

### Preventing Hydration Mismatch for "Today"
When rendering `bsday()` (which reads the current system clock) on SSR, the server time (e.g. UTC server in AWS / Vercel) and the client time (Nepal Standard Time UTC+05:45) might differ across midnight.

**Best Practice:**
Render dynamic real-time dates in Client Components or pass formatted strings from Server Components.

```tsx
// app/components/TodayNepaliDate.tsx
'use client';

import { useEffect, useState } from 'react';
import { bsday } from '@bsday.js/core';

export default function TodayNepaliDate() {
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    // Computes on client in user's active locale
    const now = bsday().locale('ne');
    setDateStr(now.format('YYYY MMMM DD, dddd'));
  }, []);

  if (!dateStr) {
    return <span className="animate-pulse">Loading date...</span>;
  }

  return (
    <div className="font-medium text-slate-800 dark:text-slate-100">
      आजको मिति: {dateStr}
    </div>
  );
}
```

---

## 2. Server Component Displaying DB Timestamp in BS

When querying a database on the server, dates are typically stored as UTC Gregorian `Date` objects. Convert them to BS seamlessly in your React Server Component:

```tsx
// app/invoices/[id]/page.tsx
import { bsday } from '@bsday.js/core';
import prisma from '@/lib/prisma';

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
  });

  if (!invoice) return <div>Invoice not found</div>;

  // Convert UTC created date to BS
  const bsDate = bsday(invoice.createdAt);
  const fiscalYear = bsDate.fiscalYear('extended'); // "FY 2081/82"

  return (
    <div className="p-8 max-w-2xl mx-auto border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold">बिल / Invoice #{invoice.id}</h1>
      <p className="text-sm text-slate-500">आर्थिक वर्ष: {fiscalYear}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-slate-400">जारी मिति (BS):</span>
          <p className="font-semibold">{bsDate.format('YYYY/MM/DD')}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Date (AD):</span>
          <p className="font-semibold">{bsDate.format('YYYY-MM-DD', 'ad')}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Next.js API Route / Server Action Validation

```ts
// app/api/kyc/route.ts
import { NextResponse } from 'next/server';
import { validateBSDateString, bsday } from '@bsday.js/core';

export async function POST(req: Request) {
  const body = await req.json();
  const { dobBS } = body;

  // 1. Validate BS date format and limits
  const validation = validateBSDateString(dobBS, {
    minYear: 2000,
    maxYear: 2081,
  });

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // 2. Calculate KYC adult eligibility
  const birth = bsday.bs(dobBS);
  const isAdult = birth.isAdult(18);

  if (!isAdult) {
    return NextResponse.json(
      { error: 'Applicant must be at least 18 years of age.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    age: birth.age(),
    formattedAge: birth.formatAge('ne'),
  });
}
```
