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

test('mid-draft with several starting slots still open: still picks pure BPA among non-QB positions, not restricted to open needs', () => {
  const roster = [
    { slot: 'QB', playerName: null },
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
    { name: 'TopTE', position: 'TE', projPts: 250 }, // not a filled slot's position, still fair game
    { name: 'DecentRB', position: 'RB', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 3 });
  assert.strictEqual(result.name, 'TopTE'); // still pure BPA this early — 6 starting slots still open, above threshold
});

// Live-verified (2026-08-20, mock draft): Yahoo's "Proj Pts" is a raw season point total,
// not position-scarcity-adjusted — a startable QB projects far higher than a comparably
// good RB/WR/TE, so an un-restricted BPA rule keeps taking QB after QB once one is already
// rostered. Once the starting QB slot is filled, QB must drop out of the BPA pool the same
// way K/DEF already do, even though several other starting slots remain open.
test('BPA phase: excludes QB once the starting QB slot is filled, even with slots still open', () => {
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
    { name: 'BackupQB', position: 'QB', projPts: 270 }, // highest raw points, but QB already filled
    { name: 'DecentRB', position: 'RB', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 3 });
  assert.strictEqual(result.name, 'DecentRB');
});

test('BPA phase: QB is still fair game before the starting QB slot is filled', () => {
  const roster = [
    { slot: 'QB', playerName: null },
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
    { name: 'TopQB', position: 'QB', projPts: 270 },
    { name: 'DecentRB', position: 'RB', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 1 });
  assert.strictEqual(result.name, 'TopQB');
});

// Live-verified (2026-08-20, mock draft): the QB exclusion above must hold even after the
// starting lineup is completely full and picking has fallen through to pure bench-value
// BPA (`byValueDesc[0]`) — a live test drafted a 5th QB at exactly this point, since raw
// Proj Pts still ranks backup QBs above bench RB/WR/TE with no positional-need filter left
// to stop it.
test('bench-fill phase (starting lineup full): still excludes QB even though nothing is "needed"', () => {
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
    { name: 'BackupQB', position: 'QB', projPts: 260 }, // highest raw points, but must stay excluded
    { name: 'BenchRB', position: 'RB', projPts: 120 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 11 });
  assert.strictEqual(result.name, 'BenchRB');
});

// Live-verified (2026-08-20, mock draft): with K already filled and DEF still open in the
// final rounds, the strategy still drafted a SECOND kicker (higher raw Proj Pts than any
// available DEF) straight into a bench slot, leaving the real DEF need unfilled — because
// K/DEF live outside STARTING_SLOTS and the old need-matching pass only ever looked at
// STARTING_SLOTS. This must not regress: DEF has to win once K is already filled.
test('final rounds: needed DEF is picked over a duplicate K once K is already filled', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: 'Filled' },
    { slot: 'DEF', playerName: null },
  ];
  const available = [
    { name: 'SecondKicker', position: 'K', projPts: 150 }, // higher raw points, but K slot already filled
    { name: 'NeededDef', position: 'DEF', projPts: 105 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 15, totalRounds: 15 });
  assert.strictEqual(result.name, 'NeededDef');
});

// Symmetric case: DEF already filled, K still open — K must win over a redundant DEF pickup.
test('final rounds: needed K is picked over a duplicate DEF once DEF is already filled', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: 'Filled' },
  ];
  const available = [
    { name: 'SecondDef', position: 'DEF', projPts: 110 }, // higher raw points, but DEF slot already filled
    { name: 'NeededK', position: 'K', projPts: 95 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 15, totalRounds: 15 });
  assert.strictEqual(result.name, 'NeededK');
});

test('throws if available list is empty', () => {
  assert.throws(() => pickPlayer([], emptyRoster(), { currentRound: 1 }), /no available players/i);
});
