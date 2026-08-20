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

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
  parseRosterPanelSlot,
  getOurRoster,
};
