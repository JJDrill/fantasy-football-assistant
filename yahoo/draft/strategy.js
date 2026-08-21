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
  let pool = kDefAllowed
    ? available
    : available.filter((p) => p.position !== 'K' && p.position !== 'DEF');

  // Live-verified (2026-08-20, 14-team mock draft): Yahoo's "Proj Pts" column is a raw
  // projected season point total, NOT adjusted for positional scarcity — a startable QB
  // routinely projects ~270 pts against ~150-160 for the best available RB/WR at the same
  // point in the draft, because passing yards/TDs accumulate points far faster than a
  // single rushing/receiving line ever does. Since a "best player available" rule keyed
  // on that raw number has no way to see that only one QB slot starts, pure BPA kept
  // taking QB after QB — 5 QBs drafted total in a live test, including one AFTER the
  // starting lineup was already completely full and every other pick was pure bench value,
  // because the bench-filling fallback below (`byValueDesc[0]`) is just as raw-points-blind
  // as the BPA phase is. Once our one starting QB slot is filled, exclude QB from
  // consideration for the rest of the draft (not just the BPA phase) — the same treatment
  // K/DEF already get, and for the same underlying reason (a single-start position whose
  // raw point total wildly overstates its marginal value once you already have one).
  const haveStartingQB = Boolean(roster.find((s) => s.slot === 'QB' && s.playerName));
  if (haveStartingQB) {
    pool = pool.filter((p) => p.position !== 'QB');
  }

  if (pool.length === 0) {
    throw new Error('No available players to pick from (pool empty after K/DEF/QB filtering)');
  }

  const byValueDesc = [...pool].sort((a, b) => b.projPts - a.projPts);

  // Only switch from pure best-player-available to need-restricted picking
  // once the starting lineup is nearly full (few open starting slots left).
  // Before that threshold, take the best player on the board regardless of
  // position, even if a slot or two has technically already been filled.
  //
  // Live-verified (2026-08-20, mock draft): K and DEF are deliberately left out of
  // STARTING_SLOTS (they're gated separately via kDefAllowed/isFinalRounds above), but
  // that meant once both single-count slots became eligible, this need check had no idea
  // whether K or DEF specifically was already filled — with K filled and DEF still open, a
  // live test still drafted a SECOND kicker (higher raw Proj Pts than any available DEF)
  // straight into a bench slot, leaving DEF unfilled. Once K/DEF are allowed, fold any
  // still-open K/DEF slot into the same need-matching pass so an already-filled one-slot
  // position can't out-rank a genuinely open one on raw points alone.
  const needSlotNames = kDefAllowed ? [...STARTING_SLOTS, 'K', 'DEF'] : STARTING_SLOTS;
  if (openStartingSlotCount(roster) <= NEED_RESTRICTION_THRESHOLD || kDefAllowed) {
    const neededPositions = new Set(
      openSlots(roster)
        .filter((s) => needSlotNames.includes(s.slot))
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
