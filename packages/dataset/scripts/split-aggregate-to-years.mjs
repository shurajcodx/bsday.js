import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGGREGATE_PATH = path.resolve(__dirname, '../src/data/1970-2100.json');
const YEARS_DIR = path.resolve(__dirname, '../src/data/years');

function sortDateKeys(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

async function main() {
  const raw = await readFile(AGGREGATE_PATH, 'utf8');
  const aggregate = JSON.parse(raw);

  const bucket = {};
  for (const [dateKey, value] of Object.entries(aggregate)) {
    const year = dateKey.slice(0, 4);
    if (!bucket[year]) {
      bucket[year] = {};
    }
    bucket[year][dateKey] = value;
  }

  await mkdir(YEARS_DIR, { recursive: true });

  const years = Object.keys(bucket).sort((a, b) => a.localeCompare(b));
  for (const year of years) {
    const sorted = {};
    const keys = Object.keys(bucket[year]).sort(sortDateKeys);
    for (const key of keys) {
      sorted[key] = bucket[year][key];
    }

    await writeFile(path.join(YEARS_DIR, `${year}.json`), `${JSON.stringify(sorted)}\n`, 'utf8');
  }

  console.log(`Wrote ${years.length} year files to ${YEARS_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
