// yahoo/draft/strategy.js
const STARTING_SLOTS = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'W/R/T'];
const FINAL_ROUNDS_FOR_K_DEF = 2;
const TOTAL_ROUNDS = 15;

function openSlots(roster) {
  return roster.filter((s) => !s.playerName);
}

function isFinalRounds(currentRound, totalRounds) {
  return currentRound > totalRounds - FINAL_ROUNDS_FOR_K_DEF;
}

function pickPlayer(available, roster, { currentRound, totalRounds = TOTAL_ROUNDS } = {}) {
  const kDefAllowed = isFinalRounds(currentRound, totalRounds);
  const pool = kDefAllowed
    ? available
    : available.filter((p) => p.position !== 'K' && p.position !== 'DEF');

  if (pool.length === 0) {
    throw new Error('No available players to pick from (pool empty after K/DEF filtering)');
  }

  const byValueDesc = [...pool].sort((a, b) => b.projPts - a.projPts);

  // Prefer the best-available player among still-open starting slots (this
  // naturally reduces to pure best-player-available on an empty roster,
  // since every starting position is "needed" at that point). Fall back to
  // pure best-player-available once no open starting slot matches anyone
  // left in the pool.
  const neededPositions = new Set(
    openSlots(roster)
      .filter((s) => STARTING_SLOTS.includes(s.slot))
      .map((s) => s.slot)
  );

  if (neededPositions.size > 0) {
    const matchesNeed = (p) =>
      neededPositions.has(p.position) ||
      (neededPositions.has('W/R/T') && ['WR', 'RB', 'TE'].includes(p.position));
    const bestMatch = byValueDesc.find(matchesNeed);
    if (bestMatch) return bestMatch;
  }

  return byValueDesc[0];
}

module.exports = { pickPlayer };
