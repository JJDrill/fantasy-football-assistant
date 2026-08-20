# Yahoo Playwright Page Object Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the five existing Yahoo fantasy skills a working live-data path by scraping
`football.fantasysports.yahoo.com` with Playwright, using a persistent logged-in browser
profile, while the Yahoo Fantasy API access request is still pending.

**Architecture:** A shared `yahoo/browser.js` launches a persistent-context Chromium
instance. Page objects in `yahoo/pages/` encapsulate navigation + extraction for one Yahoo
page each. Thin CLI scripts at `yahoo/*.js` (matching filenames the skills already
reference) call the page objects and print JSON to stdout.

**Tech Stack:** Node.js (CommonJS, matching the rest of `yahoo/`), `playwright` (Chromium
only), `node --test` for unit tests of pure parsing functions.

**Reference:** `docs/superpowers/specs/2026-08-20-yahoo-playwright-pom-design.md`

**Known constraint:** the league's draft is Sun Aug 23 2026 — as of this plan, no team has
a roster yet (every player is a free agent) and no matchup has scores. Real markup was
captured live for the **standings page** and **player list (free agents) page** — those
tasks use confirmed selectors. The **roster page** and **matchup page** have no real data
to inspect yet, so those tasks use Yahoo's same table pattern (confirmed consistent across
the two pages we could inspect) and each includes an explicit step to re-verify against
real data after the draft and adjust selectors if needed.

---

### Task 1: Add Playwright dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install playwright and the Chromium browser**

Run: `npm install playwright --save`
Run: `npx playwright install chromium`

- [ ] **Step 2: Verify package.json**

Open `package.json` and confirm `"playwright"` now appears under `"dependencies"`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add playwright dependency for Yahoo scraping"
```

---

### Task 2: Persistent browser launcher

**Files:**
- Create: `yahoo/browser.js`
- Test: `yahoo/browser.test.js`

- [ ] **Step 1: Write the failing test**

```js
// yahoo/browser.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { PROFILE_DIR } = require('./browser');
const path = require('node:path');

test('PROFILE_DIR points inside the yahoo/ directory', () => {
  assert.strictEqual(path.basename(PROFILE_DIR), '.playwright-profile');
  assert.strictEqual(path.dirname(PROFILE_DIR), __dirname);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/browser.test.js`
Expected: FAIL — `Cannot find module './browser'` or `PROFILE_DIR` is undefined.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/browser.js
const path = require('node:path');
const { chromium } = require('playwright');

const PROFILE_DIR = path.join(__dirname, '.playwright-profile');

async function launchContext({ headless = true } = {}) {
  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    viewport: { width: 1280, height: 900 },
  });
}

module.exports = { PROFILE_DIR, launchContext };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/browser.test.js`
Expected: PASS

- [ ] **Step 5: Add the profile dir to .gitignore**

Open `.gitignore` and confirm `yahoo/.playwright-profile/` is covered. The existing
`.playwright-profile/` entry (added in the pre-cleanup PR) is a bare directory name, which
git matches at any depth — so `yahoo/.playwright-profile/` is already ignored. No change
needed; verify with:

Run: `git check-ignore -v yahoo/.playwright-profile/some-file`
Expected: prints a match against the `.playwright-profile/` line in `.gitignore`.

- [ ] **Step 6: Commit**

```bash
git add yahoo/browser.js yahoo/browser.test.js
git commit -m "Add persistent-context browser launcher for Yahoo scraping"
```

---

### Task 3: Base page (login check + shared constants)

**Files:**
- Create: `yahoo/pages/base-page.js`
- Test: `yahoo/pages/base-page.test.js`

- [ ] **Step 1: Write the failing test**

```js
// yahoo/pages/base-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { LEAGUE_URL, LEAGUE_ID, teamUrl } = require('./base-page');

test('LEAGUE_URL and LEAGUE_ID match the known league', () => {
  assert.strictEqual(LEAGUE_URL, 'https://football.fantasysports.yahoo.com/league/kickerseattle');
  assert.strictEqual(LEAGUE_ID, '109715');
});

test('teamUrl builds a team roster URL from a team id', () => {
  assert.strictEqual(
    teamUrl('2'),
    'https://football.fantasysports.yahoo.com/f1/109715/2'
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/base-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/base-page.js
const LEAGUE_ID = '109715';
const LEAGUE_URL = 'https://football.fantasysports.yahoo.com/league/kickerseattle';
const FANTASY_BASE = 'https://football.fantasysports.yahoo.com';

function teamUrl(teamId) {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/${teamId}`;
}

function matchupUrl(week) {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/matchup?matchup_week=${week}`;
}

function playersUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/players`;
}

async function assertLoggedIn(page) {
  if (page.url().includes('login.yahoo.com')) {
    throw new Error(
      'NOT_LOGGED_IN: run `node yahoo/login.js` to refresh your Yahoo session'
    );
  }
}

module.exports = {
  LEAGUE_ID,
  LEAGUE_URL,
  FANTASY_BASE,
  teamUrl,
  matchupUrl,
  playersUrl,
  assertLoggedIn,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/base-page.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add yahoo/pages/base-page.js yahoo/pages/base-page.test.js
git commit -m "Add base page with league constants and login check"
```

---

### Task 4: One-time interactive login script

**Files:**
- Create: `yahoo/login.js`

- [ ] **Step 1: Write the script**

```js
// yahoo/login.js
const { launchContext } = require('./browser');
const { LEAGUE_URL } = require('./pages/base-page');

async function main() {
  const context = await launchContext({ headless: false });
  const page = await context.newPage();
  await page.goto(LEAGUE_URL);

  console.log('A browser window has opened. Log into Yahoo, then come back here.');
  console.log('Waiting for you to reach the league page...');

  await page.waitForURL((url) => !url.toString().includes('login.yahoo.com'), {
    timeout: 0,
  });

  console.log('Logged in. Session saved — you can close the browser window now.');
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run it manually to confirm the flow**

Run: `node yahoo/login.js`
Expected: a headed Chromium window opens to the league URL. If already logged in (likely,
since the persistent profile already has your session from this conversation's earlier
manual login), it should print "Logged in." almost immediately. If logged out, log in
manually in the window and confirm the same message appears.

- [ ] **Step 3: Commit**

```bash
git add yahoo/login.js
git commit -m "Add one-time interactive Yahoo login script"
```

---

### Task 5: Standings page object

Confirmed live structure (captured 2026-08-20 from the league home page): a `table` with
`columnheader`s `Rank, Team, W-L-T, PF, PA, Streak, Waiver, Moves`, and one `row` per team
with a `link` (team name, href `/f1/109715/<teamId>`) inside the Team cell.

**Files:**
- Create: `yahoo/pages/standings-page.js`
- Test: `yahoo/pages/standings-page.test.js`

- [ ] **Step 1: Write the failing test for the pure row-parsing function**

```js
// yahoo/pages/standings-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { parseStandingsRow } = require('./standings-page');

test('parseStandingsRow extracts team id, name, and record from raw cell text', () => {
  const raw = {
    teamHref: '/f1/109715/2',
    teamName: "J's Pancakes",
    record: '3-1-0',
    pf: '412.30',
    pa: '388.10',
  };
  const result = parseStandingsRow(raw);
  assert.deepStrictEqual(result, {
    teamId: '2',
    teamName: "J's Pancakes",
    wins: 3,
    losses: 1,
    ties: 0,
    pointsFor: 412.3,
    pointsAgainst: 388.1,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/standings-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/standings-page.js
const { LEAGUE_URL, assertLoggedIn } = require('./base-page');

function parseStandingsRow(raw) {
  const teamId = raw.teamHref.split('/').filter(Boolean).pop();
  const [wins, losses, ties] = raw.record.split('-').map(Number);
  return {
    teamId,
    teamName: raw.teamName,
    wins,
    losses,
    ties,
    pointsFor: Number(raw.pf),
    pointsAgainst: Number(raw.pa),
  };
}

async function getStandings(page) {
  await page.goto(LEAGUE_URL);
  await assertLoggedIn(page);

  const rows = page.locator('table:has(th:has-text("Rank")) tbody tr');
  const count = await rows.count();
  const results = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const teamLink = row.locator('a[href*="/f1/"]').last();
    const cells = row.locator('td');

    const raw = {
      teamHref: await teamLink.getAttribute('href'),
      teamName: (await teamLink.textContent()).trim(),
      record: (await cells.nth(2).textContent()).trim(),
      pf: (await cells.nth(3).textContent()).trim(),
      pa: (await cells.nth(4).textContent()).trim(),
    };
    results.push(parseStandingsRow(raw));
  }

  return results;
}

module.exports = { parseStandingsRow, getStandings };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/standings-page.test.js`
Expected: PASS

- [ ] **Step 5: Verify against the live page**

Run:
```bash
node -e "
const { launchContext } = require('./yahoo/browser');
const { getStandings } = require('./yahoo/pages/standings-page');
(async () => {
  const ctx = await launchContext();
  const page = await ctx.newPage();
  console.log(JSON.stringify(await getStandings(page), null, 2));
  await ctx.close();
})();
"
```
Expected: a JSON array of 10 teams with `teamId`, `teamName`, `wins/losses/ties`,
`pointsFor`, `pointsAgainst`. Confirm the values match what you see on
https://football.fantasysports.yahoo.com/league/kickerseattle. If the selector
`table:has(th:has-text("Rank"))` doesn't match, open the page, right-click the standings
table → Inspect, and adjust the locator in `getStandings` to match.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/standings-page.js yahoo/pages/standings-page.test.js
git commit -m "Add standings page object"
```

---

### Task 6: Free agents page object

Confirmed live structure (captured 2026-08-20 from `/f1/109715/players`): a `table` where
each player row's name cell contains repeated/concatenated text like `"Jahmyr Gibbs Jahmyr
Gibbs Video Forecast Open player notes for Jahmyr Gibbs Det - RB Sun 11:00 am vs NO"` — the
player's name appears twice, followed by team abbreviation and position (`Det - RB`), then
game info. A separate cell holds roster status (`FA` for free agent, or an opponent-league
team's abbreviation if rostered elsewhere — not relevant here since this is our league's
free agent list).

**Files:**
- Create: `yahoo/pages/free-agents-page.js`
- Test: `yahoo/pages/free-agents-page.test.js`

- [ ] **Step 1: Write the failing test for the pure name-cell parser**

```js
// yahoo/pages/free-agents-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { parsePlayerNameCell } = require('./free-agents-page');

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/free-agents-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/free-agents-page.js
const { playersUrl, assertLoggedIn } = require('./base-page');

function parsePlayerNameCell(raw) {
  // The name is duplicated at the start (visible text + accessible label repeat it).
  // Split on that duplication first.
  const words = raw.trim().split(/\s+/);
  const half = Math.floor(words.length / 2);
  let name = raw;
  for (let split = 1; split <= half; split++) {
    const first = words.slice(0, split).join(' ');
    const second = words.slice(split, split * 2).join(' ');
    if (first === second && first.length > 0) {
      name = first;
      break;
    }
  }

  const teamPosMatch = raw.match(/([A-Z][a-zA-Z]{1,3}) - ([A-Z]{1,3})\b/);
  if (teamPosMatch) {
    return { name, nflTeam: teamPosMatch[1], position: teamPosMatch[2] };
  }

  // Defenses: no "Team - POS" pattern, name IS the team.
  return { name, nflTeam: null, position: 'DEF' };
}

async function getFreeAgents(page, { position } = {}) {
  const url = position ? `${playersUrl()}?position=${position}` : playersUrl();
  await page.goto(url);
  await assertLoggedIn(page);

  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  const results = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    const nameCellText = (await cells.nth(1).textContent()).trim();
    if (!nameCellText) continue;

    const statusText = (await cells.nth(2).textContent()).trim();
    if (statusText !== 'FA') continue; // skip rostered/waiver players

    results.push({
      ...parsePlayerNameCell(nameCellText),
      status: statusText,
    });
  }

  return results;
}

module.exports = { parsePlayerNameCell, getFreeAgents };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/free-agents-page.test.js`
Expected: PASS

- [ ] **Step 5: Verify against the live page**

Run the same inline-script pattern as Task 5 Step 5, but calling
`getFreeAgents(page, { position: 'RB' })`. Expected: a JSON array of RB free agents.
Compare against https://football.fantasysports.yahoo.com/f1/109715/players — if the
`position` query param doesn't filter correctly, open the Players page in the browser,
click the "RB" position filter, and copy the resulting URL's query params into
`getFreeAgents`.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/free-agents-page.js yahoo/pages/free-agents-page.test.js
git commit -m "Add free agents page object"
```

---

### Task 7: Roster page object (best-effort — no live roster data exists yet)

No team has drafted players yet, so there's no real roster table to inspect. This task
builds against the same `table`/`columnheader`/`cell` pattern confirmed on the standings
and players pages (Yahoo uses this consistently), targeting the roster table that appears
on a team's page (e.g. `/f1/109715/2`) once it has players. **Step 5 is mandatory** — run
it after the Aug 23 draft and fix the locator before relying on this in any skill.

**Files:**
- Create: `yahoo/pages/roster-page.js`
- Test: `yahoo/pages/roster-page.test.js`

- [ ] **Step 1: Write the failing test for the pure row-parsing function**

```js
// yahoo/pages/roster-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { parseRosterRow } = require('./roster-page');

test('parseRosterRow extracts slot, player name, and points', () => {
  const raw = { slot: 'QB', playerName: 'Josh Allen', points: '24.50' };
  assert.deepStrictEqual(parseRosterRow(raw), {
    slot: 'QB',
    playerName: 'Josh Allen',
    points: 24.5,
  });
});

test('parseRosterRow handles an empty bench slot', () => {
  const raw = { slot: 'BN', playerName: '', points: '' };
  assert.deepStrictEqual(parseRosterRow(raw), {
    slot: 'BN',
    playerName: null,
    points: null,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/roster-page.js
const { teamUrl, assertLoggedIn } = require('./base-page');

function parseRosterRow(raw) {
  return {
    slot: raw.slot,
    playerName: raw.playerName || null,
    points: raw.points === '' ? null : Number(raw.points),
  };
}

async function getRoster(page, teamId, { week } = {}) {
  const url = week ? `${teamUrl(teamId)}?week=${week}` : teamUrl(teamId);
  await page.goto(url);
  await assertLoggedIn(page);

  const teamNameLocator = page.locator('h1').first();
  const teamName = (await teamNameLocator.textContent()).trim();

  const rows = page.locator('table:has(th:has-text("Points")) tbody tr');
  const count = await rows.count();
  const roster = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    const slot = (await cells.nth(0).textContent()).trim();
    const playerName = (await cells.nth(1).textContent()).trim();
    const points = (await cells.nth(cells.count ? (await cells.count()) - 1 : 0).textContent()).trim();
    roster.push(parseRosterRow({ slot, playerName, points }));
  }

  return { teamId, teamName, roster };
}

module.exports = { parseRosterRow, getRoster };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/roster-page.test.js`
Expected: PASS

- [ ] **Step 5: Verify against the live page — MANDATORY, run after the Aug 23 draft**

Run the inline-script pattern from Task 5 Step 5, calling `getRoster(page, '2')` (your team
id). Open `https://football.fantasysports.yahoo.com/f1/109715/2` in a real browser tab
side-by-side, right-click the roster table → Inspect, and confirm:
- the table selector (`table:has(th:has-text("Points"))`) actually matches the roster
  table and not some other table on the page
- the slot/player-name/points column indices are correct
- empty bench/IR slots don't crash the parser

Fix `getRoster` and re-run until the JSON output matches what you see on the page for every
roster slot (starters, bench, IR).

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/roster-page.js yahoo/pages/roster-page.test.js
git commit -m "Add roster page object (verify selectors post-draft)"
```

---

### Task 8: Matchup page object (best-effort — no live matchup data exists yet)

Same caveat as Task 7: no week has scores yet. This targets the "Matchups" list structure
already visible on the league home page (captured live) — each matchup is a list item with
two team blocks (name link + score) separated by a "vs" marker — reached via the nav bar's
"Matchups" link at `/f1/109715/matchup?matchup_week=<week>`. **Step 5 is mandatory.**

**Files:**
- Create: `yahoo/pages/matchup-page.js`
- Test: `yahoo/pages/matchup-page.test.js`

- [ ] **Step 1: Write the failing test for the pure pairing-parsing function**

```js
// yahoo/pages/matchup-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { findUserMatchup } = require('./matchup-page');

test('findUserMatchup finds the pairing containing the given team id', () => {
  const pairings = [
    { teamAId: '2', teamAName: "J's Pancakes", teamAScore: 88.2, teamBId: '4', teamBName: 'Lil Unk Rayray', teamBScore: 75.1 },
    { teamAId: '1', teamAName: 'True & Living 12th Gospel', teamAScore: 60, teamBId: '10', teamBName: 'Hash Marks Brian', teamBScore: 59 },
  ];
  const result = findUserMatchup(pairings, '2');
  assert.deepStrictEqual(result, {
    userTeamId: '2',
    userTeamName: "J's Pancakes",
    userScore: 88.2,
    opponentTeamId: '4',
    opponentTeamName: 'Lil Unk Rayray',
    opponentScore: 75.1,
  });
});

test('findUserMatchup works when the user is teamB in the pairing', () => {
  const pairings = [
    { teamAId: '1', teamAName: 'True & Living 12th Gospel', teamAScore: 60, teamBId: '2', teamBName: "J's Pancakes", teamBScore: 88.2 },
  ];
  const result = findUserMatchup(pairings, '2');
  assert.strictEqual(result.userTeamId, '2');
  assert.strictEqual(result.opponentTeamId, '1');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/matchup-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/matchup-page.js
const { matchupUrl, assertLoggedIn } = require('./base-page');

function findUserMatchup(pairings, userTeamId) {
  const pairing = pairings.find(
    (p) => p.teamAId === userTeamId || p.teamBId === userTeamId
  );
  if (!pairing) return null;

  const userIsA = pairing.teamAId === userTeamId;
  return {
    userTeamId,
    userTeamName: userIsA ? pairing.teamAName : pairing.teamBName,
    userScore: userIsA ? pairing.teamAScore : pairing.teamBScore,
    opponentTeamId: userIsA ? pairing.teamBId : pairing.teamAId,
    opponentTeamName: userIsA ? pairing.teamBName : pairing.teamAName,
    opponentScore: userIsA ? pairing.teamBScore : pairing.teamAScore,
  };
}

async function getPairings(page, week) {
  await page.goto(matchupUrl(week));
  await assertLoggedIn(page);

  const items = page.locator('ul li:has(a[href*="/f1/109715/"])');
  const count = await items.count();
  const pairings = [];

  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    const teamLinks = item.locator('a[href*="/f1/109715/"]');
    const scores = item.locator('text=/^\\d+\\.\\d{2}$/');

    const linkCount = await teamLinks.count();
    if (linkCount < 2) continue;

    const teamAHref = await teamLinks.nth(0).getAttribute('href');
    const teamBHref = await teamLinks.nth(linkCount - 1).getAttribute('href');
    const teamAName = (await teamLinks.nth(0).textContent()).trim();
    const teamBName = (await teamLinks.nth(linkCount - 1).textContent()).trim();

    const scoreCount = await scores.count();
    pairings.push({
      teamAId: teamAHref.split('/').filter(Boolean).pop(),
      teamAName,
      teamAScore: scoreCount > 0 ? Number(await scores.first().textContent()) : null,
      teamBId: teamBHref.split('/').filter(Boolean).pop(),
      teamBName,
      teamBScore: scoreCount > 1 ? Number(await scores.last().textContent()) : null,
    });
  }

  return pairings;
}

module.exports = { findUserMatchup, getPairings };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/matchup-page.test.js`
Expected: PASS

- [ ] **Step 5: Verify against the live page — MANDATORY, run after Week 1 has scores**

Run the inline-script pattern from Task 5 Step 5, calling `getPairings(page, 1)`. Open
`https://football.fantasysports.yahoo.com/f1/109715/matchup?matchup_week=1` in a browser
tab, and confirm the returned pairings match all 5 matchups shown, with correct team ids,
names, and scores. Adjust the `items`/`teamLinks`/`scores` locators if the structure
differs from the pre-season league-home widget this was modeled on.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/matchup-page.js yahoo/pages/matchup-page.test.js
git commit -m "Add matchup page object (verify selectors post-Week-1)"
```

---

### Task 9: get-matchup.js script

**Files:**
- Create: `yahoo/get-matchup.js`

- [ ] **Step 1: Write the script**

```js
// yahoo/get-matchup.js
const { launchContext } = require('./browser');
const { getPairings, findUserMatchup } = require('./pages/matchup-page');
const { getRoster } = require('./pages/roster-page');

const USER_TEAM_ID = '2'; // J's Pancakes

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/get-matchup.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  const page = await context.newPage();

  const pairings = await getPairings(page, week);
  const matchup = findUserMatchup(pairings, USER_TEAM_ID);
  if (!matchup) {
    throw new Error(`No matchup found for team ${USER_TEAM_ID} in week ${week}`);
  }

  const [userRoster, opponentRoster] = await Promise.all([
    getRoster(page, matchup.userTeamId, { week }),
    getRoster(page, matchup.opponentTeamId, { week }),
  ]);

  const result = {
    week: Number(week),
    userTeam: userRoster,
    opponent: opponentRoster,
  };

  console.log(JSON.stringify(result, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Verify against the live page — after Week 1 starts**

Run: `node yahoo/get-matchup.js 1`
Expected: JSON with `userTeam` and `opponent`, each with a `roster` array. Confirm the
opponent matches who you're actually playing that week on Yahoo.

- [ ] **Step 3: Commit**

```bash
git add yahoo/get-matchup.js
git commit -m "Add get-matchup.js script for lineup-advice/trade-analyzer/weekly-recap skills"
```

---

### Task 10: get-free-agents.js, get-scoreboard.js, run-challenge.js, smoke-test-roster.js

**Files:**
- Create: `yahoo/get-free-agents.js`
- Create: `yahoo/get-scoreboard.js`
- Create: `yahoo/run-challenge.js`
- Create: `yahoo/smoke-test-roster.js`

- [ ] **Step 1: Write get-free-agents.js**

```js
// yahoo/get-free-agents.js
const { launchContext } = require('./browser');
const { getFreeAgents } = require('./pages/free-agents-page');

async function main() {
  const position = process.argv[2]; // optional
  const context = await launchContext();
  const page = await context.newPage();
  const agents = await getFreeAgents(page, { position });
  console.log(JSON.stringify(agents, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Verify get-free-agents.js**

Run: `node yahoo/get-free-agents.js RB`
Expected: JSON array of RB free agents (should work now — free agent data already exists
pre-draft, confirmed in Task 6).

- [ ] **Step 3: Write get-scoreboard.js**

```js
// yahoo/get-scoreboard.js
const { launchContext } = require('./browser');
const { getPairings } = require('./pages/matchup-page');

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/get-scoreboard.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  const page = await context.newPage();
  const pairings = await getPairings(page, week);
  console.log(JSON.stringify({ week: Number(week), pairings }, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 4: Write run-challenge.js**

```js
// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/run-challenge.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  const page = await context.newPage();

  const standings = await getStandings(page);
  const rosters = [];
  for (const team of standings) {
    rosters.push(await getRoster(page, team.teamId, { week }));
  }

  console.log(JSON.stringify({ week: Number(week), standings, rosters }, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

`run-challenge.js` intentionally returns raw standings + all 10 rosters rather than
computing a winner — the challenge-tracker skill already applies each week's specific rule
text from `reference/challenges.md` itself (see its SKILL.md step 4), so this script's job
is just to gather the raw data.

- [ ] **Step 5: Write smoke-test-roster.js**

```js
// yahoo/smoke-test-roster.js
const { launchContext } = require('./browser');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const teamId = process.argv[2] || '2';
  const context = await launchContext();
  const page = await context.newPage();
  const roster = await getRoster(page, teamId);
  console.log(JSON.stringify(roster, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 6: Verify get-scoreboard.js, run-challenge.js, smoke-test-roster.js — after the draft**

Run each and eyeball the output against the real Yahoo pages, same as Task 7/8 Step 5.

- [ ] **Step 7: Commit**

```bash
git add yahoo/get-free-agents.js yahoo/get-scoreboard.js yahoo/run-challenge.js yahoo/smoke-test-roster.js
git commit -m "Add remaining CLI scripts (free agents, scoreboard, challenge, roster smoke test)"
```

---

### Task 11: Config and docs

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Add YAHOO_LEAGUE_URL to .env.example**

```
YAHOO_CLIENT_ID=
YAHOO_CLIENT_SECRET=
YAHOO_LEAGUE_KEY=
YAHOO_LEAGUE_URL=https://football.fantasysports.yahoo.com/league/kickerseattle
```

Note: the scraper scripts don't actually read `.env` (the league URL/id are hardcoded
constants in `yahoo/pages/base-page.js`, since they're fixed for this one league) — this
entry documents the value for humans, matching the pattern of `YAHOO_LEAGUE_KEY` already
being pre-known in this file.

- [ ] **Step 2: Update README.md**

Add a new section after "## Setup (for live data)" documenting the Playwright path:

```markdown
## Setup (browser scraping — works now, no API approval needed)

While Yahoo's API access is pending, the skills can get live data via Playwright browser
automation instead:

1. `npm install` (installs `playwright` too)
2. `npx playwright install chromium` (one-time, downloads the browser binary)
3. `node yahoo/login.js` — opens a browser window, log into Yahoo once. Your session is
   saved in `yahoo/.playwright-profile/` (gitignored) and reused by every script below.
4. That's it — `challenge-tracker`, `lineup-advice`, `trade-analyzer`, `waiver-targets`,
   and `weekly-recap` will now use `node yahoo/get-*.js` / `node yahoo/run-challenge.js`
   automatically instead of asking you to paste screenshots.

If a script ever fails with `NOT_LOGGED_IN`, just run `node yahoo/login.js` again.
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "Document Playwright-based live-data setup in README"
```

---

## Post-draft follow-up (not a task — do this manually Aug 23+)

Once the draft completes and Week 1 has scores, run through Task 7 Step 5, Task 8 Step 5,
Task 9 Step 2, and Task 10 Step 6 in order, fixing any selector mismatches you find. Commit
each fix separately with a message like `Fix roster-page selector after seeing live draft
data`.
