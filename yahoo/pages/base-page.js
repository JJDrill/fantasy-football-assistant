const LEAGUE_ID = '109715';
const LEAGUE_URL = 'https://football.fantasysports.yahoo.com/league/kickerseattle';
const FANTASY_BASE = 'https://football.fantasysports.yahoo.com';

function teamUrl(teamId) {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/${teamId}`;
}

function playersUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/players`;
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
  assertLoggedIn,
};
