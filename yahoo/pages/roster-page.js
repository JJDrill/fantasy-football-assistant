const { teamUrl, assertLoggedIn } = require('./base-page');

// The player-name cell renders team + true position as plain text, e.g. "Buf - QB",
// separate from the slot the player is currently started in (data-pos on td.pos).
// Live-verified (2026-08-26, https://football.fantasysports.yahoo.com/f1/109715/2?week=1):
// DEF rows use this exact same delimited "Team - POS" format (e.g. "Min - DEF") on this
// page. Do not confuse this with draft-room-page.js's draft room, where DEF names are
// glued together with no delimiter — that's a different page and does not apply here.
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
    yahooPlayerId: raw.yahooPlayerId || null,
    points: raw.points === '' ? null : Number(raw.points),
  };
}

// Live-verified (pre-draft, 2026-08-20, https://football.fantasysports.yahoo.com/f1/109715/2):
// the page's <h1> is just "Yahoo Sports" (not the team name), so the plan's `h1` locator
// for the team name was wrong. The real current-team text lives in a team-switcher nav
// widget within the page title area: a <span class="F-reset Nowrap"> with no wrapping
// <a> (the other, non-current teams in that same dropdown are links) inside
// `.title-wrapper`. That combination (`.title-wrapper span.F-reset.Nowrap`) matched
// exactly one element containing exactly "J's Pancakes" with no extra dropdown text.
const TEAM_NAME_SELECTOR = '.title-wrapper span.F-reset.Nowrap';

// Live-verified (2026-08-25, post-draft, real roster with 15 drafted players): the
// pre-draft guess above was wrong on every count. Once players are rostered, the team
// page renders THREE separate tables side by side, one per position group — offense
// (`#statTable0`), kickers (`#statTable1`), DEF/ST (`#statTable2`) — not one table with a
// "Points" header (the real header text is "Fan Pts", and it never appears as a plain
// <th> string match because the header cell nests a <div>). `table[id^="statTable"]`
// matches all three regardless of id suffix.
const ROSTER_TABLE_SELECTOR = 'table[id^="statTable"] tbody tr';

// Live-verified (2026-08-25): slot is a `data-pos` attribute on a span inside `td.pos`
// (e.g. `data-pos="QB"`), not the cell's raw text — the very next `td` is a hidden
// `<select>` of eligible slots (its textContent concatenates every `<option>`, e.g.
// "QBBN", which is what the old cell-index approach was actually reading). Player name
// lives in `td.player a.name`; empty BN/IR slots have no such link (name is "(Empty)"
// in the cell's own text, but easier to detect via the link's absence). Points live in
// `td.pts` and are blank for empty slots.
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

// `roster` and `statsArray` come from two independent page loads (points view vs.
// stat1=S view). Merging by index is only safe when both fetches produced the same
// number of rows in the same order — see ROSTER_TABLE_SELECTOR's comment above for a
// past incident of exactly this kind of silent misalignment. Refuse to merge (rather
// than silently truncating to the shorter array) if the counts disagree.
function mergeRosterStats(roster, statsArray) {
  if (statsArray.length !== roster.length) {
    throw new Error(
      `ROSTER_STATS_MISMATCH: points view returned ${roster.length} roster rows but ` +
      `stats view (?stat1=S) returned ${statsArray.length} rows — refusing to merge by ` +
      `index since row order/count may not correspond`
    );
  }
  for (let i = 0; i < roster.length; i++) {
    Object.assign(roster[i], statsArray[i]);
  }
  return roster;
}

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
    mergeRosterStats(roster, statsArray);
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
  mergeRosterStats,
  getRoster,
};
