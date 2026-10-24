// yahoo/grade-league-decisions.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { snapshotFromRosters, decisionPairs, summarize, WINDOWS } = require('./grade-league-decisions');

// Stand-in for scout-league.js's buildEcrIndex(): positional and FLEX ranks by name.
function fakeIndex(pos, flex) {
  return {
    pos: (p) => (p.playerName in pos ? { ecr: pos[p.playerName] } : null),
    flex: (p) => (p.playerName in flex ? { ecr: flex[p.playerName] } : null),
  };
}

test('snapshotFromRosters records each rostered player\'s ECR and FLEX ECR, FLEX only for RB/WR/TE', () => {
  const snap = snapshotFromRosters(
    [{ teamId: '1', teamName: 'Gospel', roster: [
      { playerName: 'Keenan Allen', position: 'WR' },
      { playerName: 'Jordan Love', position: 'QB' },
      { playerName: null, position: null },
    ] }],
    fakeIndex({ 'Keenan Allen': 34, 'Jordan Love': 3 }, { 'Keenan Allen': 70, 'Jordan Love': 1 }),
  );
  assert.deepEqual(snap.teams['1'].players['keenan allen'], { name: 'Keenan Allen', position: 'WR', ecr: 34, flexEcr: 70 });
  assert.deepEqual(snap.teams['1'].players['jordan love'], { name: 'Jordan Love', position: 'QB', ecr: 3, flexEcr: null });
});

test('decisionPairs compares each starter with every eligible ranked bench player, scoring the ECR favorite raw and ex-TD', () => {
  const finalRoster = [
    { selected_position: 'W/R/T', playerName: 'Josh Downs', position: 'WR', points: 6.2, injuryStatus: null },
    { selected_position: 'QB', playerName: 'Jordan Love', position: 'QB', points: 20, injuryStatus: null },
    { selected_position: 'BN', playerName: 'Keenan Allen', position: 'WR', points: 11.0, injuryStatus: null },
    { selected_position: 'BN', playerName: 'James Cook III', position: 'RB', points: 0, injuryStatus: null },
  ];
  const snapshot = snapshotFromRosters([{ teamId: '1', teamName: 'Gospel', roster: finalRoster }],
    fakeIndex({ 'Josh Downs': 37, 'Keenan Allen': 34, 'Jordan Love': 3 }, { 'Josh Downs': 79, 'Keenan Allen': 70 }));
  const pairs = decisionPairs({
    week: 7, teamId: '1', teamName: 'Gospel', finalRoster, snapshot, tdsByName: new Map([['keenan allen', 1]]),
  });
  // Cook has no rank (bye), and no QB is on the bench: one pair.
  assert.equal(pairs.length, 1);
  assert.deepEqual(pairs[0], {
    week: 7, teamId: '1', team: 'Gospel', slot: 'W/R/T', group: 'FLEX',
    starter: 'Josh Downs', starterRank: 79, starterPts: 6.2,
    bench: 'Keenan Allen', benchRank: 70, benchPts: 11.0,
    gap: 9, window: WINDOWS.FLEX, insideWindow: true,
    managerFollowedEcr: false, favorite: 'Keenan Allen',
    favoriteWon: true, favoriteWonExTd: false,
    pointsLostVsFavorite: 4.8,
  });
});

test('decisionPairs skips Out/IR players on either side, and treats a tie as no result', () => {
  const finalRoster = [
    { selected_position: 'RB', playerName: 'A', position: 'RB', points: 8 },
    { selected_position: 'BN', playerName: 'B', position: 'RB', points: 8 },
    { selected_position: 'BN', playerName: 'C', position: 'RB', points: 0, injuryStatus: 'O' },
  ];
  const snapshot = snapshotFromRosters([{ teamId: '2', teamName: 'Us', roster: finalRoster }],
    fakeIndex({ A: 10, B: 12, C: 5 }, {}));
  const pairs = decisionPairs({ week: 8, teamId: '2', teamName: 'Us', finalRoster, snapshot, tdsByName: new Map() });
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].bench, 'B');
  assert.equal(pairs[0].managerFollowedEcr, true);
  assert.equal(pairs[0].favoriteWon, null);
  assert.equal(pairs[0].pointsLostVsFavorite, 0);
});

test('summarize reports how often the ECR favorite won, by group and inside/outside the tie window', () => {
  const p = (group, insideWindow, favoriteWon, favoriteWonExTd, managerFollowedEcr, pointsLostVsFavorite) =>
    ({ group, insideWindow, favoriteWon, favoriteWonExTd, managerFollowedEcr, pointsLostVsFavorite });
  const rows = summarize([
    p('TE', true, true, true, true, 0),
    p('TE', true, false, true, false, -3),
    p('TE', false, true, true, false, 7),
    p('TE', true, null, null, true, 0),
  ]);
  assert.deepEqual(rows.find((r) => r.group === 'TE' && r.insideWindow), {
    group: 'TE', insideWindow: true, n: 2, favoriteWon: 1, favoriteWonPct: 50, favoriteWonExTd: 2, favoriteWonExTdPct: 100,
    againstEcr: 1, againstEcrPointsLost: -3,
  });
  assert.deepEqual(rows.find((r) => r.group === 'TE' && !r.insideWindow), {
    group: 'TE', insideWindow: false, n: 1, favoriteWon: 1, favoriteWonPct: 100, favoriteWonExTd: 1, favoriteWonExTdPct: 100,
    againstEcr: 1, againstEcrPointsLost: 7,
  });
});
