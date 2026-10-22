const { test } = require('node:test');
const assert = require('node:assert');
const { parsePlayerKeys, parseSuggestion, cleanTabText } = require('./team-suggestions-page');

test('parsePlayerKeys reads Yahoo ids from the Compare link, drop first (live href 2026-10-21)', () => {
  assert.deepStrictEqual(
    parsePlayerKeys('https://football.fantasysports.yahoo.com/f1/109715/research_assistant?playerKeys=470.p.40108%2C470.p.41058&statFilter=RGP'),
    ['40108', '41058']
  );
});

test('parsePlayerKeys returns [] when the link has no playerKeys', () => {
  assert.deepStrictEqual(parsePlayerKeys('/f1/109715/research_assistant'), []);
  assert.deepStrictEqual(parsePlayerKeys(null), []);
});

test('parseSuggestion maps photo order to add/drop and pairs the ids (live card 2026-10-21)', () => {
  assert.deepStrictEqual(
    parseSuggestion({
      alts: ['Photo of Malik Washington', 'Photo of Kendre Miller'],
      href: 'https://football.fantasysports.yahoo.com/f1/109715/research_assistant?playerKeys=470.p.40108%2C470.p.41058&statFilter=RGP',
    }),
    { add: 'Malik Washington', addYahooPlayerId: '41058', drop: 'Kendre Miller', dropYahooPlayerId: '40108' }
  );
});

test('parseSuggestion keeps name suffixes', () => {
  const s = parseSuggestion({ alts: ['Photo of Chris Godwin Jr.', 'Photo of Kyle Pitts Sr.'], href: '?playerKeys=470.p.33392%2C470.p.30197' });
  assert.strictEqual(s.add, 'Chris Godwin Jr.');
  assert.strictEqual(s.drop, 'Kyle Pitts Sr.');
});

test('parseSuggestion skips a card without two players', () => {
  assert.strictEqual(parseSuggestion({ alts: ['Photo of Jake Bates'], href: '' }), null);
});

test('cleanTabText drops the tab labels, placeholder cards and blank lines', () => {
  assert.deepStrictEqual(
    cleanTabText('Sit/start suggestions\nAdd/drop suggestions\nTrade suggestions\nStart Player\nSit Player\nCompare\n\nThere are no sit/start suggestions available right now. Check back later!\n'),
    ['There are no sit/start suggestions available right now. Check back later!']
  );
});
