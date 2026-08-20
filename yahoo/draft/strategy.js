// yahoo/draft/strategy.js
const STARTING_SLOTS = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'W/R/T'];
const FINAL_ROUNDS_FOR_K_DEF = 2;
const TOTAL_ROUNDS = 15;
// Only restrict picks to still-needed starting positions once the starting
// lineup is nearly full (this few or fewer starting slots still open).
// Above this threshold we keep taking pure best-player-available, even if
// one or two starting slots have technically already been filled — that's
// standard early/mid-round draft strategy, not "restrict the instant
// anything is filled."
const NEED_RESTRICTION_THRESHOLD = 2;

function openSlots(roster) {
  return roster.filter((s) => !s.playerName);
}

function openStartingSlotCount(roster) {
  return roster.filter((s) => !s.playerName && STARTING_SLOTS.includes(s.slot)).length;
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

  // Only switch from pure best-player-available to need-restricted picking
  // once the starting lineup is nearly full (few open starting slots left).
  // Before that threshold, take the best player on the board regardless of
  // position, even if a slot or two has technically already been filled.
  if (openStartingSlotCount(roster) <= NEED_RESTRICTION_THRESHOLD) {
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
  }

  return byValueDesc[0];
}

module.exports = { pickPlayer };
