const { assertLoggedIn } = require('./base-page');
const { parsePlayerNameCell } = require('./free-agents-page');

// Live-verified (2026-08-20, mock drafts): the browser tab title reliably reflects turn
// state — "YOUR TURN, DRAFT NOW | ..." when it's our pick, "N picks until your turn | ..."
// while waiting, and the draft-room body shows a "Draft Complete" heading once finished.
// Using page.title() avoids depending on any particular DOM structure for this signal.
function classifyTurnState(title) {
  if (title.includes('YOUR TURN')) return 'ours';
  if (/\d+\s+picks?\s+until\s+your\s+turn/i.test(title)) return 'waiting';
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
  await page.getByText('Connecting to draft server').waitFor({ state: 'hidden', timeout: 30000 }).catch((err) => {
    console.warn('enterDraft: "Connecting to draft server" did not disappear within timeout:', err.message);
  });
}

// The draft room's player-name cell suffix is conceptually "POS • Team • Bye N" (e.g.
// "RB • Det • Bye 6"), unlike the free-agents page's "Team - POS" suffix that
// free-agents-page.js's TEAM_POS_RE matches. Live-verified (2026-08-20, mock draft room):
// the "•" separators are CSS-rendered, not real characters — `textContent` on the actual
// DOM produces the whole suffix glued together with no separators at all, e.g.
// "J. GibbsRBDetBye 6" or, with an injury tag glued onto the name,
// "P. NacuaQWRLARBye 11". Stripping any literal "•" (with its surrounding whitespace)
// first normalizes both forms — the test's spaced-bullet mock and the real glued DOM text
// — down to the same glued shape, so one regex handles both. The position/team are
// pulled out here (anchored on a known position code, since there's no delimiter to rely
// on) and only the leading name portion is handed to parsePlayerNameCell, reusing its
// glued-injury-tag-stripping logic rather than re-implementing name cleanup.
const POSITION_CODES = ['QB', 'RB', 'WR', 'TE', 'DEF', 'DST', 'K'];
const POS_TEAM_BYE_RE = new RegExp(`(${POSITION_CODES.join('|')})([A-Za-z]{2,4})Bye\\s*(\\d+)`);

// Live-verified (2026-08-20, mock draft room, DEF position filter): team defenses have no
// separate team-abbreviation token — the player "name" IS the team name, glued straight
// onto "DEFBye N", e.g. "TexansDEFBye 8", "RamsDEFBye 11". POS_TEAM_BYE_RE requires a
// 2-4 letter team-abbreviation token between the position code and "Bye", so it never
// matches these rows. Falling back to this DEF-specific pattern (anything up to a literal
// "DEFBye") when the primary regex misses and "DEF" is present in the string handles it.
const DEF_BYE_RE = /^(.+?)DEFBye\s*(\d+)/;

function parseAvailablePlayerRow(raw) {
  const compact = raw.nameCellText.trim().replace(/\s*•\s*/g, '').replace(/\s+/g, ' ');
  const posTeamMatch = compact.match(POS_TEAM_BYE_RE);

  if (posTeamMatch) {
    const namePart = compact.slice(0, posTeamMatch.index).trim();
    const { name } = parsePlayerNameCell(namePart);
    return {
      name,
      position: posTeamMatch[1],
      nflTeam: posTeamMatch[2],
      projPts: Number(raw.projPts),
    };
  }

  const defMatch = compact.includes('DEF') && compact.match(DEF_BYE_RE);
  if (defMatch) {
    return {
      name: defMatch[1].trim(),
      position: 'DEF',
      nflTeam: null,
      projPts: Number(raw.projPts),
    };
  }

  // Row text didn't match any known shape — surface that clearly (rather than silently
  // returning a null position indistinguishable from a successful parse) so downstream
  // pick-strategy code can deliberately filter these out instead of accidentally treating
  // garbage as a real candidate.
  console.warn('parseAvailablePlayerRow: unrecognized cell format:', JSON.stringify(raw.nameCellText));
  return {
    name: compact,
    position: 'UNKNOWN',
    nflTeam: null,
    projPts: Number(raw.projPts),
  };
}

// Live-verified (2026-08-20, mock draft room): the available-players table has a
// "Player" column header and a "Proj Pts" column header among many stat columns. Locate
// the table by the presence of both headers (more specific than either alone, since
// "Player" could theoretically match other tables) and find each column's index
// dynamically from the header row rather than hardcoding cell positions — this table has
// ~20 columns and hardcoded indices would be especially fragile here.
//
// Live-verified (2026-08-22, mock draft room): a limit of 40 left K completely unfilled
// in an otherwise-clean full-15-round run — kickers (and often defenses) rank far below
// the top 40 overall players by raw value, so once strategy.js's need-matching correctly
// tries to force a still-open K in the final rounds, it was searching a candidate pool
// that had already silently excluded every kicker on the board, found no match, and fell
// through to its pure-BPA fallback instead. The table isn't virtualized (every row really
// is in the DOM — confirmed live), so raising this just scrapes more already-present rows
// rather than triggering any extra rendering; bumped well past what's needed even late in
// a draft when the remaining pool has shrunk.
async function getAvailablePlayers(page, { limit = 200 } = {}) {
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

// The flex slot's badge renders as three separate spans ("W","R","T") that concatenate to
// the raw text "WRT" (see getOurRoster below) — normalize that to "W/R/T" here so this
// matches the literal slot-name strings Task 5's strategy engine (docs/superpowers/plans/
// 2026-08-20-draft-driver.md) hardcodes throughout STARTING_SLOTS and its roster-matching
// logic. Without this, every `=== 'W/R/T'` check there would silently treat the flex slot
// as permanently open.
function parseRosterPanelSlot(raw) {
  const slot = raw.slotLabel === 'WRT' ? 'W/R/T' : raw.slotLabel;
  return { slot, playerName: raw.playerName || null };
}

// Live-verified (2026-08-20, mock draft room) against the real DOM (the original
// accessible-text-only guess below was wrong and has been replaced): a "YOUR TEAM (N/15)"
// panel is a <span> containing that text, immediately followed by a sibling <div> holding
// a <ul> of one <li> per roster slot. Each <li> has a small "slot badge" <div> whose class
// list includes the literal, human-readable utility class "W(32px)" (these are atomic CSS
// utility classes, not build-hashed CSS-module classes — e.g. React devtools showed
// hashed classnames like "_ys_qoenog" alongside these; the hashed ones are NOT relied on
// here since they're far more likely to change between deploys). The badge's text content
// is the slot label (e.g. "QB", "K", "BN"; the flex spot renders as three separate spans
// "W","R","T" that concatenate to "WRT"). A filled slot additionally contains a
// `div.ys-player[data-id]` with an `<img title="Player Name">` — the title attribute is
// used directly rather than parsing visible text, since it's a single reliable attribute
// unaffected by the surrounding layout. An open slot has no `.ys-player` element at all.
//
// Live-verified further (2026-08-20): the draft room re-renders this panel roughly once
// per second (the pick countdown timer), which raced Playwright's auto-retrying locator
// chain — `locator().locator()...textContent()` intermittently timed out because the
// element it found got detached and replaced mid-poll. Reading the whole panel in a single
// `page.evaluate` call sidesteps that: browser JS is single-threaded, so nothing can
// re-render the DOM in the middle of one evaluate() call the way it can between two
// separate Playwright round-trips.
async function getOurRoster(page) {
  const raw = await page.evaluate(() => {
    const header = Array.from(document.querySelectorAll('span')).find((el) =>
      /^YOUR TEAM \(\d+\/\d+\)$/.test(el.textContent.trim())
    );
    const panel = header ? header.nextElementSibling : null;
    // The outer roster <ul> is `panel`'s own first child. Each filled slot's player block
    // has its OWN nested <ul> (of 3 <li>s, for position/team/bye) — using
    // `querySelectorAll('ul > li')` here would match those too, since it searches all
    // descendants, not just the top-level list. Scoping to the outer <ul>'s direct
    // children avoids double-counting those nested items as extra (bogus) roster slots.
    const topUl = panel ? panel.querySelector('ul') : null;
    if (!topUl) return [];

    return Array.from(topUl.children).map((li) => {
      const badge = li.querySelector('div[class*="W(32px)"]');
      const slotLabel = badge ? badge.textContent.trim() : '';
      const img = li.querySelector('.ys-player img');
      const playerName = img ? img.getAttribute('title') : null;
      return { slotLabel, playerName };
    });
  });

  return raw.map(parseRosterPanelSlot);
}

// Live-verified (2026-08-22, mock draft room): Yahoo redesigned the draft room since it
// was last tested here (2026-08-20/21) — the previous "click name → confirmation dialog →
// click Draft inside it" flow no longer exists. Each row in the available-players table
// now has its own one-click "Draft" button (in the same column the header calls "Queue"
// the rest of the time) that drafts the player immediately, with no confirmation dialog
// at all. Confirmed live: clicking it advances the turn state and the player immediately
// appears in the roster panel.
//
// KNOWN RISK (unchanged from before): a Yahoo Fantasy Plus upsell dialog was observed once
// (pre-redesign), unpredictably, with an "Exit Preview" button. Not reproduced against the
// new UI, but still detected defensively before attempting a pick — if one is open and
// offers "Exit Preview" instead of being a routine dismissible notification, this throws
// rather than blindly clicking through something that could exit the whole draft.
async function draftPlayer(page, playerName) {
  // Live-verified (2026-08-21, mock draft room, still true post-redesign): Yahoo shows an
  // automatic "DRAFTED BY <manager> — <player>" notification card (a <dialog>, with its
  // own close/X button) whenever ANY team picks — not just us. If one of these is still
  // open when it becomes our turn, it can intercept the click on the intended row's Draft
  // button exactly like a stale dialog from our own failed pick would. Proactively clear
  // any already-open dialog before starting this pick.
  const staleDialog = page.getByRole('dialog');
  if (await staleDialog.count()) {
    const staleText = await staleDialog.first().textContent().catch(() => '');
    if (await staleDialog.first().getByRole('button', { name: 'Exit Preview' }).count()) {
      throw new Error(
        `UNEXPECTED_UPSELL_DIALOG: found an Exit-Preview dialog before attempting to draft "${playerName}": ${staleText}`
      );
    }
    await page.keyboard.press('Escape').catch(() => {});
    await staleDialog.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // Scope to the same available-players table getAvailablePlayers locates (by the
  // presence of a "Proj Pts" columnheader), then find the row containing the exact player
  // name and click its Draft button — rather than a bare page-wide name match, which could
  // otherwise land on a "last pick" ticker, a queue entry, or another team's roster panel.
  const table = page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Proj Pts' }) }).first();
  const row = table.locator('tbody tr').filter({ has: page.getByText(playerName, { exact: true }) }).first();
  await row.getByRole('button', { name: 'Draft', exact: true }).click({ timeout: 5000 });

  // Live-verified (2026-08-22, mock draft room): the old dialog-based flow gave callers an
  // implicit settle window for free (draftPlayer() didn't return until the confirmation
  // dialog had actually closed). This one-click flow has no dialog and returns the instant
  // the click event fires — which raced run-draft.js's post-pick roster re-check badly:
  // TWO consecutive picks in live testing came back PICK_NOT_REGISTERED on the very first
  // (zero-delay) check, for two different players, even though nothing was actually wrong
  // — the roster panel simply hadn't re-rendered client-side yet at the moment checked.
  // Waiting here for the drafted player's row to actually leave the available-players
  // table (a real signal the client has processed the pick, not a blind sleep) closes that
  // gap at its source rather than requiring every caller to know to pad its own check.
  await row.waitFor({ state: 'detached', timeout: 5000 }).catch((err) => {
    console.warn(`draftPlayer: row for "${playerName}" did not leave the available-players table in time:`, err.message);
  });
}

// Live-verified (2026-08-21, mock draft): Yahoo can show a dialog/toast at ANY time, not
// just mid-pick — e.g. "You have been logged off because you logged in from another draft
// client" appeared once, unprompted, outside of any pick attempt. Previously the only
// trace of an unexpected dialog was buried inside a pick_error's raw Playwright timeout
// text, and only if it happened to be blocking a click at that exact moment — nothing
// caught one that appeared and sat there between turns, when no one (human or script) was
// looking at that moment. Polling for this independently of the pick flow gives an
// explicit, human-readable log line instead of relying on a lucky collision with a pick
// attempt.
async function getVisibleDialogText(page) {
  const dialog = page.locator('dialog[open]').first();
  if ((await dialog.count()) === 0) return null;
  return (await dialog.textContent()).trim();
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
  getVisibleDialogText,
};
