// yahoo/fantasypros-ecr.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseEcrHtml, pickPlayers, normalizeName } = require('./fantasypros-ecr');

// Trimmed from a live capture of https://www.fantasypros.com/nfl/rankings/half-point-ppr-te.php
// (2026-10-06, Week 5). The page embeds the full ranking table as `var ecrData = {...};`.
const fixture = `<html><script>
var ecrData = {"sport":"NFL","type":"Weekly Half PPR","year":"2026","week":"5","position_id":"TE","scoring":"HALF","total_experts":11,"last_updated":"10\\/06","players":[
{"player_name":"Trey McBride","player_team_id":"ARI","player_position_id":"TE","player_opponent":"vs. DET","rank_ecr":1,"rank_min":"1","rank_max":"1","rank_ave":"1.00","rank_std":"0.00","start_sit_grade":"A+"},
{"player_name":"Isaiah Likely","player_team_id":"NYG","player_position_id":"TE","player_opponent":"at PHI","rank_ecr":12,"rank_min":"8","rank_max":"18","rank_ave":"12.40","rank_std":"2.90","start_sit_grade":"B-"}
]};
var otherThing = 1;
</script></html>`;

test('parseEcrHtml reads week, scoring, expert count and players from embedded ecrData', () => {
  const r = parseEcrHtml(fixture);
  assert.equal(r.week, 5);
  assert.equal(r.position, 'TE');
  assert.equal(r.scoring, 'HALF');
  assert.equal(r.experts, 11);
  assert.equal(r.players.length, 2);
  assert.deepEqual(r.players[1], {
    name: 'Isaiah Likely', team: 'NYG', position: 'TE', opponent: 'at PHI',
    ecr: 12, best: 8, worst: 18, avg: 12.4, std: 2.9, grade: 'B-',
  });
});

test('parseEcrHtml throws a clear error when the page has no ecrData', () => {
  assert.throws(() => parseEcrHtml('<html>no data</html>'), /ECR_NOT_FOUND/);
});

test('normalizeName ignores suffixes, punctuation and case', () => {
  assert.equal(normalizeName('Kyle Pitts Sr.'), normalizeName('kyle pitts'));
  assert.equal(normalizeName('Amon-Ra St. Brown'), normalizeName('Amon-Ra St Brown'));
  assert.equal(normalizeName('Luther Burden III'), normalizeName('Luther Burden'));
});

test('pickPlayers filters to the requested names and reports misses', () => {
  const { players } = parseEcrHtml(fixture);
  const { found, missing } = pickPlayers(players, ['Isaiah Likely', 'Kyle Pitts Sr.']);
  assert.deepEqual(found.map((p) => p.name), ['Isaiah Likely']);
  assert.deepEqual(missing, ['Kyle Pitts Sr.']);
});
