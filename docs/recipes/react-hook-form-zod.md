# 📋 React Hook Form + Zod BS Date Validation

This recipe shows how to validate Bikram Sambat (BS) date fields using **Zod** schemas and **React Hook Form**.

---

## 1. Defining the Zod BS Date Schema

Use `validateBSDateString` from `@bsday.js/core` inside Zod's `.refine()` or custom schema:

```typescript
// lib/validation/bsDateSchema.ts
import { z } from 'zod';
import { validateBSDateString, bsday, BSDateValidationOptions } from '@bsday.js/core';

export function zodBSDate(options: BSDateValidationOptions = {}) {
  return z
    .string({ required_error: 'मिति अनिवार्य छ (Date is required)' })
    .min(1, 'मिति प्रविष्ट गर्नुहोस्')
    .refine((val) => {
      const res = validateBSDateString(val, options);
      return res.isValid;
    }, {
      message: 'अमान्य नेपाली मिति (Invalid BS Date. Format: YYYY/MM/DD)',
    });
}

// Full Form Schema
export const UserKYCSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  dobBS: zodBSDate({ minYear: 2000, maxYear: 2081 }).refine((val) => {
    // Ensure user is at least 18 years old
    return bsday.bs(val).isAdult(18);
  }, {
    message: 'उमेर कम्तीमा १८ वर्ष हुनुपर्छ (Must be at least 18 years old)',
  }),
});

export type UserKYCFormValues = z.infer<typeof UserKYCSchema>;
```

---

## 2. React Hook Form Component

```tsx
// components/KYCForm.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserKYCSchema, UserKYCFormValues } from '@/lib/validation/bsDateSchema';
import { bsday } from '@bsday.js/core';

export default function KYCForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserKYCFormValues>({
    resolver: zodResolver(UserKYCSchema),
    defaultValues: {
      fullName: '',
      dobBS: '2058/04/10',
    },
  });

  const watchedDob = watch('dobBS');
  const parsedDate = watchedDob ? bsday.bs(watchedDob) : null;

  const onSubmit = (data: UserKYCFormValues) => {
    // Convert BS birthdate to standard AD UTC date for database submission
    const adDate = bsday.bs(data.dobBS).toAD();
    console.log('Submitting Form:', { ...data, dobAD: adDate.toISOString() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md p-6 bg-white rounded-xl shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">पूरा नाम (Full Name)</label>
        <input
          {...register('fullName')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          जन्म मिति (Date of Birth - BS)
        </label>
        <input
          {...register('dobBS')}
          placeholder="2058/04/10"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        {errors.dobBS && (
          <p className="mt-1 text-xs text-red-600">{errors.dobBS.message}</p>
        )}

        {parsedDate && parsedDate.isValid() && (
          <p className="mt-1 text-xs text-slate-500">
            उमेर: {parsedDate.formatAge('ne')} | AD: {parsedDate.format('YYYY-MM-DD', 'ad')}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        पेश गर्नुहोस् (Submit KYC)
      </button>
    </form>
  );
}
```
