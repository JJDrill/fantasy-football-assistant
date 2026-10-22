// yahoo/get-yahoo-suggestions.js
const { launchContext } = require('./browser');
const { getTeamSuggestions } = require('./pages/team-suggestions-page');

const USER_TEAM_ID = '2'; // J's Pancakes

async function main() {
  const context = await launchContext();
  try {
    const page = await context.newPage();
    const suggestions = await getTeamSuggestions(page, USER_TEAM_ID);
    console.log(JSON.stringify(suggestions, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
