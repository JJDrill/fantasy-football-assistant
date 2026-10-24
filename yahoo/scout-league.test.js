// yahoo/scout-league.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeTeam, seasonSummary, buildEcrIndex, slotEligible, lineupFlags, forecast,
} = require('./scout-league');

const pairing = (aId, aScore, bId, bScore) => ({
  teamAId: aId, teamAName: `T${aId}`, teamAScore: aScore,
  teamBId: bId, teamBName: `T${bId}`, teamBScore: bScore,
});

test('normalizeTeam folds Yahoo/FantasyPros/Sleeper spellings onto one code', () => {
  assert.equal(normalizeTeam('Jax'), 'JAX');
  assert.equal(normalizeTeam('JAC'), 'JAX');
  assert.equal(normalizeTeam('WSH'), 'WAS');
  assert.equal(normalizeTeam('LAR'), 'LAR');
  assert.equal(normalizeTeam(null), null);
});

test('seasonSummary computes record, average, close games and weeks above the league median', () => {
  const weeks = [
    { week: 1, pairings: [pairing('1', 98.36, '2', 100.12), pairing('3', 120, '4', 130)] },
    { week: 2, pairings: [pairing('1', 111, '3', 90), pairing('2', 80, '4', 70)] },
  ];
  const s = seasonSummary('1', weeks);
  assert.deepEqual(s.scores, [98.36, 111]);
  assert.equal(s.wins, 1);
  assert.equal(s.losses, 1);
  assert.equal(s.avg, 104.68);
  assert.deepEqual(s.closeLosses, [1.76]);
  assert.deepEqual(s.closeWins, []);
  // Wk1 median of 98.36/100.12/120/130 = 110.06 (below); Wk2 median of 111/90/80/70 = 85 (above).
  assert.equal(s.weeksAboveMedian, 1);
  assert.deepEqual(s.opponents, ['T2', 'T3']);
});

test('seasonSummary skips unplayed weeks (both scores 0)', () => {
  const weeks = [
    { week: 1, pairings: [pairing('1', 100, '2', 90)] },
    { week: 2, pairings: [pairing('1', 0, '2', 0)] },
  ];
  const s = seasonSummary('1', weeks);
  assert.deepEqual(s.scores, [100]);
  assert.equal(s.wins, 1);
});

test('buildEcrIndex looks players up by position and name, DEF by team, FLEX by name', () => {
  const idx = buildEcrIndex({
    WR: { players: [{ name: 'Puka Nacua', team: 'LAR', ecr: 1, best: 1, worst: 5 }] },
    DST: { players: [{ name: 'New England Patriots', team: 'NE', ecr: 16, best: 7, worst: 25 }] },
    FLEX: { players: [{ name: 'Puka Nacua', team: 'LAR', ecr: 2, best: 2, worst: 12 }] },
  });
  assert.equal(idx.pos({ playerName: 'Puka Nacua', position: 'WR', teamAbbreviation: 'LAR' }).ecr, 1);
  assert.equal(idx.pos({ playerName: 'Patriots', position: 'DEF', teamAbbreviation: 'NE' }).ecr, 16);
  assert.equal(idx.flex({ playerName: 'Puka Nacua', position: 'WR' }).ecr, 2);
  assert.equal(idx.pos({ playerName: 'Nobody', position: 'WR' }), null);
});

test('slotEligible maps roster slots to positions, W/R/T takes RB/WR/TE', () => {
  assert.equal(slotEligible('W/R/T', 'TE'), true);
  assert.equal(slotEligible('W/R/T', 'QB'), false);
  assert.equal(slotEligible('DEF', 'DEF'), true);
  assert.equal(slotEligible('RB', 'WR'), false);
});

test('lineupFlags reports a bench player ranked above a starter he could replace, plus inactive starters', () => {
  const rank = (p) => ({ Patriots: 16, Panthers: 8, Downs: 79, Allen: 70, Love: 3, Burrow: 6 })[p.playerName];
  const roster = [
    { selected_position: 'DEF', playerName: 'Patriots', position: 'DEF', points: 2 },
    { selected_position: 'BN', playerName: 'Panthers', position: 'DEF', points: null },
    { selected_position: 'W/R/T', playerName: 'Downs', position: 'WR', points: null },
    { selected_position: 'BN', playerName: 'Allen', position: 'WR', points: null },
    { selected_position: 'QB', playerName: 'Love', position: 'QB', points: null, injuryStatus: 'O' },
    { selected_position: 'BN', playerName: 'Burrow', position: 'QB', points: null },
    { selected_position: 'BN', playerName: null, position: null },
  ];
  const flags = lineupFlags(roster, rank);
  assert.deepEqual(flags, [
    { type: 'bench-ranked-higher', slot: 'DEF', starter: 'Patriots', starterRank: 16, bench: 'Panthers', benchRank: 8, gap: 8, locked: true },
    { type: 'bench-ranked-higher', slot: 'W/R/T', starter: 'Downs', starterRank: 79, bench: 'Allen', benchRank: 70, gap: 9, locked: false },
    { type: 'inactive-starter', slot: 'QB', starter: 'Love', status: 'O' },
  ]);
});

test('lineupFlags flags a starter on bye (no opponent)', () => {
  const roster = [{ selected_position: 'RB', playerName: 'Cook', position: 'RB', opponent: null, points: null }];
  assert.deepEqual(lineupFlags(roster, () => null), [{ type: 'bye-starter', slot: 'RB', starter: 'Cook' }]);
});

test('unplayed games (roster parser gives NaN points) are not locked, and a NaN-points bye starter is flagged', () => {
  const rank = (p) => ({ Irving: 13, Allen: 12 })[p.playerName];
  const roster = [
    { selected_position: 'RB', playerName: 'Irving', position: 'RB', opponent: 'Car', points: NaN },
    { selected_position: 'BN', playerName: 'Allen', position: 'RB', opponent: 'Mia', points: NaN },
    { selected_position: 'QB', playerName: 'Lawrence', position: 'QB', opponent: null, points: NaN },
  ];
  const flags = lineupFlags(roster, rank);
  assert.equal(flags[0].locked, false);
  // A bench player who already played locks the swap too.
  const benchPlayed = lineupFlags([
    { selected_position: 'W/R/T', playerName: 'Irving', position: 'RB', opponent: 'Car', points: NaN },
    { selected_position: 'BN', playerName: 'Allen', position: 'RB', opponent: 'Mia', points: 16.4 },
  ], rank);
  assert.equal(benchPlayed[0].locked, true);
  assert.deepEqual(flags[1], { type: 'bye-starter', slot: 'QB', starter: 'Lawrence' });
  assert.deepEqual(forecast([{ selected_position: 'RB', points: NaN, seasonAvg: 10 }]), { total: 10, banked: 0, missingAvg: 0 });
  // A starter on bye scores 0, not his season average.
  assert.deepEqual(forecast([{ selected_position: 'QB', opponent: null, points: NaN, seasonAvg: 19.7 }]), { total: 0, banked: 0, missingAvg: 0 });
});

test('forecast uses banked points for played starters and season average for the rest', () => {
  const starters = [
    { selected_position: 'WR', points: 21.7, seasonAvg: 9.6 },
    { selected_position: 'QB', points: null, seasonAvg: 19.4 },
    { selected_position: 'K', points: null, seasonAvg: null },
    { selected_position: 'BN', points: null, seasonAvg: 50 },
  ];
  assert.deepEqual(forecast(starters), { total: 41.1, banked: 21.7, missingAvg: 1 });
});
