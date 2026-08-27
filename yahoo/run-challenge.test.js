const { test } = require('node:test');
const assert = require('node:assert');
const { attachMatchupResult, buildMatchups, toChallengePlayer } = require('./run-challenge');

test('attachMatchupResult: teamA winner returns isWinner true and its own score as teamTotal', () => {
  const team = { teamId: 'A1' };
  const pairings = [
    { teamAId: 'A1', teamAName: 'Team A', teamAScore: 120, teamBId: 'B1', teamBName: 'Team B', teamBScore: 100 },
  ];
  const result = attachMatchupResult(team, pairings);
  assert.deepStrictEqual(result, { isWinner: true, teamTotal: 120 });
});

test('attachMatchupResult: teamB loser returns isWinner false', () => {
  const team = { teamId: 'B1' };
  const pairings = [
    { teamAId: 'A1', teamAName: 'Team A', teamAScore: 120, teamBId: 'B1', teamBName: 'Team B', teamBScore: 100 },
  ];
  const result = attachMatchupResult(team, pairings);
  assert.deepStrictEqual(result, { isWinner: false, teamTotal: 100 });
});

test('attachMatchupResult: no matching pairing returns nulls', () => {
  const team = { teamId: 'C1' };
  const pairings = [
    { teamAId: 'A1', teamAName: 'Team A', teamAScore: 120, teamBId: 'B1', teamBName: 'Team B', teamBScore: 100 },
  ];
  const result = attachMatchupResult(team, pairings);
  assert.deepStrictEqual(result, { isWinner: null, teamTotal: null });
});

test('buildMatchups maps pairings into a teams array shape', () => {
  const pairings = [
    { teamAId: 'A1', teamAName: 'Team A', teamAScore: 120, teamBId: 'B1', teamBName: 'Team B', teamBScore: 100 },
    { teamAId: 'C1', teamAName: 'Team C', teamAScore: 80, teamBId: 'D1', teamBName: 'Team D', teamBScore: 90 },
  ];
  const result = buildMatchups(pairings);
  assert.deepStrictEqual(result, [
    { teams: [{ team_name: 'Team A', score: 120 }, { team_name: 'Team B', score: 100 }] },
    { teams: [{ team_name: 'Team C', score: 80 }, { team_name: 'Team D', score: 90 }] },
  ]);
});

test('toChallengePlayer renames playerName to name and drops teamAbbreviation/opponent/bye', () => {
  const rosterEntry = {
    playerName: 'J. Allen',
    selected_position: 'QB',
    position: 'QB',
    teamAbbreviation: 'BUF',
    opponent: 'MIA',
    bye: 12,
    points: 25.4,
    int: 1,
  };
  const result = toChallengePlayer(rosterEntry);
  assert.deepStrictEqual(result, {
    name: 'J. Allen',
    selected_position: 'QB',
    position: 'QB',
    points: 25.4,
    int: 1,
  });
});

test('toChallengePlayer handles an empty bench slot without throwing', () => {
  const rosterEntry = {
    playerName: null,
    selected_position: 'BN',
    position: null,
    teamAbbreviation: null,
    opponent: null,
    bye: null,
    points: null,
  };
  const result = toChallengePlayer(rosterEntry);
  assert.deepStrictEqual(result, {
    name: null,
    selected_position: 'BN',
    position: null,
    points: null,
  });
});
