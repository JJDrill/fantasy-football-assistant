const { test } = require('node:test');
const assert = require('node:assert');
const { parseStandingsRow } = require('./standings-page');

test('parseStandingsRow extracts team id, name, and record from raw cell text', () => {
  const raw = {
    teamHref: '/f1/109715/2',
    teamName: "J's Pancakes",
    record: '3-1-0',
    pf: '412.30',
    pa: '388.10',
  };
  const result = parseStandingsRow(raw);
  assert.deepStrictEqual(result, {
    teamId: '2',
    teamName: "J's Pancakes",
    wins: 3,
    losses: 1,
    ties: 0,
    pointsFor: 412.3,
    pointsAgainst: 388.1,
  });
});
