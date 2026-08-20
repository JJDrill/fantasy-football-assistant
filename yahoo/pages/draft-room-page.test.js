const { test } = require('node:test');
const assert = require('node:assert');
const { classifyTurnState } = require('./draft-room-page');
const { parseAvailablePlayerRow } = require('./draft-room-page');

test('classifyTurnState recognizes our turn', () => {
  assert.strictEqual(classifyTurnState('YOUR TURN, DRAFT NOW | Live NFL Draft | Yahoo Fantasy Sports'), 'ours');
});

test('classifyTurnState recognizes waiting on other teams', () => {
  assert.strictEqual(classifyTurnState('6 picks until your turn | Live NFL Draft | Yahoo Fantasy Sports'), 'waiting');
});

test('classifyTurnState recognizes the draft finishing', () => {
  assert.strictEqual(classifyTurnState('Live NFL Draft | Yahoo Fantasy Sports'), 'unknown');
  assert.strictEqual(classifyTurnState('Draft Complete'), 'complete');
});

test('classifyTurnState handles the singular "1 pick" case', () => {
  assert.strictEqual(classifyTurnState('1 pick until your turn | Live NFL Draft | Yahoo Fantasy Sports'), 'waiting');
});

test('parseAvailablePlayerRow extracts name/position/team/bye and reuses the standard name-cell format', () => {
  const raw = {
    nameCellText: 'J. Gibbs J. Gibbs RB • Det • Bye 6',
    projPts: '297.7',
  };
  const result = parseAvailablePlayerRow(raw);
  assert.deepStrictEqual(result, {
    name: 'J. Gibbs',
    position: 'RB',
    nflTeam: 'Det',
    projPts: 297.7,
  });
});
