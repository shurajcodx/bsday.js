import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import computePanchang, { sunriseJD } from './compute-panchang.mjs';
import { BSDay } from '../../core/dist/index.js';

const YEARS_DIR = path.resolve('src/data/years');
const INT_EVENTS_FILE = path.resolve('src/data/static/international-events.json');
const BS_EVENTS_FILE = path.resolve('src/data/static/bs-events.json');
const FESTIVAL_RULES_FILE = path.resolve('src/data/static/festival-rules.json');
const FESTIVAL_OVERRIDES_FILE = path.resolve('src/data/static/festival-overrides.json');

const internationalEvents = JSON.parse(await readFile(INT_EVENTS_FILE, 'utf8'));
const bsEvents = JSON.parse(await readFile(BS_EVENTS_FILE, 'utf8'));
const festivalRules = JSON.parse(await readFile(FESTIVAL_RULES_FILE, 'utf8'));
const festivalOverrides = JSON.parse(await readFile(FESTIVAL_OVERRIDES_FILE, 'utf8'));

// Kathmandu coordinates
const LAT = 27.7172;
const LON = 85.3240;
const ALT = 1400;

const files = await readdir(YEARS_DIR);

for (const file of files.filter(f => f.endsWith('.json'))) {
    const filePath = path.join(YEARS_DIR, file);
    const data = JSON.parse(await readFile(filePath, 'utf8'));
    const newData = {};

    for (const date of Object.keys(data).sort()) {
        const [y, m, d] = date.split('-').map(Number);
        if (!BSDay.isValid(y, m, d, 'bs')) continue;

        const adDate = BSDay.fromBS([y, m, d]).toAD();

        // 1. Compute Panchang (with newly added paksha)
        const jdSunrise = sunriseJD(
            adDate.getUTCFullYear(),
            adDate.getUTCMonth() + 1,
            adDate.getUTCDate(),
            LAT,
            LON,
            ALT
        );
        const panchangSunrise = computePanchang(jdSunrise);
        const panchangSunset = computePanchang(jdSunrise + 0.4); // Approx sunset ~10h after sunrise

        // 2. Identify Static Events (AD/BS)
        const adMonth = String(adDate.getUTCMonth() + 1).padStart(2, '0');
        const adDay = String(adDate.getUTCDate()).padStart(2, '0');
        const adKey = `${adMonth}-${adDay}`;

        const bsMonthKey = String(m).padStart(2, '0');
        const bsDayKey = String(d).padStart(2, '0');
        const bsKey = `${bsMonthKey}-${bsDayKey}`;

        const mergedEvents = [
            ...(internationalEvents[adKey] ?? []),
            ...(bsEvents[bsKey] ?? [])
        ];

        // 3. Identify Festivals (Rule-based)
        let identifiedFestivals = festivalRules
            .filter(rule => {
                const cond = rule.condition;
                const targetPanchang = cond.time === 'sunset' ? panchangSunset : panchangSunrise;

                const tithiMatch = cond.tithi === targetPanchang.tithi;
                const monthMatch = cond.month === m;
                const pakshaMatch = !cond.paksha || cond.paksha === targetPanchang.paksha;
                return tithiMatch && monthMatch && pakshaMatch;
            })
            .map(rule => rule.name);

        // Apply Overrides
        const override = festivalOverrides[date];
        if (override) {
            if (override.removeFestivals) {
                identifiedFestivals = identifiedFestivals.filter(f => !override.removeFestivals.includes(f));
            }
            if (override.addFestivals) {
                identifiedFestivals = [...identifiedFestivals, ...override.addFestivals];
            }
        }

        // Stop merging with existing (legacy) festivals to keep dataset clean
        const finalFestivals = [...new Set(identifiedFestivals)];

        newData[date] = {
            ...panchangSunrise,
            festivals: finalFestivals,
            events: mergedEvents,
            isHoliday: data[date].isHoliday || identifiedFestivals.length > 0
        };
    }

    await writeFile(filePath, JSON.stringify(newData, null, 2));
    console.log(`Recomputed and updated ${file}`);
}

console.log('✅ Full dataset re-computation and festival injection complete!');
