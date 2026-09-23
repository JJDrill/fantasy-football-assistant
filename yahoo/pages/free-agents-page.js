const { playersUrl, assertLoggedIn } = require('./base-page');

const TEAM_POS_RE = /([A-Z][a-zA-Z]{1,3}) - ([A-Z]{1,3})\b/;

// Substrings Yahoo splices directly against the player name in the cell's raw DOM text,
// with no separating whitespace (e.g. "Jahmyr GibbsVideo ForecastPlayer Note Det - RB..."
// or, with an injury designation, "Puka NacuaQVideo ForecastNew Player Note LAR - WR...").
// Cutting the name off at the earliest of these markers (rather than trying to split on
// case transitions, which mangles real names like "McCaffrey") reliably isolates it.
//
// These must be full, specific phrases rather than single generic words: a bare 'Note'
// (or 'Player') would substring-match inside a real surname, e.g. NFL player Joseph
// Noteboom's cell contains "...NoteboomVideo Forecast..." — indexOf('Note') would find a
// false match at the start of "Noteboom" and truncate the name down to just "Joseph".
const NAME_CELL_MARKERS = [
  'Video Forecast', // the usual first marker glued after the name, when a video exists
  'Player Note', // some players have no video, just "...Player Note" glued directly on
  'Open player notes for',
  'No new player', // defenses have no video forecast link, just a "No new player Notes" note
];

// A single- or multi-letter injury/status designation (Q/O/D/C/P, or IR/PUP/NFI/SUSP)
// glued directly onto the name with no separating space, e.g. "NacuaQ" -> "Nacua" or
// "SmithIR" -> "Smith". Longest tags are checked first so "IR" isn't mistaken for a
// single trailing letter. Only strips when the character right before the tag is
// lowercase (i.e. genuinely glued, not a real capitalized word boundary like "III").
const INJURY_TAGS = ['SUSP', 'PUP', 'NFI', 'IR', 'Q', 'O', 'D', 'C', 'P'];

// A generational suffix (Jr./Sr./II/III/IV) directly preceding the tag is ALSO a valid
// glued boundary, not just a lowercase letter -- live-verified (2026-08-21, mock draft):
// "L. Burden III" + injury tag "Q" glues to "L. Burden IIIQ", and the lowercase-only guard
// (added to avoid misreading "III" itself as a glued tag) refused to strip it, since the
// character right before "Q" is the uppercase "I" from "III". Without this, the parsed
// name never matches the real DOM text, and every pick attempt on such a player fails.
const SUFFIX_BOUNDARY_RE = /(?:II|III|IV|Jr\.|Sr\.)$/;

function stripGluedInjuryTag(name) {
  for (const tag of INJURY_TAGS) {
    if (name.length > tag.length && name.endsWith(tag)) {
      const remainder = name.slice(0, name.length - tag.length);
      const charBeforeTag = remainder[remainder.length - 1];
      if (/[a-z]/.test(charBeforeTag) || SUFFIX_BOUNDARY_RE.test(remainder)) {
        return remainder.trimEnd();
      }
    }
  }
  return name;
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

    // Available players show either "FA" (unclaimed) or "W (<date>)" (on waivers,
    // claimable once they clear) — both are worth surfacing as pickup targets.
    const statusText = (await cells.nth(3).textContent()).trim();
    if (statusText !== 'FA' && !statusText.startsWith('W')) continue;

    results.push({
      ...parsePlayerNameCell(nameCellText),
      status: statusText,
    });
  }

  return results;
}

module.exports = { parsePlayerNameCell, getFreeAgents };
