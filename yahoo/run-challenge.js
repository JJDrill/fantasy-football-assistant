// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/run-challenge.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  try {
    const page = await context.newPage();

    const standings = await getStandings(page);
    const rosters = [];
    // Sequential (not Promise.all) — getRoster() navigates the shared `page` object,
    // and concurrent navigations on one Page race each other (see get-matchup.js's
    // two-tab fix for the same issue). Fetching 10 rosters is slower this way but safe.
    for (const team of standings) {
      rosters.push(await getRoster(page, team.teamId, { week }));
    }

    console.log(JSON.stringify({ week: Number(week), standings, rosters }, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
