// yahoo/sleeper-stats.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractChallengeStats, isCacheFresh, buildYahooIdIndex } = require('./sleeper-stats');

test('extractChallengeStats maps a QB stat line (live-captured 2026-08-26, Dak Prescott Week 1 2025)', () => {
  // Real response from https://api.sleeper.com/stats/nfl/2025/1?season_type=regular&position=QB
  const statsObject = {
    pass_att: 34, pass_cmp: 21, pass_inc: 13, pass_lng: 32, pass_yd: 188,
    // no pass_int key at all — Sleeper omits zero-value keys entirely (0 interceptions).
  };
  assert.deepEqual(extractChallengeStats(statsObject, 'QB'), { int: 0, inc: 13, lng: 32 });
});

test('extractChallengeStats reads a nonzero interception count when present', () => {
  const statsObject = { pass_att: 30, pass_cmp: 18, pass_inc: 12, pass_int: 1, pass_lng: 24 };
  assert.deepEqual(extractChallengeStats(statsObject, 'QB'), { int: 1, inc: 12, lng: 24 });
});

test('extractChallengeStats maps a DEF stat line (live-captured 2026-08-26, Dallas Week 1 2025)', () => {
  // Real response from https://api.sleeper.com/stats/nfl/2025/1?season_type=regular&position=DEF
  const statsObject = { sack: 1, qb_hit: 5, tkl: 67, pts_allow: 24 };
  assert.deepEqual(extractChallengeStats(statsObject, 'DEF'), { sack: 1 });
});

test('extractChallengeStats maps receiving yards for WR/RB/TE', () => {
  // rec_yd follows Sleeper's documented field-naming convention (pass_yd/rush_yd/rec_yd);
  // not independently captured in a live sample during this plan's research — worth a
  // quick spot-check against a real receiving player's Week 1 row during implementation.
  const statsObject = { rec: 6, rec_yd: 78, rec_tgt: 9 };
  assert.deepEqual(extractChallengeStats(statsObject, 'WR'), { 'rec yds': 78 });
  assert.deepEqual(extractChallengeStats(statsObject, 'RB'), { 'rec yds': 78 });
  assert.deepEqual(extractChallengeStats(statsObject, 'TE'), { 'rec yds': 78 });
});

test('extractChallengeStats returns an empty object for a position with no tracked stats (K)', () => {
  assert.deepEqual(extractChallengeStats({ fgm: 3 }, 'K'), {});
});

test('extractChallengeStats returns an empty object when statsObject is missing', () => {
  assert.deepEqual(extractChallengeStats(null, 'QB'), {});
  assert.deepEqual(extractChallengeStats(undefined, 'DEF'), {});
});

test('isCacheFresh is false when there is no cache', () => {
  assert.equal(isCacheFresh(null, 1000, () => 5000), false);
});

test('isCacheFresh is false when the cache is older than maxAgeMs', () => {
  assert.equal(isCacheFresh({ fetchedAt: 1000 }, 500, () => 2000), false);
});

test('isCacheFresh is true when the cache is within maxAgeMs', () => {
  assert.equal(isCacheFresh({ fetchedAt: 1000 }, 5000, () => 2000), true);
});

test('buildYahooIdIndex keys by yahoo_id (stringified) and skips players with none', () => {
  // Shape matches a real https://api.sleeper.app/v1/players/nfl entry (live-captured
  // 2026-08-26), trimmed to the fields this function actually reads.
  const playersById = {
    '6462': { player_id: '6462', position: 'TE', team: null, yahoo_id: 32262 },
    '11255': { player_id: '11255', position: 'OL', team: null, yahoo_id: null },
  };
  const index = buildYahooIdIndex(playersById);
  assert.deepEqual(index.get('32262'), { sleeperId: '6462', position: 'TE', team: null });
  assert.equal(index.has('null'), false);
  assert.equal(index.size, 1);
});
