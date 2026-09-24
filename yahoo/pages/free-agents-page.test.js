const { test } = require('node:test');
const assert = require('node:assert');
const { parsePlayerNameCell, findColumnIndex } = require('./free-agents-page');

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

test('parsePlayerNameCell handles the real live cell shape: name glued directly to the marker text, with a single-letter injury tag', () => {
  // No literal name duplication here (unlike the accessibility-tree-shaped fixture above)
  // — this is what Yahoo's actual DOM textContent produces: the name link sits immediately
  // against "Video Forecast"/"Player Note" with no whitespace, and an injury designation
  // letter (Q here) is glued directly onto the name too.
  const raw = 'Puka NacuaQVideo ForecastNew Player Note LAR - WR Thu 6:35 pm vs Sea';
  const result = parsePlayerNameCell(raw);
  assert.deepStrictEqual(result, {
    name: 'Puka Nacua',
    nflTeam: 'LAR',
    position: 'WR',
  });
});

test('parsePlayerNameCell strips a multi-letter injury designation (IR) glued onto the name', () => {
  const raw = "A.J. BrownIRVideo ForecastPlayer Note Phi - WR Sun 1:00 pm vs NYG";
  const result = parsePlayerNameCell(raw);
  assert.deepStrictEqual(result, {
    name: 'A.J. Brown',
    nflTeam: 'Phi',
    position: 'WR',
  });
});

test('parsePlayerNameCell strips a glued injury tag that directly follows a generational suffix', () => {
  const raw = 'L. Burden IIIQVideo ForecastPlayer Note Chi - WR Sun 1:00 pm vs GB';
  const result = parsePlayerNameCell(raw);
  assert.deepStrictEqual(result, {
    name: 'L. Burden III',
    nflTeam: 'Chi',
    position: 'WR',
  });
});

test('parsePlayerNameCell does not truncate a real surname that contains "Note" (e.g. Noteboom)', () => {
  const raw = 'Joseph NoteboomVideo ForecastPlayer Note LAR - OL Sun 1:25 pm @ Sea';
  const result = parsePlayerNameCell(raw);
  assert.strictEqual(result.name, 'Joseph Noteboom');
});

test('parsePlayerNameCell handles a player with no video link, just "...Player Note" glued directly on', () => {
  const raw = 'Kyren WilliamsPlayer Note LAR - RB Thu 6:35 pm vs SF';
  const result = parsePlayerNameCell(raw);
  assert.deepStrictEqual(result, {
    name: 'Kyren Williams',
    nflTeam: 'LAR',
    position: 'RB',
  });
});

test('findColumnIndex locates a column by its header label, not a fixed position', () => {
  // Live-verified (2026-09-24): Yahoo inserted a "Highlight" column ahead of "Roster
  // Status", shifting it from index 3 to 4 — a hardcoded index silently read the empty
  // Highlight cell for every row and returned no free agents at all.
  const headers = ['', '', 'Offense', 'Highlight', 'Roster Status', 'GP*', 'Bye', 'Fan Pts'];
  assert.strictEqual(findColumnIndex(headers, 'Roster Status'), 4);
});

test('findColumnIndex returns -1 when the header is missing', () => {
  assert.strictEqual(findColumnIndex(['', '', 'Offense', 'Owner'], 'Roster Status'), -1);
});

test('parsePlayerNameCell handles an injured player with no video link ("...QNew Player Note")', () => {
  // Live-verified (2026-09-24): with no "Video Forecast" marker, the glued "New" from
  // "New Player Note" sat between the injury tag and the "Player Note" marker, leaving
  // "Tyjae SpearsQNew" as the name.
  assert.deepStrictEqual(
    parsePlayerNameCell('Tyjae SpearsQNew Player Note Ten - RB Sun 10:00 am vs NYG'),
    { name: 'Tyjae Spears', nflTeam: 'Ten', position: 'RB' },
  );
});
