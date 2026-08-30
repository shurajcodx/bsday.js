#!/usr/bin/env node

/**
 * Pre-Publish Dist Verification Script
 * Validates dist builds across CommonJS, ESM, TypeScript declarations,
 * and confirms zero Node-builtin leakage in browser-facing bundles.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

let failed = false;

function logStep(name) {
  console.log(`\n\x1b[36m▶ Checking: ${name}\x1b[0m`);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed = true;
  } else {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
  }
}

// 1. Check Package Exports & Existence
logStep('Package.json files and dist exports existence');
const packages = [
  { name: '@bsday.js/core', dir: path.resolve(rootDir, 'packages/core') },
  { name: '@bsday.js/dataset', dir: path.resolve(rootDir, 'packages/dataset') },
];

for (const pkg of packages) {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkg.dir, 'package.json'), 'utf8'));
  console.log(`  Checking package: \x1b[33m${pkg.name}\x1b[0m`);

  // Check main, module, types
  if (pkgJson.main) {
    assert(
      fs.existsSync(path.join(pkg.dir, pkgJson.main)),
      `${pkg.name} main exists (${pkgJson.main})`,
    );
  }
  if (pkgJson.module) {
    assert(
      fs.existsSync(path.join(pkg.dir, pkgJson.module)),
      `${pkg.name} module exists (${pkgJson.module})`,
    );
  }
  if (pkgJson.types) {
    assert(
      fs.existsSync(path.join(pkg.dir, pkgJson.types)),
      `${pkg.name} types exists (${pkgJson.types})`,
    );
  }

  // Check export subpaths
  if (pkgJson.exports) {
    for (const [subpath, config] of Object.entries(pkgJson.exports)) {
      if (typeof config === 'object') {
        if (config.import) {
          const impDefault =
            typeof config.import === 'string' ? config.import : config.import.default;
          const impTypes = typeof config.import === 'object' ? config.import.types : null;
          if (impDefault)
            assert(
              fs.existsSync(path.join(pkg.dir, impDefault)),
              `${pkg.name} exports["${subpath}"].import.default exists (${impDefault})`,
            );
          if (impTypes)
            assert(
              fs.existsSync(path.join(pkg.dir, impTypes)),
              `${pkg.name} exports["${subpath}"].import.types exists (${impTypes})`,
            );
        }
        if (config.require) {
          const reqDefault =
            typeof config.require === 'string' ? config.require : config.require.default;
          const reqTypes = typeof config.require === 'object' ? config.require.types : null;
          if (reqDefault)
            assert(
              fs.existsSync(path.join(pkg.dir, reqDefault)),
              `${pkg.name} exports["${subpath}"].require.default exists (${reqDefault})`,
            );
          if (reqTypes)
            assert(
              fs.existsSync(path.join(pkg.dir, reqTypes)),
              `${pkg.name} exports["${subpath}"].require.types exists (${reqTypes})`,
            );
        }
      }
    }
  }
}

// 2. Check for banned Node builtin imports / shims in browser-facing bundles
logStep('Scanning browser bundles for banned node builtins & fileURLToPath');
const browserDistFiles = [
  'packages/core/dist/index.js',
  'packages/core/dist/index.cjs',
  'packages/dataset/dist/index.js',
  'packages/dataset/dist/index.cjs',
  'packages/dataset/dist/all.js',
  'packages/dataset/dist/all.cjs',
  'packages/dataset/dist/monthData.js',
  'packages/dataset/dist/monthData.cjs',
];

for (const relFile of browserDistFiles) {
  const absPath = path.resolve(rootDir, relFile);
  if (!fs.existsSync(absPath)) continue;
  const content = fs.readFileSync(absPath, 'utf8');
  const hasFileURLToPath = content.includes('fileURLToPath');
  const hasUrlImport =
    /import\s+.*\s+from\s+['"]url['"]/.test(content) || /require\(['"]url['"]\)/.test(content);
  const hasEsmShims = content.includes('init_esm_shims');

  assert(!hasFileURLToPath, `${relFile} has NO fileURLToPath references`);
  assert(!hasUrlImport, `${relFile} has NO 'url' imports`);
  assert(!hasEsmShims, `${relFile} has NO tsup init_esm_shims() injection`);
}

// 3. Test CommonJS Requiring
logStep('CommonJS resolution and execution');
try {
  const core = require(path.resolve(rootDir, 'packages/core/dist/index.cjs'));
  assert(typeof core === 'function', '@bsday.js/core is callable function in CJS');
  assert(typeof core.bs === 'function', '@bsday.js/core bs() method works');
  assert(typeof core.BSDay === 'function', '@bsday.js/core named export BSDay is available');
  assert(
    typeof core.isValidBSDate === 'function',
    '@bsday.js/core named export isValidBSDate is available',
  );
  assert(
    typeof core.getBsMonthDays === 'function',
    '@bsday.js/core named export getBsMonthDays is available',
  );
  assert(
    typeof core.getCalendarMatrix === 'function',
    '@bsday.js/core named export getCalendarMatrix is available',
  );

  const d = core.bs(2081, 1, 1);
  assert(
    d.format('YYYY-MM-DD') === '2081-01-01',
    `@bsday.js/core date formatting works (${d.format('YYYY-MM-DD')})`,
  );

  const dataset = require(path.resolve(rootDir, 'packages/dataset/dist/index.cjs'));
  assert(
    typeof dataset.ACCURATE_BS_MONTH_TABLE === 'object',
    '@bsday.js/dataset exports ACCURATE_BS_MONTH_TABLE in CJS',
  );
  assert(
    typeof dataset.FestivalEngine === 'function',
    '@bsday.js/dataset exports FestivalEngine in CJS',
  );

  const all = require(path.resolve(rootDir, 'packages/dataset/dist/all.cjs'));
  assert(
    typeof all.dataset === 'object' && all.dataset['2081-01-01'],
    '@bsday.js/dataset/all exports 111-year dataset in CJS',
  );
  assert(
    typeof all.datasetNepali === 'object' && all.datasetNepali['2081-01-01'],
    '@bsday.js/dataset/all exports Nepali dataset in CJS',
  );

  const monthData = require(path.resolve(rootDir, 'packages/dataset/dist/monthData.cjs'));
  assert(
    Array.isArray(monthData.ACCURATE_BS_MONTH_TABLE[2081]),
    '@bsday.js/dataset/month-data exports ACCURATE_BS_MONTH_TABLE in CJS',
  );

  const panchang = require(path.resolve(rootDir, 'packages/dataset/dist/panchang-engine.cjs'));
  assert(
    typeof panchang.computePanchang === 'function',
    '@bsday.js/dataset/panchang-engine exports computePanchang in CJS',
  );
  const pRes = panchang.computePanchang(2460413.5);
  assert(pRes.tithi === 'Panchami', `Panchang computation verified in CJS (tithi: ${pRes.tithi})`);
} catch (err) {
  assert(false, `CJS require test threw error: ${err.message}\n${err.stack}`);
}

// 4. Test ESM Dynamic Imports
logStep('ESM dynamic import resolution and execution');
try {
  const coreUrl = pathToFileURL(path.resolve(rootDir, 'packages/core/dist/index.js')).href;
  const core = await import(coreUrl);
  assert(typeof core.default === 'function', '@bsday.js/core default export is function in ESM');
  assert(typeof core.bsday === 'function', '@bsday.js/core bsday export is function in ESM');
  assert(typeof core.BSDay === 'function', '@bsday.js/core named export BSDay is available in ESM');
  assert(
    typeof core.isValidBSDate === 'function',
    '@bsday.js/core named export isValidBSDate is available in ESM',
  );
  assert(
    typeof core.getBsMonthDays === 'function',
    '@bsday.js/core named export getBsMonthDays is available in ESM',
  );

  const datasetUrl = pathToFileURL(path.resolve(rootDir, 'packages/dataset/dist/index.js')).href;
  const dataset = await import(datasetUrl);
  assert(
    typeof dataset.ACCURATE_BS_MONTH_TABLE === 'object',
    '@bsday.js/dataset named ACCURATE_BS_MONTH_TABLE in ESM',
  );
  assert(
    typeof dataset.FestivalEngine === 'function',
    '@bsday.js/dataset named FestivalEngine in ESM',
  );

  const allUrl = pathToFileURL(path.resolve(rootDir, 'packages/dataset/dist/all.js')).href;
  const all = await import(allUrl);
  assert(
    typeof all.dataset === 'object' && all.dataset['2081-01-01'],
    '@bsday.js/dataset/all dataset in ESM',
  );
  assert(
    typeof all.datasetNepali === 'object' && all.datasetNepali['2081-01-01'],
    '@bsday.js/dataset/all datasetNepali in ESM',
  );

  const monthDataUrl = pathToFileURL(
    path.resolve(rootDir, 'packages/dataset/dist/monthData.js'),
  ).href;
  const monthData = await import(monthDataUrl);
  assert(
    Array.isArray(monthData.ACCURATE_BS_MONTH_TABLE[2081]),
    '@bsday.js/dataset/month-data in ESM',
  );

  const panchangUrl = pathToFileURL(
    path.resolve(rootDir, 'packages/dataset/dist/panchang-engine.js'),
  ).href;
  const panchang = await import(panchangUrl);
  assert(
    typeof panchang.computePanchang === 'function',
    '@bsday.js/dataset/panchang-engine computePanchang in ESM',
  );
} catch (err) {
  assert(false, `ESM import test threw error: ${err.message}\n${err.stack}`);
}

// 5. Simulated Browser Sandbox (No Node globals)
logStep('Browser VM Sandbox execution (No Node globals)');
try {
  // Test core in clean sandbox
  const coreCjsCode = fs.readFileSync(
    path.resolve(rootDir, 'packages/core/dist/index.cjs'),
    'utf8',
  );
  const sandboxCore = {
    module: { exports: {} },
    exports: {},
    console: console,
    Math: Math,
    Date: Date,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
  };
  vm.createContext(sandboxCore);
  vm.runInContext(coreCjsCode, sandboxCore);
  assert(
    typeof sandboxCore.module.exports === 'function',
    'Core CJS runs in pure browser sandbox without process/node globals',
  );

  // Test dataset in clean sandbox
  const datasetCjsCode = fs.readFileSync(
    path.resolve(rootDir, 'packages/dataset/dist/index.cjs'),
    'utf8',
  );
  const sandboxDataset = {
    module: { exports: {} },
    exports: {},
    console: console,
    Math: Math,
    Date: Date,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
  };
  vm.createContext(sandboxDataset);
  vm.runInContext(datasetCjsCode, sandboxDataset);
  assert(
    typeof sandboxDataset.module.exports.FestivalEngine === 'function',
    'Dataset CJS runs in pure browser sandbox without process/node globals',
  );
} catch (err) {
  assert(false, `Browser sandbox test threw error: ${err.message}\n${err.stack}`);
}

if (failed) {
  console.error('\n\x1b[31m✖ Dist check failed! Do not publish.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\n\x1b[32m✔ All pre-publish dist verification checks passed successfully!\x1b[0m\n');
  process.exit(0);
}
