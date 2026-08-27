// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');
const { getPairings } = require('./pages/matchup-page');
const { getIncAndLng } = require('./pages/player-gamelog');
const { isStarter } = require('./evaluate-challenge');
const { CHALLENGES } = require('./challenge-config');

function attachMatchupResult(team, pairings) {
  const pairing = pairings.find((p) => p.teamAId === team.teamId || p.teamBId === team.teamId);
  if (!pairing) return { isWinner: null, teamTotal: null };
  const isTeamA = pairing.teamAId === team.teamId;
  const teamTotal = isTeamA ? pairing.teamAScore : pairing.teamBScore;
  const opponentTotal = isTeamA ? pairing.teamBScore : pairing.teamAScore;
  return { isWinner: teamTotal > opponentTotal, teamTotal };
}

function buildMatchups(pairings) {
  return pairings.map((p) => ({
    teams: [
      { team_name: p.teamAName, score: p.teamAScore },
      { team_name: p.teamBName, score: p.teamBScore },
    ],
  }));
}

// Only weeks 9 and 15 need inc/lng (see reference/challenges.md), and only for starting
// QBs — an ESPN round-trip per rostered player per week would be wasted work otherwise.
async function enrichIncLng(espnPage, roster, week) {
  const config = CHALLENGES[week];
  if (!config || (config.stat !== 'inc' && config.stat !== 'lng')) return;

  for (const player of roster) {
    if (player.position !== 'QB' || !player.playerName) continue;
    if (config.pool === 'starters' && !isStarter(player)) continue;

    const result = await getIncAndLng(espnPage, {
      playerName: player.playerName,
      teamAbbreviation: player.teamAbbreviation,
      week,
      byeWeek: player.bye,
    });
    if (result) Object.assign(player, result);
  }
}

function toChallengePlayer(rosterEntry) {
  const { playerName, selected_position, teamAbbreviation, opponent, bye, ...rest } = rosterEntry;
  return { name: playerName, selected_position, ...rest };
}

async function main() {
  const week = process.argv[2];
  if (!week) {
    console.error('Usage: node yahoo/run-challenge.js <week>');
    process.exit(1);
  }
  const weekNum = Number(week);

  const context = await launchContext();
  try {
    const page = await context.newPage();

    const standings = await getStandings(page);
    const pairings = await getPairings(page, week);

    const rosters = [];
    // Sequential (not Promise.all) — getRoster() navigates the shared `page` object,
    // and concurrent navigations on one Page race each other. See get-matchup.js's
    // two-tab fix for the same issue.
    //
    // Each team's fetch is isolated: getRoster() can throw ROSTER_STATS_MISMATCH (see
    // roster-page.js) or hit a transient page error, and one bad team shouldn't crash the
    // whole run and produce zero output for the other nine. On failure, push a placeholder
    // so `rosters` stays index-aligned with `standings` for the zip below.
    for (const team of standings) {
      try {
        rosters.push(await getRoster(page, team.teamId, { week }));
      } catch (err) {
        console.error(`Failed to fetch roster for team ${team.teamId} (${team.teamName}): ${err.message}`);
        rosters.push({ teamId: team.teamId, teamName: team.teamName, roster: [], fetchError: err.message });
      }
    }

    const espnPage = await context.newPage();
    try {
      for (const roster of rosters) {
        await enrichIncLng(espnPage, roster.roster, weekNum);
      }
    } finally {
      await espnPage.close();
    }

    const teams = standings.map((team, i) => {
      const { isWinner, teamTotal } = attachMatchupResult(team, pairings);
      return {
        team_name: rosters[i].teamName,
        isWinner,
        teamTotal,
        players: rosters[i].roster.map(toChallengePlayer),
        fetchError: rosters[i].fetchError || null,
      };
    });

    console.log(
      JSON.stringify({ week: weekNum, standings, teams, matchups: buildMatchups(pairings) }, null, 2)
    );
  } finally {
    await context.close();
  }
}

module.exports = { attachMatchupResult, buildMatchups, toChallengePlayer };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
