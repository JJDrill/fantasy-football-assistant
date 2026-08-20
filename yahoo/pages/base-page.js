const LEAGUE_ID = '109715';
const LEAGUE_URL = 'https://football.fantasysports.yahoo.com/league/kickerseattle';
const FANTASY_BASE = 'https://football.fantasysports.yahoo.com';

function teamUrl(teamId) {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/${teamId}`;
}

function playersUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/players`;
}

// Points at the league's own "Draft" nav link (confirmed present in the site nav during
// earlier testing) as the real draft's entry point. UNVERIFIED as an actual entry point
// for the real draft room, since the real draft hasn't opened yet — the mock-draft flow
// instead requires a `?auth=` token from the mock lobby's "Launch Draft App" link, and the
// real draft (tied to the user's own logged-in session) may not need that token at all.
// Verify this URL once the real draft room opens; if it doesn't work, get the real draft's
// entry URL the same way the mock ones were found (open it manually once, copy the URL you
// land on).
function draftUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/draft`;
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
  assertLoggedIn,
};
