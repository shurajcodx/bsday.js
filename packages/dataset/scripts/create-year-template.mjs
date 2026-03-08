import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARS_DIR = path.resolve(__dirname, '../src/data/years');
const year = process.argv[2];

if (!year || !/^\d{4}$/.test(year)) {
  console.error('Usage: node scripts/create-year-template.mjs <YYYY>');
  process.exit(1);
}

await mkdir(YEARS_DIR, { recursive: true });
const filePath = path.join(YEARS_DIR, `${year}.json`);

const template = {
  [`${year}-01-01`]: {
    tithi: 'Pratipada',
    festivals: [],
    nakshatra: 'Ashwini',
    yoga: 'Vishkumbha',
    karana: 'Bava',
  },
};

await writeFile(filePath, `${JSON.stringify(template, null, 2)}\n`, { flag: 'wx' });
console.log(`Created template: ${filePath}`);
