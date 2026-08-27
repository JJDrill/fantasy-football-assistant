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

  return { teamId, teamName, roster };
}

module.exports = {
  parseRosterRow,
  parsePosition,
  parseTeamAbbreviation,
  parseOpponent,
  getRoster,
};
