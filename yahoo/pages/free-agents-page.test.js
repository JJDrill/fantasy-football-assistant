const { test } = require('node:test');
const assert = require('node:assert');
const { parsePlayerNameCell } = require('./free-agents-page');

test('parsePlayerNameCell extracts name, team, and position from the compound cell text', () => {
  const raw = 'Jahmyr Gibbs Jahmyr Gibbs Video Forecast Open player notes for Jahmyr Gibbs Det - RB Sun 11:00 am vs NO';
  const result = parsePlayerNameCell(raw);
  assert.deepStrictEqual(result, {
    name: 'Jahmyr Gibbs',
    nflTeam: 'Det',
    position: 'RB',
  });
});

test('parsePlayerNameCell handles defenses, which have no separate team/position split', () => {
  const raw = 'San Francisco 49ers San Francisco 49ers SF Sun 1:25 pm @ Sea';
  const result = parsePlayerNameCell(raw);
  assert.strictEqual(result.name, 'San Francisco 49ers');
  assert.strictEqual(result.position, 'DEF');
});
