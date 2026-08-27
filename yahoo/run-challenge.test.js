const { test } = require('node:test');
const assert = require('node:assert');
const { attachMatchupResult, buildMatchups, toChallengePlayer, enrichWithSleeperStats } = require('./run-challenge');

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

test('toChallengePlayer renames playerName to name and drops teamAbbreviation/opponent/yahooPlayerId', () => {
  const rosterEntry = {
    playerName: 'J. Allen',
    selected_position: 'QB',
    position: 'QB',
    teamAbbreviation: 'BUF',
    opponent: 'MIA',
    yahooPlayerId: '30977',
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

test('enrichWithSleeperStats merges QB stats via yahooPlayerId -> playersMap -> weekStats', () => {
  const player = { position: 'QB', yahooPlayerId: '30977', playerName: 'Josh Allen' };
  const playersMap = new Map([['30977', { sleeperId: '6789', position: 'QB', team: 'BUF' }]]);
  const weekStats = new Map([['6789', { pass_int: 2, pass_inc: 10, pass_lng: 40 }]]);

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, {
    position: 'QB', yahooPlayerId: '30977', playerName: 'Josh Allen',
    int: 2, inc: 10, lng: 40,
  });
});

test('enrichWithSleeperStats merges DEF stats via uppercased teamAbbreviation', () => {
  const player = { position: 'DEF', teamAbbreviation: 'Buf', playerName: 'Bills' };
  const playersMap = new Map();
  const weekStats = new Map([['BUF', { sack: 3 }]]);

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, { position: 'DEF', teamAbbreviation: 'Buf', playerName: 'Bills', sack: 3 });
});

test('enrichWithSleeperStats leaves the player unchanged when there is no match', () => {
  const player = { position: 'QB', yahooPlayerId: '99999', playerName: 'Nobody' };
  const playersMap = new Map();
  const weekStats = new Map();

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, { position: 'QB', yahooPlayerId: '99999', playerName: 'Nobody' });
});

test('enrichWithSleeperStats leaves an empty roster slot unchanged (no yahooPlayerId, no teamAbbreviation)', () => {
  const player = { position: null, playerName: null, selected_position: 'BN' };
  enrichWithSleeperStats(player, { playersMap: new Map(), weekStats: new Map() });
  assert.deepStrictEqual(player, { position: null, playerName: null, selected_position: 'BN' });
});
