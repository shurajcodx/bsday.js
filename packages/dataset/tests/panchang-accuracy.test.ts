import { describe, expect, it } from 'vitest';
import { dataset } from '../src/all';
import { convertDayToNepali } from '../src';

describe('Panchang, Tithi and Festival Accuracy', () => {
  it('accurately provides 2081 BS New Year Panchang', () => {
    const d = dataset['2081-01-01'];
    expect(d).toBeDefined();
    expect(d.tithi).toBe('Panchami');
    expect(d.paksha).toBe('Shukla');
    expect(d.nakshatra).toBe('Mrigashirsha');
    expect(d.events).toContain('Nepali New Year / Biska Jatra');
    expect(d.isHoliday).toBe(true);

    const dNe = convertDayToNepali(d);
    expect(dNe.tithi).toBe('पञ्चमी');
    expect(dNe.paksha).toBe('शुक्ल');
    expect(dNe.nakshatra).toBe('मृगशिरा');
    expect(dNe.events).toContain('नयाँ वर्ष / बिस्का जात्रा');
  });

  it('accurately identifies 2081 Dashain dates (Ghatasthapana, Fulpati, Vijaya Dashami)', () => {
    // Ghatasthapana: 2081-06-17
    const ghata = dataset['2081-06-17'];
    expect(ghata.festivals).toContain('Ghatasthapana');
    expect(ghata.isHoliday).toBe(true);

    // Fulpati: 2081-06-24
    expect(dataset['2081-06-24'].festivals).toContain('Fulpati');
    expect(dataset['2081-06-24'].isHoliday).toBe(true);

    // Maha Ashtami: 2081-06-25
    expect(dataset['2081-06-25'].festivals).toContain('Maha Ashtami');
    expect(dataset['2081-06-25'].isHoliday).toBe(true);

    // Vijaya Dashami: 2081-06-26
    const dashami = dataset['2081-06-26'];
    expect(dashami.festivals).toContain('Vijaya Dashami');
    expect(dashami.isHoliday).toBe(true);
  });

  it('accurately identifies 2081 Tihar festival dates (Kag Tihar, Laxmi Puja, Bhai Tika)', () => {
    // Kag Tihar: 2081-07-13 or 2081-07-14
    expect(dataset['2081-07-13'].festivals.includes('Kag Tihar') || dataset['2081-07-14'].festivals.includes('Kag Tihar')).toBe(true);

    // Laxmi Puja: 2081-07-15
    const laxmi = dataset['2081-07-15'];
    expect(laxmi.festivals).toContain('Laxmi Puja');
    expect(laxmi.isHoliday).toBe(true);

    // Bhai Tika: 2081-07-18
    const bhai = dataset['2081-07-18'];
    expect(bhai.festivals).toContain('Bhai Tika');
    expect(bhai.isHoliday).toBe(true);
    expect(bhai.tithi).toBe('Dvitiya');
    expect(bhai.paksha).toBe('Shukla');

    // Chhath Puja: 2081-07-22
    const chhath = dataset['2081-07-22'];
    expect(chhath.festivals).toContain('Chhath Puja');
    expect(chhath.isHoliday).toBe(true);
  });

  it('accurately handles 2083 Dashain with Tithi Vriddhi and 6-day holiday block', () => {
    // 2083 Ashwin 25: Ghatasthapana
    expect(dataset['2083-06-25'].festivals).toContain('Ghatasthapana');

    // 2083 Ashwin 31: Fulpati
    expect(dataset['2083-06-31'].festivals).toContain('Fulpati');
    expect(dataset['2083-06-31'].isHoliday).toBe(true);

    // 2083 Kartik 1: Dashain Holiday (Vriddhi of Saptami)
    expect(dataset['2083-07-01'].isHoliday).toBe(true);

    // 2083 Kartik 2: Maha Ashtami
    expect(dataset['2083-07-02'].festivals).toContain('Maha Ashtami');
    expect(dataset['2083-07-02'].isHoliday).toBe(true);

    // 2083 Kartik 3: Maha Navami
    expect(dataset['2083-07-03'].festivals).toContain('Maha Navami');
    expect(dataset['2083-07-03'].isHoliday).toBe(true);

    // 2083 Kartik 4: Vijaya Dashami (on true Dashami)
    expect(dataset['2083-07-04'].festivals).toContain('Vijaya Dashami');
    expect(dataset['2083-07-04'].isHoliday).toBe(true);

    // 2083 Kartik 5: Papankusha Ekadashi
    expect(dataset['2083-07-05'].festivals).toContain('Papankusha Ekadashi');
    expect(dataset['2083-07-05'].isHoliday).toBe(true);

    // 2083 Kartik 6: Dashain Holiday (Dwadashi)
    expect(dataset['2083-07-06'].isHoliday).toBe(true);
  });

  it('accurately identifies 2083 Bhadra Dar Khane Din (Bhadra 28) and Haritalika Teej (Bhadra 29)', () => {
    // 2083 Bhadra 28: Dar Khane Din
    const dar = dataset['2083-05-28'];
    expect(dar.festivals).toContain('Dar Khane Din');

    // 2083 Bhadra 29: Haritalika Teej
    const teej = dataset['2083-05-29'];
    expect(teej.festivals).toContain('Haritalika Teej');
    expect(teej.isHoliday).toBe(true);

    // 2083 Bhadra 30: Ganesh Chaturthi
    const ganesh = dataset['2083-05-30'];
    expect(ganesh.festivals).toContain('Ganesh Chaturthi');

    // 2083 Bhadra 31: Rishi Panchami
    const rishi = dataset['2083-05-31'];
    expect(rishi.festivals).toContain('Rishi Panchami');
    expect(rishi.isHoliday).toBe(true);
  });

  it('accurately identifies 2083 Jitiya Parva on Ashwin 18', () => {
    const jitiya = dataset['2083-06-18'];
    expect(jitiya.festivals).toContain('Jitiya Parva');
    expect(jitiya.isHoliday).toBe(true);
  });

  it('accurately provides full Nepali localized panchang for 2082 Bhai Tika', () => {
    const d = dataset['2082-07-06'];
    expect(d.festivals).toContain('Bhai Tika');

    const dNe = convertDayToNepali(d);
    expect(dNe.festivals).toContain('भाइटीका / किजा पूजा');
    expect(dNe.paksha).toBe('शुक्ल');
    expect(dNe.tithi).toBe('द्वितीया');
  });

  it('has zero Unknown fields across the entire 111-year dataset (1990-2100 BS)', () => {
    for (const val of Object.values(dataset)) {
      expect(val.tithi).not.toBe('Unknown');
      expect(val.paksha).not.toBe('Unknown');
      expect(val.nakshatra).not.toBe('Unknown');
      expect(val.yoga).not.toBe('Unknown');
      expect(val.karana).not.toBe('Unknown');
    }
  });
});
