// yahoo/get-matchup.js
const { launchContext } = require('./browser');
const { getPairings, findUserMatchup } = require('./pages/matchup-page');
const { getRoster } = require('./pages/roster-page');

const USER_TEAM_ID = '2'; // J's Pancakes

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/get-matchup.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  try {
    const page = await context.newPage();

    const pairings = await getPairings(page, week);
    const matchup = findUserMatchup(pairings, USER_TEAM_ID);
    if (!matchup) {
      throw new Error(`No matchup found for team ${USER_TEAM_ID} in week ${week}`);
    }

    // getRoster() navigates the page it's given (page.goto). A single shared Page
    // object cannot safely handle two concurrent navigations (Promise.all would race
    // both goto() calls against each other and can corrupt/mix up the resulting roster
    // data). Open a second tab in the same context so the two fetches can genuinely run
    // concurrently without racing each other.
    const opponentPage = await context.newPage();
    try {
      const [userRoster, opponentRoster] = await Promise.all([
        getRoster(page, matchup.userTeamId, { week }),
        getRoster(opponentPage, matchup.opponentTeamId, { week }),
      ]);

      const result = {
        week: Number(week),
        userTeam: userRoster,
        opponent: opponentRoster,
      };

      console.log(JSON.stringify(result, null, 2));
    } finally {
      await opponentPage.close();
    }
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
