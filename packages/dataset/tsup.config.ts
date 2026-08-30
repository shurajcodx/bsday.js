import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    all: 'src/all.ts',
    monthData: 'src/monthData.ts',
    'panchang-engine': 'src/panchang-engine.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  shims: false,
  target: 'es2020',
  external: ['swisseph-v2', 'path', 'url', 'fs'],
});
