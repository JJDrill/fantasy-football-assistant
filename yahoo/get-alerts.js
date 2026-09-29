// yahoo/get-alerts.js
// Replaces asking the user about Yahoo app alerts: flags players on either roster in this
// week's matchup who show up in Yahoo's league-wide add/drop trends, and lists recent moves
// in this league, plus your pending waiver claims. Usage: node yahoo/get-alerts.js <week> [days=7]
const { launchContext } = require('./browser');
const { getPairings, findUserMatchup } = require('./pages/matchup-page');
const { getRoster } = require('./pages/roster-page');
const { TRENDS_SORTS, getTransactionTrends, getLeagueTransactions, buildAlerts } = require('./pages/alerts-page');
const { getTeamNotes } = require('./pages/team-notes-page');

const USER_TEAM_ID = '2'; // J's Pancakes

async function main() {
  const week = process.argv[2];
  const days = Number(process.argv[3] ?? 7);
  if (!week || Number.isNaN(days)) {
    console.error('Usage: node yahoo/get-alerts.js <week> [days=7]');
    process.exit(1);
  }

  const context = await launchContext();
  try {
    const page = await context.newPage();

    const matchup = findUserMatchup(await getPairings(page, week), USER_TEAM_ID);
    if (!matchup) throw new Error(`No matchup found for team ${USER_TEAM_ID} in week ${week}`);
    const userTeam = await getRoster(page, matchup.userTeamId, { week });
    const opponent = await getRoster(page, matchup.opponentTeamId, { week });

    // Each sort is a separate top-50 list, so pulling all three widens coverage.
    const trends = [];
    for (const sort of [TRENDS_SORTS.drops, TRENDS_SORTS.adds, TRENDS_SORTS.overall]) {
      trends.push(...(await getTransactionTrends(page, sort)));
    }
    const transactions = await getLeagueTransactions(page);
    // Pending waiver claims (and any other pending item), waiver priority, IR usage.
    const userTeamNotes = await getTeamNotes(page, USER_TEAM_ID);

    const alerts = buildAlerts({
      trends,
      rosters: { userTeam, opponent },
      transactions,
      now: new Date(),
      days,
      userTeamId: USER_TEAM_ID,
    });

    console.log(JSON.stringify({ week: Number(week), opponent: opponent.teamName, userTeamNotes, ...alerts }, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
