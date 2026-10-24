// yahoo/scout-league.js
//
// One-pass data pull for the `team-scout` skill: every team's roster for a week, its
// season to date, FantasyPros ECR for each player, Sleeper usage (half-PPR points, snap
// share, carries/targets) for the weeks already played, lineup flags (a bench player
// ranked above a starter he could replace, inactive or bye starters), and a simple
// forecast (banked points + season averages).
//
// Usage: node yahoo/scout-league.js <week> [--out <file>]
//
// Uses the shared Playwright profile, so don't run it alongside another Yahoo script.

const fs = require('node:fs');
const path = require('node:path');
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');
const { getPairings } = require('./pages/matchup-page');
const { parseEcrHtml, normalizeName, PAGES } = require('./fantasypros-ecr');
const { getWeekStats } = require('./sleeper-stats');

const USER_TEAM_ID = '2'; // J's Pancakes
const CLOSE_GAME = 5; // points; a game decided by less than this counts as close
const SLEEPER_PLAYERS_CACHE = path.join(__dirname, '.cache', 'sleeper-players.json');

const TEAM_ALIASES = { JAC: 'JAX', WSH: 'WAS', LA: 'LAR', LVR: 'LV', OAK: 'LV' };

function normalizeTeam(abbr) {
  if (!abbr) return null;
  const up = abbr.toUpperCase();
  return TEAM_ALIASES[up] ?? up;
}

const round2 = (n) => Math.round(n * 100) / 100;

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// weeks: [{ week, pairings }] from getPairings(). Weeks where both sides scored 0 are
// unplayed and skipped.
function seasonSummary(teamId, weeks) {
  const s = { scores: [], opponents: [], wins: 0, losses: 0, ties: 0, closeWins: [], closeLosses: [], weeksAboveMedian: 0 };
  for (const { pairings } of weeks) {
    const p = pairings.find((x) => x.teamAId === teamId || x.teamBId === teamId);
    if (!p || (p.teamAScore === 0 && p.teamBScore === 0)) continue;
    const isA = p.teamAId === teamId;
    const mine = isA ? p.teamAScore : p.teamBScore;
    const theirs = isA ? p.teamBScore : p.teamAScore;
    s.scores.push(mine);
    s.opponents.push(isA ? p.teamBName : p.teamAName);
    const margin = round2(mine - theirs);
    if (margin > 0) s.wins++;
    else if (margin < 0) s.losses++;
    else s.ties++;
    if (margin > 0 && margin < CLOSE_GAME) s.closeWins.push(margin);
    if (margin < 0 && -margin < CLOSE_GAME) s.closeLosses.push(-margin);
    const all = pairings.flatMap((x) => [x.teamAScore, x.teamBScore]);
    if (mine > median(all)) s.weeksAboveMedian++;
  }
  s.avg = s.scores.length ? round2(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : null;
  return s;
}

// ecrByPos: { QB: { players }, ..., DST: { players }, FLEX: { players } }
function buildEcrIndex(ecrByPos) {
  const byPos = new Map();
  const byDefTeam = new Map();
  const flex = new Map();
  for (const [pos, data] of Object.entries(ecrByPos)) {
    for (const p of data.players ?? []) {
      if (pos === 'FLEX') flex.set(normalizeName(p.name), p);
      else if (pos === 'DST') byDefTeam.set(normalizeTeam(p.team), p);
      else byPos.set(`${pos}|${normalizeName(p.name)}`, p);
    }
  }
  return {
    pos(player) {
      if (!player.playerName) return null;
      if (player.position === 'DEF') return byDefTeam.get(normalizeTeam(player.teamAbbreviation)) ?? null;
      return byPos.get(`${player.position}|${normalizeName(player.playerName)}`) ?? null;
    },
    flex(player) {
      return player.playerName ? flex.get(normalizeName(player.playerName)) ?? null : null;
    },
  };
}

function slotEligible(slot, position) {
  if (slot === 'W/R/T') return ['RB', 'WR', 'TE'].includes(position);
  return slot === position;
}

const isStarterSlot = (slot) => slot !== 'BN' && slot !== 'IR';

// The roster parser gives NaN points for a game not played yet (it only becomes null once
// serialized to JSON), so test for a real number, never `!= null`.
const hasPoints = (p) => Number.isFinite(p.points);

// rank(player, slot) -> positional ECR (or FLEX ECR for the W/R/T slot), lower is better.
// Reports the best-ranked eligible bench player for each starter he outranks. `locked`
// means either player's game has already been played (points posted), so the swap can't be made.
function lineupFlags(roster, rank) {
  const flags = [];
  const bench = roster.filter((p) => p.selected_position === 'BN' && p.playerName);
  for (const s of roster.filter((p) => isStarterSlot(p.selected_position) && p.playerName)) {
    const slot = s.selected_position;
    const sr = rank(s, slot);
    if (sr != null) {
      let best = null;
      for (const b of bench) {
        if (!slotEligible(slot, b.position)) continue;
        const br = rank(b, slot);
        if (br != null && br < sr && (!best || br < best.rank)) best = { player: b, rank: br };
      }
      if (best) {
        flags.push({
          type: 'bench-ranked-higher', slot, starter: s.playerName, starterRank: sr,
          bench: best.player.playerName, benchRank: best.rank, gap: sr - best.rank,
          locked: hasPoints(s) || hasPoints(best.player),
        });
      }
    }
    if (['O', 'D', 'IR', 'SUSP'].includes(s.injuryStatus)) {
      flags.push({ type: 'inactive-starter', slot, starter: s.playerName, status: s.injuryStatus });
    }
    if ('opponent' in s && s.opponent == null && !hasPoints(s)) {
      flags.push({ type: 'bye-starter', slot, starter: s.playerName });
    }
  }
  return flags;
}

// players: roster rows enriched with seasonAvg. Banked points win over the average, and a
// starter on bye (no opponent) counts as 0.
function forecast(players) {
  let total = 0;
  let banked = 0;
  let missingAvg = 0;
  for (const p of players.filter((x) => isStarterSlot(x.selected_position) && x.playerName !== null)) {
    if (hasPoints(p)) {
      total += p.points;
      banked += p.points;
    } else if ('opponent' in p && p.opponent == null) {
      continue;
    } else if (p.seasonAvg != null) {
      total += p.seasonAvg;
    } else {
      missingAvg++;
    }
  }
  return { total: round2(total), banked: round2(banked), missingAvg };
}

// Sleeper's player list, indexed by normalized name + team (Yahoo ids are missing for many
// players in Sleeper's data, so name matching is the reliable join). DEF ids are team codes.
function buildSleeperIndex(players) {
  const index = new Map();
  for (const p of Object.values(players)) {
    if (!p.team) continue;
    if (p.position === 'DEF') index.set(`DEF|${normalizeTeam(p.team)}`, p.player_id);
    else if (p.full_name) index.set(`${normalizeName(p.full_name)}|${normalizeTeam(p.team)}`, p.player_id);
  }
  return index;
}

function sleeperKey(player) {
  if (player.position === 'DEF') return `DEF|${normalizeTeam(player.teamAbbreviation)}`;
  return `${normalizeName(player.playerName)}|${normalizeTeam(player.teamAbbreviation)}`;
}

function weekLine(st, position) {
  if (!st || !(st.gp || st.off_snp || st.fga || st.xpa || position === 'DEF')) return null;
  const line = { pts: round2(st.pts_half_ppr ?? 0) };
  if (st.off_snp && st.tm_off_snp) line.snapPct = Math.round((100 * st.off_snp) / st.tm_off_snp);
  if (position === 'RB') Object.assign(line, { carries: st.rush_att ?? 0, targets: st.rec_tgt ?? 0 });
  if (position === 'WR' || position === 'TE') line.targets = st.rec_tgt ?? 0;
  return line;
}

async function loadSleeperPlayers() {
  const { getPlayersMap } = require('./sleeper-stats');
  await getPlayersMap(); // refreshes the on-disk cache when stale
  return JSON.parse(fs.readFileSync(SLEEPER_PLAYERS_CACHE, 'utf8')).players;
}

// With a week, reads FantasyPros' archived page for it (its final, Sunday update).
async function fetchAllEcr(week) {
  const axios = require('axios');
  const out = {};
  for (const [pos, page] of Object.entries(PAGES)) {
    const res = await axios.get(`https://www.fantasypros.com/nfl/rankings/${page}${week ? `?week=${week}` : ''}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    out[pos] = parseEcrHtml(res.data);
  }
  return out;
}

function enrichPlayer(p, ecr, sleeperIdx, statsByWeek) {
  if (!p.playerName) return null;
  const r = ecr.pos(p);
  const f = ['RB', 'WR', 'TE'].includes(p.position) ? ecr.flex(p) : null;
  const sid = sleeperIdx.get(sleeperKey(p));
  const weeks = statsByWeek.map(({ week, stats }) => ({ week, ...(weekLine(sid ? stats.get(sid) : null, p.position) ?? { pts: null }) }));
  const played = weeks.filter((w) => w.pts != null);
  return {
    slot: p.selected_position,
    name: p.playerName,
    position: p.position,
    team: p.teamAbbreviation,
    opponent: p.opponent,
    injuryStatus: p.injuryStatus,
    points: hasPoints(p) ? p.points : null,
    ecr: r ? r.ecr : null,
    ecrRange: r ? `${r.best}-${r.worst}` : null,
    flexEcr: f ? f.ecr : null,
    seasonAvg: played.length ? round2(played.reduce((a, w) => a + w.pts, 0) / played.length) : null,
    gamesPlayed: played.length,
    sleeperMatched: Boolean(sid),
    weeks,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const week = Number(args[0]);
  if (!week) {
    console.error('Usage: node yahoo/scout-league.js <week> [--out <file>]');
    process.exit(1);
  }
  const oi = args.indexOf('--out');
  const outFile = oi >= 0 ? args[oi + 1] : null;

  const [ecrByPos, sleeperPlayers] = [await fetchAllEcr(), await loadSleeperPlayers()];
  const ecr = buildEcrIndex(ecrByPos);
  const sleeperIdx = buildSleeperIndex(sleeperPlayers);
  const statsByWeek = [];
  for (let w = 1; w < week; w++) statsByWeek.push({ week: w, stats: await getWeekStats(2026, w) });

  const context = await launchContext();
  let teams;
  let weeks;
  let rosters;
  try {
    const page = await context.newPage();
    teams = await getStandings(page);
    weeks = [];
    for (let w = 1; w <= week; w++) weeks.push({ week: w, pairings: await getPairings(page, w) });
    // One tab per team, same as get-all-rosters.js, so navigations don't race.
    rosters = await Promise.all(teams.map(async (t) => {
      const tp = await context.newPage();
      try {
        return await getRoster(tp, t.teamId, { week });
      } finally {
        await tp.close();
      }
    }));
  } finally {
    await context.close();
  }

  const current = weeks[weeks.length - 1];
  const result = {
    week,
    generatedAt: new Date().toISOString(),
    ecr: Object.fromEntries(Object.entries(ecrByPos).map(([pos, d]) => [pos, { experts: d.experts, lastUpdated: d.lastUpdated }])),
    teams: teams.map((t, i) => {
      const roster = rosters[i].roster;
      const players = roster.map((p) => enrichPlayer(p, ecr, sleeperIdx, statsByWeek)).filter(Boolean);
      const pairing = current.pairings.find((p) => p.teamAId === t.teamId || p.teamBId === t.teamId);
      const isA = pairing && pairing.teamAId === t.teamId;
      const rank = (p, slot) => {
        const hit = slot === 'W/R/T' ? ecr.flex(p) : ecr.pos(p);
        return hit ? hit.ecr : null;
      };
      return {
        teamId: t.teamId,
        teamName: t.teamName,
        isUs: t.teamId === USER_TEAM_ID,
        standings: { wins: t.wins, losses: t.losses, ties: t.ties, pointsFor: t.pointsFor, pointsAgainst: t.pointsAgainst },
        season: seasonSummary(t.teamId, weeks.slice(0, -1)),
        thisWeek: pairing ? {
          opponentId: isA ? pairing.teamBId : pairing.teamAId,
          opponentName: isA ? pairing.teamBName : pairing.teamAName,
          liveScore: isA ? pairing.teamAScore : pairing.teamBScore,
        } : null,
        starters: players.filter((p) => isStarterSlot(p.slot)),
        bench: players.filter((p) => !isStarterSlot(p.slot)),
        flags: lineupFlags(roster, rank),
        forecast: forecast(roster.map((p) => ({ ...p, seasonAvg: players.find((x) => x.name === p.playerName)?.seasonAvg ?? null }))),
      };
    }),
  };

  const json = JSON.stringify(result, null, 2);
  if (outFile) fs.writeFileSync(outFile, json);
  else console.log(json);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { normalizeTeam, seasonSummary, buildEcrIndex, slotEligible, lineupFlags, forecast, buildSleeperIndex, weekLine, fetchAllEcr };
