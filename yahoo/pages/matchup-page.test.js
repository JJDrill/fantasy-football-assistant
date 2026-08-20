const { test } = require('node:test');
const assert = require('node:assert');
const { findUserMatchup } = require('./matchup-page');

test('findUserMatchup finds the pairing containing the given team id', () => {
  const pairings = [
    { teamAId: '2', teamAName: "J's Pancakes", teamAScore: 88.2, teamBId: '4', teamBName: 'Lil Unk Rayray', teamBScore: 75.1 },
    { teamAId: '1', teamAName: 'True & Living 12th Gospel', teamAScore: 60, teamBId: '10', teamBName: 'Hash Marks Brian', teamBScore: 59 },
  ];
  const result = findUserMatchup(pairings, '2');
  assert.deepStrictEqual(result, {
    userTeamId: '2',
    userTeamName: "J's Pancakes",
    userScore: 88.2,
    opponentTeamId: '4',
    opponentTeamName: 'Lil Unk Rayray',
    opponentScore: 75.1,
  });
});

test('findUserMatchup works when the user is teamB in the pairing', () => {
  const pairings = [
    { teamAId: '1', teamAName: 'True & Living 12th Gospel', teamAScore: 60, teamBId: '2', teamBName: "J's Pancakes", teamBScore: 88.2 },
  ];
  const result = findUserMatchup(pairings, '2');
  assert.strictEqual(result.userTeamId, '2');
  assert.strictEqual(result.opponentTeamId, '1');
});
