// yahoo/sleeper-stats.js
//
// Sleeper (api.sleeper.app / api.sleeper.com) is a free, unauthenticated public API that
// exposes every per-week stat category this project needs (interceptions, incompletions,
// longest pass, sacks, receiving yards) in one JSON call per week for the whole league —
// see docs/superpowers/specs/2026-08-26-sleeper-stats-replacement-design.md for the full
// rationale (it replaces roster-page.js's unverified stat1=S scrape and
// player-gamelog.js's ESPN cross-referencing, both removed in this same change).

const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

const CACHE_PATH = path.join(__dirname, '.cache', 'sleeper-players.json');
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day — this mapping changes slowly.

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

function isCacheFresh(cache, maxAgeMs, now = Date.now) {
  return Boolean(cache) && typeof cache.fetchedAt === 'number' && now() - cache.fetchedAt < maxAgeMs;
}

// Sleeper's raw players file is keyed by ITS OWN player id, with each player carrying
// Yahoo's numeric player id (if known) as `yahoo_id`. Inverted here into a yahoo_id-keyed
// index so a Yahoo-scraped player can be looked up in O(1) — see roster-page.js's
// `yahooPlayerId` field (from the `data-ys-playerid` DOM attribute), the join key this
// index is built for.
function buildYahooIdIndex(playersById) {
  const index = new Map();
  for (const player of Object.values(playersById)) {
    if (player.yahoo_id) {
      index.set(String(player.yahoo_id), {
        sleeperId: player.player_id,
        position: player.position,
        team: player.team,
      });
    }
  }
  return index;
}

// Caches Sleeper's full player list to disk (multi-MB, slow-changing) rather than
// re-fetching on every run-challenge.js invocation. Re-fetches automatically once the
// cache is missing or older than maxAgeMs.
async function getPlayersMap({ cachePath = CACHE_PATH, maxAgeMs = DEFAULT_MAX_AGE_MS } = {}) {
  let cache = null;
  if (fs.existsSync(cachePath)) {
    try {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {
      cache = null; // corrupt cache file — treat as absent, re-fetch below.
    }
  }

  if (!isCacheFresh(cache, maxAgeMs)) {
    const res = await axios.get('https://api.sleeper.app/v1/players/nfl');
    cache = { fetchedAt: Date.now(), players: res.data };
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(cache));
  }

  return buildYahooIdIndex(cache.players);
}

// Not cached — stat corrections can land after initial publication (see
// reference/challenges.md: "scoring source is final Yahoo scoring after stat
// corrections"), so this should be fresh on every call.
async function getWeekStats(season, week) {
  const res = await axios.get(`https://api.sleeper.com/stats/nfl/${season}/${week}`, {
    params: { season_type: 'regular' },
  });
  const statsByPlayerId = new Map();
  for (const row of res.data) {
    statsByPlayerId.set(row.player_id, row.stats || {});
  }
  return statsByPlayerId;
}

module.exports = { extractChallengeStats, isCacheFresh, buildYahooIdIndex, getPlayersMap, getWeekStats };
