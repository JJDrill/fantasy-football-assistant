const { test } = require('node:test');
const assert = require('node:assert');
const { LEAGUE_URL, LEAGUE_ID, teamUrl } = require('./base-page');

test('LEAGUE_URL and LEAGUE_ID match the known league', () => {
  assert.strictEqual(LEAGUE_URL, 'https://football.fantasysports.yahoo.com/league/kickerseattle');
  assert.strictEqual(LEAGUE_ID, '109715');
});

test('teamUrl builds a team roster URL from a team id', () => {
  assert.strictEqual(
    teamUrl('2'),
    'https://football.fantasysports.yahoo.com/f1/109715/2'
  );
});
