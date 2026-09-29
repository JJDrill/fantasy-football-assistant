const { test } = require('node:test');
const assert = require('node:assert');
const {
  parseCount,
  parseTeamPosition,
  normalizeTrendRow,
  normalizeTransaction,
  parseTimestamp,
  buildAlerts,
} = require('./alerts-page');

test('parseCount handles plain and comma-grouped numbers, and blanks as 0', () => {
  assert.strictEqual(parseCount('76585'), 76585);
  assert.strictEqual(parseCount('76,585'), 76585);
  assert.strictEqual(parseCount('89%'), 89);
  assert.strictEqual(parseCount(''), 0);
  assert.strictEqual(parseCount(undefined), 0);
});

test('parseTeamPosition splits "Mia - RB" and handles defenses', () => {
  assert.deepStrictEqual(parseTeamPosition('Mia - RB'), { nflTeam: 'Mia', position: 'RB' });
  assert.deepStrictEqual(parseTeamPosition(' Car - DEF '), { nflTeam: 'Car', position: 'DEF' });
  assert.deepStrictEqual(parseTeamPosition(''), { nflTeam: null, position: null });
});

test('normalizeTrendRow maps the Transaction Trends cells (live column order 2026-09-29)', () => {
  // Headers: Player | % Ros | % Start | Drops | Adds | Trades | Total
  const raw = {
    playerId: '40118',
    name: "De'Von Achane",
    injuryStatus: 'IR',
    teamPosition: 'Mia - RB',
    cells: ['89%', '64%', '76585', '49', '351', '76985'],
  };
  assert.deepStrictEqual(normalizeTrendRow(raw), {
    playerId: '40118',
    name: "De'Von Achane",
    nflTeam: 'Mia',
    position: 'RB',
    injuryStatus: 'IR',
    pctRostered: 89,
    pctStarted: 64,
    drops: 76585,
    adds: 49,
    trades: 351,
    total: 76985,
  });
});

test('normalizeTrendRow treats a missing injury tag as null', () => {
  const raw = { playerId: '100005', name: 'Bears', injuryStatus: '', teamPosition: 'Chi - DEF', cells: ['9%', '7%', '205', '7698', '3', '7906'] };
  assert.strictEqual(normalizeTrendRow(raw).injuryStatus, null);
});

test('normalizeTransaction: a single drop to waivers', () => {
  const raw = {
    kind: 'move',
    iconTitles: ['Dropped Player'],
    players: [{ playerId: '40877', name: 'Xavier Worthy', teamPosition: 'KC - WR', injuryStatus: '', detail: 'To Waivers' }],
    label: '',
    teamId: '3',
    teamName: 'Knights Who Say Ni',
    timestamp: 'Sep 29, 5:55 am',
  };
  assert.deepStrictEqual(normalizeTransaction(raw), {
    type: 'drop',
    teamId: '3',
    teamName: 'Knights Who Say Ni',
    timestamp: 'Sep 29, 5:55 am',
    players: [
      { playerId: '40877', name: 'Xavier Worthy', nflTeam: 'KC', position: 'WR', injuryStatus: null, action: 'dropped', detail: 'To Waivers' },
    ],
  });
});

test('normalizeTransaction: add/drop pairs icons with players in order', () => {
  const raw = {
    kind: 'move',
    iconTitles: ['Added Player', 'Dropped Player'],
    players: [
      { playerId: '40224', name: 'Kayshon Boutte', teamPosition: 'Hou - WR', injuryStatus: '', detail: 'Free Agent' },
      { playerId: '40915', name: 'Adonai Mitchell', teamPosition: 'NYJ - WR', injuryStatus: 'O', detail: 'To Waivers' },
    ],
    label: '',
    teamId: '1',
    teamName: 'True & Living 12th Gospel',
    timestamp: 'Sep 26, 6:19 am',
  };
  const result = normalizeTransaction(raw);
  assert.strictEqual(result.type, 'add/drop');
  assert.deepStrictEqual(result.players.map((p) => [p.name, p.action, p.injuryStatus]), [
    ['Kayshon Boutte', 'added', null],
    ['Adonai Mitchell', 'dropped', 'O'],
  ]);
});

test('normalizeTransaction: trade leg keeps its label (e.g. vetoed) and receiving team', () => {
  const raw = {
    kind: 'trade',
    iconTitles: [],
    players: [
      { playerId: '33423', name: 'Javonte Williams', teamPosition: 'Dal - RB', injuryStatus: '', detail: '' },
      { playerId: '32704', name: 'Michael Pittman Jr.', teamPosition: 'Pit - WR', injuryStatus: '', detail: '' },
    ],
    label: 'Vetoed Trade to',
    teamId: '2',
    teamName: "J's Pancakes",
    timestamp: 'Sep 28, 7:39 pm',
  };
  const result = normalizeTransaction(raw);
  assert.strictEqual(result.type, 'vetoed trade');
  assert.strictEqual(result.teamName, "J's Pancakes");
  assert.deepStrictEqual(result.players.map((p) => p.action), ['to team', 'to team']);
});

test('normalizeTransaction: a plain completed trade leg', () => {
  const raw = {
    kind: 'trade', iconTitles: [], label: 'Traded to', teamId: '5', teamName: 'Queen of the Damned', timestamp: 'Sep 17, 9:00 am',
    players: [{ playerId: '1', name: 'Isaiah Likely', teamPosition: 'NYG - TE', injuryStatus: '', detail: '' }],
  };
  assert.strictEqual(normalizeTransaction(raw).type, 'trade');
});

test('parseTimestamp reads Yahoo\'s year-less "Mon D, h:mm am/pm" using the reference year', () => {
  const ts = parseTimestamp('Sep 28, 7:39 pm', new Date(2026, 8, 29, 12, 0));
  assert.strictEqual(ts.getFullYear(), 2026);
  assert.strictEqual(ts.getMonth(), 8);
  assert.strictEqual(ts.getDate(), 28);
  assert.strictEqual(ts.getHours(), 19);
  assert.strictEqual(ts.getMinutes(), 39);
  assert.strictEqual(parseTimestamp('Sep 29, 12:05 am', new Date(2026, 8, 29)).getHours(), 0);
  assert.strictEqual(parseTimestamp('garbage', new Date()), null);
});

test('parseTimestamp rolls back a year when the date would be in the future (Dec seen in Jan)', () => {
  const ts = parseTimestamp('Dec 30, 1:00 pm', new Date(2027, 0, 2));
  assert.strictEqual(ts.getFullYear(), 2026);
});

test('buildAlerts flags trending players on either roster and keeps recent league moves', () => {
  const now = new Date(2026, 8, 29, 12, 0);
  const trends = [
    { playerId: '10', name: 'My Guy', nflTeam: 'Min', position: 'DEF', injuryStatus: null, pctRostered: 60, pctStarted: 50, drops: 9000, adds: 100, trades: 0, total: 9100 },
    { playerId: '20', name: 'Their Guy', nflTeam: 'Det', position: 'RB', injuryStatus: 'Q', pctRostered: 99, pctStarted: 95, drops: 50, adds: 3000, trades: 10, total: 3060 },
    { playerId: '30', name: 'Nobody', nflTeam: 'NYJ', position: 'TE', injuryStatus: null, pctRostered: 20, pctStarted: 5, drops: 1, adds: 20000, trades: 0, total: 20001 },
  ];
  const rosters = {
    userTeam: { teamName: "J's Pancakes", roster: [{ yahooPlayerId: '10', playerName: 'My Guy' }, { yahooPlayerId: null, playerName: null }] },
    opponent: { teamName: 'Russini', roster: [{ yahooPlayerId: '20', playerName: 'Their Guy' }] },
  };
  const transactions = [
    { type: 'drop', teamId: '3', teamName: 'Knights', timestamp: 'Sep 29, 5:55 am', players: [] },
    { type: 'add', teamId: '1', teamName: 'Old', timestamp: 'Sep 10, 5:55 am', players: [] },
    { type: 'vetoed trade', teamId: '2', teamName: "J's Pancakes", timestamp: 'Sep 28, 7:39 pm', players: [] },
  ];
  const alerts = buildAlerts({ trends, rosters, transactions, now, days: 7, userTeamId: '2' });

  assert.deepStrictEqual(alerts.rosterTrendFlags.map((f) => [f.name, f.team, f.direction]), [
    ['My Guy', 'user', 'dropping'],
    ['Their Guy', 'opponent', 'adding'],
  ]);
  assert.deepStrictEqual(alerts.recentLeagueTransactions.map((t) => t.teamName), ['Knights', "J's Pancakes"]);
  assert.deepStrictEqual(alerts.userTeamTransactions.map((t) => t.type), ['vetoed trade']);
  assert.strictEqual(alerts.windowDays, 7);
});
