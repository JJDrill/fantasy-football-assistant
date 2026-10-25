// yahoo/playoff-odds.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { seasonToDate, teamMeans, simulate } = require('./playoff-odds');

const pairing = (a, aScore, b, bScore) => ({ teamAId: a, teamAName: a, teamAScore: aScore, teamBId: b, teamBName: b, teamBScore: bScore });

test('seasonToDate totals wins and points from completed weeks only', () => {
  const s = seasonToDate([
    { week: 1, pairings: [pairing('A', 100, 'B', 90)] },
    { week: 2, pairings: [pairing('A', 80, 'B', 80)] },
  ]);
  assert.deepEqual(s.get('A'), { teamId: 'A', name: 'A', wins: 1.5, games: 2, pointsFor: 180 });
  assert.deepEqual(s.get('B'), { teamId: 'B', name: 'B', wins: 0.5, games: 2, pointsFor: 170 });
});

test('teamMeans regresses each team\'s average halfway to the league average and applies a boost', () => {
  const s = seasonToDate([{ week: 1, pairings: [pairing('A', 120, 'B', 80)] }]);
  const means = teamMeans(s, { regress: 0.5, boost: { B: 5 } });
  assert.equal(means.get('A'), 110);
  assert.equal(means.get('B'), 95);
});

test('simulate: a team that always outscores everyone makes the playoffs every time', () => {
  const s = seasonToDate([{ week: 1, pairings: [pairing('A', 200, 'B', 50), pairing('C', 60, 'D', 55), pairing('E', 52, 'F', 51)] }]);
  const remaining = [{ week: 2, pairings: [pairing('A', null, 'C', null), pairing('B', null, 'D', null), pairing('E', null, 'F', null)] }];
  let seed = 1;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const odds = simulate(s, remaining, { sims: 200, sd: 1, regress: 0, playoffTeams: 4, rng });
  assert.equal(odds.get('A').playoffPct, 100);
  assert.ok(odds.get('B').playoffPct < 100);
});
