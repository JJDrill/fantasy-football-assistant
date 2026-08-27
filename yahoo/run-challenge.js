// yahoo/run-challenge.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');
const { getPairings } = require('./pages/matchup-page');
const { getPlayersMap, getWeekStats, extractChallengeStats } = require('./sleeper-stats');

// This league's current NFL season. Hardcoded, matching this codebase's existing
// convention of hardcoding league-specific constants (see LEAGUE_ID in
// yahoo/pages/base-page.js) — see reference/League_Settings.pdf.
const SEASON = 2026;

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

// Every roster entry (starters and bench alike) gets enriched — unlike the prior
// ESPN-based approach, this is a Map lookup already fetched once per run, not a
// per-player network round-trip, so there's no cost reason to restrict this to specific
// weeks/positions/pool anymore. Mutates `player` in place and returns it.
function enrichWithSleeperStats(player, { playersMap, weekStats }) {
  let statsRow;
  if (player.position === 'DEF') {
    statsRow = player.teamAbbreviation && weekStats.get(player.teamAbbreviation.toUpperCase());
  } else if (player.yahooPlayerId) {
    const mapped = playersMap.get(player.yahooPlayerId);
    statsRow = mapped && weekStats.get(mapped.sleeperId);
  }
  if (statsRow) Object.assign(player, extractChallengeStats(statsRow, player.position));
  return player;
}

function toChallengePlayer(rosterEntry) {
  const { playerName, selected_position, teamAbbreviation, opponent, yahooPlayerId, ...rest } = rosterEntry;
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
    // Each team's fetch is isolated: one bad team shouldn't crash the whole run and
    // produce zero output for the other nine. On failure, push a placeholder so
    // `rosters` stays index-aligned with `standings` for the zip below.
    for (const team of standings) {
      try {
        rosters.push(await getRoster(page, team.teamId, { week }));
      } catch (err) {
        console.error(`Failed to fetch roster for team ${team.teamId} (${team.teamName}): ${err.message}`);
        rosters.push({ teamId: team.teamId, teamName: team.teamName, roster: [], fetchError: err.message });
      }
    }

    // Sleeper is now the only source for int/sack/rec-yds/inc/lng, for every week — unlike
    // the removed ESPN module, a fetch failure here should surface loudly rather than
    // degrade silently, since silent nulls here would make every player's category stats
    // look plausibly-but-wrongly absent for the whole week, not just one player. See
    // docs/superpowers/specs/2026-08-26-sleeper-stats-replacement-design.md's "Error
    // handling" section.
    const playersMap = await getPlayersMap();
    const weekStats = await getWeekStats(SEASON, weekNum);
    for (const roster of rosters) {
      for (const player of roster.roster) {
        enrichWithSleeperStats(player, { playersMap, weekStats });
      }
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

module.exports = { attachMatchupResult, buildMatchups, toChallengePlayer, enrichWithSleeperStats };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
