const { test } = require('node:test');
const assert = require('node:assert');
const {
  parseRosterRow,
  parsePosition,
  parseTeamAbbreviation,
  parseOpponent,
  parseStatNumber,
  extractCategoryStats,
  mergeRosterStats,
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

test('parseStatNumber treats "-" and blank as 0, and strips thousands separators', () => {
  assert.strictEqual(parseStatNumber('-'), 0);
  assert.strictEqual(parseStatNumber(''), 0);
  assert.strictEqual(parseStatNumber('3,668'), 3668);
  assert.strictEqual(parseStatNumber('49'), 49);
});

test('extractCategoryStats reads Bye/Int/receiving Yds from the offense table header layout', () => {
  const headers = ['Pos', 'Edit', 'Offense', 'Bye', 'Fan Pts', '% Start', '% Ros', 'Yds', 'TD', 'Int', 'Att*', 'Yds', 'TD', 'Tgt*', 'Rec', 'Yds', 'TD', 'TD', '2PT', 'Lost', ''];
  const cells = ['QB', 'QBBN', 'Josh Allen', '7', '374.62', '96%', '100%', '3,668', '25', '10', '112', '579', '14', '0', '0', '0', '0', '0', '1', '3', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 7, int: 10, 'rec yds': 0 });
});

test('extractCategoryStats reads Bye/Sack/Int from the DEF table header layout', () => {
  const headers = ['Pos', 'Edit', 'Defense/Special Teams', 'Bye', 'Fan Pts', '% Start', '% Ros', 'Pts vs.*', 'Sack', 'Safe', 'Int', 'Fum Rec', 'TD', 'Blk Kick', 'TD', ''];
  const cells = ['DEF', 'DEFBN', 'Vikings', '6', '136.00', '75%', '84%', '309', '49', '0', '8', '13', '2', '2', '0', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 6, int: 8, sack: 49 });
});

test('extractCategoryStats reads only Bye when a table has none of the other tracked columns (kickers)', () => {
  const headers = ['Pos', 'Edit', 'Kickers', 'Bye', 'Fan Pts', '% Start', '% Ros', '0‑19', '20‑29', '30‑39', '40‑49', '50+', 'Made', ''];
  const cells = ['K', 'KBN', 'Eddy Pineiro', '8', '140.00', '60%', '64%', '0', '5', '7', '10', '6', '34', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 8 });
});

test('mergeRosterStats merges matching-length arrays by index', () => {
  const roster = [{ playerName: 'A' }, { playerName: 'B' }];
  const statsArray = [{ int: 1 }, { sack: 2 }];
  const result = mergeRosterStats(roster, statsArray);
  assert.deepStrictEqual(result, [{ playerName: 'A', int: 1 }, { playerName: 'B', sack: 2 }]);
});

test('mergeRosterStats throws on a row-count mismatch instead of silently merging a partial result', () => {
  const roster = [{ playerName: 'A' }, { playerName: 'B' }, { playerName: 'C' }];
  const statsArray = [{ int: 1 }, { sack: 2 }];
  assert.throws(() => mergeRosterStats(roster, statsArray), /ROSTER_STATS_MISMATCH/);
});
