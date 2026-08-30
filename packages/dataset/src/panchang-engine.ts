import swisseph from 'swisseph-v2';
import path from 'path';

// Set accurate path and Lahiri Ayanamsa
const ephePath =
  (typeof process !== 'undefined' && process.env?.BSDAY_EPHE_PATH) ||
  (typeof __dirname !== 'undefined'
    ? path.resolve(__dirname, '../ephe')
    : typeof process !== 'undefined' && typeof process.cwd === 'function'
      ? path.resolve(process.cwd(), 'ephe')
      : '');

if (ephePath && swisseph && typeof swisseph.swe_set_ephe_path === 'function') {
  try {
    swisseph.swe_set_ephe_path(ephePath);
  } catch {
    // fallback if ephemeris files cannot be configured directly
  }
}
if (swisseph && typeof swisseph.swe_set_sid_mode === 'function') {
  try {
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  } catch {
    // fallback
  }
}

// Use Sidereal flags
const FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

export const TITHIS = [
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

export const NAKSHATRAS = [
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

export const YOGAS = [
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

export const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];

export interface PanchangData {
  tithi: string;
  paksha: 'Shukla' | 'Krishna';
  nakshatra: string;
  yoga: string;
  karana: string;
}

interface SweCalcResult {
  longitude?: number;
  latitude?: number;
  distance?: number;
  longitudeSpeed?: number;
  latitudeSpeed?: number;
  distanceSpeed?: number;
  rflag?: number;
}

interface SweRiseTransResult {
  transitTime?: number;
  rise?: number;
  set?: number;
}

// Returns panchang for given JD
export function computePanchang(jd_ut: number): PanchangData {
  let sun: SweCalcResult | null = null;
  let moon: SweCalcResult | null = null;
  try {
    sun = swisseph.swe_calc_ut(jd_ut, swisseph.SE_SUN, FLAGS) as SweCalcResult;
    moon = swisseph.swe_calc_ut(jd_ut, swisseph.SE_MOON, FLAGS) as SweCalcResult;

    if (
      !sun ||
      typeof sun.longitude === 'undefined' ||
      !moon ||
      typeof moon.longitude === 'undefined'
    ) {
      throw new Error('Invalid coordinates returned from Swiss Ephemeris');
    }
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Swiss Ephemeris calculation error for JD:', jd_ut, error.message);
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
  const diff = (moonLon - sunLon + 360) % 360;
  const tithiIndex = Math.floor(diff / 12);

  // 0-14: Shukla 1 to Purnima
  // 15-29: Krishna 1 to Amavasya
  const tithiNameIndex = tithiIndex % 15;
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
export function findTithiTransition(
  jd_start: number,
): { nextTithi: string; transitionJD: number } | null {
  let currentJD = jd_start;
  const currentPanchang = computePanchang(jd_start);

  // Binary search or iterative approach for transition
  // A tithi is roughly 0.9 - 1.1 days.
  // We can check every hour for simplicity, then refine.
  const step = 1 / 24; // 1 hour
  for (let i = 0; i < 30; i++) {
    // Check up to 30 hours
    currentJD += step;
    const nextPanchang = computePanchang(currentJD);
    if (
      nextPanchang.tithi !== currentPanchang.tithi ||
      nextPanchang.paksha !== currentPanchang.paksha
    ) {
      // Found a change, refine with smaller steps (binary search style)
      let low = currentJD - step;
      let high = currentJD;
      for (let j = 0; j < 10; j++) {
        const mid = (low + high) / 2;
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

export function sunriseJD(
  year: number,
  month: number,
  day: number,
  lat: number = 27.7172,
  lon: number = 85.324,
  alt: number = 1400,
): number {
  const jdMidnight = swisseph.swe_julday(year, month, day, 0, swisseph.SE_GREG_CAL);
  try {
    const sweModule = swisseph as unknown as {
      swe_rise_trans: (
        tjd: number,
        ipl: number,
        starname: string,
        epheflag: number,
        rsmi: number,
        geopos: number[],
        atpress: number,
        attemp: number,
      ) => SweRiseTransResult;
    };
    const res = sweModule.swe_rise_trans(
      jdMidnight,
      swisseph.SE_SUN,
      '',
      swisseph.SEFLG_SWIEPH,
      swisseph.SE_CALC_RISE,
      [lon, lat, alt],
      1013.25,
      15,
    );
    if (res && typeof res.transitTime === 'number') return res.transitTime;
    if (res && typeof res.rise === 'number') return res.rise;
  } catch {
    // Fallback on error
  }
  // Fallback to approx 6:00 AM Kathmandu (LT) = 00:15 AM UTC
  // 00:15 UTC = 0.25 / 24 = ~0.0104167 days
  return jdMidnight + 0.0104167;
}
