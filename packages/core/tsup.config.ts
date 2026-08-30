import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  shims: false,
  clean: true,
  splitting: false,
  target: 'es2020',
  // In CJS, attach all named exports onto default export function and assign to module.exports
  // enabling both `const bsday = require('@bsday.js/core')` and `const { isValidBSDate, BSDay } = require('@bsday.js/core')`
  footer({ format }) {
    if (format === 'cjs') {
      return {
        js: `
if (typeof module !== 'undefined' && module.exports && typeof module.exports.default !== 'undefined') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
`,
      };
    }
  },
});
