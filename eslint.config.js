const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // ESLint doesn't read .gitignore; mirror its scratch/browser-profile dirs here.
  { ignores: ['.temp/**', '**/.playwright-profile/**', '.playwright-mcp/**', 'yahoo/.cache/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      // Browser globals cover code passed to Playwright's page.evaluate().
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // Destructuring fields out just to drop them from `...rest` is intentional.
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
];
