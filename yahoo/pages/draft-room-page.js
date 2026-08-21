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
// Generational suffixes that can trail a surname (e.g. "T. Etienne Jr.", "J. Walker III").
// Stripped before taking the "surname" token below — without this, a name like
// "T. Etienne Jr." would take "Jr." as the comparison token, which trivially matches ANY
// other Jr.-suffixed player's dialog (e.g. "Michael Pittman Jr."), silently defeating the
// mismatch check for a meaningful fraction of the real player pool. Mirrors the
// suffix-awareness free-agents-page.js already needs elsewhere in this codebase, though the
// concrete approach differs (that file strips glued injury tags; this strips a
// whitespace-separated generational suffix).
const NAME_SUFFIXES = new Set(['Jr.', 'Sr.', 'II', 'III', 'IV']);

// Exported for unit testing — pure string logic split out of draftPlayer's Playwright
// interaction. Compares by surname rather than requiring the dialog to contain the exact
// playerName string: the available-players table renders names in abbreviated form
// ("J. Jefferson"), but the detail dialog that opens on click shows the player's full first
// name ("Justin" / "Jefferson" as separate elements, not "J."). An exact-substring check
// against the abbreviated form therefore NEVER matches — live-verified (2026-08-20, mock
// draft room) this made the mismatch check a permanent false positive that fired on every
// single real pick. Comparing surnames instead is reliable across both name formats and DEF
// rows (whose "name" is just the team name, e.g. "Rams") — but the surname must be taken
// after stripping any trailing generational suffix (see NAME_SUFFIXES above), or a
// suffixed player's "surname" degrades to the shared suffix itself.
function dialogMatchesPlayer(dialogText, playerName) {
  const tokens = playerName.trim().split(/\s+/);
  while (tokens.length > 1 && NAME_SUFFIXES.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  const surname = tokens.pop();
  return Boolean(surname) && dialogText.includes(surname);
}

async function draftPlayer(page, playerName) {
  // Scope the name search to the same available-players table getAvailablePlayers locates
  // (by the presence of a "Proj Pts" columnheader), rather than searching the whole page —
  // a bare-name `text=` match anywhere on the page could otherwise land on a "last pick"
  // ticker, a draft queue entry, or another team's roster panel instead of the intended row.
  const table = page.locator('table').filter({ has: page.getByRole('columnheader', { name: 'Proj Pts' }) }).first();
  const nameCell = table.locator(`text="${playerName}"`).first();
  await nameCell.click();

  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });

  try {
    const exitPreview = dialog.getByRole('button', { name: 'Exit Preview' });
    if (await exitPreview.count()) {
      throw new Error(
        `UNEXPECTED_UPSELL_DIALOG: expected a Draft confirmation for "${playerName}" but got an Exit Preview dialog instead`
      );
    }

    // Belt-and-suspenders check: even with the click scoped to the right table above,
    // confirm the dialog that actually opened is for the right player before submitting
    // the pick — a mismatch here means something clicked the wrong row and we must not
    // silently draft it.
    const dialogText = await dialog.textContent();
    if (!dialogMatchesPlayer(dialogText, playerName)) {
      throw new Error(
        `DIALOG_MISMATCH: expected a Draft confirmation for "${playerName}" but the dialog doesn't mention that name`
      );
    }

    // Deliberate pause after the mismatch check passes, before submitting: gives a human
    // watching the headed browser (this runs headed on purpose, see run-draft.js) a real
    // couple of seconds to see the confirmation card and react/intervene if something looks
    // wrong, rather than the pick firing the instant the check clears.
    await page.waitForTimeout(2000);

    const draftButton = dialog.getByRole('button', { name: 'Draft' });
    await draftButton.click({ timeout: 5000 });
    // Live-verified (2026-08-20, mock draft room): after a successful Draft click the
    // dialog can take a couple seconds to actually close. Without waiting for it, the next
    // poll loop iteration — which can fire quickly, e.g. if run-draft.js's turn-state
    // re-check still (transiently) reads 'ours' right after this same pick — starts a new
    // draftPlayer() click that lands on this still-open (or mid-close) dialog, which
    // intercepts the pointer event and burns the full click timeout before failing. Waiting
    // here for the dialog to actually disappear closes that race at its source rather than
    // relying only on callers to debounce.
    await dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch((err) => {
      console.warn('draftPlayer: confirmation dialog did not close within timeout:', err.message);
    });
  } catch (err) {
    // Live-verified (2026-08-20, mock draft room): leaving the detail dialog open after a
    // thrown error blocks every subsequent click attempt for the rest of the draft (a
    // stale dialog from one failed pick intercepted the next round's click for a full 30s
    // until Playwright gave up). Close it before propagating so run-draft.js's deadline
    // guard can retry cleanly on the next turn instead of cascading into repeated timeouts.
    await page.keyboard.press('Escape').catch(() => {});
    throw err;
  }
}

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
  parseRosterPanelSlot,
  getOurRoster,
  dialogMatchesPlayer,
  draftPlayer,
};
