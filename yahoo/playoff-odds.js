// yahoo/playoff-odds.js
//
// Playoff odds by simulation. Records and points come from the completed weeks' pairings; the
// rest of the regular season is played out on the real schedule. Each team's weekly score is
// normal around its points per game, regressed partway to the league average (six weeks of
// scoring overstates how different teams really are), with a fixed spread.
//
// Top 4 make it, ranked by wins (a tie counts half), then points for. The league settings don't
// list a regular-season tiebreaker; points for is Yahoo's default, so it's an assumption.
//
// Usage: node yahoo/playoff-odds.js <last completed week> [--boost <pts>] [--sims N]
//   --boost adds pts/week to our mean, e.g. to price a trade.
//
// Uses the shared Playwright profile, so don't run it alongside another Yahoo script.

const USER_TEAM_ID = '2'; // J's Pancakes
const REGULAR_SEASON_WEEKS = 15;
const PLAYOFF_TEAMS = 4;
const SD = 22; // weekly spread in points, as in the Wk5 estimate (league-patterns.md)
const REGRESS = 0.5;

// weeks: [{ week, pairings }] for completed weeks.
function seasonToDate(weeks) {
  const teams = new Map();
  const get = (id, name) => {
    if (!teams.has(id)) teams.set(id, { teamId: id, name, wins: 0, games: 0, pointsFor: 0 });
    return teams.get(id);
  };
  for (const { pairings } of weeks) {
    for (const p of pairings) {
      const a = get(p.teamAId, p.teamAName);
      const b = get(p.teamBId, p.teamBName);
      a.games++;
      b.games++;
      a.pointsFor += p.teamAScore;
      b.pointsFor += p.teamBScore;
      if (p.teamAScore > p.teamBScore) a.wins++;
      else if (p.teamBScore > p.teamAScore) b.wins++;
      else {
        a.wins += 0.5;
        b.wins += 0.5;
      }
    }
  }
  return teams;
}

function teamMeans(teams, { regress = REGRESS, boost = {} } = {}) {
  const all = [...teams.values()];
  const leagueAvg = all.reduce((t, s) => t + s.pointsFor / s.games, 0) / all.length;
  return new Map(all.map((s) => {
    const avg = s.pointsFor / s.games;
    return [s.teamId, avg + regress * (leagueAvg - avg) + (boost[s.teamId] ?? 0)];
  }));
}

function normal(rng) {
  // Box-Muller
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// remaining: [{ week, pairings }] still to play. Returns teamId -> { playoffPct, avgWins }.
function simulate(teams, remaining, { sims = 20000, sd = SD, regress = REGRESS, boost = {}, playoffTeams = PLAYOFF_TEAMS, rng = Math.random } = {}) {
  const means = teamMeans(teams, { regress, boost });
  const made = new Map([...teams.keys()].map((id) => [id, 0]));
  const winSum = new Map([...teams.keys()].map((id) => [id, 0]));
  for (let i = 0; i < sims; i++) {
    const wins = new Map([...teams.values()].map((s) => [s.teamId, s.wins]));
    const pf = new Map([...teams.values()].map((s) => [s.teamId, s.pointsFor]));
    for (const { pairings } of remaining) {
      for (const p of pairings) {
        const a = means.get(p.teamAId) + sd * normal(rng);
        const b = means.get(p.teamBId) + sd * normal(rng);
        pf.set(p.teamAId, pf.get(p.teamAId) + a);
        pf.set(p.teamBId, pf.get(p.teamBId) + b);
        const winner = a > b ? p.teamAId : p.teamBId;
        wins.set(winner, wins.get(winner) + 1);
      }
    }
    const order = [...teams.keys()].sort((x, y) => wins.get(y) - wins.get(x) || pf.get(y) - pf.get(x));
    for (const id of order.slice(0, playoffTeams)) made.set(id, made.get(id) + 1);
    for (const [id, w] of wins) winSum.set(id, winSum.get(id) + w);
  }
  return new Map([...teams.keys()].map((id) => [id, {
    playoffPct: Math.round((1000 * made.get(id)) / sims) / 10,
    avgWins: Math.round((10 * winSum.get(id)) / sims) / 10,
  }]));
}

async function main() {
  const args = process.argv.slice(2);
  const through = Number(args[0]);
  if (!Number.isInteger(through) || through < 1 || through >= REGULAR_SEASON_WEEKS) {
    console.error('Usage: node yahoo/playoff-odds.js <last completed week> [--boost <pts>] [--sims N]');
    process.exit(1);
  }
  const flag = (name, dflt) => (args.includes(name) ? Number(args[args.indexOf(name) + 1]) : dflt);
  const boostPts = flag('--boost', 0);
  const sims = flag('--sims', 20000);

  const { launchContext } = require('./browser');
  const { getPairings } = require('./pages/matchup-page');
  const context = await launchContext();
  const weeks = [];
  try {
    const page = await context.newPage();
    for (let w = 1; w <= REGULAR_SEASON_WEEKS; w++) weeks.push({ week: w, pairings: await getPairings(page, w) });
  } finally {
    await context.close();
  }
  const teams = seasonToDate(weeks.filter((w) => w.week <= through));
  const remaining = weeks.filter((w) => w.week > through);

  const base = simulate(teams, remaining, { sims });
  const boosted = boostPts ? simulate(teams, remaining, { sims, boost: { [USER_TEAM_ID]: boostPts } }) : null;
  const rows = [...teams.values()].sort((a, b) => base.get(b.teamId).playoffPct - base.get(a.teamId).playoffPct);
  console.log(`Through Wk${through}; Wks ${through + 1}-${REGULAR_SEASON_WEEKS} simulated on the real schedule (${sims} runs, sd ${SD}, regress ${REGRESS}).\n`);
  console.log(`| Team | Record | PF/game | Proj. wins | Playoff odds |${boosted ? ` With +${boostPts}/wk for us |` : ''}`);
  console.log(`|---|---|---|---|---|${boosted ? '---|' : ''}`);
  for (const s of rows) {
    const record = `${Math.floor(s.wins)}-${s.games - Math.ceil(s.wins)}${s.wins % 1 ? '-1' : ''}`;
    const extra = boosted ? ` ${s.teamId === USER_TEAM_ID ? `${boosted.get(s.teamId).playoffPct}%` : ''} |` : '';
    console.log(`| ${s.name} | ${record} | ${(s.pointsFor / s.games).toFixed(1)} | ${base.get(s.teamId).avgWins} | ${base.get(s.teamId).playoffPct}% |${extra}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { seasonToDate, teamMeans, simulate };
