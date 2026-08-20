# Draft Driver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully autonomous Playwright agent that drafts the user's team unattended in the
Aug 23 2026 live draft, using Yahoo's own in-draft player rankings and a standard
best-player-available-then-need strategy, falling back to Yahoo's built-in autopick on any
error or missed deadline.

**Architecture:** A new `draft-room-page.js` page object encapsulates all draft-room DOM
interaction (reusing `yahoo/browser.js`'s persistent session). A pure `strategy.js`
implements pick selection with no browser dependency. `run-draft.js` orchestrates: poll for
our turn, read state, decide, click, with a hard internal deadline.

**Tech Stack:** Node.js (CommonJS), `playwright`, `node --test`.

**Reference:** `docs/superpowers/specs/2026-08-20-draft-driver-design.md`

**Known constraint:** the real league's draft opens Sun Aug 23 2026, 5pm EDT. Everything in
this plan was validated against **mock drafts** during manual testing (2026-08-20) — mock
and real draft rooms share the identical URL pattern and DOM/interaction flow
(`draftclient/f1/<leagueId>/<teamId>?auth=<token>`), confirmed by driving both. Selectors
below are based on real accessibility-tree structure captured live, using Playwright
role-based locators (matched directly from what was observed, not guessed CSS classes).
**Task 7 (live end-to-end test) is mandatory before Sunday** — run it against a fresh mock
draft, not just unit tests, before trusting this with the real draft.

One thing that could NOT be fully diagnosed during testing: a Yahoo Fantasy Plus upsell
modal appeared once and blocked clicks until dismissed via "Exit Preview" (which exits the
whole draft). Its trigger wasn't isolated. Task 4 includes a defensive check for it; Task 7
must watch for it recurring.

---

### Task 1: Draft room page object — turn state and entering the draft

**Files:**
- Create: `yahoo/pages/draft-room-page.js`
- Test: `yahoo/pages/draft-room-page.test.js`

- [ ] **Step 1: Write the failing test for the pure turn-state classifier**

```js
// yahoo/pages/draft-room-page.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { classifyTurnState } = require('./draft-room-page');

test('classifyTurnState recognizes our turn', () => {
  assert.strictEqual(classifyTurnState('YOUR TURN, DRAFT NOW | Live NFL Draft | Yahoo Fantasy Sports'), 'ours');
});

test('classifyTurnState recognizes waiting on other teams', () => {
  assert.strictEqual(classifyTurnState('6 picks until your turn | Live NFL Draft | Yahoo Fantasy Sports'), 'waiting');
});

test('classifyTurnState recognizes the draft finishing', () => {
  assert.strictEqual(classifyTurnState('Live NFL Draft | Yahoo Fantasy Sports'), 'unknown');
  assert.strictEqual(classifyTurnState('Draft Complete'), 'complete');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/pages/draft-room-page.js
const { assertLoggedIn } = require('./base-page');

// Live-verified (2026-08-20, mock drafts): the browser tab title reliably reflects turn
// state — "YOUR TURN, DRAFT NOW | ..." when it's our pick, "N picks until your turn | ..."
// while waiting, and the draft-room body shows a "Draft Complete" heading once finished.
// Using page.title() avoids depending on any particular DOM structure for this signal.
function classifyTurnState(title) {
  if (title.includes('YOUR TURN')) return 'ours';
  if (/picks until your turn/i.test(title)) return 'waiting';
  if (title.includes('Draft Complete') || title === 'Draft Complete') return 'complete';
  return 'unknown';
}

async function getTurnState(page) {
  // "Draft Complete" is shown as page body text/heading, not always in the title —
  // check both.
  const title = await page.title();
  const fromTitle = classifyTurnState(title);
  if (fromTitle !== 'unknown') return fromTitle;

  const complete = await page.getByText('Draft Complete').count();
  return complete > 0 ? 'complete' : 'unknown';
}

async function enterDraft(page, draftUrl) {
  await page.goto(draftUrl);
  await assertLoggedIn(page);
  // The draft client shows "Connecting to draft server" before the room is interactive.
  await page.getByText('Connecting to draft server').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
}

module.exports = { classifyTurnState, getTurnState, enterDraft };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Verify against a live mock draft**

Join a fresh mock draft (8-team standard, via
`https://football.fantasysports.yahoo.com/f1/109715/mock_lobby?lobby=standard`, click "8
Team", then use the "Launch Draft App" link from the lobby table — this gives a URL with a
real `auth` token, which is required; a bare `draftclient/f1/<id>/<team>` URL without
`?auth=` will hang on "Connecting to draft server" forever). Run:

```bash
node -e "
const { launchContext } = require('./yahoo/browser');
const { enterDraft, getTurnState } = require('./yahoo/pages/draft-room-page');
(async () => {
  const ctx = await launchContext({ headless: false });
  const page = await ctx.newPage();
  await enterDraft(page, '<the draftclient URL with ?auth=... from the lobby>');
  console.log('turn state:', await getTurnState(page));
  await ctx.close();
})();
"
```

Run headed (`headless: false`) for this manual check so you can watch it alongside the
console output. Confirm the reported turn state matches what you see on screen, and try it
again a few seconds later once your turn arrives to confirm it flips to `'ours'`.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/draft-room-page.js yahoo/pages/draft-room-page.test.js
git commit -m "Add draft room page object: turn state detection and draft entry"
```

---

### Task 2: Draft room page object — reading available players

**Files:**
- Modify: `yahoo/pages/draft-room-page.js`
- Modify: `yahoo/pages/draft-room-page.test.js`

- [ ] **Step 1: Write the failing test for the pure player-row parser**

```js
// append to yahoo/pages/draft-room-page.test.js
const { parseAvailablePlayerRow } = require('./draft-room-page');

test('parseAvailablePlayerRow extracts name/position/team/bye and reuses the standard name-cell format', () => {
  const raw = {
    nameCellText: 'J. Gibbs J. Gibbs RB • Det • Bye 6',
    projPts: '297.7',
  };
  const result = parseAvailablePlayerRow(raw);
  assert.deepStrictEqual(result, {
    name: 'J. Gibbs',
    position: 'RB',
    nflTeam: 'Det',
    projPts: 297.7,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: FAIL — `parseAvailablePlayerRow` not exported.

- [ ] **Step 3: Write the implementation**

The draft room's player-name cell uses the same "name repeated, then `POS • Team • Bye N`"
text format already handled by `yahoo/pages/free-agents-page.js`'s `parsePlayerNameCell` —
reuse it instead of duplicating the parsing logic.

```js
// add to yahoo/pages/draft-room-page.js
const { parsePlayerNameCell } = require('./free-agents-page');

function parseAvailablePlayerRow(raw) {
  const { name, nflTeam, position } = parsePlayerNameCell(raw.nameCellText);
  return {
    name,
    position,
    nflTeam,
    projPts: Number(raw.projPts),
  };
}

// Live-verified (2026-08-20, mock draft room): the available-players table has a
// "Player" column header and a "Proj Pts" column header among many stat columns. Locate
// the table by the presence of both headers (more specific than either alone, since
// "Player" could theoretically match other tables) and find each column's index
// dynamically from the header row rather than hardcoding cell positions — this table has
// ~20 columns and hardcoded indices would be especially fragile here.
async function getAvailablePlayers(page, { limit = 40 } = {}) {
  const table = page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Proj Pts' }) }).first();
  const headers = await table.locator('thead th, thead >> role=columnheader').allTextContents();
  const playerColIndex = headers.findIndex((h) => h.trim() === 'Player');
  const projPtsColIndex = headers.findIndex((h) => h.trim() === 'Proj Pts');

  const rows = table.locator('tbody tr');
  const count = Math.min(await rows.count(), limit);
  const players = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    if (cellCount <= Math.max(playerColIndex, projPtsColIndex)) continue;

    const nameCellText = (await cells.nth(playerColIndex).textContent()).trim();
    if (!nameCellText) continue;
    const projPtsText = (await cells.nth(projPtsColIndex).textContent()).trim();

    players.push(parseAvailablePlayerRow({ nameCellText, projPts: projPtsText }));
  }

  return players;
}

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
};
```

(Replace the previous `module.exports` line from Task 1 with this expanded one.)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Verify against a live mock draft**

Using the same mock draft session pattern from Task 1 Step 5:

```bash
node -e "
const { launchContext } = require('./yahoo/browser');
const { enterDraft, getAvailablePlayers } = require('./yahoo/pages/draft-room-page');
(async () => {
  const ctx = await launchContext({ headless: false });
  const page = await ctx.newPage();
  await enterDraft(page, '<draftclient URL with ?auth=...>');
  const players = await getAvailablePlayers(page, { limit: 10 });
  console.log(JSON.stringify(players, null, 2));
  await ctx.close();
})();
"
```

Expected: an array of ~10 players with clean `name`/`position`/`nflTeam`/`projPts`,
matching the top of the list you see on screen (sorted by Yahoo's default ranking). If the
`Player`/`Proj Pts` header lookup doesn't find the table, open the draft room in a normal
browser tab, right-click the player table → Inspect, and adjust the table-locating
`.filter()` condition to match what you find.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/draft-room-page.js yahoo/pages/draft-room-page.test.js
git commit -m "Add getAvailablePlayers to draft room page object"
```

---

### Task 3: Draft room page object — reading our own roster

**Files:**
- Modify: `yahoo/pages/draft-room-page.js`
- Modify: `yahoo/pages/draft-room-page.test.js`

- [ ] **Step 1: Write the failing test for the pure roster-panel parser**

```js
// append to yahoo/pages/draft-room-page.test.js
const { parseRosterPanelSlot } = require('./draft-room-page');

test('parseRosterPanelSlot extracts a filled slot', () => {
  const raw = { slotLabel: 'QB', playerName: 'L. Jackson' };
  assert.deepStrictEqual(parseRosterPanelSlot(raw), { slot: 'QB', playerName: 'L. Jackson' });
});

test('parseRosterPanelSlot handles an open slot', () => {
  const raw = { slotLabel: 'TE', playerName: null };
  assert.deepStrictEqual(parseRosterPanelSlot(raw), { slot: 'TE', playerName: null });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: FAIL — `parseRosterPanelSlot` not exported.

- [ ] **Step 3: Write the implementation**

```js
// add to yahoo/pages/draft-room-page.js

function parseRosterPanelSlot(raw) {
  return { slot: raw.slotLabel, playerName: raw.playerName || null };
}

// Live-verified (2026-08-20, mock draft room): a "YOUR TEAM (N/15)" panel lists each
// roster slot as a <li>. A filled slot has a slot-label element (e.g. "QB") followed by a
// clickable player block with the player's name; an open slot has just the slot label
// with no player block. There's no stable class name captured for this during manual
// testing (only the accessible structure was observed) — this locates the panel by the
// "YOUR TEAM" text and reads its following list, which should be robust to styling
// changes but has NOT been verified against a real class-name selector. Treat this
// function's live-verification step (below) as important, not optional.
async function getOurRoster(page) {
  const panel = page.locator('text=/YOUR TEAM \\(\\d+\\/\\d+\\)/').locator('xpath=following-sibling::*[1]');
  const slots = panel.locator('li');
  const count = await slots.count();
  const roster = [];

  for (let i = 0; i < count; i++) {
    const slot = slots.nth(i);
    const text = (await slot.textContent()).trim();
    // Slot label is the leading run of letters/slashes (QB, RB, WR, TE, W/R/T, K, DEF, BN).
    const labelMatch = text.match(/^[A-Z/]+/);
    const slotLabel = labelMatch ? labelMatch[0] : text;
    const rest = text.slice(slotLabel.length).trim();
    // An open slot has no player block, so `rest` is empty; a filled slot's remaining
    // text starts with the player's name.
    const playerName = rest ? rest.split(/[•·]/)[0].trim() : null;
    roster.push(parseRosterPanelSlot({ slotLabel, playerName }));
  }

  return roster;
}

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
  parseRosterPanelSlot,
  getOurRoster,
};
```

(Replace the previous `module.exports` line from Task 2 with this expanded one.)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/pages/draft-room-page.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Verify against a live mock draft**

```bash
node -e "
const { launchContext } = require('./yahoo/browser');
const { enterDraft, getOurRoster } = require('./yahoo/pages/draft-room-page');
(async () => {
  const ctx = await launchContext({ headless: false });
  const page = await ctx.newPage();
  await enterDraft(page, '<draftclient URL with ?auth=...>');
  console.log(JSON.stringify(await getOurRoster(page), null, 2));
  await ctx.close();
})();
"
```

Draft at least one player manually first (via the browser window, since this is headed),
then re-run the script and confirm the drafted player shows up in the right slot, and
undrafted slots show `playerName: null`. **This selector is the least-verified piece of
this plan** (built from accessible-text structure only, no confirmed CSS class) — if it
doesn't work, open the draft room, right-click the "YOUR TEAM" panel → Inspect, and rewrite
`getOurRoster` to match the real structure you find. Don't skip this.

- [ ] **Step 6: Commit**

```bash
git add yahoo/pages/draft-room-page.js yahoo/pages/draft-room-page.test.js
git commit -m "Add getOurRoster to draft room page object"
```

---

### Task 4: Draft room page object — submitting a pick

**Files:**
- Modify: `yahoo/pages/draft-room-page.js`
- Modify: `yahoo/pages/draft-room-page.test.js`

- [ ] **Step 1: Write the implementation**

No pure function to unit test here — this is pure Playwright interaction. Write it
directly, following the exact sequence confirmed during manual testing: click the
player's name cell (opens a confirmation dialog with player detail), then click "Draft"
inside that dialog.

```js
// add to yahoo/pages/draft-room-page.js

// Live-verified (2026-08-20, mock draft rooms): clicking a player's name cell in the
// available-players table opens a modal dialog with player detail and a "Draft" button
// at the bottom. This is the reliable path — a per-row one-click "Draft" button also
// exists in some views but was less reliable to target during testing (the row-level
// button sometimes triggered the same confirmation dialog anyway).
//
// KNOWN RISK (see spec's "Known gap"): a Yahoo Fantasy Plus upsell dialog was observed
// once, unpredictably, with an "Exit Preview" button instead of "Draft" — clicking
// through it exits the whole draft. This function detects that case and throws instead
// of blindly clicking whatever button is in the dialog, so the deadline guard in
// run-draft.js can catch it and fall back to Yahoo's autopick rather than accidentally
// leaving the draft.
async function draftPlayer(page, playerName) {
  const nameCell = page.locator(`text="${playerName}"`).first();
  await nameCell.click();

  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });

  const exitPreview = dialog.getByRole('button', { name: 'Exit Preview' });
  if (await exitPreview.count()) {
    throw new Error(
      `UNEXPECTED_UPSELL_DIALOG: expected a Draft confirmation for "${playerName}" but got an Exit Preview dialog instead`
    );
  }

  const draftButton = dialog.getByRole('button', { name: 'Draft' });
  await draftButton.click();
}

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
  parseRosterPanelSlot,
  getOurRoster,
  draftPlayer,
};
```

(Replace the previous `module.exports` line from Task 3 with this expanded one.)

- [ ] **Step 2: Verify against a live mock draft**

```bash
node -e "
const { launchContext } = require('./yahoo/browser');
const { enterDraft, getAvailablePlayers, draftPlayer, getOurRoster } = require('./yahoo/pages/draft-room-page');
(async () => {
  const ctx = await launchContext({ headless: false });
  const page = await ctx.newPage();
  await enterDraft(page, '<draftclient URL with ?auth=...>');
  const [top] = await getAvailablePlayers(page, { limit: 1 });
  console.log('drafting:', top.name);
  await draftPlayer(page, top.name);
  console.log(JSON.stringify(await getOurRoster(page), null, 2));
  await ctx.close();
})();
"
```

Wait until it's actually your turn in the joined mock draft before running this (check
with `getTurnState` from Task 1, or just watch the screen). Expected: the console logs the
player it drafted, and the subsequent roster dump shows that player in the correct slot.
If the Yahoo Plus dialog appears, the script should throw `UNEXPECTED_UPSELL_DIALOG` rather
than hang or silently fail — if it hangs instead, the dialog structure differs from what
this code expects and needs adjustment.

- [ ] **Step 3: Commit**

```bash
git add yahoo/pages/draft-room-page.js
git commit -m "Add draftPlayer to draft room page object"
```

---

### Task 5: Pick strategy (pure logic)

**Files:**
- Create: `yahoo/draft/strategy.js`
- Test: `yahoo/draft/strategy.test.js`

**Roster slot requirements for this league** (from `reference/League_Settings.pdf`):
`QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6, IR×2`. The 7 "starting lineup" slots that
drive the BPA→need switch are: `QB, WR, WR, RB, RB, TE, W/R/T` (K and DEF are excluded from
this set — they're handled by the separate K/DEF-deferral rule, not the BPA→need switch).

- [ ] **Step 1: Write the failing tests**

```js
// yahoo/draft/strategy.js
const { test } = require('node:test');
const assert = require('node:assert');
const { pickPlayer } = require('./strategy');

const STARTING_SLOTS = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'W/R/T'];
const TOTAL_ROUNDS = 15;

function emptyRoster() {
  return [
    { slot: 'QB', playerName: null },
    { slot: 'WR', playerName: null },
    { slot: 'WR', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'RB', playerName: null },
    { slot: 'TE', playerName: null },
    { slot: 'W/R/T', playerName: null },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
    { slot: 'BN', playerName: null },
  ];
}
```

Path note: the plan's test file should live at `yahoo/draft/strategy.test.js`; the
snippet above starts it — continue with the actual test bodies below in the same file
(don't create a second file).

```js
// yahoo/draft/strategy.test.js (continued)
test('early round: picks best player available regardless of position', () => {
  const available = [
    { name: 'A', position: 'RB', projPts: 300 },
    { name: 'B', position: 'QB', projPts: 350 },
  ];
  const result = pickPlayer(available, emptyRoster(), { currentRound: 1 });
  assert.strictEqual(result.name, 'B');
});

test('early round: excludes K and DEF even if top-ranked', () => {
  const available = [
    { name: 'BestDef', position: 'DEF', projPts: 999 },
    { name: 'B', position: 'QB', projPts: 350 },
  ];
  const result = pickPlayer(available, emptyRoster(), { currentRound: 1 });
  assert.strictEqual(result.name, 'B');
});

test('once starting lineup is full: picks best player at a still-needed position', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: null },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
  ];
  const available = [
    { name: 'BestOverall', position: 'RB', projPts: 400 },
    { name: 'BestTE', position: 'TE', projPts: 200 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 8 });
  assert.strictEqual(result.name, 'BestTE');
});

test('once starting lineup is full and no open non-bench slot matches, best player fills bench', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
    { slot: 'BN', playerName: null },
  ];
  const available = [
    { name: 'BestOverall', position: 'RB', projPts: 400 },
    { name: 'Worse', position: 'WR', projPts: 100 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 8 });
  assert.strictEqual(result.name, 'BestOverall');
});

test('final two rounds: takes best K or DEF if those slots are still open', () => {
  const roster = [
    { slot: 'QB', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'WR', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'RB', playerName: 'Filled' },
    { slot: 'TE', playerName: 'Filled' },
    { slot: 'W/R/T', playerName: 'Filled' },
    { slot: 'K', playerName: null },
    { slot: 'DEF', playerName: null },
  ];
  const available = [
    { name: 'BestKicker', position: 'K', projPts: 120 },
    { name: 'MarginalBenchPlayer', position: 'WR', projPts: 50 },
  ];
  const result = pickPlayer(available, roster, { currentRound: 14 });
  assert.strictEqual(result.name, 'BestKicker');
});

test('throws if available list is empty', () => {
  assert.throws(() => pickPlayer([], emptyRoster(), { currentRound: 1 }), /no available players/i);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test yahoo/draft/strategy.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// yahoo/draft/strategy.js
const STARTING_SLOTS = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'W/R/T'];
const FINAL_ROUNDS_FOR_K_DEF = 2;
const TOTAL_ROUNDS = 15;

function openSlots(roster) {
  return roster.filter((s) => !s.playerName);
}

function startingLineupFull(roster) {
  // For each required starting slot, at least that many roster entries with that slot
  // label must be filled. Since roster entries already carry their slot label 1:1 with
  // the league's roster requirements, this is just: no open slot whose label is in
  // STARTING_SLOTS.
  return !roster.some((s) => !s.playerName && STARTING_SLOTS.includes(s.slot));
}

function isFinalRounds(currentRound, totalRounds) {
  return currentRound > totalRounds - FINAL_ROUNDS_FOR_K_DEF;
}

function pickPlayer(available, roster, { currentRound, totalRounds = TOTAL_ROUNDS } = {}) {
  const kDefAllowed = isFinalRounds(currentRound, totalRounds);
  const pool = kDefAllowed
    ? available
    : available.filter((p) => p.position !== 'K' && p.position !== 'DEF');

  if (pool.length === 0) {
    throw new Error('No available players to pick from (pool empty after K/DEF filtering)');
  }

  const byValueDesc = [...pool].sort((a, b) => b.projPts - a.projPts);

  if (!startingLineupFull(roster)) {
    return byValueDesc[0];
  }

  const neededPositions = new Set(
    openSlots(roster)
      .filter((s) => STARTING_SLOTS.includes(s.slot) || s.slot === 'W/R/T')
      .map((s) => s.slot)
  );

  if (neededPositions.size > 0) {
    // W/R/T can be filled by WR, RB, or TE.
    const matchesNeed = (p) =>
      neededPositions.has(p.position) ||
      (neededPositions.has('W/R/T') && ['WR', 'RB', 'TE'].includes(p.position));
    const bestMatch = byValueDesc.find(matchesNeed);
    if (bestMatch) return bestMatch;
  }

  return byValueDesc[0];
}

module.exports = { pickPlayer };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test yahoo/draft/strategy.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add yahoo/draft/strategy.js yahoo/draft/strategy.test.js
git commit -m "Add pure pick-strategy logic: BPA-then-need with K/DEF deferral"
```

---

### Task 6: run-draft.js orchestrator

**Files:**
- Create: `yahoo/run-draft.js`
- Modify: `yahoo/pages/base-page.js`

- [ ] **Step 1: Add a draft URL helper to base-page.js**

```js
// add to yahoo/pages/base-page.js, alongside the other URL builders
function draftUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/draft`;
}
```

Add `draftUrl` to the `module.exports` object. This points at the league's own "Draft" nav
link (`/f1/109715/draft`) — confirmed present in the site nav during earlier testing, but
**not yet confirmed to work as a direct entry point for the real draft**, since the real
draft hasn't opened yet. This is different from the mock-draft flow, which requires a
`?auth=` token obtained from the mock lobby's "Launch Draft App" link — the real draft, tied
to the user's own logged-in session, may not need that token (Yahoo likely authenticates
via the existing session cookie instead). **Verify this specific URL once the real draft
room opens Sunday, before relying on it** — if it doesn't work, get the real draft's entry
URL the same way the mock ones were found (open it manually once, copy the URL you land
on).

- [ ] **Step 2: Write run-draft.js**

```js
// yahoo/run-draft.js
const fs = require('node:fs');
const path = require('node:path');
const { launchContext } = require('./browser');
const {
  enterDraft,
  getTurnState,
  getAvailablePlayers,
  getOurRoster,
  draftPlayer,
} = require('./pages/draft-room-page');
const { draftUrl } = require('./pages/base-page');
const { pickPlayer } = require('./draft/strategy');

const POLL_INTERVAL_MS = 2500;
const PICK_DEADLINE_MS = 52000; // Yahoo's clock is 60s; leave margin for network/render time.
const TOTAL_ROUNDS = 15;
const LOG_PATH = path.join(__dirname, 'draft-log.jsonl');

function log(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

async function withDeadline(promise, ms, onTimeout) {
  let timedOut = false;
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve(undefined);
    }, ms);
  });
  const result = await Promise.race([promise, timeout]);
  if (timedOut) {
    onTimeout();
    return undefined;
  }
  return result;
}

async function takeOurTurn(page, currentRound) {
  const [roster, available] = await Promise.all([getOurRoster(page), getAvailablePlayers(page)]);
  const choice = pickPlayer(available, roster, { currentRound, totalRounds: TOTAL_ROUNDS });
  await draftPlayer(page, choice.name);
  log({ event: 'picked', round: currentRound, player: choice.name, position: choice.position });
}

async function main() {
  const context = await launchContext();
  try {
    const page = await context.newPage();
    await enterDraft(page, draftUrl());
    log({ event: 'entered_draft' });

    let currentRound = 1;
    let lastState = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const state = await getTurnState(page);
      if (state !== lastState) {
        log({ event: 'state_change', state });
        lastState = state;
      }

      if (state === 'complete') {
        log({ event: 'draft_complete' });
        break;
      }

      if (state === 'ours') {
        const attempt = takeOurTurn(page, currentRound).catch((err) => {
          log({ event: 'pick_error', round: currentRound, error: err.message });
        });
        await withDeadline(attempt, PICK_DEADLINE_MS, () => {
          log({ event: 'deadline_missed', round: currentRound, note: 'letting Yahoo autopick take this turn' });
        });
        currentRound += 1;
        // Give the UI a moment to reflect the new state before polling again, whether
        // our pick landed or Yahoo's autopick took over.
        await page.waitForTimeout(POLL_INTERVAL_MS);
        continue;
      }

      await page.waitForTimeout(POLL_INTERVAL_MS);
    }
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

**Note on `currentRound` tracking:** this increments a local counter every time we
observe our own turn, rather than scraping a round number from the page — simpler and
avoids a dependency on the round-number display being reliably scrapeable. This assumes
`takeOurTurn` is only ever invoked once per actual turn, which holds given the state-change
logging and the fact that `state` only reads `'ours'` while it's actually our turn.

- [ ] **Step 3: Add draft-log.jsonl to .gitignore**

Open `.gitignore` and add a line: `yahoo/draft-log.jsonl` (this is a runtime artifact, not
something to commit).

- [ ] **Step 4: Commit**

```bash
git add yahoo/run-draft.js yahoo/pages/base-page.js .gitignore
git commit -m "Add run-draft.js orchestrator: poll loop, deadline guard, pick logging"
```

---

### Task 7: Live end-to-end verification — MANDATORY before Sunday

This is not optional polish — it's the only way to gain real confidence in `run-draft.js`
before it runs unattended on the actual draft.

- [ ] **Step 1: Run a full mock draft with `run-draft.js` driving it**

Join a fresh 8-team (or larger) live mock draft via the mock lobby, get its `draftclient`
URL with `?auth=...` from the "Launch Draft App" link, and run:

```bash
node yahoo/run-draft.js
```

**Before running:** temporarily point `draftUrl()` (or just call `enterDraft` directly
with the mock URL in a throwaway copy of `run-draft.js`, then delete the copy) at the mock
draft's URL instead of the real league's — `run-draft.js` as written always calls
`draftUrl()`, which targets the real league. Don't commit a version hardcoded to a mock
league.

- [ ] **Step 2: Watch it draft several real rounds unattended**

Confirm:
- It correctly detects when it's our turn and picks within the deadline.
- Early picks are BPA regardless of position (check the log's `position` field varies).
- No K/DEF picked early.
- Once the starting lineup fills (watch the log), later picks target open positions.
- If the Yahoo Plus upsell dialog or any other unexpected UI appears, confirm the deadline
  guard catches it and Yahoo's autopick takes over — don't just watch it fail silently,
  actually verify a `deadline_missed` or `pick_error` log line appears and the draft
  continues rather than hanging.

- [ ] **Step 3: Fix whatever breaks**

If any step in Tasks 1-6 doesn't hold up under a real full-length run (timing too tight,
a selector that worked in isolated testing doesn't hold up under the full flow, etc.), fix
it here and re-run until a full mock draft completes cleanly with this script driving it.

- [ ] **Step 4: Document the outcome**

Add a short note to `docs/superpowers/specs/2026-08-20-draft-driver-design.md`'s "Known
gap" section (or a new section) recording what you found — did the upsell dialog recur, did
timing hold up, anything else worth knowing before Sunday. Commit that update.

```bash
git add docs/superpowers/specs/2026-08-20-draft-driver-design.md
git commit -m "Document live end-to-end draft-driver test results"
```

---

## Post-implementation, before Sunday (not a task — manual)

Once Task 7 passes, do one more live check specifically of `draftUrl()` against the real
league (Task 6 Step 1's caveat) as soon as the real draft room opens Sunday — ideally with
enough time before 5pm ET to fix it if the URL/auth pattern differs from the mock-draft
assumption.
