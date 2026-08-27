# run-challenge Stats Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `yahoo/run-challenge.js` output the shape `yahoo/evaluate-challenge.js`
actually needs (`position`, `selected_position`, per-stat categories, `isWinner`,
`teamTotal`, `matchups`), so `challenge-tracker` can evaluate all 15 weekly challenges
from live-scraped data instead of always falling back to manual paste.

**Architecture:** Extend `roster-page.js` to extract true position, opponent/schedule
text, and (pending a live-verification spike) per-week stat categories from a second
page fetch. Add a new `player-gamelog.js` module that cross-references ESPN's public
gamelog for the two stats (`inc`, `lng`) Yahoo doesn't expose for free. Wire matchup
results (win/loss, score) from the already-existing `matchup-page.js` into
`run-challenge.js`, which becomes the orchestrator producing the final shape.

**Tech Stack:** Node.js (CommonJS), Playwright (existing Yahoo session), axios (ESPN's
public JSON search endpoint), `node:test` + `node:assert/strict`.

**Spec:** `docs/superpowers/specs/2026-08-26-run-challenge-stats-design.md`

---

### Task 1: Check in the per-week stat-source verification spike (to run once Week 1 finishes)

**Files:**
- Create: `yahoo/smoke-test-week-stats.js`

The design spec found that `?week=N&stat1=S` on the roster page returns season-aggregate
numbers (e.g. 3,668 season passing yards) rather than per-week numbers, even with a week
param set — but this can't be conclusively proven until a real week's games have been
played (right now, pre-season, everything "week 1" is either zero or a leftover prior-
season total). This task checks in the verification script now; **it must be run after
Week 1 actually concludes**, before Task 3's `getRosterStats` is trusted for real
challenge scoring.

- [ ] **Step 1: Write the spike script**

```js
// yahoo/smoke-test-week-stats.js
//
// Run this once a week has real, final stats (i.e. after Week 1's games finish). It
// prints the "Stats view" numbers for two different completed weeks side by side. If
// `stat1=S` is genuinely per-week, the two columns will differ by roughly that week's
// individual production. If it's a season-aggregate bug, week N will show a number
// LARGER than or equal to week N-1's (monotonically increasing across weeks, matching
// a running season total) even when compared against DIFFERENT weeks' pages, and the
// numbers will look implausibly large for a single game (e.g. a QB with 40+ pass
// attempts, 300+ yards, in what should be one week's stat line is a strong signal this
// is still season-to-date, not that week alone).
//
// See docs/superpowers/specs/2026-08-26-run-challenge-stats-design.md's "Category-stat
// source: pending verification" section for full context.
const { launchContext } = require('./browser');
const { teamUrl, assertLoggedIn } = require('./pages/base-page');

async function dumpWeekStats(page, teamId, week) {
  const url = `${teamUrl(teamId)}?week=${week}&stat1=S`;
  await page.goto(url);
  await assertLoggedIn(page);

  const table = page.locator('table#statTable0');
  const headers = (await table.locator('thead tr').nth(1).locator('th').allTextContents()).map((h) => h.trim());
  const firstRowCells = (await table.locator('tbody tr').first().locator('td').allTextContents()).map((c) => c.trim());
  return { url, headers, firstRowCells };
}

async function main() {
  const teamId = process.argv[2] || '2';
  const weekA = process.argv[3] || '1';
  const weekB = process.argv[4] || '2';

  const context = await launchContext();
  try {
    const page = await context.newPage();
    const a = await dumpWeekStats(page, teamId, weekA);
    const b = await dumpWeekStats(page, teamId, weekB);

    console.log(`=== Week ${weekA} (${a.url}) ===`);
    console.log(JSON.stringify(a.firstRowCells, null, 2));
    console.log(`\n=== Week ${weekB} (${b.url}) ===`);
    console.log(JSON.stringify(b.firstRowCells, null, 2));
    console.log('\nCompare the two rows above against headers:', JSON.stringify(a.headers));
    console.log(
      '\nIf these look like plausible SINGLE-GAME lines that differ between the two\n' +
      'weeks (not a monotonically growing season total), stat1=S is per-week — proceed\n' +
      'with Task 3 as written. If not, the per-week source needs to be found elsewhere\n' +
      '(most likely a per-matchup box-score page) before Task 3 can be trusted.'
    );
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add yahoo/smoke-test-week-stats.js
git commit -m "Add spike script to verify per-week vs season-aggregate stat source"
```

- [ ] **Step 3: STOP — this step cannot be completed today**

Do not proceed to treat Task 3's `stat1=S`-based implementation as verified until
someone has actually run `node yahoo/smoke-test-week-stats.js 2 1 2` after Week 1 and
Week 2 both have final stats, and confirmed the numbers look like real per-week lines.
Tasks 2, 4, and 5 below do not depend on this and can be built and tested now regardless.

---

### Task 2: `roster-page.js` — position, team abbreviation, and opponent extraction

**Files:**
- Modify: `yahoo/pages/roster-page.js`
- Test: `yahoo/pages/roster-page.test.js`

Live-verified 2026-08-26: every filled roster row's player-name cell contains a
`<span class="Fz-xxs">Buf - QB</span>`-style element (team abbreviation + true position,
separate from the slot the player is started in) inside `td.player`, and a
`<span class="ysf-game-status"><a>Sun 10:00 am @ Hou</a></span>` with that week's
opponent inside the same cell. Both are needed later: `position`/`selected_position` for
`evaluate-challenge.js`, and team abbreviation/opponent for `player-gamelog.js`'s ESPN
lookup (Task 4).

- [ ] **Step 1: Write the failing tests**

```js
// yahoo/pages/roster-page.test.js — replace the existing two tests with these five
const { test } = require('node:test');
const assert = require('node:assert');
const { parseRosterRow, parsePosition, parseTeamAbbreviation, parseOpponent } = require('./roster-page');

test('parsePosition extracts the position from "Team - POS" text', () => {
  assert.strictEqual(parsePosition('Buf - QB'), 'QB');
});

test('parsePosition returns null when there is no "Team - POS" text (empty slot)', () => {
  assert.strictEqual(parsePosition(''), null);
});

test('parseTeamAbbreviation extracts the team code from "Team - POS" text', () => {
  assert.strictEqual(parseTeamAbbreviation('Buf - QB'), 'Buf');
});

test('parseOpponent extracts the trailing team code from Yahoo schedule text', () => {
  assert.strictEqual(parseOpponent('Sun 10:00 am @ Hou'), 'Hou');
  assert.strictEqual(parseOpponent('Sun 1:00 pm vs NE'), 'NE');
  assert.strictEqual(parseOpponent(''), null);
});

test('parseRosterRow extracts position, selected_position, team, opponent, name, and points', () => {
  const raw = {
    slot: 'QB',
    playerName: 'Josh Allen',
    points: '24.50',
    position: 'QB',
    teamAbbreviation: 'Buf',
    opponent: 'Hou',
  };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'QB',
    playerName: 'Josh Allen',
    position: 'QB',
    teamAbbreviation: 'Buf',
    opponent: 'Hou',
    points: 24.5,
  });
});

test('parseRosterRow handles an empty bench slot', () => {
  const raw = { slot: 'BN', playerName: '', points: '', position: null, teamAbbreviation: null, opponent: null };
  assert.deepStrictEqual(parseRosterRow(raw), {
    selected_position: 'BN',
    playerName: null,
    position: null,
    teamAbbreviation: null,
    opponent: null,
    points: null,
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: FAIL — `parsePosition`/`parseTeamAbbreviation`/`parseOpponent` are not exported,
and the two `parseRosterRow` tests fail on shape (no `position`/`teamAbbreviation`/
`opponent` keys, `slot` instead of `selected_position`).

- [ ] **Step 3: Implement `parsePosition`, `parseTeamAbbreviation`, `parseOpponent`, and update `parseRosterRow`**

In `yahoo/pages/roster-page.js`, replace the existing `parseRosterRow` with:

```js
// The player-name cell renders team + true position as plain text, e.g. "Buf - QB",
// separate from the slot the player is currently started in (data-pos on td.pos).
function parsePosition(teamAndPosition) {
  if (!teamAndPosition || !teamAndPosition.includes(' - ')) return null;
  return teamAndPosition.split(' - ').pop().trim();
}

function parseTeamAbbreviation(teamAndPosition) {
  if (!teamAndPosition || !teamAndPosition.includes(' - ')) return null;
  return teamAndPosition.split(' - ')[0].trim();
}

// Yahoo's per-row schedule text, e.g. "Sun 10:00 am @ Hou" or "Sun 1:00 pm vs NE" —
// day/time is not useful to us, only the trailing opponent code.
function parseOpponent(scheduleText) {
  if (!scheduleText) return null;
  const match = scheduleText.match(/(?:@|vs)\s*([A-Za-z]+)\s*$/i);
  return match ? match[1] : null;
}

function parseRosterRow(raw) {
  return {
    selected_position: raw.slot,
    playerName: raw.playerName || null,
    position: raw.position || null,
    teamAbbreviation: raw.teamAbbreviation || null,
    opponent: raw.opponent || null,
    points: raw.points === '' ? null : Number(raw.points),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Wire the new fields into `readRosterRow`**

In `yahoo/pages/roster-page.js`, replace `readRosterRow` with:

```js
async function readRosterRow(row) {
  const slotAttr = row.locator('td.pos span[data-pos]');
  const slot = (await slotAttr.count())
    ? await slotAttr.getAttribute('data-pos')
    : (await row.locator('td.pos').textContent()).trim();

  const nameLink = row.locator('td.player a.name');
  const playerName = (await nameLink.count()) ? (await nameLink.first().textContent()).trim() : '';

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
    position: parsePosition(teamAndPositionText),
    teamAbbreviation: parseTeamAbbreviation(teamAndPositionText),
    opponent: parseOpponent(scheduleText),
  });
}
```

- [ ] **Step 6: Update `module.exports`**

```js
module.exports = { parseRosterRow, parsePosition, parseTeamAbbreviation, parseOpponent, getRoster };
```

(`getRosterStats`, `parseStatNumber`, and `extractCategoryStats` are added to this export
list in Task 3.)

- [ ] **Step 7: Run the full roster-page test file once more, then commit**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS (5 tests)

```bash
git add yahoo/pages/roster-page.js yahoo/pages/roster-page.test.js
git commit -m "Extract true position, team, and opponent from roster rows"
```

---

### Task 3: `roster-page.js` — per-week category stats (`int`, `sack`, `rec yds`, `bye`)

**Files:**
- Modify: `yahoo/pages/roster-page.js`
- Test: `yahoo/pages/roster-page.test.js`

Implements the `stat1=S` scrape per the design spec, using header-text lookups (not
hardcoded cell indices — this codebase has already been burned once by a hardcoded-index
approach silently reading the wrong cell, per the comment above `ROSTER_TABLE_SELECTOR`).
**The URL/decision to use `stat1=S` is unverified per Task 1** — the parsing logic below
is correct regardless of source, so it's safe to build and unit-test now; only the "is
this actually per-week data" question is deferred.

- [ ] **Step 1: Write the failing tests**

```js
// yahoo/pages/roster-page.test.js — append these
const { parseStatNumber, extractCategoryStats } = require('./roster-page');

test('parseStatNumber treats "-" and blank as 0, and strips thousands separators', () => {
  assert.strictEqual(parseStatNumber('-'), 0);
  assert.strictEqual(parseStatNumber(''), 0);
  assert.strictEqual(parseStatNumber('3,668'), 3668);
  assert.strictEqual(parseStatNumber('49'), 49);
});

test('extractCategoryStats reads Bye/Int/receiving Yds from the offense table header layout', () => {
  // Live-verified 2026-08-26 header/row shape for table#statTable0 under ?stat1=S.
  const headers = ['Pos', 'Edit', 'Offense', 'Bye', 'Fan Pts', '% Start', '% Ros', 'Yds', 'TD', 'Int', 'Att*', 'Yds', 'TD', 'Tgt*', 'Rec', 'Yds', 'TD', 'TD', '2PT', 'Lost', ''];
  const cells = ['QB', 'QBBN', 'Josh Allen', '7', '374.62', '96%', '100%', '3,668', '25', '10', '112', '579', '14', '0', '0', '0', '0', '0', '1', '3', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 7, int: 10, 'rec yds': 0 });
});

test('extractCategoryStats reads Bye/Sack/Int from the DEF table header layout', () => {
  // Live-verified 2026-08-26 header/row shape for table#statTable2 under ?stat1=S.
  const headers = ['Pos', 'Edit', 'Defense/Special Teams', 'Bye', 'Fan Pts', '% Start', '% Ros', 'Pts vs.*', 'Sack', 'Safe', 'Int', 'Fum Rec', 'TD', 'Blk Kick', 'TD', ''];
  const cells = ['DEF', 'DEFBN', 'Vikings', '6', '136.00', '75%', '84%', '309', '49', '0', '8', '13', '2', '2', '0', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 6, int: 8, sack: 49 });
});

test('extractCategoryStats reads only Bye when a table has none of the other tracked columns (kickers)', () => {
  // Live-verified 2026-08-26 header/row shape for table#statTable1 under ?stat1=S.
  const headers = ['Pos', 'Edit', 'Kickers', 'Bye', 'Fan Pts', '% Start', '% Ros', '0‑19', '20‑29', '30‑39', '40‑49', '50+', 'Made', ''];
  const cells = ['K', 'KBN', 'Eddy Pineiro', '8', '140.00', '60%', '64%', '0', '5', '7', '10', '6', '34', ''];
  assert.deepStrictEqual(extractCategoryStats(headers, cells), { bye: 8 });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: FAIL — `parseStatNumber is not a function`

- [ ] **Step 3: Implement `parseStatNumber`, `extractCategoryStats`, and `getRosterStats`**

Add to `yahoo/pages/roster-page.js`, above `getRoster`:

```js
function parseStatNumber(text) {
  const trimmed = (text || '').trim();
  if (trimmed === '' || trimmed === '-') return 0;
  return Number(trimmed.replace(/,/g, ''));
}

// Looks up columns by header text rather than a fixed index, since this table's column
// layout differs across the three position-group tables (offense/kickers/DEF) and past
// experience in this file (see ROSTER_TABLE_SELECTOR's comment) shows fixed-index
// guessing silently reads the wrong cell. The DEF table also has an "Int" column
// (defensive interceptions) picked up by this same lookup — harmless, since no challenge
// config ever reads `int` from a DEF-position player.
function extractCategoryStats(headers, cells) {
  const stats = {};
  const byeIdx = headers.indexOf('Bye');
  if (byeIdx !== -1) stats.bye = parseStatNumber(cells[byeIdx]);
  const intIdx = headers.indexOf('Int');
  if (intIdx !== -1) stats.int = parseStatNumber(cells[intIdx]);
  const recIdx = headers.indexOf('Rec');
  if (recIdx !== -1 && headers[recIdx + 1] === 'Yds') {
    stats['rec yds'] = parseStatNumber(cells[recIdx + 1]);
  }
  const sackIdx = headers.indexOf('Sack');
  if (sackIdx !== -1) stats.sack = parseStatNumber(cells[sackIdx]);
  return stats;
}

const STAT_TABLE_IDS = ['statTable0', 'statTable1', 'statTable2'];

// PENDING VERIFICATION (see yahoo/smoke-test-week-stats.js and
// docs/superpowers/specs/2026-08-26-run-challenge-stats-design.md): stat1=S showed
// season-aggregate numbers, not per-week, when checked pre-season. Do not trust this
// function's output for real challenge scoring until that spike confirms the source.
async function getRosterStats(page, teamId, week) {
  const url = `${teamUrl(teamId)}?week=${week}&stat1=S`;
  await page.goto(url);
  await assertLoggedIn(page);

  const allStats = [];
  for (const id of STAT_TABLE_IDS) {
    const table = page.locator(`table#${id}`);
    if ((await table.count()) === 0) continue;
    const headers = (await table.locator('thead tr').nth(1).locator('th').allTextContents()).map((h) => h.trim());
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const cells = (await rows.nth(i).locator('td').allTextContents()).map((c) => c.trim());
      allStats.push(extractCategoryStats(headers, cells));
    }
  }
  return allStats;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Wire `getRosterStats` into `getRoster`**

Replace `getRoster` in `yahoo/pages/roster-page.js` with:

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

  // Category stats only matter for a specific week's challenge evaluation.
  if (week) {
    const statsArray = await getRosterStats(page, teamId, week);
    for (let i = 0; i < roster.length && i < statsArray.length; i++) {
      Object.assign(roster[i], statsArray[i]);
    }
  }

  return { teamId, teamName, roster };
}

module.exports = {
  parseRosterRow,
  parsePosition,
  parseTeamAbbreviation,
  parseOpponent,
  parseStatNumber,
  extractCategoryStats,
  getRoster,
};
```

- [ ] **Step 6: Run the full test file once more, then commit**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS (9 tests)

```bash
git add yahoo/pages/roster-page.js yahoo/pages/roster-page.test.js
git commit -m "Add per-week category stat scraping to getRoster (pending source verification)"
```

---

### Task 4: `player-gamelog.js` — ESPN cross-reference for `inc` and `lng`

**Files:**
- Create: `yahoo/pages/player-gamelog.js`
- Create: `yahoo/pages/player-gamelog.test.js`

Live-verified 2026-08-26:
- ESPN's public search endpoint (`https://site.web.api.espn.com/apis/search/v2?query=<name>`,
  no auth) returns `{ results: [{ type: 'player', contents: [{ description, subtitle, uid,
  ... }] }] }`. `uid` looks like `s:20~l:28~a:3918298` — the trailing number is ESPN's
  player ID. Multiple real NFL players can share a display name (confirmed: three
  different real "Josh Allen" NFL entries came back for that query), so results must be
  filtered by `description === 'NFL'` and `subtitle` matching the player's team name.
- ESPN's gamelog page (`https://www.espn.com/nfl/player/gamelog/_/id/<espnId>`) renders a
  table whose header row is `['Date', 'OPP', 'Result', 'CMP', 'ATT', 'YDS', 'CMP%', 'AVG',
  'TD', 'INT', 'LNG', 'SACK', 'RTG', 'QBR', 'CAR', 'YDS', 'AVG', 'TD', 'LNG']` (passing
  `LNG` at index 10, confirmed via a real row: `Cmp=33, Att=46, ..., Int=0, Lng=51, ...`).
  Rows are ordered most-recent-game-first. A table containing the text "REGULAR SEASON"
  is the one to use (as opposed to a "POSTSEASON" table, present only for players whose
  team made playoffs the prior year).

- [ ] **Step 1: Write the failing tests for the pure functions**

```js
// yahoo/pages/player-gamelog.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pickPlayerResult, pickGamelogRow } = require('./player-gamelog');

test('pickPlayerResult picks the NFL player whose subtitle matches the team name', () => {
  const searchResponse = {
    results: [
      {
        type: 'player',
        contents: [
          { description: 'NFL', subtitle: 'Jacksonville Jaguars', uid: 's:20~l:28~a:3915239' },
          { description: 'NFL', subtitle: 'Buffalo Bills', uid: 's:20~l:28~a:3918298' },
          { description: 'NFL', subtitle: 'Maryland Terrapins', uid: 's:20~l:28~a:10795' },
        ],
      },
    ],
  };
  assert.equal(pickPlayerResult(searchResponse, 'Buf'), '3918298');
});

test('pickPlayerResult falls back to the first NFL result when the team is unknown', () => {
  const searchResponse = {
    results: [
      { type: 'player', contents: [{ description: 'NFL', subtitle: 'Someplace Team', uid: 's:20~l:28~a:111' }] },
    ],
  };
  assert.equal(pickPlayerResult(searchResponse, 'ZZ'), '111');
});

test('pickPlayerResult returns null when there is no player result group', () => {
  assert.equal(pickPlayerResult({ results: [{ type: 'article', contents: [] }] }, 'Buf'), null);
});

test('pickGamelogRow picks the chronological game for a week before the bye', () => {
  // Rows are most-recent-first (as ESPN renders them); week 1's game is last.
  const rows = [
    { opponent: 'CIN', cmp: 10 }, // week 3 (most recent)
    { opponent: 'NYJ', cmp: 20 }, // week 2
    { opponent: 'BAL', cmp: 30 }, // week 1 (oldest)
  ];
  const row = pickGamelogRow(rows, { week: 1, byeWeek: 7 });
  assert.deepEqual(row, { opponent: 'BAL', cmp: 30 });
});

test('pickGamelogRow shifts the index by one for a week after the bye', () => {
  const rows = [
    { opponent: 'CIN', cmp: 10 }, // week 3 (played after the week-2 bye)
    { opponent: 'BAL', cmp: 30 }, // week 1
  ];
  const row = pickGamelogRow(rows, { week: 3, byeWeek: 2 });
  assert.deepEqual(row, { opponent: 'CIN', cmp: 10 });
});

test('pickGamelogRow returns null for the bye week itself', () => {
  const rows = [{ opponent: 'BAL', cmp: 30 }];
  assert.equal(pickGamelogRow(rows, { week: 2, byeWeek: 2 }), null);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/pages/player-gamelog.test.js`
Expected: FAIL — cannot find module `./player-gamelog`

- [ ] **Step 3: Implement `player-gamelog.js`**

```js
// yahoo/pages/player-gamelog.js
//
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
  } catch {
    return null;
  }
}

module.exports = { pickPlayerResult, findEspnPlayerId, pickGamelogRow, fetchGamelogRows, getIncAndLng, TEAM_NAMES };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/pages/player-gamelog.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add yahoo/pages/player-gamelog.js yahoo/pages/player-gamelog.test.js
git commit -m "Add ESPN-backed player-gamelog module for inc/lng stats"
```

---

### Task 5: `evaluate-challenge.js` — export `isStarter` for reuse

**Files:**
- Modify: `yahoo/evaluate-challenge.js`

`run-challenge.js` (Task 6) needs the same "is this player currently a starter"
check `buildPool` already uses internally, to decide which QBs need an ESPN lookup.
Reuse it instead of re-implementing the BN/IR check a second time.

- [ ] **Step 1: Export `isStarter`**

In `yahoo/evaluate-challenge.js`, change the final line:

```js
module.exports = { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge, buildPool, isStarter };
```

- [ ] **Step 2: Run the existing test suite to confirm nothing broke**

Run: `node --test yahoo/evaluate-challenge.test.js`
Expected: PASS (11 tests, unchanged — this is an export-only change)

- [ ] **Step 3: Commit**

```bash
git add yahoo/evaluate-challenge.js
git commit -m "Export isStarter from evaluate-challenge.js for reuse in run-challenge.js"
```

---

### Task 6: `run-challenge.js` — orchestrate the full output shape

**Files:**
- Modify: `yahoo/run-challenge.js`

Wires `getPairings` (already existing in `matchup-page.js`, unmodified) into the output
for `isWinner`/`teamTotal`/`matchups`, and conditionally enriches QB rows with `inc`/`lng`
via `player-gamelog.js` when the current week's challenge config needs them.

- [ ] **Step 1: Replace `yahoo/run-challenge.js`**

```js
// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');
const { getPairings } = require('./pages/matchup-page');
const { getIncAndLng } = require('./pages/player-gamelog');
const { isStarter } = require('./evaluate-challenge');
const { CHALLENGES } = require('./challenge-config');

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

// Only weeks 9 and 15 need inc/lng (see reference/challenges.md), and only for starting
// QBs — an ESPN round-trip per rostered player per week would be wasted work otherwise.
async function enrichIncLng(espnPage, roster, week) {
  const config = CHALLENGES[week];
  if (!config || (config.stat !== 'inc' && config.stat !== 'lng')) return;

  for (const player of roster) {
    if (player.position !== 'QB' || !player.playerName) continue;
    if (config.pool === 'starters' && !isStarter(player)) continue;

    const result = await getIncAndLng(espnPage, {
      playerName: player.playerName,
      teamAbbreviation: player.teamAbbreviation,
      week,
      byeWeek: player.bye,
    });
    if (result) Object.assign(player, result);
  }
}

function toChallengePlayer(rosterEntry) {
  const { playerName, selected_position, teamAbbreviation, opponent, bye, ...rest } = rosterEntry;
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
    for (const team of standings) {
      rosters.push(await getRoster(page, team.teamId, { week }));
    }

    const espnPage = await context.newPage();
    try {
      for (const roster of rosters) {
        await enrichIncLng(espnPage, roster.roster, weekNum);
      }
    } finally {
      await espnPage.close();
    }

    const teams = standings.map((team, i) => {
      const { isWinner, teamTotal } = attachMatchupResult(team, pairings);
      return {
        team_name: rosters[i].teamName,
        isWinner,
        teamTotal,
        players: rosters[i].roster.map(toChallengePlayer),
      };
    });

    console.log(
      JSON.stringify({ week: weekNum, standings, teams, matchups: buildMatchups(pairings) }, null, 2)
    );
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add yahoo/run-challenge.js
git commit -m "Wire matchup results and ESPN inc/lng enrichment into run-challenge.js"
```

---

### Task 7: Full test suite run and manual smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all existing suites (`evaluate-challenge.test.js`, `roster-page.test.js`,
`player-gamelog.test.js`, `matchup-page.test.js`, `standings-page.test.js`, and every
other existing `*.test.js`) pass with no failures.

- [ ] **Step 2: Manual smoke test (once a week has live, final data)**

```bash
node yahoo/run-challenge.js 1
```

Expected: valid JSON printed to stdout with `week`, `standings`, `teams` (each with
`team_name`, `isWinner`, `teamTotal`, and a `players` array with `position`,
`selected_position`, `points`, and — pending Task 1's verification — `int`/`sack`/
`rec yds` where applicable), and `matchups`. Spot-check two or three players' `points`
and `isWinner`/`teamTotal` against the actual Yahoo standings/matchup pages in a browser.

- [ ] **Step 3: Once Task 1's spike is run and confirms (or refutes) `stat1=S` as a real
  per-week source, update this plan's Task 3 accordingly** — either remove the "pending
  verification" comments (confirmed correct) or swap `getRosterStats`'s URL/target for
  whatever the spike found instead (e.g. a per-matchup box-score page), keeping the same
  `extractCategoryStats(headers, cells)` function signature so `getRoster`'s wiring in
  Task 3 Step 5 doesn't need to change.
