import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARS_DIR = path.resolve(__dirname, '../src/data/years');
const AGGREGATE_PATH = path.resolve(__dirname, '../src/data/1970-2100.json');
const METADATA_PATH = path.resolve(__dirname, '../src/data/metadata.json');

function sortDateKeys(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function createEmptyQuality() {
  return {
    unknownTithiCount: 0,
    unknownYogaCount: 0,
    unknownKaranaCount: 0,
    unknownNakshatraCount: 0,
  };
}

async function readJson(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(YEARS_DIR, { recursive: true });

  const files = await readdir(YEARS_DIR);
  const yearFiles = files
    .filter((name) => /^\d{4}\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b));

  const aggregate = {};

  for (const file of yearFiles) {
    const filePath = path.join(YEARS_DIR, file);
    const yearData = await readJson(filePath);
    if (!yearData || typeof yearData !== 'object') {
      continue;
    }

    for (const [dateKey, value] of Object.entries(yearData)) {
      aggregate[dateKey] = value;
    }
  }

  const sortedKeys = Object.keys(aggregate).sort(sortDateKeys);
  const sortedAggregate = {};

  for (const key of sortedKeys) {
    sortedAggregate[key] = aggregate[key];
  }

  await writeFile(AGGREGATE_PATH, `${JSON.stringify(sortedAggregate)}\n`, 'utf8');

  const metadata = (await readJson(METADATA_PATH)) ?? {};
  const quality = createEmptyQuality();

  for (const value of Object.values(sortedAggregate)) {
    if (value.tithi === 'Unknown') quality.unknownTithiCount += 1;
    if (value.yoga === 'Unknown') quality.unknownYogaCount += 1;
    if (value.karana === 'Unknown') quality.unknownKaranaCount += 1;
    if (value.nakshatra === 'Unknown') quality.unknownNakshatraCount += 1;
  }

  metadata.generatedAt = new Date().toISOString();
  metadata.source = 'manual year files';
  metadata.sourceEndpoint = '';
  metadata.coverage = {
    startYear: sortedKeys.length ? Number(sortedKeys[0].slice(0, 4)) : 0,
    endYear: sortedKeys.length ? Number(sortedKeys[sortedKeys.length - 1].slice(0, 4)) : 0,
    keys: sortedKeys.length,
  };
  metadata.quality = quality;
  delete metadata.sourceCoverage;
  delete metadata.requestedRange;
  delete metadata.warnings;

  await writeFile(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

  console.log(`Aggregated ${sortedKeys.length} records from ${yearFiles.length} year files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
