import { BSDay, bsday, getCalendarMatrix } from '../packages/core/dist/index.js';

function runBenchmark(name, fn, iterations = 100_000) {
  // Warmup
  for (let i = 0; i < Math.min(iterations / 10, 1000); i++) {
    fn(i);
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(i);
  }
  const end = performance.now();

  const totalTimeMs = end - start;
  const opsPerSec = Math.round(iterations / (totalTimeMs / 1000));

  return {
    name,
    iterations,
    totalTimeMs: totalTimeMs.toFixed(2),
    opsPerSec: opsPerSec.toLocaleString(),
    avgTimePerOpNs: ((totalTimeMs / iterations) * 1_000_000).toFixed(1),
  };
}

console.log('='.repeat(70));
console.log('⚡ bsday.js Performance Benchmark Suite');
console.log('='.repeat(70));
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform} (${process.arch})`);
console.log(`Date: ${new Date().toISOString()}\n`);

const results = [];

// 1. BS to AD Conversion
results.push(
  runBenchmark(
    'BS ➔ AD Conversion (bsday.bs)',
    (i) => {
      const y = 2000 + (i % 80);
      const m = 1 + (i % 12);
      const d = 1 + (i % 28);
      return BSDay.bs(y, m, d).toAD();
    },
    200_000,
  ),
);

// 2. AD to BS Conversion
const baseTime = new Date('2020-01-01T00:00:00Z').getTime();
results.push(
  runBenchmark(
    'AD ➔ BS Conversion (bsday.fromAD)',
    (i) => {
      const date = new Date(baseTime + (i % 7000) * 86400000);
      return BSDay.fromAD(date).toBS();
    },
    200_000,
  ),
);

// 3. String Formatting
const testDate = BSDay.bs(2081, 5, 15);
results.push(
  runBenchmark(
    'Date Formatting (format)',
    () => {
      return testDate.format('YYYY/MM/DD [आज] dddd');
    },
    200_000,
  ),
);

// 4. Date Arithmetic & Manipulation
results.push(
  runBenchmark(
    'Date Arithmetic (add 7 days & startOf)',
    (i) => {
      return testDate.add(i % 30, 'day').startOf('month');
    },
    200_000,
  ),
);

// 5. Fiscal Year Engine
results.push(
  runBenchmark(
    'Fiscal Year Calculation (fiscalYear)',
    () => {
      return testDate.fiscalYear('extended', 'ne');
    },
    200_000,
  ),
);

// 6. Chronological Age / KYC Calculation
const birthDate = BSDay.bs(2057, 5, 15);
results.push(
  runBenchmark(
    'KYC Age Calculation (age + formatAge)',
    () => {
      return birthDate.formatAge('ne', testDate);
    },
    100_000,
  ),
);

// 7. Headless Calendar Matrix Generation
results.push(
  runBenchmark(
    'Calendar Matrix Grid (42 cells)',
    (i) => {
      return getCalendarMatrix(2081, 1 + (i % 12));
    },
    10_000,
  ),
);

console.table(results);
console.log('='.repeat(70));
console.log('✅ All benchmarks completed successfully.');
console.log('='.repeat(70));
