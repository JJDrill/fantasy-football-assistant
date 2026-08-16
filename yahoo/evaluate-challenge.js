// yahoo/evaluate-challenge.js
const { IDP_POSITIONS } = require('./challenge-config');

function playerMatchesPositions(player, positions, includeSuperflex) {
  if (positions === 'any') return true;
  const list = positions === 'IDP' ? IDP_POSITIONS : positions;
  const startedInSuperflexSlot = ['OP', 'SUPERFLEX', 'W/R/T/Q'].includes(player.selected_position);

  if (list.includes(player.position)) {
    if (player.position === 'QB' && startedInSuperflexSlot) {
      // A QB started in a superflex/OP slot only counts when the challenge
      // explicitly allows it (e.g. weeks 4, 9, 15). Week 12 sets
      // includeSuperflex: false specifically to exclude this case.
      return Boolean(includeSuperflex);
    }
    return true;
  }
  return false;
}

function isStarter(player) {
  return player.selected_position && player.selected_position !== 'BN' && player.selected_position !== 'IR';
}

function isBench(player) {
  return player.selected_position === 'BN';
}

function buildPool(config, teams) {
  const pool = [];
  for (const team of teams) {
    if (config.teamFilter === 'winners' && !team.isWinner) continue;
    if (config.teamFilter === 'losers' && team.isWinner) continue;
    for (const player of team.players) {
      const positionOk = playerMatchesPositions(player, config.positions, config.includeSuperflex);
      if (!positionOk) continue;
      if (config.pool === 'starters' && !isStarter(player)) continue;
      if (config.pool === 'bench' && !isBench(player)) continue;
      const value = Number(player[config.stat]);
      if (Number.isNaN(value)) continue;
      // team.teamTotal (the team's total fantasy score for the week) is carried
      // along on each pool entry so pickExtreme can use it to break ties when
      // config.tiebreak === 'teamTotal' (week 6: most sacks, ties broken by
      // highest team fantasy score that week). It's optional on the input team
      // objects — only required when a challenge actually declares that tiebreak.
      pool.push({ ...player, team_name: team.team_name, statValue: value, teamTotal: team.teamTotal });
    }
  }
  return pool;
}

// Picks the pool entry with the extreme (max or min) statValue, as determined
// by `isBetter(candidateValue, currentBestValue)`. When multiple entries tie
// on statValue and config.tiebreak === 'teamTotal', the tie is broken by
// picking the tied entry whose team.teamTotal (weekly team score) is highest.
// Without a configured tiebreak, ties resolve to whichever tied entry appears
// first in `pool` (i.e. earliest team/player iteration order), matching the
// engine's prior behavior.
function pickExtreme(pool, isBetter, config) {
  let bestValue = pool[0].statValue;
  for (const p of pool) {
    if (isBetter(p.statValue, bestValue)) bestValue = p.statValue;
  }
  const tied = pool.filter((p) => p.statValue === bestValue);
  if (tied.length === 1 || config.tiebreak !== 'teamTotal') {
    return tied[0];
  }
  return tied.reduce((best, p) => {
    const pTotal = p.teamTotal ?? -Infinity;
    const bestTotal = best.teamTotal ?? -Infinity;
    return pTotal > bestTotal ? p : best;
  });
}

function evaluatePlayerStatChallenge(config, teams) {
  const pool = buildPool(config, teams);
  if (pool.length === 0) return null;

  if (config.pick === 'max') {
    return pickExtreme(pool, (a, b) => a > b, config);
  }
  if (config.pick === 'min') {
    return pickExtreme(pool, (a, b) => a < b, config);
  }
  if (config.pick === 'closest') {
    return pool.reduce((best, p) =>
      Math.abs(p.statValue - config.target) < Math.abs(best.statValue - config.target) ? p : best
    );
  }
  if (config.pick === 'closestUnder') {
    const eligible = pool.filter((p) => p.statValue <= config.target);
    if (eligible.length === 0) return null;
    return eligible.reduce((best, p) => (p.statValue > best.statValue ? p : best));
  }
  throw new Error(`Unknown pick strategy: ${config.pick}`);
}

function withMargins(matchups) {
  const results = [];
  for (const matchup of matchups) {
    const [t1, t2] = matchup.teams;
    const t1Won = t1.score > t2.score;
    results.push({ team_name: t1.name || t1.team_name, score: t1.score, margin: Math.abs(t1.score - t2.score), isWinner: t1Won });
    results.push({ team_name: t2.name || t2.team_name, score: t2.score, margin: Math.abs(t1.score - t2.score), isWinner: !t1Won });
  }
  return results;
}

function evaluateTeamScoreChallenge(config, matchups) {
  const teams = withMargins(matchups);
  const filtered = teams.filter((t) => (config.filter === 'winners' ? t.isWinner : !t.isWinner));
  if (filtered.length === 0) return null;

  if (config.pick === 'maxMargin') {
    return filtered.reduce((best, t) => (t.margin > best.margin ? t : best));
  }
  if (config.pick === 'minMargin') {
    return filtered.reduce((best, t) => (t.margin < best.margin ? t : best));
  }
  if (config.pick === 'maxScore') {
    return filtered.reduce((best, t) => (t.score > best.score ? t : best));
  }
  throw new Error(`Unknown pick strategy: ${config.pick}`);
}

module.exports = { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge, buildPool };
