// yahoo/get-scoreboard.js
const { launchContext } = require('./browser');
const { getPairings } = require('./pages/matchup-page');

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/get-scoreboard.js <week>');
    process.exit(1);
  }

  const context = await launchContext();
  const page = await context.newPage();
  const pairings = await getPairings(page, week);
  console.log(JSON.stringify({ week: Number(week), pairings }, null, 2));
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
