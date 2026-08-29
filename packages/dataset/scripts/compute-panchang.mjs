import swisseph from 'swisseph-v2';
import path from 'path';
import { fileURLToPath } from 'url';

// Set accurate path and Lahiri Ayanamsa
const ephePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../ephe');
swisseph.swe_set_ephe_path(ephePath);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

// Use Sidereal flags
const FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

const TITHIS = [
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
  'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGAS = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harsha', 'Vajra', 'Siddhi', 'Vyatipata',
  'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

const KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'
];

// Returns panchang for given JD
export default function computePanchang(jd_ut) {
  let sun, moon;
  try {
    sun = swisseph.swe_calc_ut(jd_ut, swisseph.SE_SUN, FLAGS);
    moon = swisseph.swe_calc_ut(jd_ut, swisseph.SE_MOON, FLAGS);

    if (!sun || typeof sun.longitude === 'undefined' || !moon || typeof moon.longitude === 'undefined') {
      throw new Error('Invalid coordinates returned from Swiss Ephemeris');
    }
  } catch (error) {
    console.error('Swiss Ephemeris calculation error for JD:', jd_ut, error.message);
    return { tithi: 'Unknown', nakshatra: 'Unknown', yoga: 'Unknown', karana: 'Unknown' };
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
export function findTithiTransition(jd_start) {
  let currentJD = jd_start;
  const currentPanchang = computePanchang(jd_start);

  const step = 1 / 24; // 1 hour
  for (let i = 0; i < 30; i++) { // Check up to 30 hours
    currentJD += step;
    const nextPanchang = computePanchang(currentJD);
    if (nextPanchang.tithi !== currentPanchang.tithi || nextPanchang.paksha !== currentPanchang.paksha) {
      let low = currentJD - step;
      let high = currentJD;
      for (let j = 0; j < 10; j++) {
        let mid = (low + high) / 2;
        const midPanchang = computePanchang(mid);
        if (midPanchang.tithi === currentPanchang.tithi && midPanchang.paksha === currentPanchang.paksha) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return {
        nextTithi: computePanchang(high).tithi,
        transitionJD: high
      };
    }
  }
  return null;
}

export function sunriseJD(year, month, day, lat = 27.7172, lon = 85.3240, alt = 1400) {
  const jdMidnight = swisseph.swe_julday(year, month, day, 0, swisseph.SE_GREG_CAL);
  try {
    const res = swisseph.swe_rise_trans(
      jdMidnight,
      swisseph.SE_SUN,
      '',
      swisseph.SEFLG_SWIEPH,
      swisseph.SE_CALC_RISE,
      [lon, lat, alt],
      1013.25,
      15
    );
    if (res && typeof res.transitTime === 'number') {
      return res.transitTime;
    }
    if (res && typeof res.rise === 'number') {
      return res.rise;
    }
  } catch {
    // Fallback if ephemeris rise calculation fails
  }
  // Fallback to approx 6:00 AM Kathmandu (LT) = 00:15 AM UTC
  // 00:15 UTC = 0.25 / 24 = ~0.0104167 days
  return jdMidnight + 0.0104167;
}