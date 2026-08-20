const { teamUrl, assertLoggedIn } = require('./base-page');

function parseRosterRow(raw) {
  return {
    slot: raw.slot,
    playerName: raw.playerName || null,
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

// Live-verified (pre-draft): the team page currently renders a *roster-requirements*
// summary table (headers QB/RB/WR/TE/W-R-T/K/DEF/BN/IR, one row of position counts) but
// no actual per-player roster table — there's nothing with a "Points" column yet because
// no one has drafted. The plan's guessed selector below could not be confirmed against
// real roster markup and MUST be re-verified after the Aug 23 draft (see Step 5 in the
// task). Left as-is for now: when no matching table exists, `rows.count()` is 0 and this
// function safely returns an empty roster rather than throwing.
const ROSTER_TABLE_SELECTOR = 'table:has(th:has-text("Points")) tbody tr';

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
    const row = rows.nth(i);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    if (cellCount < 2) continue;

    const slot = (await cells.nth(0).textContent()).trim();
    const playerName = (await cells.nth(1).textContent()).trim();
    const points = (await cells.nth(cellCount - 1).textContent()).trim();
    roster.push(parseRosterRow({ slot, playerName, points }));
  }

  return { teamId, teamName, roster };
}

module.exports = { parseRosterRow, getRoster };
