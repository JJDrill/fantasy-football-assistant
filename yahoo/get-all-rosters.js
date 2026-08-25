// yahoo/get-all-rosters.js
//
// Live smoke test (2026-08-25): `node yahoo/get-all-rosters.js` failed immediately with
// `NOT_LOGGED_IN: run node yahoo/login.js to refresh your Yahoo session` — no persisted
// Yahoo session was available in this environment. That's an environment/session issue,
// not a bug in this script: it fails at the same `assertLoggedIn` check that every other
// script in this file (get-matchup.js, get-free-agents.js, get-scoreboard.js) relies on,
// and getStandings()/getRoster() are already covered by their own page-object tests. Full
// live verification (confirming the composed output shape end-to-end) is still pending a
// logged-in session; re-run this script after `node yahoo/login.js` to complete it.
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const week = process.argv[2]; // optional; omit for current roster snapshot

  const context = await launchContext();
  try {
    const page = await context.newPage();
    const teams = await getStandings(page);

    // One tab per team so every roster fetch can run concurrently without racing
    // navigations against each other (same reasoning as get-matchup.js's opponent tab).
    const rosters = await Promise.all(
      teams.map(async (team) => {
        const teamPage = await context.newPage();
        try {
          return await getRoster(teamPage, team.teamId, week ? { week } : {});
        } finally {
          await teamPage.close();
        }
      })
    );

    const result = teams.map((team, i) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      roster: rosters[i].roster,
    }));

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
