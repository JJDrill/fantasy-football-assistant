# Sleeper API Stats Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `roster-page.js`'s unverified `stat1=S` scrape and `player-gamelog.js`'s
ESPN cross-referencing with one verified, simpler source — Sleeper's free public API —
for every category stat (`int`, `sack`, `rec yds`, `inc`, `lng`) `evaluate-challenge.js`
needs, for every week (not just weeks 9/15).

**Architecture:** New `yahoo/sleeper-stats.js` fetches/caches Sleeper's player list
(`yahoo_id` → Sleeper player ID) and per-week stats (`api.sleeper.com/stats/nfl/<season>/<week>`).
`roster-page.js` gains one field (`yahooPlayerId`, from `data-ys-playerid`, already in the
DOM) and loses the entire `stat1=S` apparatus. `run-challenge.js` replaces its
weeks-9/15-only ESPN enrichment with one Sleeper lookup per player, every week — after
which `player-gamelog.js` and `smoke-test-week-stats.js` have no remaining callers and are
deleted outright.

**Tech Stack:** Node.js (CommonJS), axios (already a dependency), `node:test` +
`node:assert`/`node:assert/strict`, `node:fs`/`node:path` for disk caching.

**Status (2026-08-27):** Tasks 1-7 implemented and reviewed (spec compliance + code
quality) on branch `sleeper-stats-replacement`. Full suite: 88/88 passing. Task 8's Step 1
(full suite) is done; Steps 2-3 (manual smoke test against a live Yahoo session with real
week data, confirming the cache file gets created) require real game data and a logged-in
session not available in this environment — must be run once real data exists. Two
minor, non-blocking test-coverage gaps were noted in review but not fixed (see Task 5's
`enrichWithSleeperStats`: no test for a DEF player with a non-matching `teamAbbreviation`,
or for DEF with no `teamAbbreviation` at all — both paths are logically identical to
already-tested cases, low risk).

**Spec:** `docs/superpowers/specs/2026-08-26-sleeper-stats-replacement-design.md`

**Prerequisite:** This plan is written against the codebase state produced by PR #5
(branch `run-challenge-stats`), which must be merged to `main` before this work starts.
The exact code shown in each task below is copied from that branch's actual current
content, not guessed from the plan that produced it — if `main` doesn't yet match what's
quoted here when you start, stop and check whether PR #5 has actually merged.

**Sequencing note:** tasks are ordered so the full test suite stays green after every
commit (rewire `run-challenge.js` off of `player-gamelog.js` *before* deleting that
module, not after).

---

### Task 1: `yahoo/sleeper-stats.js` — pure stat-name mapping (`extractChallengeStats`)

**Files:**
- Create: `yahoo/sleeper-stats.js`
- Create: `yahoo/sleeper-stats.test.js`

Sleeper's stat objects are sparse (a key is simply absent when its value would be 0) and
use different field names than this project (`pass_int` vs `int`, `rec_yd` vs `'rec yds'`,
etc.). This task is the pure, no-network mapping function only — the real API calls are
Task 2.

- [ ] **Step 1: Write the failing tests**

```js
// yahoo/sleeper-stats.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractChallengeStats } = require('./sleeper-stats');

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/sleeper-stats.test.js`
Expected: FAIL — cannot find module `./sleeper-stats`

- [ ] **Step 3: Implement `extractChallengeStats`**

```js
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
    stats.int = statsObject.pass_int || 0;
    stats.inc = statsObject.pass_inc || 0;
    stats.lng = statsObject.pass_lng || 0;
  }
  if (position === 'DEF') {
    stats.sack = statsObject.sack || 0;
  }
  if (position === 'WR' || position === 'RB' || position === 'TE') {
    stats['rec yds'] = statsObject.rec_yd || 0;
  }
  return stats;
}

module.exports = { extractChallengeStats };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/sleeper-stats.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add yahoo/sleeper-stats.js yahoo/sleeper-stats.test.js
git commit -m "Add extractChallengeStats: pure Sleeper-to-project stat name mapping"
```

---

### Task 2: `yahoo/sleeper-stats.js` — `getPlayersMap` (cached) and `getWeekStats`

**Files:**
- Modify: `yahoo/sleeper-stats.js`
- Modify: `yahoo/sleeper-stats.test.js`
- Modify: `.gitignore`

Adds the two real network-calling functions, plus their pure, unit-testable helper logic
(cache-freshness check, yahoo_id index building) split out so it doesn't need a live
network call or a mocked filesystem to test.

- [ ] **Step 1: Write the failing tests for the pure helpers**

```js
// yahoo/sleeper-stats.test.js — add these, alongside the existing require line
const { extractChallengeStats, isCacheFresh, buildYahooIdIndex } = require('./sleeper-stats');

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/sleeper-stats.test.js`
Expected: FAIL — `isCacheFresh is not a function`, `buildYahooIdIndex is not a function`

- [ ] **Step 3: Implement `isCacheFresh`, `buildYahooIdIndex`, `getPlayersMap`, `getWeekStats`**

Add to `yahoo/sleeper-stats.js`:

```js
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

const CACHE_PATH = path.join(__dirname, '.cache', 'sleeper-players.json');
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day — this mapping changes slowly.

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
```

- [ ] **Step 4: Update `module.exports`**

```js
module.exports = { extractChallengeStats, isCacheFresh, buildYahooIdIndex, getPlayersMap, getWeekStats };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test yahoo/sleeper-stats.test.js`
Expected: PASS (10 tests)

- [ ] **Step 6: Add the cache directory to `.gitignore`**

Add this line to `.gitignore` (alongside the existing `.playwright-profile/` entry):

```
yahoo/.cache/
```

- [ ] **Step 7: Commit**

```bash
git add yahoo/sleeper-stats.js yahoo/sleeper-stats.test.js .gitignore
git commit -m "Add getPlayersMap (disk-cached) and getWeekStats to sleeper-stats.js"
```

---

### Task 3: `roster-page.js` — extract each player's Yahoo numeric ID

**Files:**
- Modify: `yahoo/pages/roster-page.js`
- Modify: `yahoo/pages/roster-page.test.js`

The join key into Sleeper's `yahoo_id` field is Yahoo's own numeric player ID, already
present (but never read) as `data-ys-playerid` on the same `td.player a.name` link
`playerName` is read from — live-confirmed in this project's prior DOM notes
(`data-ys-playerid="30977"` on Josh Allen's name link).

- [ ] **Step 1: Write the failing test**

```js
// yahoo/pages/roster-page.test.js — add near the other parseRosterRow tests
test('parseRosterRow carries yahooPlayerId through when present', () => {
  const raw = {
    slot: 'QB', playerName: 'Josh Allen', points: '24.50',
    position: 'QB', teamAbbreviation: 'Buf', opponent: 'Hou', yahooPlayerId: '30977',
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'QB', playerName: 'Josh Allen', position: 'QB',
    teamAbbreviation: 'Buf', opponent: 'Hou', yahooPlayerId: '30977', points: 24.5,
  });
});

test('parseRosterRow defaults yahooPlayerId to null for an empty slot', () => {
  const raw = {
    slot: 'BN', playerName: '', points: '',
    position: null, teamAbbreviation: null, opponent: null, yahooPlayerId: null,
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'BN', playerName: null, position: null,
    teamAbbreviation: null, opponent: null, yahooPlayerId: null, points: null,
  });
});
```

Also update the two EXISTING `parseRosterRow` tests (`'parseRosterRow extracts
position, selected_position, team, opponent, name, and points'` and `'parseRosterRow
handles an empty bench slot'`) to include `yahooPlayerId` in both the input `raw` object
and the expected output — matching the pattern above (`'30977'` for the filled-slot test,
`null` for the empty-slot test) — since `parseRosterRow`'s output shape is changing for
every caller, not just new tests.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: FAIL — the updated/new `parseRosterRow` assertions don't match current output
(no `yahooPlayerId` key yet)

- [ ] **Step 3: Update `parseRosterRow` and `readRosterRow`**

In `yahoo/pages/roster-page.js`:

```js
function parseRosterRow(raw) {
  return {
    selected_position: raw.slot,
    playerName: raw.playerName || null,
    position: raw.position || null,
    teamAbbreviation: raw.teamAbbreviation || null,
    opponent: raw.opponent || null,
    yahooPlayerId: raw.yahooPlayerId || null,
    points: raw.points === '' ? null : Number(raw.points),
  };
}
```

```js
async function readRosterRow(row) {
  const slotAttr = row.locator('td.pos span[data-pos]');
  const slot = (await slotAttr.count())
    ? await slotAttr.getAttribute('data-pos')
    : (await row.locator('td.pos').textContent()).trim();

  const nameLink = row.locator('td.player a.name');
  const hasNameLink = (await nameLink.count()) > 0;
  const playerName = hasNameLink ? (await nameLink.first().textContent()).trim() : '';
  const yahooPlayerId = hasNameLink ? await nameLink.first().getAttribute('data-ys-playerid') : null;

  const teamAndPositionSpan = row.locator('td.player span.Fz-xxs');
  const teamAndPositionText = (await teamAndPositionSpan.count())
    ? (await teamAndPositionSpan.first().textContent()).trim()
    : '';

  const scheduleLink = row.locator('td.player .ysf-game-status a');
  const scheduleText = (await scheduleLink.count()) ? (await scheduleLink.first().textContent()).trim() : '';

  const pointsCell = row.locator('td.pts');
  const points = (await pointsCell.count()) ? (await pointsCell.textContent()).trim() : '';

  return parseRosterRow({
    slot,
    playerName,
    points,
    yahooPlayerId,
    position: parsePosition(teamAndPositionText),
    teamAbbreviation: parseTeamAbbreviation(teamAndPositionText),
    opponent: parseOpponent(scheduleText),
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS — trust the actual test runner's reported count over any number guessed
here (this depends on how many tests already existed on the branch before this task).

- [ ] **Step 5: Commit**

```bash
git add yahoo/pages/roster-page.js yahoo/pages/roster-page.test.js
git commit -m "Extract each roster row's Yahoo numeric player id (data-ys-playerid)"
```

---

### Task 4: `roster-page.js` — remove the entire `stat1=S` apparatus

**Files:**
- Modify: `yahoo/pages/roster-page.js`
- Modify: `yahoo/pages/roster-page.test.js`

Sleeper now supplies every category stat directly — `getRosterStats`,
`extractCategoryStats`, `parseStatNumber`, `mergeRosterStats`, and `STAT_TABLE_IDS` (and
the second page fetch they drove inside `getRoster`) are no longer needed. This is a
deletion-only task; no new behavior.

- [ ] **Step 1: Delete the now-unused tests from `roster-page.test.js`**

Remove these test blocks entirely (search for their exact `test(...)` names):
- `'parseStatNumber treats "-" and blank as 0, and strips thousands separators'`
- `'extractCategoryStats reads Bye/Int/receiving Yds from the offense table header layout'`
- `'extractCategoryStats reads Bye/Sack/Int from the DEF table header layout'`
- `'extractCategoryStats reads only Bye when a table has none of the other tracked columns (kickers)'`
- `'mergeRosterStats merges matching-length arrays by index'`
- `'mergeRosterStats throws on a row-count mismatch instead of silently merging a partial result'`

Also remove `parseStatNumber`, `extractCategoryStats`, `mergeRosterStats` from the
`require('./roster-page')` destructuring at the top of the file (they no longer exist).

- [ ] **Step 2: Remove the corresponding code from `roster-page.js`**

Delete these entirely: `parseStatNumber`, `extractCategoryStats`, `STAT_TABLE_IDS`,
`mergeRosterStats`, `getRosterStats` (the whole functions/constants — search for each
name).

Replace `getRoster` with:

```js
async function getRoster(page, teamId, { week } = {}) {
  const url = week ? `${teamUrl(teamId)}?week=${week}` : teamUrl(teamId);
  await page.goto(url);
  await assertLoggedIn(page);

  const teamNameLocator = page.locator(TEAM_NAME_SELECTOR).first();
  const teamName = (await teamNameLocator.count()) ? (await teamNameLocator.textContent()).trim() : null;

  const rows = page.locator(ROSTER_TABLE_SELECTOR);
  const count = await rows.count();
  const roster = [];

  for (let i = 0; i < count; i++) {
    roster.push(await readRosterRow(rows.nth(i)));
  }

  return { teamId, teamName, roster };
}
```

Update `module.exports` to:

```js
module.exports = {
  parseRosterRow,
  parsePosition,
  parseTeamAbbreviation,
  parseOpponent,
  getRoster,
};
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS — trust the actual reported count (this file's stat1=S tests from PR #5
are removed, everything else from Task 3 remains).

- [ ] **Step 4: Commit**

```bash
git add yahoo/pages/roster-page.js yahoo/pages/roster-page.test.js
git commit -m "Remove roster-page.js's stat1=S scraping (replaced by Sleeper)"
```

---

### Task 5: `run-challenge.js` — replace ESPN enrichment with Sleeper enrichment

**Files:**
- Modify: `yahoo/run-challenge.js`
- Modify: `yahoo/run-challenge.test.js`

Replaces `enrichIncLng`/the ESPN tab/the weeks-9-and-15-only restriction with one Sleeper
lookup applied to every player, every week. After this task, `player-gamelog.js` has no
remaining callers (removed in Task 6).

- [ ] **Step 1: Write the failing tests for `enrichWithSleeperStats`**

```js
// yahoo/run-challenge.test.js — add near the top, alongside the existing require
const { attachMatchupResult, buildMatchups, toChallengePlayer, enrichWithSleeperStats } = require('./run-challenge');

test('enrichWithSleeperStats merges QB stats via yahooPlayerId -> playersMap -> weekStats', () => {
  const player = { position: 'QB', yahooPlayerId: '30977', playerName: 'Josh Allen' };
  const playersMap = new Map([['30977', { sleeperId: '6789', position: 'QB', team: 'BUF' }]]);
  const weekStats = new Map([['6789', { pass_int: 2, pass_inc: 10, pass_lng: 40 }]]);

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, {
    position: 'QB', yahooPlayerId: '30977', playerName: 'Josh Allen',
    int: 2, inc: 10, lng: 40,
  });
});

test('enrichWithSleeperStats merges DEF stats via uppercased teamAbbreviation', () => {
  const player = { position: 'DEF', teamAbbreviation: 'Buf', playerName: 'Bills' };
  const playersMap = new Map();
  const weekStats = new Map([['BUF', { sack: 3 }]]);

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, { position: 'DEF', teamAbbreviation: 'Buf', playerName: 'Bills', sack: 3 });
});

test('enrichWithSleeperStats leaves the player unchanged when there is no match', () => {
  const player = { position: 'QB', yahooPlayerId: '99999', playerName: 'Nobody' };
  const playersMap = new Map();
  const weekStats = new Map();

  enrichWithSleeperStats(player, { playersMap, weekStats });

  assert.deepStrictEqual(player, { position: 'QB', yahooPlayerId: '99999', playerName: 'Nobody' });
});

test('enrichWithSleeperStats leaves an empty roster slot unchanged (no yahooPlayerId, no teamAbbreviation)', () => {
  const player = { position: null, playerName: null, selected_position: 'BN' };
  enrichWithSleeperStats(player, { playersMap: new Map(), weekStats: new Map() });
  assert.deepStrictEqual(player, { position: null, playerName: null, selected_position: 'BN' });
});
```

Also update the two existing `toChallengePlayer` tests to match its new destructure list
(dropping `yahooPlayerId` in addition to the fields already dropped, and no longer
mentioning `bye` at all — see Step 3 below for why): add `yahooPlayerId: '...'` to the
first test's input `rosterEntry` (any non-null string) and confirm it's absent from the
expected output; remove the `bye: 12`/`bye: null` lines from both tests' `rosterEntry`
fixtures entirely (roster rows no longer have a `bye` field once Task 4 removes
`extractCategoryStats`, so keeping a stale `bye` in the fixture would be testing a shape
that no longer occurs).

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/run-challenge.test.js`
Expected: FAIL — `enrichWithSleeperStats is not a function`, plus the updated
`toChallengePlayer` assertions won't match yet.

- [ ] **Step 3: Replace `yahoo/run-challenge.js`**

```js
// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');
const { getPairings } = require('./pages/matchup-page');
const { getPlayersMap, getWeekStats, extractChallengeStats } = require('./sleeper-stats');

// This league's current NFL season. Hardcoded, matching this codebase's existing
// convention of hardcoding league-specific constants (see LEAGUE_ID in
// yahoo/pages/base-page.js) — see reference/League_Settings.pdf.
const SEASON = 2026;

function attachMatchupResult(team, pairings) {
  const pairing = pairings.find((p) => p.teamAId === team.teamId || p.teamBId === team.teamId);
  if (!pairing) return { isWinner: null, teamTotal: null };
  const isTeamA = pairing.teamAId === team.teamId;
  const teamTotal = isTeamA ? pairing.teamAScore : pairing.teamBScore;
  const opponentTotal = isTeamA ? pairing.teamBScore : pairing.teamAScore;
  return { isWinner: teamTotal > opponentTotal, teamTotal };
}

function buildMatchups(pairings) {
  return pairings.map((p) => ({
    teams: [
      { team_name: p.teamAName, score: p.teamAScore },
      { team_name: p.teamBName, score: p.teamBScore },
    ],
  }));
}

// Every roster entry (starters and bench alike) gets enriched — unlike the prior
// ESPN-based approach, this is a Map lookup already fetched once per run, not a
// per-player network round-trip, so there's no cost reason to restrict this to specific
// weeks/positions/pool anymore. Mutates `player` in place and returns it.
function enrichWithSleeperStats(player, { playersMap, weekStats }) {
  let statsRow;
  if (player.position === 'DEF') {
    statsRow = player.teamAbbreviation && weekStats.get(player.teamAbbreviation.toUpperCase());
  } else if (player.yahooPlayerId) {
    const mapped = playersMap.get(player.yahooPlayerId);
    statsRow = mapped && weekStats.get(mapped.sleeperId);
  }
  if (statsRow) Object.assign(player, extractChallengeStats(statsRow, player.position));
  return player;
}

function toChallengePlayer(rosterEntry) {
  const { playerName, selected_position, teamAbbreviation, opponent, yahooPlayerId, ...rest } = rosterEntry;
  return { name: playerName, selected_position, ...rest };
}

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/run-challenge.js <week>');
    process.exit(1);
  }
  const weekNum = Number(week);

  const context = await launchContext();
  try {
    const page = await context.newPage();

    const standings = await getStandings(page);
    const pairings = await getPairings(page, week);

    const rosters = [];
    // Sequential (not Promise.all) — getRoster() navigates the shared `page` object,
    // and concurrent navigations on one Page race each other. See get-matchup.js's
    // two-tab fix for the same issue.
    //
    // Each team's fetch is isolated: one bad team shouldn't crash the whole run and
    // produce zero output for the other nine. On failure, push a placeholder so
    // `rosters` stays index-aligned with `standings` for the zip below.
    for (const team of standings) {
      try {
        rosters.push(await getRoster(page, team.teamId, { week }));
      } catch (err) {
        console.error(`Failed to fetch roster for team ${team.teamId} (${team.teamName}): ${err.message}`);
        rosters.push({ teamId: team.teamId, teamName: team.teamName, roster: [], fetchError: err.message });
      }
    }

    // Sleeper is now the only source for int/sack/rec-yds/inc/lng, for every week — unlike
    // the removed ESPN module, a fetch failure here should surface loudly rather than
    // degrade silently, since silent nulls here would make every player's category stats
    // look plausibly-but-wrongly absent for the whole week, not just one player. See
    // docs/superpowers/specs/2026-08-26-sleeper-stats-replacement-design.md's "Error
    // handling" section.
    const playersMap = await getPlayersMap();
    const weekStats = await getWeekStats(SEASON, weekNum);
    for (const roster of rosters) {
      for (const player of roster.roster) {
        enrichWithSleeperStats(player, { playersMap, weekStats });
      }
    }

    const teams = standings.map((team, i) => {
      const { isWinner, teamTotal } = attachMatchupResult(team, pairings);
      return {
        team_name: rosters[i].teamName,
        isWinner,
        teamTotal,
        players: rosters[i].roster.map(toChallengePlayer),
        fetchError: rosters[i].fetchError || null,
      };
    });

    console.log(
      JSON.stringify({ week: weekNum, standings, teams, matchups: buildMatchups(pairings) }, null, 2)
    );
  } finally {
    await context.close();
  }
}

module.exports = { attachMatchupResult, buildMatchups, toChallengePlayer, enrichWithSleeperStats };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
```

Note what's gone compared to the pre-Sleeper version: the `getIncAndLng`/`isStarter`/
`CHALLENGES` imports (no longer needed — enrichment isn't config/week-conditional
anymore), the `enrichIncLng` function, and the second `espnPage` tab in `main()`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/run-challenge.test.js`
Expected: PASS — all tests, including the 4 new `enrichWithSleeperStats` tests and the 2
updated `toChallengePlayer` tests under their new fixtures.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS, 0 failures. `player-gamelog.js`/`player-gamelog.test.js` still exist on
disk at this point but are no longer referenced by anything — confirm the suite is fully
green before proceeding to delete them in Task 6.

- [ ] **Step 6: Commit**

```bash
git add yahoo/run-challenge.js yahoo/run-challenge.test.js
git commit -m "Replace ESPN inc/lng enrichment with Sleeper stats for all players/weeks"
```

---

### Task 6: Delete `player-gamelog.js` and its test file

**Files:**
- Delete: `yahoo/pages/player-gamelog.js`
- Delete: `yahoo/pages/player-gamelog.test.js`

Nothing requires this module anymore after Task 5 — confirm that before deleting.

- [ ] **Step 1: Confirm nothing still requires it**

```bash
grep -rn "player-gamelog" yahoo/ --include=*.js
```

Expected: no output (or only matches inside `player-gamelog.js`/`player-gamelog.test.js`
themselves, which are about to be deleted). If anything else still references it, STOP —
Task 5 wasn't fully applied; do not proceed with deletion until that's resolved.

- [ ] **Step 2: Delete both files**

```bash
git rm yahoo/pages/player-gamelog.js yahoo/pages/player-gamelog.test.js
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS, 0 failures (this deletion should be fully inert — nothing depended on
these files after Task 5).

- [ ] **Step 4: Commit**

```bash
git commit -m "Remove player-gamelog.js (ESPN cross-referencing replaced by Sleeper)"
```

---

### Task 7: Delete `smoke-test-week-stats.js`

**Files:**
- Delete: `yahoo/smoke-test-week-stats.js`

This script existed solely to verify whether `stat1=S` was per-week or a season
aggregate — a question that no longer matters once `stat1=S` itself is deleted (Task 4).

- [ ] **Step 1: Delete the file**

```bash
git rm yahoo/smoke-test-week-stats.js
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS, 0 failures (this file had no test file and nothing imports it).

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove smoke-test-week-stats.js (stat1=S no longer used)"
```

---

### Task 8: Full suite verification and manual smoke test instructions

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite one more time**

Run: `npm test`
Expected: PASS, 0 failures.

- [ ] **Step 2: Manual smoke test (requires a live Yahoo session and real week data)**

```bash
node yahoo/run-challenge.js 1
```

Expected: valid JSON with `week`, `standings`, `teams` (each with `team_name`, `isWinner`,
`teamTotal`, `fetchError: null`, and a `players` array where QBs have `int`/`inc`/`lng`,
DEF has `sack`, and WR/RB/TE have `'rec yds'` — all sourced from Sleeper, not Yahoo's
`stat1=S` or ESPN), and `matchups`. Spot-check a few players' stats against Sleeper's own
site (sleeper.com) or against Yahoo's own final box score for that week, to confirm the
`yahoo_id` join actually resolved correctly for real players in this specific league —
this is the first time the join will run against real (not synthetic) roster data.

- [ ] **Step 3: Confirm the Sleeper players cache was created**

Check that `yahoo/.cache/sleeper-players.json` exists after Step 2 and is gitignored
(`git status` should not show it as untracked-and-stageable — it should not appear at
all, since `.gitignore` excludes `yahoo/.cache/`).
