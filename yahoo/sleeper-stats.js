// yahoo/sleeper-stats.js
//
// Sleeper (api.sleeper.app / api.sleeper.com) is a free, unauthenticated public API that
// exposes every per-week stat category this project needs (interceptions, incompletions,
// longest pass, sacks, receiving yards) in one JSON call per week for the whole league —
// see docs/superpowers/specs/2026-08-26-sleeper-stats-replacement-design.md for the full
// rationale (it replaces roster-page.js's unverified stat1=S scrape and
// player-gamelog.js's ESPN cross-referencing, both removed in this same change).

// Sleeper's stat objects are sparse — a key is absent entirely when its value would be 0
// (live-confirmed: a QB's 0-interception game had no `pass_int` key at all), so every
// lookup below defaults to 0 rather than reading `undefined`. Only the stats relevant to
// a player's actual position are included, mirroring how roster-page.js's prior
// `extractCategoryStats` gated by table/column presence — a kicker's stat line should
// never get a fabricated `sack: 0`.
function extractChallengeStats(statsObject, position) {
  if (!statsObject) return {};
  const stats = {};
  if (position === 'QB') {
    stats.int = statsObject.pass_int ?? 0;
    stats.inc = statsObject.pass_inc ?? 0;
    stats.lng = statsObject.pass_lng ?? 0;
  }
  if (position === 'DEF') {
    stats.sack = statsObject.sack ?? 0;
  }
  if (position === 'WR' || position === 'RB' || position === 'TE') {
    stats['rec yds'] = statsObject.rec_yd ?? 0;
  }
  return stats;
}

module.exports = { extractChallengeStats };
