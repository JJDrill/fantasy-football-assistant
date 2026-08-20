// yahoo/smoke-test-roster.js
const { launchContext } = require('./browser');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const teamId = process.argv[2] || '2';
  const context = await launchContext();
  try {
    const page = await context.newPage();
    const roster = await getRoster(page, teamId);
    console.log(JSON.stringify(roster, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
