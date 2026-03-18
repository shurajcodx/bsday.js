import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import computePanchang, { sunriseJD, findTithiTransition } from './compute-panchang.mjs';
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

    // First pass: Compute all daily panchang and transitions
    const dailyPanchangs = [];
    const dates = Object.keys(data).sort();

    for (const date of dates) {
        const [y, m, d] = date.split('-').map(Number);
        if (!BSDay.isValid(y, m, d, 'bs')) continue;

        const adDate = BSDay.fromBS([y, m, d]).toAD();
        const jdSunrise = sunriseJD(
            adDate.getUTCFullYear(),
            adDate.getUTCMonth() + 1,
            adDate.getUTCDate(),
            LAT, LON, ALT
        );
        const panchang = computePanchang(jdSunrise);
        const transition = findTithiTransition(jdSunrise);

        dailyPanchangs.push({
            date,
            month: m,
            day: d,
            jdSunrise,
            ...panchang,
            nextTithi: transition?.nextTithi,
            transitionJD: transition?.transitionJD
        });
    }

    // Second pass: Rule computation
    for (let i = 0; i < dailyPanchangs.length; i++) {
        const day = dailyPanchangs[i];

        // 1. Static Events
        const [y, m, d] = day.date.split('-').map(Number);
        const adDate = BSDay.fromBS([y, m, d]).toAD();
        const adMonth = String(adDate.getUTCMonth() + 1).padStart(2, '0');
        const adDay = String(adDate.getUTCDate()).padStart(2, '0');
        const adKey = `${adMonth}-${adDay}`;
        const bsKey = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const mergedEvents = [
            ...(internationalEvents[adKey] ?? []),
            ...(bsEvents[bsKey] ?? [])
        ];

        // 2. Festival Rules
        let identifiedFestivals = [];
        for (const rule of festivalRules) {
            const cond = rule.condition || rule; // Support both structures
            const type = cond.type || cond.time || 'sunrise';
            const monthMatch = (cond.month === day.month);
            if (!monthMatch) continue;

            const pakshaMatch = !cond.paksha || cond.paksha === day.paksha;

            if (type === 'sunrise') {
                if (day.tithi === cond.tithi && pakshaMatch) {
                    // Check if matched yesterday to avoid duplicates on Vriddhi
                    const prevDay = dailyPanchangs[i - 1];
                    let alreadyMatched = false;
                    if (prevDay && prevDay.tithi === cond.tithi && (!cond.paksha || cond.paksha === prevDay.paksha)) {
                        alreadyMatched = true;
                    }
                    if (!alreadyMatched) {
                        identifiedFestivals.push(rule.name);
                    }
                }
            } else if (type === 'sunset' || type === 'night') {
                const offset = (type === 'sunset') ? 0.45 : 0.75;
                const targetJD = day.jdSunrise + offset;
                const panchangAtWindow = computePanchang(targetJD);

                const targetPakshaMatch = !cond.paksha || cond.paksha === panchangAtWindow.paksha;

                if (panchangAtWindow.tithi === cond.tithi && targetPakshaMatch) {
                    // Check if already matched yesterday to avoid duplicates on Vriddhi
                    const prevDay = dailyPanchangs[i - 1];
                    let alreadyMatched = false;
                    if (prevDay) {
                        const prevTargetJD = prevDay.jdSunrise + offset;
                        const prevPanchang = computePanchang(prevTargetJD);
                        if (prevPanchang.tithi === cond.tithi && (!cond.paksha || cond.paksha === prevPanchang.paksha)) {
                            alreadyMatched = true;
                        }
                    }

                    if (!alreadyMatched) {
                        identifiedFestivals.push(rule.name);
                    }
                }
            }
        }

        // (Overrides moved to Pass 4)

        newData[day.date] = {
            tithi: day.tithi,
            paksha: day.paksha,
            nakshatra: day.nakshatra,
            yoga: day.yoga,
            karana: day.karana,
            festivals: [...new Set(identifiedFestivals)],
            events: mergedEvents,
            isHoliday: (data[day.date]?.isHoliday || identifiedFestivals.length > 0)
        };
    }

    // Third pass: Apply Relative Rules (within the year)
    const relativeRules = festivalRules.filter(r => (r.condition?.type === 'relative' || r.type === 'relative'));
    if (relativeRules.length > 0) {
        const dateKeys = Object.keys(newData).sort();
        for (const rule of relativeRules) {
            const cond = rule.condition || rule;
            // Find base festival
            for (let i = 0; i < dateKeys.length; i++) {
                const date = dateKeys[i];
                if (newData[date].festivals.includes(cond.base)) {
                    const targetIdx = i + cond.offsetDays;
                    if (targetIdx >= 0 && targetIdx < dateKeys.length) {
                        const targetDate = dateKeys[targetIdx];
                        if (!newData[targetDate].festivals.includes(rule.name)) {
                            newData[targetDate].festivals.push(rule.name);
                            newData[targetDate].isHoliday = true;
                        }
                    }
                }
            }
        }
    }

    // Fourth pass: Apply Overrides
    for (const date of Object.keys(newData)) {
        const override = festivalOverrides[date];
        if (override) {
            let festivals = newData[date].festivals;
            if (override.removeFestivals) {
                festivals = festivals.filter(f => !override.removeFestivals.includes(f));
            }
            if (override.addFestivals) {
                for (const f of override.addFestivals) {
                    if (!festivals.includes(f)) festivals.push(f);
                }
            }
            newData[date].festivals = festivals;
            // Update holiday status
            if (festivals.length > 0 && !newData[date].isHoliday) {
                newData[date].isHoliday = true;
            } else if (festivals.length === 0 && newData[date].events.length === 0 && !data[date]?.isHoliday) {
                // Not a holiday if no events/festivals and wasn't originally a holiday (though originally is Holiday might be tied to old data)
                // Let's keep it simple: if festivals > 0 it's holiday.
            }
        }
    }

    await writeFile(filePath, JSON.stringify(newData, null, 2));
    console.log(`Recomputed and updated ${file}`);
}

console.log('✅ Full dataset re-computation complete!');
