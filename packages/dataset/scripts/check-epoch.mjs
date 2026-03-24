import swisseph from 'swisseph-v2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ephePath = path.resolve(__dirname, '../ephe');
swisseph.swe_set_ephe_path(ephePath);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL;

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

const startJD = swisseph.swe_julday(1913, 4, 1, 0, swisseph.SE_GREG_CAL);
const ingressJD = findIngress(startJD, 0);
const res = swisseph.swe_revjul(ingressJD + (5.75/24), swisseph.SE_GREG_CAL);

console.log(`Solar Ingress into Aries (April 1913):`);
console.log(`UT JD: ${ingressJD}`);
console.log(`Nepal Time Date: ${res.year}-${res.month}-${res.day} ${res.hour}:${Math.floor(res.minute)}`);
