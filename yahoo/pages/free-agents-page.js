const { playersUrl, assertLoggedIn } = require('./base-page');

const TEAM_POS_RE = /([A-Z][a-zA-Z]{1,3}) - ([A-Z]{1,3})\b/;

// Substrings Yahoo splices directly against the player name in the cell's raw DOM text,
// with no separating whitespace (e.g. "Jahmyr GibbsVideo ForecastPlayer Note Det - RB..."
// or, with an injury designation, "Puka NacuaQVideo ForecastNew Player Note LAR - WR...").
// Cutting the name off at the earliest of these markers (rather than trying to split on
// case transitions, which mangles real names like "McCaffrey") reliably isolates it.
const NAME_CELL_MARKERS = [
  'Video', 'Forecast', 'Player', 'Note', 'Open player notes for',
  'No new player', // defenses have no video forecast link, just a "No new player Notes" note
];

// A single uppercase injury-designation letter (Q/O/D/IR/etc.) glued directly onto the
// name with no separating space, e.g. "NacuaQ" -> "Nacua".
function stripGluedInjuryTag(name) {
  return /[a-z][A-Z]$/.test(name) ? name.slice(0, -1).trimEnd() : name;
}

function parsePlayerNameCell(raw) {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  const teamPosMatch = trimmed.match(TEAM_POS_RE);
  const nflTeam = teamPosMatch ? teamPosMatch[1] : null;
  const position = teamPosMatch ? teamPosMatch[2] : 'DEF';

  // Strategy 1: the name appears twice, back to back (e.g. an accessibility-tree
  // rendering that concatenates an image's alt text with a link's visible text).
  const words = trimmed.split(' ');
  const half = Math.floor(words.length / 2);
  for (let split = 1; split <= half; split++) {
    const first = words.slice(0, split).join(' ');
    const second = words.slice(split, split * 2).join(' ');
    if (first === second && first.length > 0) {
      return { name: first, nflTeam, position };
    }
  }

  // Strategy 2: no literal duplicate is present — this is what Yahoo's live DOM
  // textContent actually produces, since the name link sits immediately against the
  // "Video Forecast"/"Player Note" markup with no whitespace between them. Cut the name
  // off at the earliest marker substring, then strip a glued injury-designation letter.
  const beforeTeamPos = teamPosMatch ? trimmed.slice(0, trimmed.indexOf(teamPosMatch[0])) : trimmed;
  let cutIndex = -1;
  for (const marker of NAME_CELL_MARKERS) {
    const idx = beforeTeamPos.indexOf(marker);
    if (idx !== -1 && (cutIndex === -1 || idx < cutIndex)) cutIndex = idx;
  }
  const candidate = cutIndex !== -1 ? beforeTeamPos.slice(0, cutIndex) : beforeTeamPos;
  const name = stripGluedInjuryTag(candidate.trim()) || beforeTeamPos.trim();

  return { name, nflTeam, position };
}

async function getFreeAgents(page, { position } = {}) {
  // Yahoo's players page filters by the `pos` query param (e.g. pos=RB), not `position`,
  // and `status=A` scopes the list to available (non-rostered) players.
  const url = position ? `${playersUrl()}?status=A&pos=${position}` : `${playersUrl()}?status=A`;
  await page.goto(url);
  await assertLoggedIn(page);

  // The page renders several `table` elements (the main sortable players list plus a
  // couple of "players also available" sidebar widgets); only the interactive one is
  // the real players list.
  const rows = page.locator('table.Table-interactive tbody tr');
  const count = await rows.count();
  const results = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    const nameCellText = (await cells.nth(2).textContent()).trim();
    if (!nameCellText) continue;

    const statusText = (await cells.nth(3).textContent()).trim();
    if (statusText !== 'FA') continue;

    results.push({
      ...parsePlayerNameCell(nameCellText),
      status: statusText,
    });
  }

  return results;
}

module.exports = { parsePlayerNameCell, getFreeAgents };
