// Yahoo's free roster views don't expose incompletions or longest-pass (see
// docs/superpowers/specs/2026-08-26-run-challenge-stats-design.md). ESPN's public
// gamelog page has both, with no login/paywall required. Used only for the specific
// weeks/positions that need these two stats (see run-challenge.js).
const axios = require('axios');

const ESPN_SEARCH_URL = 'https://site.web.api.espn.com/apis/search/v2';

// Yahoo's team-abbreviation text (e.g. "Buf - QB") mapped to the full team name ESPN's
// search API returns in a player's `subtitle` field. Standard NFL short codes — spot-
// check against a live Yahoo roster page if a real lookup ever comes back empty.
const TEAM_NAMES = {
  Ari: 'Arizona Cardinals', Atl: 'Atlanta Falcons', Bal: 'Baltimore Ravens',
  Buf: 'Buffalo Bills', Car: 'Carolina Panthers', Chi: 'Chicago Bears',
  Cin: 'Cincinnati Bengals', Cle: 'Cleveland Browns', Dal: 'Dallas Cowboys',
  Den: 'Denver Broncos', Det: 'Detroit Lions', GB: 'Green Bay Packers',
  Hou: 'Houston Texans', Ind: 'Indianapolis Colts', Jax: 'Jacksonville Jaguars',
  KC: 'Kansas City Chiefs', LV: 'Las Vegas Raiders', LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams', Mia: 'Miami Dolphins', Min: 'Minnesota Vikings',
  NE: 'New England Patriots', NO: 'New Orleans Saints', NYG: 'New York Giants',
  NYJ: 'New York Jets', Phi: 'Philadelphia Eagles', Pit: 'Pittsburgh Steelers',
  SF: 'San Francisco 49ers', Sea: 'Seattle Seahawks', TB: 'Tampa Bay Buccaneers',
  Ten: 'Tennessee Titans', Was: 'Washington Commanders',
};

function pickPlayerResult(searchResponse, teamAbbreviation) {
  const playerGroup = (searchResponse.results || []).find((r) => r.type === 'player');
  const candidates = (playerGroup && playerGroup.contents) || [];
  const nflCandidates = candidates.filter((c) => c.description === 'NFL');
  const teamName = TEAM_NAMES[teamAbbreviation];
  const match = teamName ? nflCandidates.find((c) => c.subtitle === teamName) : null;
  const chosen = match || nflCandidates[0] || null;
  if (!chosen) return null;
  const idMatch = chosen.uid.match(/a:(\d+)/);
  return idMatch ? idMatch[1] : null;
}

async function findEspnPlayerId(playerName, teamAbbreviation) {
  const res = await axios.get(ESPN_SEARCH_URL, { params: { query: playerName, limit: 10 } });
  return pickPlayerResult(res.data, teamAbbreviation);
}

// `rows` must already be filtered to real games (no "Total" row) and in ESPN's native
// most-recent-first order. Returns null for the bye week itself rather than silently
// returning the adjacent week's game.
//
// Picks the row for `week` using positional index arithmetic against ESPN's
// reverse-chronological row list, adjusted for exactly one tracked bye week — it does
// NOT match by calendar date or verify against `opponent` (despite earlier design notes
// suggesting date/opponent matching; that was never implemented). If ESPN's row list has
// any gap not accounted for by `byeWeek` (a postponed/rescheduled game, a mid-season
// trade, a second bye somehow, etc.), every subsequent week's lookup silently shifts by
// one and returns a plausible-but-wrong stat line — there is no detection for this.
// `opponent` is captured per-row by fetchGamelogRows but not currently used here; wiring
// it in as a sanity check (compare against the Yahoo-side opponent already available on
// the roster row) would catch drift, but was left out of this pass — see the
// implementation plan's "Known follow-up" notes.
function pickGamelogRow(rows, { week, byeWeek }) {
  if (byeWeek && week === byeWeek) return null;
  const chronological = [...rows].reverse();
  const index = byeWeek && week > byeWeek ? week - 2 : week - 1;
  return chronological[index] || null;
}

async function fetchGamelogRows(page, espnId) {
  await page.goto(`https://www.espn.com/nfl/player/gamelog/_/id/${espnId}`);
  const table = page.locator('table').filter({ hasText: 'REGULAR SEASON' }).first();
  const headers = (await table.locator('thead tr').last().locator('th').allTextContents()).map((h) => h.trim());
  const cmpIdx = headers.indexOf('CMP');
  const attIdx = headers.indexOf('ATT');
  const lngIdx = headers.indexOf('LNG'); // first LNG occurrence is passing, not rushing
  const oppIdx = headers.indexOf('OPP');

  const rowLocators = table.locator('tbody tr');
  const rowCount = await rowLocators.count();
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const cells = (await rowLocators.nth(i).locator('td').allTextContents()).map((c) => c.trim());
    if (cells.length <= Math.max(cmpIdx, attIdx, lngIdx, oppIdx)) continue;
    const cmp = Number(cells[cmpIdx]);
    if (Number.isNaN(cmp)) continue; // skips the "Total" summary row
    rows.push({
      opponent: cells[oppIdx].replace(/^(vs|@)/i, '').trim(),
      cmp,
      att: Number(cells[attIdx]),
      passLng: Number(cells[lngIdx]),
    });
  }
  return rows;
}

// Returns { inc, lng } or null (name not resolvable, no matching game, or any lookup
// failure) — callers must treat null the same as a genuinely missing stat, not an error.
async function getIncAndLng(page, { playerName, teamAbbreviation, week, byeWeek }) {
  try {
    const espnId = await findEspnPlayerId(playerName, teamAbbreviation);
    if (!espnId) return null;
    const rows = await fetchGamelogRows(page, espnId);
    const row = pickGamelogRow(rows, { week, byeWeek });
    if (!row) return null;
    return { inc: row.att - row.cmp, lng: row.passLng };
  } catch (err) {
    console.error(`getIncAndLng failed for "${playerName}" (week ${week}): ${err.message}`);
    return null;
  }
}

module.exports = { pickPlayerResult, findEspnPlayerId, pickGamelogRow, fetchGamelogRows, getIncAndLng, TEAM_NAMES };
