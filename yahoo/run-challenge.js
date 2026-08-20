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
  const page = await context.newPage();

  const standings = await getStandings(page);
  const rosters = [];
  for (const team of standings) {
    rosters.push(await getRoster(page, team.teamId, { week }));
  }

  console.log(JSON.stringify({ week: Number(week), standings, rosters }, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
