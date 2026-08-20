const { test } = require('node:test');
const assert = require('node:assert');
const { classifyTurnState } = require('./draft-room-page');
const { parseAvailablePlayerRow } = require('./draft-room-page');
const { parseRosterPanelSlot } = require('./draft-room-page');
const { dialogMatchesPlayer } = require('./draft-room-page');

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

test('parseAvailablePlayerRow handles a team defense row (no separate team-abbreviation token)', () => {
  const raw = { nameCellText: 'TexansDEFBye 8', projPts: '118.66' };
  const result = parseAvailablePlayerRow(raw);
  assert.strictEqual(result.name, 'Texans');
  assert.strictEqual(result.position, 'DEF');
  assert.strictEqual(result.projPts, 118.66);
});

test('parseRosterPanelSlot extracts a filled slot', () => {
  const raw = { slotLabel: 'QB', playerName: 'L. Jackson' };
  assert.deepStrictEqual(parseRosterPanelSlot(raw), { slot: 'QB', playerName: 'L. Jackson' });
});

test('parseRosterPanelSlot handles an open slot', () => {
  const raw = { slotLabel: 'TE', playerName: null };
  assert.deepStrictEqual(parseRosterPanelSlot(raw), { slot: 'TE', playerName: null });
});

test('parseRosterPanelSlot normalizes the flex slot label WRT to W/R/T', () => {
  const raw = { slotLabel: 'WRT', playerName: null };
  assert.deepStrictEqual(parseRosterPanelSlot(raw), { slot: 'W/R/T', playerName: null });
});

test('dialogMatchesPlayer matches on surname despite the dialog using the full first name', () => {
  // Live-verified (2026-08-20, mock draft room): the detail dialog for "J. Jefferson"
  // rendered "Justin" and "Jefferson" as separate elements, never the abbreviated "J."
  // form used in the available-players table.
  const dialogText = 'JustinJeffersonWide Receiver • Minnesota Vikings • Bye 6221.05Proj Pts';
  assert.strictEqual(dialogMatchesPlayer(dialogText, 'J. Jefferson'), true);
});

test('dialogMatchesPlayer matches a DEF row whose "name" is just the team name', () => {
  const dialogText = 'Texans Defense/Special Teams118.66Proj Pts';
  assert.strictEqual(dialogMatchesPlayer(dialogText, 'Texans'), true);
});

test('dialogMatchesPlayer rejects a dialog for a different player', () => {
  const dialogText = 'JoshAllenQuarterback • Buffalo Bills • Bye 7';
  assert.strictEqual(dialogMatchesPlayer(dialogText, 'J. Jefferson'), false);
});
