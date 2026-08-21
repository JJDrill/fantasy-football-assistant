const { test } = require('node:test');
const assert = require('node:assert');
const { verifyFinalRoster, isSessionLostDialog } = require('./run-draft');

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

test('isSessionLostDialog recognizes a logged-off-elsewhere message', () => {
  assert.strictEqual(
    isSessionLostDialog('You have been logged off because you logged in from another draft client.'),
    true
  );
});

test('isSessionLostDialog recognizes an expired-session message', () => {
  assert.strictEqual(isSessionLostDialog('Your session has expired. Please log in again.'), true);
});

test('isSessionLostDialog does not flag a routine pick notification', () => {
  assert.strictEqual(isSessionLostDialog('DRAFTED BY David — Chase Brown, RB, Cin'), false);
});
