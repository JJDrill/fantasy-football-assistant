const { test } = require('node:test');
const assert = require('node:assert');
const { verifyFinalRoster } = require('./run-draft');

test('verifyFinalRoster reports a clean match when every click landed', () => {
  const finalRoster = [
    { slot: 'QB', playerName: 'J. Allen' },
    { slot: 'RB', playerName: null },
  ];
  const result = verifyFinalRoster(finalRoster, ['J. Allen']);
  assert.deepStrictEqual(result, {
    clickedButMissingFromFinalRoster: [],
    inFinalRosterButNeverClickedByUs: [],
  });
});

test('verifyFinalRoster flags a player we clicked but is missing from the final roster', () => {
  const finalRoster = [{ slot: 'QB', playerName: null }];
  const result = verifyFinalRoster(finalRoster, ['J. Allen']);
  assert.deepStrictEqual(result.clickedButMissingFromFinalRoster, ['J. Allen']);
});

test('verifyFinalRoster reports autopicked players as informational, not a mismatch', () => {
  const finalRoster = [
    { slot: 'QB', playerName: 'J. Allen' },
    { slot: 'K', playerName: 'AutopickedKicker' },
  ];
  const result = verifyFinalRoster(finalRoster, ['J. Allen']);
  assert.deepStrictEqual(result, {
    clickedButMissingFromFinalRoster: [],
    inFinalRosterButNeverClickedByUs: ['AutopickedKicker'],
  });
});
