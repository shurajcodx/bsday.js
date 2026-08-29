import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import computePanchang, { sunriseJD, findTithiTransition } from './compute-panchang.mjs';
import { BSDay } from '../../core/dist/index.js';

const year = parseInt(process.argv[2], 10);

if (!year || isNaN(year)) {
  console.error('Usage: node scripts/create-year-template.mjs <YYYY>');
  process.exit(1);
}

const OUT_DIR = path.resolve('src/data/years');
const INT_EVENTS_FILE = path.resolve('src/data/static/international-events.json');
const BS_EVENTS_FILE = path.resolve('src/data/static/bs-events.json');
const FESTIVAL_RULES_FILE = path.resolve('src/data/static/festival-rules.json');

await mkdir(OUT_DIR, { recursive: true });

const internationalEvents = JSON.parse(await readFile(INT_EVENTS_FILE, 'utf8'));
const bsEvents = JSON.parse(await readFile(BS_EVENTS_FILE, 'utf8'));
const festivalRules = JSON.parse(await readFile(FESTIVAL_RULES_FILE, 'utf8'));

const dataset = {};

// Kathmandu coordinates
const LAT = 27.7172;
const LON = 85.324;
const ALT = 1400;

for (let m = 1; m <= 12; m++) {
  // Use core library to get correct number of days for this BS month
  try {
    const d = BSDay.fromBS([year, m, 1]).clone().setDay(1).addMonths(1).subtractDays(1).day;
    if (!d) throw new Error();
  } catch {
    console.error(`Error calculating month days for ${year}-${m}`);
    continue;
  }

  for (let d = 1; d <= 32; d++) {
    if (!BSDay.isValid(year, m, d, 'bs')) continue;

    const dateKey = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Map BS to AD
    const adDate = BSDay.fromBS([year, m, d]).toAD();

    const jdSunrise = sunriseJD(
      adDate.getUTCFullYear(),
      adDate.getUTCMonth() + 1,
      adDate.getUTCDate(),
      LAT,
      LON,
      ALT,
    );

    const panchang = computePanchang(jdSunrise);
    const transition = findTithiTransition(jdSunrise);

    const adMonth = String(adDate.getUTCMonth() + 1).padStart(2, '0');
    const adDay = String(adDate.getUTCDate()).padStart(2, '0');
    const adKey = `${adMonth}-${adDay}`;

    const bsMonthKey = String(m).padStart(2, '0');
    const bsDayKey = String(d).padStart(2, '0');
    const bsKey = `${bsMonthKey}-${bsDayKey}`;

    const mergedEvents = [...(internationalEvents[adKey] ?? []), ...(bsEvents[bsKey] ?? [])];

    let identifiedFestivals = [];
    for (const rule of festivalRules) {
      const cond = rule.condition || rule;
      const type = cond.type || cond.time || 'sunrise';
      const monthMatch = cond.month === m;
      if (!monthMatch) continue;

      const pakshaMatch = !cond.paksha || cond.paksha === panchang.paksha;

      if (type === 'sunrise') {
        if (panchang.tithi === cond.tithi && pakshaMatch) {
          identifiedFestivals.push(rule.name);
        }
      } else if (type === 'sunset') {
        const sunsetJD = jdSunrise + 0.4;
        if (
          (panchang.tithi === cond.tithi && pakshaMatch) ||
          (transition?.nextTithi === cond.tithi && transition.transitionJD < sunsetJD)
        ) {
          identifiedFestivals.push(rule.name);
        }
      } else if (type === 'night') {
        const nightJD = jdSunrise + 0.75;
        if (
          (panchang.tithi === cond.tithi && pakshaMatch) ||
          (transition?.nextTithi === cond.tithi && transition.transitionJD < nightJD)
        ) {
          identifiedFestivals.push(rule.name);
        }
      }
    }

    dataset[dateKey] = {
      ...panchang,
      festivals: [...new Set(identifiedFestivals)],
      events: mergedEvents,
      isHoliday: false,
    };
  }
}

await writeFile(path.join(OUT_DIR, `${year}.json`), JSON.stringify(dataset, null, 2));

console.log(`✅ Generated accurate year template for ${year} BS`);
