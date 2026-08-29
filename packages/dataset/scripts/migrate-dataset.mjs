import swisseph from 'swisseph-v2';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { BSDay } from '../../core/dist/index.js';

// Set accurate path and Lahiri Ayanamsa
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ephePath = path.resolve(__dirname, '../ephe');
swisseph.swe_set_ephe_path(ephePath);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

// Use Sidereal flags
const FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

// Kathmandu coordinates
const LAT = 27.7172;
const LON = 85.324;
const ALT = 1400;

// Panchang constants
const TITHIS = [
  'Pratipada',
  'Dvitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima',
  'Amavasya',
];

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashirsha',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

const YOGAS = [
  'Vishkumbha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shoola',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harsha',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyana',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
];

const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];

// Load static data files
async function loadStaticData() {
  const intEventsPath = path.resolve(__dirname, '../src/data/static/international-events.json');
  const bsEventsPath = path.resolve(__dirname, '../src/data/static/bs-events.json');
  const festivalRulesPath = path.resolve(__dirname, '../src/data/static/festival-rules.json');
  const festivalOverridesPath = path.resolve(
    __dirname,
    '../src/data/static/festival-overrides.json',
  );

  const [intEvents, bsEvents, festivalRules, festivalOverrides] = await Promise.all([
    readFile(intEventsPath, 'utf8').then((d) => JSON.parse(d)),
    readFile(bsEventsPath, 'utf8').then((d) => JSON.parse(d)),
    readFile(festivalRulesPath, 'utf8').then((d) => JSON.parse(d)),
    readFile(festivalOverridesPath, 'utf8').then((d) => JSON.parse(d)),
  ]);

  return { intEvents, bsEvents, festivalRules, festivalOverrides };
}

// Compute panchang for given JD
function computePanchang(jd_ut) {
  let sun, moon;
  try {
    sun = swisseph.swe_calc_ut(jd_ut, swisseph.SE_SUN, FLAGS);
    moon = swisseph.swe_calc_ut(jd_ut, swisseph.SE_MOON, FLAGS);

    if (
      !sun ||
      typeof sun.longitude === 'undefined' ||
      !moon ||
      typeof moon.longitude === 'undefined'
    ) {
      throw new Error('Invalid coordinates returned from Swiss Ephemeris');
    }
  } catch (e) {
    console.error('Swiss Ephemeris calculation error for JD:', jd_ut, e.message);
    return {
      tithi: 'Unknown',
      paksha: 'Shukla',
      nakshatra: 'Unknown',
      yoga: 'Unknown',
      karana: 'Unknown',
    };
  }

  const sunLon = sun.longitude;
  const moonLon = moon.longitude;

  // Tithi: 360 degrees divided into 30 parts of 12 degrees each
  let diff = (moonLon - sunLon + 360) % 360;
  const tithiIndex = Math.floor(diff / 12);

  // 0-14: Shukla 1 to Purnima
  // 15-29: Krishna 1 to Amavasya
  let tithiNameIndex = tithiIndex % 15;
  let tithi = TITHIS[tithiNameIndex];

  if (tithiIndex === 14) tithi = 'Purnima';
  if (tithiIndex === 29) tithi = 'Amavasya';

  if (!tithi) tithi = 'Unknown';

  const nakshatraIndex = Math.floor((moonLon % 360) / (360 / 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex] || 'Unknown';

  const yogaIndex = Math.floor(((sunLon + moonLon) % 360) / (360 / 27));
  const yoga = YOGAS[yogaIndex] || 'Unknown';

  const karanaDiff = diff / 6;
  const karanaIndex = Math.floor(karanaDiff);

  let karana = '';
  if (karanaIndex === 0) {
    karana = 'Kimstughna';
  } else if (karanaIndex >= 57) {
    const fixedKaranas = ['Shakuni', 'Chatushpada', 'Naga'];
    karana = fixedKaranas[karanaIndex - 57] || 'Unknown';
  } else {
    karana = KARANAS[(karanaIndex - 1) % 7] || 'Unknown';
  }

  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';

  return { tithi, paksha, nakshatra, yoga, karana };
}

// Find when the current tithi ends (next tithi starts)
function findTithiTransition(jd_start) {
  let currentJD = jd_start;
  const currentPanchang = computePanchang(jd_start);

  const step = 1 / 24; // 1 hour
  for (let i = 0; i < 30; i++) {
    // Check up to 30 hours
    currentJD += step;
    const nextPanchang = computePanchang(currentJD);
    if (
      nextPanchang.tithi !== currentPanchang.tithi ||
      nextPanchang.paksha !== currentPanchang.paksha
    ) {
      let low = currentJD - step;
      let high = currentJD;
      for (let j = 0; j < 10; j++) {
        let mid = (low + high) / 2;
        const midPanchang = computePanchang(mid);
        if (
          midPanchang.tithi === currentPanchang.tithi &&
          midPanchang.paksha === currentPanchang.paksha
        ) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return {
        nextTithi: computePanchang(high).tithi,
        transitionJD: high,
      };
    }
  }
  return null;
}

// Calculate sunrise JD for given date
function sunriseJD(year, month, day, lat = LAT, lon = LON, alt = ALT) {
  const jdMidnight = swisseph.swe_julday(year, month, day, 0, swisseph.SE_GREG_CAL);
  try {
    const res = swisseph.swe_rise_trans(
      jdMidnight,
      swisseph.SE_SUN,
      swisseph.SEFLG_SWIEPH,
      swisseph.SE_CALC_RISE,
      lat,
      lon,
      alt,
    );
    if (res && res.rise) return res.rise;
  } catch {
    // console.warn('Sunrise calculation failed, using fallback');
  }
  // Fallback to approx 6:30 AM Kathmandu (LT) = 00:45 AM UTC
  return jdMidnight + 0.03125;
}

// Generate all dates for a BS year using BSDay library
function generateBsDates(bsYear) {
  const dates = [];

  // Use BSDay to get actual month days
  for (let month = 1; month <= 12; month++) {
    // Try each day, BSDay.isValid will tell us if it exists
    for (let day = 1; day <= 32; day++) {
      if (!BSDay.isValid(bsYear, month, day, 'bs')) break;

      dates.push({
        year: bsYear,
        month,
        day,
        dateStr: `${bsYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      });
    }
  }
  return dates;
}

// Apply festival rules to compute festivals for a day
function computeFestivalsForDay(dayData, allDays, festivalRules, index) {
  const festivals = [];
  const day = dayData.panchang;

  for (const rule of festivalRules) {
    const cond = rule.condition || rule;
    const type = cond.type || cond.time || 'sunrise';
    const monthMatch = cond.month === day.month;

    if (!monthMatch) continue;

    const pakshaMatch = !cond.paksha || cond.paksha === day.paksha;

    if (type === 'sunrise') {
      if (day.tithi === cond.tithi && pakshaMatch) {
        // Check if matched yesterday to avoid duplicates on Vriddhi
        const prevDay = allDays[index - 1];
        let alreadyMatched = false;
        if (
          prevDay &&
          prevDay.panchang.tithi === cond.tithi &&
          (!cond.paksha || cond.paksha === prevDay.panchang.paksha)
        ) {
          alreadyMatched = true;
        }
        if (!alreadyMatched) {
          festivals.push(rule.name);
        }
      }
    } else if (type === 'sunset' || type === 'night') {
      const offset = type === 'sunset' ? 0.45 : 0.75;
      const targetJD = day.jdSunrise + offset;
      const panchangAtWindow = computePanchang(targetJD);

      const targetPakshaMatch = !cond.paksha || cond.paksha === panchangAtWindow.paksha;

      if (panchangAtWindow.tithi === cond.tithi && targetPakshaMatch) {
        // Check if already matched yesterday to avoid duplicates on Vriddhi
        const prevDay = allDays[index - 1];
        let alreadyMatched = false;
        if (prevDay) {
          const prevTargetJD = prevDay.panchang.jdSunrise + offset;
          const prevPanchang = computePanchang(prevTargetJD);
          if (
            prevPanchang.tithi === cond.tithi &&
            (!cond.paksha || cond.paksha === prevPanchang.paksha)
          ) {
            alreadyMatched = true;
          }
        }

        if (!alreadyMatched) {
          festivals.push(rule.name);
        }
      }
    }
  }

  return festivals;
}

// Apply relative rules (e.g., Vijaya Dashami = Ghatasthapana + 9 days)
function applyRelativeRules(yearData, allDays, festivalRules) {
  const relativeRules = festivalRules.filter(
    (r) => r.condition?.type === 'relative' || r.type === 'relative',
  );

  const dateKeys = Object.keys(yearData).sort();

  for (const rule of relativeRules) {
    const cond = rule.condition || rule;
    // Find base festival
    for (let i = 0; i < dateKeys.length; i++) {
      const date = dateKeys[i];
      if (yearData[date].festivals.includes(cond.base)) {
        const targetIdx = i + cond.offsetDays;
        if (targetIdx >= 0 && targetIdx < dateKeys.length) {
          const targetDate = dateKeys[targetIdx];
          if (!yearData[targetDate].festivals.includes(rule.name)) {
            yearData[targetDate].festivals.push(rule.name);
            yearData[targetDate].isHoliday = true;
          }
        }
      }
    }
  }
}

// Get events for a date using BSDay for accurate AD conversion
function getEventsForDate(bsYear, bsMonth, bsDay, intEvents, bsEvents) {
  const bsKey = `${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;

  // Use BSDay for accurate AD date conversion
  try {
    const bsDate = BSDay.fromBS([bsYear, bsMonth, bsDay]);
    const adDate = bsDate.toAD();
    const adMonth = String(adDate.getUTCMonth() + 1).padStart(2, '0');
    const adDay = String(adDate.getUTCDate()).padStart(2, '0');
    const adKey = `${adMonth}-${adDay}`;

    const events = [...(intEvents[adKey] ?? []), ...(bsEvents[bsKey] ?? [])];

    return events;
  } catch {
    // Fallback if BSDay conversion fails
    return [];
  }
}

// Main migration function
async function migrateYear(bsYear, { intEvents, bsEvents, festivalRules, festivalOverrides }) {
  console.log(`Migrating year ${bsYear}...`);

  const dates = generateBsDates(bsYear);
  const allDays = [];

  // First pass: Compute panchang for all days
  for (const dateInfo of dates) {
    // Use BSDay for accurate BS to AD conversion
    const bsDate = BSDay.fromBS([dateInfo.year, dateInfo.month, dateInfo.day]);
    const adDate = bsDate.toAD();

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

    allDays.push({
      ...dateInfo,
      panchang: {
        month: dateInfo.month,
        jdSunrise,
        ...panchang,
        nextTithi: transition?.nextTithi,
        transitionJD: transition?.transitionJD,
      },
    });
  }

  // Second pass: Compute festivals and events
  const yearData = {};

  for (let i = 0; i < allDays.length; i++) {
    const day = allDays[i];
    const festivals = computeFestivalsForDay(day, allDays, festivalRules, i);
    const events = getEventsForDate(day.year, day.month, day.day, intEvents, bsEvents);

    // Apply overrides
    const override = festivalOverrides[day.dateStr];
    if (override) {
      if (override.removeFestivals) {
        for (const f of override.removeFestivals) {
          const idx = festivals.indexOf(f);
          if (idx !== -1) festivals.splice(idx, 1);
        }
      }
      if (override.addFestivals) {
        festivals.push(...override.addFestivals);
      }
    }

    // Remove duplicates
    const uniqueFestivals = [...new Set(festivals)];

    yearData[day.dateStr] = {
      tithi: day.panchang.tithi,
      paksha: day.panchang.paksha,
      nakshatra: day.panchang.nakshatra,
      yoga: day.panchang.yoga,
      karana: day.panchang.karana,
      festivals: uniqueFestivals,
      events: events,
      isHoliday: uniqueFestivals.length > 0,
    };
  }

  // Third pass: Apply relative rules
  applyRelativeRules(yearData, allDays, festivalRules);

  return yearData;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let startYear = 1950;
  let endYear = 2100;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
      startYear = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--end' && args[i + 1]) {
      endYear = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--year' && args[i + 1]) {
      startYear = endYear = parseInt(args[i + 1], 10);
      i++;
    }
  }

  console.log(`🚀 Starting migration for BS years ${startYear} to ${endYear}`);
  console.log(`📁 Output directory: data/years-migrated/`);

  // Create output directory
  const outputDir = path.resolve(__dirname, '../src/data/years-migrated');
  await mkdir(outputDir, { recursive: true });

  // Load static data
  console.log('📖 Loading static data (events, rules, overrides)...');
  const staticData = await loadStaticData();

  // Process each year
  const startTime = Date.now();

  for (let year = startYear; year <= endYear; year++) {
    const yearData = await migrateYear(year, staticData);

    // Sort keys
    const sortedKeys = Object.keys(yearData).sort();
    const sortedYearData = {};
    for (const key of sortedKeys) {
      sortedYearData[key] = yearData[key];
    }

    // Write year file
    const outputPath = path.join(outputDir, `${year}.json`);
    await writeFile(outputPath, JSON.stringify(sortedYearData, null, 2) + '\n');

    const recordCount = Object.keys(sortedYearData).length;
    const festivalCount = Object.values(sortedYearData).reduce(
      (sum, d) => sum + d.festivals.length,
      0,
    );

    console.log(`  ✅ ${year}: ${recordCount} days, ${festivalCount} festivals`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 Migration complete! Processed ${endYear - startYear + 1} years in ${elapsed}s`);
  console.log(`📂 Output: ${outputDir}`);
}

// Run
main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exitCode = 1;
});
