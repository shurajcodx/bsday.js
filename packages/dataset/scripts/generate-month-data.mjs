import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yearsDir = path.resolve(__dirname, '../src/data/years');
const outputFile = path.resolve(__dirname, '../src/monthData.ts');

console.log('Generating BS month data from:', yearsDir);

const files = fs
  .readdirSync(yearsDir)
  .filter((f) => f.endsWith('.json'))
  .sort();
const table = {};

files.forEach((file) => {
  const year = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(yearsDir, file), 'utf8'));
  const monthCounts = Array(12).fill(0);

  Object.keys(data).forEach((key) => {
    const parts = key.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10);
      if (m >= 1 && m <= 12) {
        monthCounts[m - 1]++;
      }
    }
  });

  table[year] = monthCounts;
});

const formattedEntries = Object.entries(table)
  .map(([year, counts]) => `  '${year}': [${counts.join(', ')}],`)
  .join('\n');

const content = `export type BsMonthTable = Record<number, readonly number[]>;

/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Accurate historical BS month-length table.
 * Generated from yearly JSON files in src/data/years.
 */
export const ACCURATE_BS_MONTH_TABLE: BsMonthTable = {
${formattedEntries}
};
`;

fs.writeFileSync(outputFile, content);
console.log('Successfully generated:', outputFile);
