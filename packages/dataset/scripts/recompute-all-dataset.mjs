import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import computePanchang, { sunriseJD, findTithiTransition } from './compute-panchang.mjs';
import { BSDay, getBsMonthDays } from '../../core/dist/index.js';

const YEARS_DIR = path.resolve('src/data/years');
const INT_EVENTS_FILE = path.resolve('src/data/static/international-events.json');
const BS_EVENTS_FILE = path.resolve('src/data/static/bs-events.json');
const FESTIVAL_RULES_FILE = path.resolve('src/data/static/festival-rules.json');
const FESTIVAL_OVERRIDES_FILE = path.resolve('src/data/static/festival-overrides.json');

const internationalEvents = JSON.parse(await readFile(INT_EVENTS_FILE, 'utf8'));
const bsEvents = JSON.parse(await readFile(BS_EVENTS_FILE, 'utf8'));
const festivalRules = JSON.parse(await readFile(FESTIVAL_RULES_FILE, 'utf8'));
const festivalOverrides = JSON.parse(await readFile(FESTIVAL_OVERRIDES_FILE, 'utf8'));

// Recognized public holidays in Nepal (National, Community, and Regional)
const PUBLIC_HOLIDAYS = new Set([
  'Nepali New Year / Biska Jatra',
  'Buddha Jayanti / Ubhauli Parva',
  'Gai Jatra',
  'Krishna Janmashtami / Gaura Parva',
  'Haritalika Teej',
  'Jitiya Parva',
  'Rishi Panchami',
  'Constitution Day (Sambidhan Diwas)',
  'Ghatasthapana',
  'Fulpati',
  'Maha Ashtami',
  'Maha Navami',
  'Vijaya Dashami',
  'Papankusha Ekadashi',
  'Dashain Holiday',
  'Kojagrat Purnima',
  'Laxmi Puja',
  'Govardhan Puja / Mha Puja / Gai Puja',
  'Bhai Tika',
  'Tihar Holiday',
  'Chhath Puja',
  'Tamu Lhosar',
  'Christmas Day',
  'National Unity Day (Prithvi Jayanti)',
  'Maghe Sankranti / Maghi Parva',
  'Sonam Lhosar',
  'Shahid Diwas',
  'Basanta Panchami / Saraswati Puja',
  'National Democracy Day (Prajatantra Diwas)',
  'Maha Shivaratri',
  'Gyalpo Lhosar',
  "International Women's Day (Nari Diwas)",
  'Holi / Phagu Purnima (Hilly)',
  'Holi / Phagu Purnima (Terai)',
  'Ghode Jatra',
  'International Labour Day (Majdoor Diwas)',
  'Republic Day (Ganatantra Diwas)',
]);

// Kathmandu coordinates
const LAT = 27.7172;
const LON = 85.324;
const ALT = 1400;

for (let year = 1990; year <= 2100; year++) {
  const filePath = path.join(YEARS_DIR, `${year}.json`);
  const newData = {};

  // First pass: Compute all daily panchang and transitions for all authentic days in year
  const dailyPanchangs = [];

  for (let m = 1; m <= 12; m++) {
    const daysInMonth = getBsMonthDays(year, m);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const bsInstance = BSDay.bs(year, m, d);
      const adDate = bsInstance.toAD();

      // Convert UTC timestamp (+05:45 representation) to Nepal civil calendar date
      const nepalLocalMs = adDate.getTime() + (5 * 60 + 45) * 60000;
      const nepalDate = new Date(nepalLocalMs);
      const nepalY = nepalDate.getUTCFullYear();
      const nepalM = nepalDate.getUTCMonth() + 1;
      const nepalD = nepalDate.getUTCDate();

      const jdSunrise = sunriseJD(nepalY, nepalM, nepalD, LAT, LON, ALT);
      const panchang = computePanchang(jdSunrise);
      const panchangSunset = computePanchang(jdSunrise + 0.45);
      const panchangNight = computePanchang(jdSunrise + 0.75);
      const transition = findTithiTransition(jdSunrise);

      dailyPanchangs.push({
        date: dateKey,
        month: m,
        day: d,
        nepalY,
        nepalM,
        nepalD,
        jdSunrise,
        ...panchang,
        sunsetPanchang: panchangSunset,
        nightPanchang: panchangNight,
        nextTithi: transition?.nextTithi,
        transitionJD: transition?.transitionJD,
      });
    }
  }

  // Second pass: Static events and general non-Dashain/Tihar festival rules
  const standaloneRules = festivalRules.filter((r) => {
    const name = r.name;
    return ![
      'Ghatasthapana',
      'Fulpati',
      'Maha Ashtami',
      'Maha Navami',
      'Vijaya Dashami',
      'Papankusha Ekadashi',
      'Kojagrat Purnima',
      'Kag Tihar',
      'Kukur Tihar',
      'Laxmi Puja',
      'Govardhan Puja / Mha Puja / Gai Puja',
      'Bhai Tika',
      'Tihar Holiday',
      'Chhath Puja',
      'Haribodhini Ekadashi / Tulsi Bibaha',
    ].includes(name);
  });

  for (let i = 0; i < dailyPanchangs.length; i++) {
    const day = dailyPanchangs[i];

    const adKey = `${String(day.nepalM).padStart(2, '0')}-${String(day.nepalD).padStart(2, '0')}`;
    const bsKey = `${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;

    const mergedEvents = [...(internationalEvents[adKey] ?? []), ...(bsEvents[bsKey] ?? [])];

    let identifiedFestivals = [];
    for (const rule of standaloneRules) {
      const cond = rule.condition || rule;
      const type = cond.type || cond.time || 'sunrise';
      const monthMatch = cond.month === day.month;
      if (!monthMatch) continue;

      const pakshaMatch = !cond.paksha || cond.paksha === day.paksha;

      if (type === 'sunrise') {
        if (day.tithi === cond.tithi && pakshaMatch) {
          const prevDay = dailyPanchangs[i - 1];
          let alreadyMatched = false;
          if (
            prevDay &&
            prevDay.tithi === cond.tithi &&
            (!cond.paksha || cond.paksha === prevDay.paksha)
          ) {
            alreadyMatched = true;
          }
          if (!alreadyMatched) {
            identifiedFestivals.push(rule.name);
          }
        }
      } else if (type === 'sunset' || type === 'night') {
        const targetPanchang = type === 'sunset' ? day.sunsetPanchang : day.nightPanchang;
        const targetPakshaMatch = !cond.paksha || cond.paksha === targetPanchang.paksha;
        const matchesWindow = targetPanchang.tithi === cond.tithi && targetPakshaMatch;
        const matchesSunrise = day.tithi === cond.tithi && pakshaMatch;

        if (matchesWindow || matchesSunrise) {
          const prevDay = dailyPanchangs[i - 1];
          let alreadyMatched = false;
          if (prevDay) {
            const prevTargetPanchang =
              type === 'sunset' ? prevDay.sunsetPanchang : prevDay.nightPanchang;
            if (
              (prevTargetPanchang.tithi === cond.tithi &&
                (!cond.paksha || cond.paksha === prevTargetPanchang.paksha)) ||
              (prevDay.tithi === cond.tithi && (!cond.paksha || cond.paksha === prevDay.paksha))
            ) {
              alreadyMatched = true;
            }
          }
          if (!alreadyMatched) {
            identifiedFestivals.push(rule.name);
          }
        }
      }
    }

    // Jitiya Parva: Ashwin Krishna Ashtami (during Sohra Shraddha)
    if (day.month === 6 && day.paksha === 'Krishna') {
      if (
        day.tithi === 'Ashtami' ||
        (dailyPanchangs[i - 1]?.nightPanchang.tithi === 'Ashtami' && day.tithi === 'Navami')
      ) {
        if (!identifiedFestivals.includes('Jitiya Parva')) {
          identifiedFestivals.push('Jitiya Parva');
        }
      }
    }

    // Teej Sequence in Bhadra:
    if (day.month === 5 && day.paksha === 'Shukla') {
      if (
        day.tithi === 'Tritiya' ||
        (dailyPanchangs[i - 1]?.tithi === 'Tritiya' && day.tithi === 'Chaturthi' && day.day === 29)
      ) {
        if (!identifiedFestivals.includes('Haritalika Teej')) {
          identifiedFestivals.push('Haritalika Teej');
        }
      }
      if (day.tithi === 'Dvitiya') {
        if (!identifiedFestivals.includes('Dar Khane Din')) {
          identifiedFestivals.push('Dar Khane Din');
        }
      }
    }

    newData[day.date] = {
      tithi: day.tithi,
      paksha: day.paksha,
      nakshatra: day.nakshatra,
      yoga: day.yoga,
      karana: day.karana,
      festivals: [...new Set(identifiedFestivals)],
      events: mergedEvents,
      isHoliday: false,
    };
  }

  // Ensure Dar Khane Din is always immediately before Haritalika Teej (handling Kshaya)
  const dateList = Object.keys(newData).sort();
  const teejDateIdx = dateList.findIndex((d) => newData[d].festivals.includes('Haritalika Teej'));
  if (teejDateIdx > 0) {
    const prevDate = dateList[teejDateIdx - 1];
    if (!newData[prevDate].festivals.includes('Dar Khane Din')) {
      newData[prevDate].festivals.push('Dar Khane Din');
    }
  }

  // Third pass: Dashain Sequence Allocator (Navaratri)
  let ghataIdx = dailyPanchangs.findIndex(
    (d) => (d.month === 6 || d.month === 7) && d.paksha === 'Shukla' && d.tithi === 'Pratipada',
  );
  if (ghataIdx !== -1) {
    newData[dailyPanchangs[ghataIdx].date].festivals.push('Ghatasthapana');

    let fulpatiIdx = -1,
      mahaAshtamiIdx = -1,
      mahaNavamiIdx = -1,
      vijayaDashamiIdx = -1,
      ekadashiIdx = -1,
      purnimaIdx = -1;

    for (let i = ghataIdx; i < Math.min(ghataIdx + 20, dailyPanchangs.length); i++) {
      const p = dailyPanchangs[i];
      if (p.paksha !== 'Shukla') break;
      const dKey = p.date;

      if (p.tithi === 'Saptami' && fulpatiIdx === -1) {
        fulpatiIdx = i;
        if (!newData[dKey].festivals.includes('Fulpati')) newData[dKey].festivals.push('Fulpati');
      }
      if (p.tithi === 'Ashtami' && mahaAshtamiIdx === -1) {
        mahaAshtamiIdx = i;
        if (!newData[dKey].festivals.includes('Maha Ashtami'))
          newData[dKey].festivals.push('Maha Ashtami');
      }
      if (p.tithi === 'Navami' && mahaNavamiIdx === -1) {
        mahaNavamiIdx = i;
        if (!newData[dKey].festivals.includes('Maha Navami'))
          newData[dKey].festivals.push('Maha Navami');
      }
      if (p.tithi === 'Dashami' && vijayaDashamiIdx === -1) {
        vijayaDashamiIdx = i;
        if (!newData[dKey].festivals.includes('Vijaya Dashami'))
          newData[dKey].festivals.push('Vijaya Dashami');
      }
      if (p.tithi === 'Ekadashi' && ekadashiIdx === -1) {
        ekadashiIdx = i;
        if (!newData[dKey].festivals.includes('Papankusha Ekadashi'))
          newData[dKey].festivals.push('Papankusha Ekadashi');
      }
      if (p.tithi === 'Purnima' && purnimaIdx === -1) {
        purnimaIdx = i;
        if (!newData[dKey].festivals.includes('Kojagrat Purnima'))
          newData[dKey].festivals.push('Kojagrat Purnima');
      }
    }

    // Continuous Dashain Public Holiday Block (from Fulpati to Dwadashi)
    if (fulpatiIdx !== -1) {
      const dwadashiIdx =
        ekadashiIdx !== -1
          ? ekadashiIdx + 1
          : vijayaDashamiIdx !== -1
            ? vijayaDashamiIdx + 2
            : fulpatiIdx + 5;
      for (let k = fulpatiIdx; k <= Math.min(dwadashiIdx, dailyPanchangs.length - 1); k++) {
        const dKey = dailyPanchangs[k].date;
        newData[dKey].isHoliday = true;
        const hasDashainName = [
          'Fulpati',
          'Maha Ashtami',
          'Maha Navami',
          'Vijaya Dashami',
          'Papankusha Ekadashi',
        ].some((f) => newData[dKey].festivals.includes(f));
        if (!hasDashainName && !newData[dKey].events.includes('Dashain Holiday')) {
          newData[dKey].events.push('Dashain Holiday');
        }
      }
    }
  }

  // Fourth pass: Tihar Sequence Allocator (Yamapanchak)
  let laxmiIdx = dailyPanchangs.findIndex(
    (d) =>
      (d.month === 7 || d.month === 8) &&
      d.paksha === 'Krishna' &&
      (d.tithi === 'Amavasya' || d.sunsetPanchang.tithi === 'Amavasya'),
  );
  if (laxmiIdx !== -1) {
    // Kag Tihar (Krishna Trayodashi)
    let kagIdx = -1;
    for (let k = Math.max(0, laxmiIdx - 3); k < laxmiIdx; k++) {
      if (dailyPanchangs[k].tithi === 'Trayodashi') kagIdx = k;
    }
    if (kagIdx === -1 && laxmiIdx >= 2) kagIdx = laxmiIdx - 2;
    if (kagIdx !== -1) {
      const dKey = dailyPanchangs[kagIdx].date;
      if (!newData[dKey].festivals.includes('Kag Tihar')) newData[dKey].festivals.push('Kag Tihar');
    }

    // Kukur Tihar (Krishna Chaturdashi)
    let kukurIdx = -1;
    for (let k = Math.max(0, laxmiIdx - 2); k < laxmiIdx; k++) {
      if (dailyPanchangs[k].tithi === 'Chaturdashi') kukurIdx = k;
    }
    if (kukurIdx === -1 && laxmiIdx >= 1) kukurIdx = laxmiIdx - 1;
    if (kukurIdx !== -1) {
      const dKey = dailyPanchangs[kukurIdx].date;
      if (!newData[dKey].festivals.includes('Kukur Tihar'))
        newData[dKey].festivals.push('Kukur Tihar');
    }

    // Laxmi Puja
    const laxmiKey = dailyPanchangs[laxmiIdx].date;
    if (!newData[laxmiKey].festivals.includes('Laxmi Puja'))
      newData[laxmiKey].festivals.push('Laxmi Puja');

    // Govardhan Puja (Shukla Pratipada)
    let govardhanIdx = -1;
    for (let k = laxmiIdx + 1; k <= Math.min(laxmiIdx + 3, dailyPanchangs.length - 1); k++) {
      if (dailyPanchangs[k].paksha === 'Shukla' && dailyPanchangs[k].tithi === 'Pratipada') {
        govardhanIdx = k;
        break;
      }
    }
    if (govardhanIdx === -1 && laxmiIdx + 1 < dailyPanchangs.length) govardhanIdx = laxmiIdx + 1;
    if (govardhanIdx !== -1) {
      const dKey = dailyPanchangs[govardhanIdx].date;
      if (!newData[dKey].festivals.includes('Govardhan Puja / Mha Puja / Gai Puja')) {
        newData[dKey].festivals.push('Govardhan Puja / Mha Puja / Gai Puja');
      }
    }

    // Bhai Tika (Shukla Dvitiya)
    let bhaiIdx = -1;
    if (govardhanIdx !== -1) {
      for (
        let k = govardhanIdx + 1;
        k <= Math.min(govardhanIdx + 2, dailyPanchangs.length - 1);
        k++
      ) {
        if (dailyPanchangs[k].paksha === 'Shukla' && dailyPanchangs[k].tithi === 'Dvitiya') {
          bhaiIdx = k;
          break;
        }
      }
      if (bhaiIdx === -1 && govardhanIdx + 1 < dailyPanchangs.length) bhaiIdx = govardhanIdx + 1;
    }
    if (bhaiIdx !== -1) {
      const dKey = dailyPanchangs[bhaiIdx].date;
      if (!newData[dKey].festivals.includes('Bhai Tika')) newData[dKey].festivals.push('Bhai Tika');

      // Tihar Holiday (Bhai Tika + 1)
      if (bhaiIdx + 1 < dailyPanchangs.length) {
        const tiharHolKey = dailyPanchangs[bhaiIdx + 1].date;
        if (!newData[tiharHolKey].events.includes('Tihar Holiday')) {
          newData[tiharHolKey].events.push('Tihar Holiday');
        }
        if (!newData[tiharHolKey].festivals.includes('Tihar Holiday')) {
          newData[tiharHolKey].festivals.push('Tihar Holiday');
        }
      }
    }

    // Continuous Tihar Public Holiday Block (Laxmi Puja to Bhai Tika + 1)
    const endTiharIdx = bhaiIdx !== -1 ? bhaiIdx + 1 : laxmiIdx + 3;
    for (let k = laxmiIdx; k <= Math.min(endTiharIdx, dailyPanchangs.length - 1); k++) {
      newData[dailyPanchangs[k].date].isHoliday = true;
    }

    // Chhath Puja (Shukla Shashthi after Laxmi Puja)
    const chhathIdx = dailyPanchangs.findIndex(
      (d, idx) => idx > laxmiIdx && d.paksha === 'Shukla' && d.tithi === 'Shashthi',
    );
    if (chhathIdx !== -1) {
      const dKey = dailyPanchangs[chhathIdx].date;
      if (!newData[dKey].festivals.includes('Chhath Puja'))
        newData[dKey].festivals.push('Chhath Puja');
    }

    // Haribodhini Ekadashi (Shukla Ekadashi after Laxmi Puja)
    const haribodhiniIdx = dailyPanchangs.findIndex(
      (d, idx) => idx > laxmiIdx && d.paksha === 'Shukla' && d.tithi === 'Ekadashi',
    );
    if (haribodhiniIdx !== -1) {
      const dKey = dailyPanchangs[haribodhiniIdx].date;
      if (!newData[dKey].festivals.includes('Haribodhini Ekadashi / Tulsi Bibaha')) {
        newData[dKey].festivals.push('Haribodhini Ekadashi / Tulsi Bibaha');
      }
    }
  }

  // Relative Rules (like Holi Terai relative to Holi Hilly)
  const relativeRules = festivalRules.filter(
    (r) => r.condition?.type === 'relative' || r.type === 'relative',
  );
  if (relativeRules.length > 0) {
    const allDateKeys = Object.keys(newData).sort();
    for (const rule of relativeRules) {
      const cond = rule.condition || rule;
      for (let i = 0; i < allDateKeys.length; i++) {
        const date = allDateKeys[i];
        if (newData[date].festivals.includes(cond.base)) {
          const targetIdx = i + cond.offsetDays;
          if (targetIdx >= 0 && targetIdx < allDateKeys.length) {
            const targetDate = allDateKeys[targetIdx];
            if (!newData[targetDate].festivals.includes(rule.name)) {
              newData[targetDate].festivals.push(rule.name);
            }
          }
        }
      }
    }
  }

  // Final Holiday reconciliation & Overrides
  for (const date of Object.keys(newData)) {
    const dayObj = newData[date];

    const override = festivalOverrides[date];
    if (override) {
      let festivals = dayObj.festivals;
      if (override.removeFestivals) {
        festivals = festivals.filter((f) => !override.removeFestivals.includes(f));
      }
      if (override.addFestivals) {
        for (const f of override.addFestivals) {
          if (!festivals.includes(f)) festivals.push(f);
        }
      }
      dayObj.festivals = festivals;
    }

    const isHolidayFestival = dayObj.festivals.some((f) => PUBLIC_HOLIDAYS.has(f));
    const isHolidayEvent = dayObj.events.some((e) => PUBLIC_HOLIDAYS.has(e));
    if (isHolidayFestival || isHolidayEvent) {
      dayObj.isHoliday = true;
    } else {
      // Keep isHoliday if explicitly marked by Dashain/Tihar blocks
      if (!dayObj.events.includes('Dashain Holiday') && !dayObj.events.includes('Tihar Holiday')) {
        dayObj.isHoliday = false;
      }
    }
  }

  await writeFile(filePath, JSON.stringify(newData, null, 2));
  console.log(`Recomputed and updated ${year}.json (${Object.keys(newData).length} days)`);
}

console.log('✅ Full dataset re-computation complete for all years 1990-2100!');
