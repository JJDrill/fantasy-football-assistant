const { test } = require('node:test');
const assert = require('node:assert');
const { PROFILE_DIR } = require('./browser');
const path = require('node:path');

test('PROFILE_DIR points inside the yahoo/ directory', () => {
  assert.strictEqual(path.basename(PROFILE_DIR), '.playwright-profile');
  assert.strictEqual(path.dirname(PROFILE_DIR), __dirname);
});
