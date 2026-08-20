// yahoo/draft/strategy.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { pickPlayer } = require('./strategy');

const STARTING_SLOTS = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'W/R/T'];
const TOTAL_ROUNDS = 15;

function emptyRoster() {
  return [
    { slot: 'QB', playerName: null },
    { slot: 'WR', playerName: null },
    { slot: 'WR', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'TE', playerName: null },
    { slot: 'W/R/T', playerName: null },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
    { slot: 'BN', playerName: null },
  ];
}

test('early round: picks best player available regardless of position', () => {
  const available = [
    { name: 'A', position: 'RB', projPts: 300 },
    { name: 'B', position: 'QB', projPts: 350 },
  ];
  const result = pickPlayer(available, emptyRoster(), { currentRound: 1 });
  assert.strictEqual(result.name, 'B');
});

test('early round: excludes K and DEF even if top-ranked', () => {
  const available = [
    { name: 'BestDef', position: 'DEF', projPts: 999 },
    { name: 'B', position: 'QB', projPts: 350 },
  ];
  const result = pickPlayer(available, emptyRoster(), { currentRound: 1 });
  assert.strictEqual(result.name, 'B');
});

test('once starting lineup is full: picks best player at a still-needed position', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: null },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
  ];
  const available = [
    { name: 'BestOverall', position: 'RB', projPts: 400 },
    { name: 'BestTE', position: 'TE', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 8 });
  assert.strictEqual(result.name, 'BestTE');
});

test('once starting lineup is full and no open non-bench slot matches, best player fills bench', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
  ];
  const available = [
    { name: 'BestOverall', position: 'RB', projPts: 400 },
    { name: 'Worse', position: 'WR', projPts: 100 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 8 });
  assert.strictEqual(result.name, 'BestOverall');
});

test('final two rounds: takes best K or DEF if those slots are still open', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
  ];
  const available = [
    { name: 'BestKicker', position: 'K', projPts: 120 },
    { name: 'MarginalBenchPlayer', position: 'WR', projPts: 50 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 14 });
  assert.strictEqual(result.name, 'BestKicker');
});

test('mid-draft with several starting slots still open: still picks pure BPA, not restricted to open needs', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: null },
    { slot: 'WR', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'TE', playerName: null },
    { slot: 'W/R/T', playerName: null },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
  ];
  const available = [
    { name: 'BackupQB', position: 'QB', projPts: 250 }, // QB already filled, not a starting "need"
    { name: 'DecentRB', position: 'RB', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 3 });
  assert.strictEqual(result.name, 'BackupQB'); // still pure BPA this early — 6 starting slots still open, above threshold
});

test('throws if available list is empty', () => {
  assert.throws(() => pickPlayer([], emptyRoster(), { currentRound: 1 }), /no available players/i);
});
