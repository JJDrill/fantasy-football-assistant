const { test } = require('node:test');
const assert = require('node:assert');
const { parseRosterRow } = require('./roster-page');

test('parseRosterRow extracts slot, player name, and points', () => {
  const raw = { slot: 'QB', playerName: 'Josh Allen', points: '24.50' };
  assert.deepStrictEqual(parseRosterRow(raw), {
    slot: 'QB',
    playerName: 'Josh Allen',
    points: 24.5,
  });
});

test('parseRosterRow handles an empty bench slot', () => {
  const raw = { slot: 'BN', playerName: '', points: '' };
  assert.deepStrictEqual(parseRosterRow(raw), {
    slot: 'BN',
    playerName: null,
    points: null,
  });
});
