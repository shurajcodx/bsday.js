# 🕉️ @bsday.js/dataset

> **Comprehensive Bikram Sambat (BS) calendar dataset and astronomical Panchang engine (1990–2100 BS) for JavaScript and TypeScript.**

[![Website](https://img.shields.io/badge/website-bsdayjs.vercel.app-blue.svg?style=flat-square&logo=vercel)](https://bsdayjs.vercel.app)
[![npm version](https://img.shields.io/npm/v/@bsday.js/dataset.svg?style=flat-square&color=indigo)](https://www.npmjs.com/package/@bsday.js/dataset)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/shurajcodx/bsday.js/blob/main/LICENSE)
[![tests](https://img.shields.io/badge/tests-77%2F77%20passing-brightgreen.svg?style=flat-square)](https://vitest.dev)

🌐 **Official Website & Playground**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)  
📅 **Interactive Calendar Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)  
📖 **API Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)

`@bsday.js/dataset` provides **111 years (1990–2100 BS / 40,543 days)** of verified Nepali calendar data with **Hamro Patro and Panchang Nirnayak Samiti parity**, including **Tithi, Paksha, Nakshatra, Yoga, Karana, cultural festivals, secular events, and continuous public holiday blocks**.

---

## 📦 Installation

```bash
npm install @bsday.js/dataset @bsday.js/core
# or
pnpm add @bsday.js/dataset @bsday.js/core
# or
yarn add @bsday.js/dataset @bsday.js/core
```

---

## 🌟 Key Features

- **111-Year Dataset (1990–2100 BS)**: **40,543 daily records** precomputed with zero `Unknown` fields.
- **Vedic Panchang Elements**: Complete calculation of _Tithi_, _Paksha_, _Nakshatra_, _Yoga_, and _Karana_.
- **Nepali Calendar Parity**:
  - **दर खाने दिन (Dar Khane Din)**: Bhadra Shukla Dvitiya (or day preceding Teej on Kshaya).
  - **हरितालिका तीज (Haritalika Teej)**: Bhadra Shukla Tritiya (Chaturthi-joined).
  - **दशैं बिदा (Dashain Public Holiday Block)**: 6 continuous days from Fulpati through Dwadashi (handling Tithi Vriddhi & Kshaya).
  - **तिहार बिदा (Tihar Public Holiday Block)**: 4 continuous days from Laxmi Puja through Bhai Tika + 1.
  - **जितिया पर्व (Jitiya Parva)**: Ashwin Krishna Ashtami (Sohra Shraddha).
  - **श्रीकृष्ण जन्माष्टमी / गौरा पर्व**: Bhadra Krishna Ashtami (Nishita Kaal).
  - **जनै पूर्णिमा / रक्षा बन्धन**: Full canonical festival title.
- **Dual-Language Support**: Instant English and Devanagari (नेपाली) outputs.
- **Modular & Tree-Shakeable**: Import only the sub-modules you need (`.`, `./all`, `./month-data`, `./panchang-engine`).

---

## 📋 Data Schema

```typescript
export interface BSDayData {
  tithi: string; // "Pratipada", "Dvitiya", "Purnima", "Amavasya", etc.
  paksha: string; // "Shukla" | "Krishna"
  nakshatra: string; // "Ashwini", "Bharani", "Krittika", "Rohini", etc.
  yoga: string; // "Vishkumbha", "Priti", "Ayushman", "Saubhagya", etc.
  karana: string; // "Bava", "Balava", "Kaulava", "Taitila", etc.
  festivals: string[]; // Cultural/religious festivals (Dashain, Tihar, Teej, etc.)
  events: string[]; // National/international events (Constitution Day, Sankranti)
  isHoliday: boolean; // True if it is a recognized government public holiday
}
```

---

## 🚀 Basic Usage

### 1. Direct Lookup by BS Date

```typescript
import { dataset, datasetNepali, type BSDayData } from '@bsday.js/dataset/all';

// English lookup
const day: BSDayData = dataset['2083-05-29'];
console.log(day.tithi); // "Chaturthi"
console.log(day.festivals); // ["Haritalika Teej"]
console.log(day.isHoliday); // true

// Authentic Nepali (Devanagari) lookup
const nepaliDay = datasetNepali['2083-05-29'];
console.log(nepaliDay.tithi); // "चतुर्थी"
console.log(nepaliDay.festivals); // ["हरितालिका तीज (महिला बिदा)"]
console.log(nepaliDay.isHoliday); // true
```

### 2. Integration with `@bsday.js/core`

```typescript
import { bsday, BSDay, datasetManager } from '@bsday.js/core';
import { dataset } from '@bsday.js/dataset/all';

// Hydrate dataset into core engine
datasetManager.setDataset(dataset);

const today = bsday.bs(2083, 7, 4); // Vijaya Dashami 2083
console.log(today.tithi); // "Dashami"
console.log(today.festivals); // ["Vijaya Dashami"]
console.log(today.isHoliday); // true

// Localized in Nepali
const todayNe = today.locale('ne');
console.log(todayNe.tithi); // "दशमी"
console.log(todayNe.festivals); // ["विजया दशमी (बडा दशैं टीका)"]
```

---

## 🔬 Advanced: Panchang Engine

Calculate astronomical Panchang values for any Julian Day or coordinate on the fly:

```typescript
import { computePanchang, sunriseJD } from '@bsday.js/dataset/panchang-engine';

// Kathmandu coordinates
const LAT = 27.7172;
const LON = 85.324;
const ALT = 1400;

const jd = sunriseJD(2026, 9, 10, LAT, LON, ALT);
const panchang = computePanchang(jd);

console.log(panchang.tithi); // "Chaturthi"
console.log(panchang.paksha); // "Shukla"
console.log(panchang.nakshatra); // "Chitra"
console.log(panchang.yoga); // "Brahma"
console.log(panchang.karana); // "Vanija"
```

---

## ⚡ Zero-Maintenance Developer Architecture

Because major Nepali festivals follow astronomical lunar mechanics (_Kaala & Tithi transitions_), **in 2085, 2090, or 2099 BS, the package already computes accurate festivals and holidays automatically.**

If you ever need to inject sudden ad-hoc government holidays at runtime:

```typescript
import { datasetManager } from '@bsday.js/core';

datasetManager.addDataset({
  '2086-04-15': {
    tithi: 'Panchami',
    paksha: 'Shukla',
    nakshatra: 'Hasta',
    yoga: 'Siddhi',
    karana: 'Bava',
    festivals: ['Special State Holiday'],
    events: [],
    isHoliday: true,
  },
});
```

---

## 🔗 Useful Links

- 🌐 **Website**: [https://bsdayjs.vercel.app](https://bsdayjs.vercel.app)
- 📖 **Documentation**: [https://bsdayjs.vercel.app/docs](https://bsdayjs.vercel.app/docs)
- 📅 **Calendar & Panchang Explorer**: [https://bsdayjs.vercel.app/dataset](https://bsdayjs.vercel.app/dataset)
- 🧪 **Interactive Playground**: [https://bsdayjs.vercel.app/playground](https://bsdayjs.vercel.app/playground)
- 🐙 **GitHub Repository**: [https://github.com/shurajcodx/bsday.js](https://github.com/shurajcodx/bsday.js)

---

## 📄 License

MIT © [shurajcodx](https://github.com/shurajcodx)
