const { test } = require('node:test');
const assert = require('node:assert');
const {
  parseRosterRow,
  parsePosition,
  parseTeamAbbreviation,
  parseOpponent,
} = require('./roster-page');

test('parsePosition extracts the position from "Team - POS" text', () => {
  assert.strictEqual(parsePosition('Buf - QB'), 'QB');
});

test('parsePosition returns null when there is no "Team - POS" text (empty slot)', () => {
  assert.strictEqual(parsePosition(''), null);
});

test('parseTeamAbbreviation extracts the team code from "Team - POS" text', () => {
  assert.strictEqual(parseTeamAbbreviation('Buf - QB'), 'Buf');
});

test('parsePosition and parseTeamAbbreviation handle a DEF row (live-verified 2026-08-26)', () => {
  // Live-verified against https://football.fantasysports.yahoo.com/f1/109715/2?week=1 —
  // a DEF row's td.player span.Fz-xxs text is "Min - DEF", same delimited format as
  // every other position. (A different, unrelated page — draft-room-page.js's draft
  // room — glues DEF names together with no delimiter; that does NOT apply here.)
  assert.strictEqual(parsePosition('Min - DEF'), 'DEF');
  assert.strictEqual(parseTeamAbbreviation('Min - DEF'), 'Min');
});

test('parseOpponent extracts the trailing team code from Yahoo schedule text', () => {
  assert.strictEqual(parseOpponent('Sun 10:00 am @ Hou'), 'Hou');
  assert.strictEqual(parseOpponent('Sun 1:00 pm vs NE'), 'NE');
  assert.strictEqual(parseOpponent(''), null);
});

test('parseRosterRow extracts position, selected_position, team, opponent, name, and points', () => {
  const raw = {
    slot: 'QB',
    playerName: 'Josh Allen',
    points: '24.50',
    position: 'QB',
    teamAbbreviation: 'Buf',
    opponent: 'Hou',
    yahooPlayerId: '30977',
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'QB',
    playerName: 'Josh Allen',
    position: 'QB',
    teamAbbreviation: 'Buf',
    opponent: 'Hou',
    yahooPlayerId: '30977',
    points: 24.5,
  });
});

test('parseRosterRow handles an empty bench slot', () => {
  const raw = {
    slot: 'BN', playerName: '', points: '',
    position: null, teamAbbreviation: null, opponent: null, yahooPlayerId: null,
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'BN',
    playerName: null,
    position: null,
    teamAbbreviation: null,
    opponent: null,
    yahooPlayerId: null,
    points: null,
  });
});

test('parseRosterRow carries yahooPlayerId through when present', () => {
  const raw = {
    slot: 'QB', playerName: 'Josh Allen', points: '24.50',
    position: 'QB', teamAbbreviation: 'Buf', opponent: 'Hou', yahooPlayerId: '30977',
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'QB', playerName: 'Josh Allen', position: 'QB',
    teamAbbreviation: 'Buf', opponent: 'Hou', yahooPlayerId: '30977', points: 24.5,
  });
});

test('parseRosterRow defaults yahooPlayerId to null for an empty slot', () => {
  const raw = {
    slot: 'BN', playerName: '', points: '',
    position: null, teamAbbreviation: null, opponent: null, yahooPlayerId: null,
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'BN', playerName: null, position: null,
    teamAbbreviation: null, opponent: null, yahooPlayerId: null, points: null,
  });
});

