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

module.exports = {
  classifyTurnState,
  getTurnState,
  enterDraft,
  parseAvailablePlayerRow,
  getAvailablePlayers,
};
