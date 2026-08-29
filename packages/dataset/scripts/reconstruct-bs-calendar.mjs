import swisseph from 'swisseph-v2';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ephePath = path.resolve(__dirname, '../ephe');
swisseph.swe_set_ephe_path(ephePath);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL;

const NEPAL_OFFSET_DAYS = 5.75 / 24;

function findIngress(jd_start, targetLong) {
  let low = jd_start;
  let high = jd_start + 32;

  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;
    const res = swisseph.swe_calc_ut(mid, swisseph.SE_SUN, FLAGS);
    const lon = (res.longitude - targetLong + 360) % 360;
    if (lon < 180) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return high;
}

function jdToNepalDate(jd_ut) {
  const jd_nepal = jd_ut + NEPAL_OFFSET_DAYS;
  const res = swisseph.swe_revjul(jd_nepal, swisseph.SE_GREG_CAL);
  return { year: res.year, month: res.month, day: res.day };
}

async function reconstruct() {
  const table = {};

  // Starting point: April 1913 (BS 1970 starts)
  let currentJD = findIngress(swisseph.swe_julday(1913, 4, 1, 0, swisseph.SE_GREG_CAL), 0);

  for (let bsYear = 1970; bsYear <= 2100; bsYear++) {
    const monthLengths = [];
    const sankrantiJDs = [];
    sankrantiJDs.push(currentJD);

    for (let m = 1; m <= 12; m++) {
      const targetLong = (m * 30) % 360;
      const nextJD = findIngress(currentJD + 25, targetLong);
      sankrantiJDs.push(nextJD);
      currentJD = nextJD;
    }

    for (let i = 0; i < 12; i++) {
      const start = jdToNepalDate(sankrantiJDs[i]);
      const end = jdToNepalDate(sankrantiJDs[i + 1]);

      const startJD = swisseph.swe_julday(
        start.year,
        start.month,
        start.day,
        0,
        swisseph.SE_GREG_CAL,
      );
      const endJD = swisseph.swe_julday(end.year, end.month, end.day, 0, swisseph.SE_GREG_CAL);

      monthLengths.push(Math.round(endJD - startJD));
    }

    table[bsYear] = monthLengths;
  }

  const outputFile = path.resolve(__dirname, '../src/monthData.ts');
  const content = `export type BsMonthTable = Record<number, readonly number[]>;

/**
 * ASTRONOMICALLY RECONSTRUCTED FILE - DO NOT EDIT MANUALLY
 * Authoritative BS month-length table derived from Swiss Ephemeris.
 * Range: 1970 - 2100 BS.
 * Resolution: Nepal Local Time (UTC+5:45).
 */
export const ACCURATE_BS_MONTH_TABLE: BsMonthTable = ${JSON.stringify(table, null, 2)};
`;

  fs.writeFileSync(outputFile, content);
  console.log('Successfully reconstructed BS calendar and saved to:', outputFile);
}

reconstruct().catch(console.error);
