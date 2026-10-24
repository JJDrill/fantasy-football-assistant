// yahoo/grade-league-decisions.js
//
// League-wide start/sit grading. Every week, all 10 managers make start/sit calls, and each
// one is a free test of our own rules: did the player FantasyPros ECR ranked higher actually
// score more? With all 10 teams that's ~10x the evidence our own roster gives us, and it's
// what tests the coin-flip windows in methodology/rules.md / season-lessons.md.
//
// ECR comes from FantasyPros' archived page for the week (`?week=N`), which keeps its final
// Sunday update, so any completed week can be graded. Each starter in a team's final lineup is
// paired with every eligible ranked bench player, and the ECR favorite is scored (raw points,
// and excluding rushing/receiving TDs).
//
// Usage: node yahoo/grade-league-decisions.js <week | first-last> [--out <file>]
//        node yahoo/grade-league-decisions.js --summary   # every graded week so far
//
// Uses the shared Playwright profile, so don't run it alongside another Yahoo script.

const fs = require('node:fs');
const path = require('node:path');
const { normalizeName } = require('./fantasypros-ecr');

const DATA_DIR = path.join(__dirname, '..', 'seasons', '2026', 'Kicker I Hardly Know Her', 'scouting', 'data');

// ECR gap at or under which a call counts as a coin flip. TE/RB/FLEX are the 2026 windows from
// season-lessons.md; QB/WR/K/DEF have no rule yet, so these are placeholders for the data to test.
const WINDOWS = { QB: 3, RB: 3, WR: 5, TE: 5, FLEX: 10, K: 3, DEF: 3 };
const INACTIVE = ['O', 'D', 'IR', 'SUSP'];
const round2 = (n) => Math.round(n * 100) / 100;

const decisionsPath = (week) => path.join(DATA_DIR, `week-${String(week).padStart(2, '0')}-decisions.json`);

// Per team, each rostered player's positional ECR and FLEX ECR for the week. ecrIndex is
// scout-league.js's buildEcrIndex() over that week's rankings.
function snapshotFromRosters(teams, ecrIndex) {
  const out = {};
  for (const t of teams) {
    const players = {};
    for (const p of t.roster) {
      if (!p.playerName) continue;
      const r = ecrIndex.pos(p);
      const f = ['RB', 'WR', 'TE'].includes(p.position) ? ecrIndex.flex(p) : null;
      players[normalizeName(p.playerName)] = { name: p.playerName, position: p.position, ecr: r ? r.ecr : null, flexEcr: f ? f.ecr : null };
    }
    out[t.teamId] = { teamName: t.teamName, players };
  }
  return { teams: out };
}

function rankFor(snapPlayer, group) {
  if (!snapPlayer) return null;
  return group === 'FLEX' ? snapPlayer.flexEcr : snapPlayer.ecr;
}

function exTd(points, position, tds) {
  return ['RB', 'WR', 'TE'].includes(position) ? points - 6 * (tds ?? 0) : points;
}

function compare(a, b) {
  if (a > b) return true;
  if (a < b) return false;
  return null;
}

// finalRoster: Yahoo roster rows for the completed week (final lineup and points).
function decisionPairs({ week, teamId, teamName, finalRoster, snapshot, tdsByName }) {
  const snapTeam = snapshot.teams[teamId];
  if (!snapTeam) return [];
  const lookup = (p) => snapTeam.players[normalizeName(p.playerName)];
  const usable = (p) => p.playerName && Number.isFinite(p.points) && !INACTIVE.includes(p.injuryStatus) && lookup(p);

  const starters = finalRoster.filter((p) => !['BN', 'IR'].includes(p.selected_position) && usable(p));
  const bench = finalRoster.filter((p) => p.selected_position === 'BN' && usable(p));
  const tds = (p) => tdsByName.get(normalizeName(p.playerName)) ?? 0;
  const pairs = [];
  for (const s of starters) {
    const slot = s.selected_position;
    const group = slot === 'W/R/T' ? 'FLEX' : slot;
    for (const b of bench) {
      const eligible = group === 'FLEX' ? ['RB', 'WR', 'TE'].includes(b.position) : b.position === slot;
      if (!eligible) continue;
      const sr = rankFor(lookup(s), group);
      const br = rankFor(lookup(b), group);
      if (sr == null || br == null || sr === br) continue;
      const followed = sr < br;
      const fav = followed ? s : b;
      const other = followed ? b : s;
      const gap = Math.abs(sr - br);
      pairs.push({
        week, teamId, team: teamName, slot, group,
        starter: s.playerName, starterRank: sr, starterPts: s.points,
        bench: b.playerName, benchRank: br, benchPts: b.points,
        gap, window: WINDOWS[group], insideWindow: gap <= WINDOWS[group],
        managerFollowedEcr: followed, favorite: fav.playerName,
        favoriteWon: compare(fav.points, other.points),
        favoriteWonExTd: compare(exTd(fav.points, fav.position, tds(fav)), exTd(other.points, other.position, tds(other))),
        pointsLostVsFavorite: followed ? 0 : round2(b.points - s.points),
      });
    }
  }
  return pairs;
}

// One row per group × inside/outside the window. Ties (favoriteWon null) aren't counted.
function summarize(pairs) {
  const rows = new Map();
  for (const p of pairs) {
    if (p.favoriteWon == null) continue;
    const key = `${p.group}|${p.insideWindow}`;
    if (!rows.has(key)) {
      rows.set(key, { group: p.group, insideWindow: p.insideWindow, n: 0, favoriteWon: 0, favoriteWonExTd: 0, againstEcr: 0, againstEcrPointsLost: 0 });
    }
    const r = rows.get(key);
    r.n++;
    if (p.favoriteWon) r.favoriteWon++;
    if (p.favoriteWonExTd) r.favoriteWonExTd++;
    if (!p.managerFollowedEcr) {
      r.againstEcr++;
      r.againstEcrPointsLost = round2(r.againstEcrPointsLost + p.pointsLostVsFavorite);
    }
  }
  const order = Object.keys(WINDOWS);
  return [...rows.values()]
    .map((r) => ({
      group: r.group, insideWindow: r.insideWindow, n: r.n,
      favoriteWon: r.favoriteWon, favoriteWonPct: Math.round((100 * r.favoriteWon) / r.n),
      favoriteWonExTd: r.favoriteWonExTd, favoriteWonExTdPct: Math.round((100 * r.favoriteWonExTd) / r.n),
      againstEcr: r.againstEcr, againstEcrPointsLost: r.againstEcrPointsLost,
    }))
    .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || (b.insideWindow - a.insideWindow));
}

function printSummary(rows) {
  console.log('| Group | ECR gap | Pairs | ECR favorite won | Excl. TDs | Calls against ECR | Points lost going against ECR |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const gap = r.insideWindow ? `≤${WINDOWS[r.group]} (coin-flip window)` : `>${WINDOWS[r.group]}`;
    console.log(`| ${r.group} | ${gap} | ${r.n} | ${r.favoriteWon} (${r.favoriteWonPct}%) | ${r.favoriteWonExTd} (${r.favoriteWonExTdPct}%) | ${r.againstEcr} | ${r.againstEcrPointsLost} |`);
  }
}

async function loadTds(week) {
  const { getWeekStats, getPlayersMap } = require('./sleeper-stats');
  await getPlayersMap(); // refreshes the on-disk Sleeper player cache when stale
  const players = JSON.parse(fs.readFileSync(path.join(__dirname, '.cache', 'sleeper-players.json'), 'utf8')).players;
  const stats = await getWeekStats(2026, week);
  const byName = new Map();
  for (const p of Object.values(players)) {
    if (!p.full_name || !['RB', 'WR', 'TE'].includes(p.position)) continue;
    const st = stats.get(p.player_id);
    if (st) byName.set(normalizeName(p.full_name), (st.rush_td ?? 0) + (st.rec_td ?? 0));
  }
  return byName;
}

async function gradeWeek(context, week, outFile) {
  const { buildEcrIndex, fetchAllEcr } = require('./scout-league');
  const { getStandings } = require('./pages/standings-page');
  const { getRoster } = require('./pages/roster-page');
  const ecrByPos = await fetchAllEcr(week);
  if (ecrByPos.QB.week !== week) throw new Error(`ECR_WEEK_MISMATCH: FantasyPros returned week ${ecrByPos.QB.week} for week ${week}`);
  const tdsByName = await loadTds(week);

  const page = await context.newPage();
  const teams = await getStandings(page);
  // One tab per team, same as get-all-rosters.js, so navigations don't race.
  const rosters = await Promise.all(teams.map(async (t) => {
    const tp = await context.newPage();
    try {
      return await getRoster(tp, t.teamId, { week });
    } finally {
      await tp.close();
    }
  }));
  const withRosters = teams.map((t, i) => ({ teamId: t.teamId, teamName: t.teamName, roster: rosters[i].roster }));
  const snapshot = snapshotFromRosters(withRosters, buildEcrIndex(ecrByPos));
  const pairs = withRosters.flatMap((t) => decisionPairs({
    week, teamId: t.teamId, teamName: t.teamName, finalRoster: t.roster, snapshot, tdsByName,
  }));

  const file = outFile ?? decisionsPath(week);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ week, ecrLastUpdated: ecrByPos.QB.lastUpdated, gradedAt: new Date().toISOString(), pairs }, null, 1));
  console.log(`Week ${week} (ECR updated ${ecrByPos.QB.lastUpdated}): ${pairs.length} pairs → ${file}`);
  return pairs;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--summary') {
    const files = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('-decisions.json')).sort() : [];
    const pairs = files.flatMap((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).pairs);
    console.log(`Weeks graded: ${files.map((f) => Number(f.slice(5, 7))).join(', ') || 'none'}. Pairs: ${pairs.length}.\n`);
    printSummary(summarize(pairs));
    return;
  }
  const m = /^(\d+)(?:-(\d+))?$/.exec(args[0] ?? '');
  if (!m) {
    console.error('Usage: node yahoo/grade-league-decisions.js <week | first-last> [--out <file>] | --summary');
    process.exit(1);
  }
  const first = Number(m[1]);
  const last = Number(m[2] ?? m[1]);
  const oi = args.indexOf('--out');
  const outFile = oi >= 0 && first === last ? args[oi + 1] : null;

  const { launchContext } = require('./browser');
  const context = await launchContext();
  const all = [];
  try {
    for (let w = first; w <= last; w++) all.push(...await gradeWeek(context, w, outFile));
  } finally {
    await context.close();
  }
  console.log('');
  printSummary(summarize(all));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { snapshotFromRosters, decisionPairs, summarize, WINDOWS, decisionsPath };
