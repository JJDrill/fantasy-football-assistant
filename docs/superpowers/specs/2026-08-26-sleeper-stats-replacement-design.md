# Sleeper API Stats Replacement — Design

## Purpose

PR #5 (branch `run-challenge-stats`) made `run-challenge.js` produce the shape
`evaluate-challenge.js` needs, but two of its data sources are fragile and explicitly
flagged as such in that branch's own code comments and plan:

- `roster-page.js`'s `getRosterStats` (the `?stat1=S` roster-page scrape) is **unverified**
  — live checks during development showed numbers that looked like season aggregates, not
  per-week data, and this can't be conclusively proven until real games have been played.
- `player-gamelog.js`'s ESPN cross-referencing (for `inc`/`lng`, weeks 9 and 15 only) uses
  fuzzy name+team matching to resolve a player across sites, and picks the right week's row
  by positional index arithmetic rather than any real date/opponent verification — a
  documented, accepted-but-real drift risk.

While reviewing that work, a live-verified alternative surfaced: **Sleeper's free, public,
unauthenticated API** (`api.sleeper.app` for player metadata, `api.sleeper.com` for stats)
provides every stat category this project needs — `int`, `sack`, `rec yds`, `inc`, `lng`
— genuinely keyed by week, in one JSON call per week for the entire league, with an exact
Yahoo-player-ID join key already built in. This replaces both fragile sources with one
verified, simpler one.

This is a standalone follow-up to PR #5, not a revision of it — see "Sequencing" below.

## Investigation findings (live-verified 2026-08-26)

- `GET https://api.sleeper.app/v1/players/nfl` returns a single JSON object keyed by
  Sleeper's own player ID, one entry per NFL player (active and inactive), e.g.:
  ```json
  "6462": { "full_name": "Ellis Richardson", "position": "TE", "team": null,
            "yahoo_id": 32262, "espn_id": 3926590, "player_id": "6462", ... }
  ```
  Critically, **`yahoo_id` is Yahoo's own numeric player ID** — the same ID already visible
  (but not currently extracted) on Yahoo's roster page as the `data-ys-playerid` attribute
  on each player's name link (confirmed in `roster-page.js`'s own DOM notes from the prior
  branch). This means exact-ID matching, not fuzzy name/team disambiguation like the ESPN
  approach required.
- This file is large (multi-MB) and slow-changing (rosters/free agency move players
  between teams, but the yahoo_id↔sleeper_id mapping itself is stable) — worth caching to
  disk rather than re-fetching every run.
- `GET https://api.sleeper.com/stats/nfl/<season>/<week>?season_type=regular` returns a
  JSON array, one entry per player **for that specific week**, e.g.:
  ```json
  {
    "player_id": "3294", "week": 1, "season": "2025", "team": "DAL", "opponent": "PHI",
    "stats": { "pass_att": 34, "pass_cmp": 21, "pass_inc": 13, "pass_int": 0,
               "pass_lng": 32, "pass_yd": 188, ... }
  }
  ```
  Confirmed live against real 2025 Week 1 data (the most recent completed season, since
  the 2026 season hasn't started): `pass_int` appears and is nonzero for a QB who actually
  threw an interception (Drake Maye, 1). `pass_inc` is the incompletion count directly (no
  `att - cmp` computation needed, unlike the ESPN approach). `pass_lng` is longest
  completed pass. Stat keys are **sparse** — a key is simply absent when its value would be
  0 (confirmed: Dak Prescott's 0-interception game had no `pass_int` key at all), so
  `stats.pass_int || 0` is required, not `stats.pass_int`.
- DEF (team defense) rows are returned under `&position=DEF` and keyed by **team
  abbreviation as `player_id`** (e.g. `"DAL"`), not a numeric player ID — confirmed live,
  and `sack` appears as a direct field on these rows (Dallas' Week 1 DEF row: `sack: 1`).
  Sleeper's full list of DEF team codes was fetched and compared directly against this
  league's real Yahoo team-abbreviation text captured in the prior branch (`Buf`, `Hou`,
  `Min`, etc.) — they match exactly modulo case (`BUF` vs `Buf`), so
  `teamAbbreviation.toUpperCase()` is a verified, reliable join with no remap table needed.
- Receiving yards is `rec_yd` (singular) in Sleeper's stat keys — needs a rename to this
  project's `'rec yds'` key, same as every other stat.

## Architecture

```
yahoo/
  sleeper-stats.js          NEW — Sleeper API client + pure stat-name mapping. Not under
                             pages/ since it's not a Yahoo/Playwright page; sits alongside
                             client.js (Yahoo's own non-Playwright API client) at the
                             yahoo/ root, following that file's precedent.
  pages/
    roster-page.js           MODIFIED — one addition: extract each player's Yahoo numeric
                              ID (data-ys-playerid). REMOVED: getRosterStats,
                              extractCategoryStats, parseStatNumber, mergeRosterStats,
                              STAT_TABLE_IDS, and the second `?stat1=S` page fetch inside
                              getRoster — none of this is needed once Sleeper supplies
                              every category stat directly.
    player-gamelog.js        REMOVED entirely (and its test file), along with the
                              ESPN_SEARCH_URL/TEAM_NAMES/pickPlayerResult/pickGamelogRow/
                              fetchGamelogRows/getIncAndLng machinery — Sleeper replaces
                              this for inc/lng too.
  smoke-test-week-stats.js REMOVED — it existed to verify stat1=S, which no longer exists.
  run-challenge.js         MODIFIED — replaces the "only weeks 9/15 need ESPN enrichment"
                            branch with a single Sleeper enrichment step that runs for
                            every roster, every week, once per run (not once per team).
```

### `yahoo/sleeper-stats.js`

```js
async function getPlayersMap({ cacheDir, maxAgeMs } = {}) -> Map<yahooId(string), { sleeperId, position, team }>
async function getWeekStats(season, week) -> Map<sleeperPlayerIdOrTeamCode(string), statsObject>
function extractChallengeStats(statsObject) -> { int?, sack?, 'rec yds'?, inc?, lng? }
```

- `getPlayersMap`: fetches `api.sleeper.app/v1/players/nfl`, caches the raw response to
  `yahoo/.cache/sleeper-players.json` (new gitignored directory, following the precedent
  of `yahoo/token.json` and `yahoo/.playwright-profile/` already being local, gitignored
  state under `yahoo/`) alongside a `fetchedAt` timestamp. Re-fetches automatically if the
  cached file is missing or older than `maxAgeMs` (default 24h). Builds and returns a Map
  keyed by `yahoo_id` (stringified, since Yahoo's DOM attribute is a string) for O(1)
  lookup — the raw file is keyed by Sleeper ID, so this function does the one-time inversion.
- `getWeekStats(season, week)`: fetches `api.sleeper.com/stats/nfl/<season>/<week>?season_type=regular`,
  returns a Map keyed by `player_id` (which is a numeric-string Sleeper player ID for
  individual players, or a team code string like `"DAL"` for DEF rows) to that row's
  `stats` object. Not cached — always fresh per run (unlike the players map, this
  genuinely changes as stat corrections come in, per this league's own rules doc:
  "scoring source is final Yahoo scoring after stat corrections").
- `extractChallengeStats(statsObject)`: pure function, maps Sleeper's sparse field names to
  this project's names, treating a missing key as 0 (matching Sleeper's sparse-key
  convention): `{ int: statsObject.pass_int || 0, sack: statsObject.sack || 0, 'rec yds':
  statsObject.rec_yd || 0, inc: statsObject.pass_inc || 0, lng: statsObject.pass_lng || 0
  }`. Only include a key when the source stat is meaningfully applicable to that player
  (e.g. don't fabricate `sack: 0` on a WR's stat line) — mirror `extractCategoryStats`'s
  prior header-presence-gating approach, but since Sleeper's schema is globally sparse
  rather than table-shaped, gate on **player position** instead: QBs get
  `int`/`inc`/`lng`, DEF get `sack`, receiving positions (WR/RB/TE) get `'rec yds'`.

### `roster-page.js` changes

Add to `readRosterRow`: extract `data-ys-playerid` from `td.player a.name` (the same link
`playerName` is already read from), added to `parseRosterRow`'s output as `yahooPlayerId`
(string, or `null` for an empty slot with no link).

Remove entirely: `getRosterStats`, `extractCategoryStats`, `parseStatNumber`,
`mergeRosterStats`, `STAT_TABLE_IDS`, and the `if (week) { ... }` block in `getRoster` that
called them. `getRoster` goes back to a single page fetch — simpler than it's been at any
point in the prior branch.

### `run-challenge.js` changes

Replace the `enrichIncLng`/weeks-9-and-15-only/ESPN-tab logic with:

```js
const season = 2026; // this league's current season; see reference/League_Settings.pdf
const playersMap = await getPlayersMap();
const weekStats = await getWeekStats(season, weekNum);

function enrichWithSleeperStats(player) {
  let statsRow;
  if (player.position === 'DEF') {
    statsRow = weekStats.get(player.teamAbbreviation.toUpperCase());
  } else if (player.yahooPlayerId) {
    const mapped = playersMap.get(player.yahooPlayerId);
    statsRow = mapped && weekStats.get(mapped.sleeperId);
  }
  if (statsRow) Object.assign(player, extractChallengeStats(statsRow, player.position));
}
```

...called once per player, for every roster, every week — no more "only weeks 9/15", no
more per-player network round-trip (both `playersMap` and `weekStats` are fetched once
per `run-challenge.js` invocation, not once per team/player), and no more second Playwright
tab. This is a genuine simplification of the orchestrator, not just a swap.

## Error handling

- `getPlayersMap`/`getWeekStats` failures (network error, Sleeper API down/changed) should
  fail the whole run loudly rather than silently — unlike the ESPN module (which was
  explicitly scoped to 2 far-future weeks with a "fall back to manual" safety net), Sleeper
  is now the *only* source for `int`/`sack`/`rec yds`/`inc`/`lng` for *every* week, so a
  silent per-player `null` would make an entire week's challenge evaluation look plausible
  but be systematically wrong (e.g. every player missing `int` data). A clear thrown error
  ("SLEEPER_FETCH_FAILED: ...") that surfaces immediately is more honest than degrading
  quietly, and `challenge-tracker`'s existing manual-paste fallback already handles a
  thrown error from the live-data script the same way it always has.
- A player with no `yahooPlayerId` (shouldn't happen for a filled roster slot, but empty
  bench/IR slots have none) or no match in `playersMap` (a real gap in Sleeper's mapping
  for an individual player) should be skipped silently for that one player only — this
  mirrors `evaluate-challenge.js`'s existing NaN-skip behavior in `buildPool`, and a single
  unmapped player is a normal, expected edge case, unlike a wholesale API failure.

## Testing

- `sleeper-stats.js`: unit test `extractChallengeStats` (pure) against the real captured
  Dak Prescott/Drake Maye/Dallas-DEF JSON samples above — no network needed for this part.
- `getPlayersMap`/`getWeekStats` are real network calls; per this project's established
  pattern for scrapers/API clients (see `yahoo-playwright-pom-design`'s Testing section),
  these aren't mocked — exercised via manual runs against the live API during development
  and via `run-challenge.js`'s own manual smoke test once real Week 1+ data exists.
- `roster-page.test.js`: add a test for the new `yahooPlayerId` extraction (pure parsing,
  same style as the existing `parsePosition`/`parseOpponent` tests) using the real
  `data-ys-playerid="30977"` value already captured in this project's prior live DOM notes.
- Delete `player-gamelog.test.js` and `smoke-test-week-stats.js` along with the modules
  they test — no orphaned tests for removed code.
- `run-challenge.test.js`'s existing tests for `attachMatchupResult`/`buildMatchups`/
  `toChallengePlayer` are unaffected (those functions don't change) — only `enrichIncLng`
  (removed) needs to be replaced with a test for the new `enrichWithSleeperStats`, using
  fake `playersMap`/`weekStats` Maps rather than live data.

## Sequencing

This is a **separate follow-up PR/branch, built on top of `main` after PR #5 merges** —
not a revision of PR #5 itself. PR #5's `stat1=S`/ESPN approach is a complete, tested,
working (if more fragile) implementation; there's no reason to block or reopen it now that
a better approach has been found. The new branch will delete most of what PR #5 added to
`roster-page.js`/`run-challenge.js` and remove `player-gamelog.js` outright — that's
expected and fine as a normal follow-up commit history, not a sign PR #5 was wrong to ship.

## Known follow-ups (not blocking this work)

- The `season` value (2026) is currently planned as a hardcoded constant in
  `run-challenge.js`, matching this codebase's existing convention of hardcoding
  league-specific constants (e.g. `LEAGUE_ID` in `base-page.js`). Worth revisiting only if
  this project ever needs to span multiple seasons.
- Sleeper's `yahoo_id` mapping coverage for this specific league's actual rostered players
  hasn't been spot-checked beyond confirming the field exists in the schema — worth a
  quick live cross-check (fetch this league's real roster, confirm each starter's
  `data-ys-playerid` actually resolves via `getPlayersMap`) once implementation begins,
  before assuming 100% coverage.
