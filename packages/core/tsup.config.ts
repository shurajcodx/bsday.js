import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  shims: true,
  clean: true,
  splitting: false,
  // This ensures that the CJS build sets module.exports = defaultExport
  // enabling: const bsday = require('@bsday.js/core')
  footer: {
    js: `
if (typeof module !== 'undefined' && module.exports && typeof module.exports.default !== 'undefined') {
  module.exports = module.exports.default;
}
`,
  },
});
