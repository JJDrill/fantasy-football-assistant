const LEAGUE_ID = '109715';
const LEAGUE_URL = 'https://football.fantasysports.yahoo.com/league/kickerseattle';
const FANTASY_BASE = 'https://football.fantasysports.yahoo.com';

function teamUrl(teamId) {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/${teamId}`;
}

function playersUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/players`;
}

// Points at the league's own "Draft" nav link. Live-verified (2026-08-23, real draft room
// opened ~30 min before start): this lands on a "Draft Central Overview" page, NOT the
// interactive draft room itself — same two-step shape as the mock-draft lobby. A "Live
// Draft In Progress!" panel with a "Launch Draft Application" button appears once the
// draft opens; clicking it (in a popup, same as mock drafts) is what actually reaches
// draftclient/f1/<leagueId>/<teamId>?auth=<token>. Use findLiveDraftUrl() below to get the
// real entry point rather than passing this directly to enterDraft().
function draftUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/draft`;
}

// Live-verified (2026-08-23): navigates to the Draft Central Overview page and clicks
// "Launch Draft Application" to reach the actual interactive draft room, returning the
// resulting draftclient URL. Mirrors yahoo/testing/mock-draft.js's join pattern, including
// its popup-closing fix (2026-08-22): leaving a popup open after capturing its URL, then
// separately navigating the caller's own page to the same URL, put two live connections on
// one seat and got the account evicted with "logged in from another draft client" — only
// ever one tab should end up driving the draft.
async function findLiveDraftUrl(page) {
  await page.goto(draftUrl());
  const launchBtn = page
    .getByRole('button', { name: 'Launch Draft Application' })
    .or(page.getByRole('link', { name: 'Launch Draft Application' }));
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    launchBtn.first().click(),
  ]);
  const target = popup || page;
  await target.waitForURL(/draftclient\/f1\//, { timeout: 30000 });
  const url = target.url();
  if (popup) await popup.close();
  return url;
}

async function assertLoggedIn(page) {
  if (page.url().includes('login.yahoo.com')) {
    throw new Error(
      'NOT_LOGGED_IN: run `node yahoo/login.js` to refresh your Yahoo session'
    );
  }
}

module.exports = {
  LEAGUE_ID,
  LEAGUE_URL,
  FANTASY_BASE,
  teamUrl,
  playersUrl,
  draftUrl,
  findLiveDraftUrl,
  assertLoggedIn,
};
