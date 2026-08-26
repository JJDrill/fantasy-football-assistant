// yahoo/challenge-config.js
// type: 'player_stat' | 'team_score'
// pool: 'starters' | 'bench' (player_stat only)
// positions: array of Yahoo position codes, or 'any'
// includeSuperflex: also count a player started in a superflex/OP slot as QB-eligible
//   (this league's roster has no superflex/OP slot, so this is currently always false —
//   kept as a config knob only in case that ever changes)
// stat: display_name of the stat to compare (resolved via buildStatNameMap)
// pick: 'max' | 'min' | 'closest' | 'closestUnder'
// target: number, required when pick is 'closest' or 'closestUnder'
// teamFilter (player_stat only): 'winners' | 'losers' | undefined (no filter)
// filter (team_score only): 'winners' | 'losers'

const CHALLENGES = {
  1: { week: 1, type: 'player_stat', pool: 'bench', positions: 'any', stat: 'points', pick: 'max' },
  2: { week: 2, type: 'player_stat', pool: 'starters', positions: 'any', teamFilter: 'winners', stat: 'points', pick: 'min' },
  3: { week: 3, type: 'player_stat', pool: 'starters', positions: ['K'], stat: 'points', pick: 'max' },
  4: { week: 4, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'int', pick: 'max' },
  5: { week: 5, type: 'player_stat', pool: 'starters', positions: ['RB'], stat: 'points', pick: 'max' },
  // Reissued challenge pack (2026-08-26) redefined week 6 from "starting IDP with the
  // most sacks" (this roster has no IDP slot — always 0 eligible players) to "the
  // defensive team [i.e. the DEF/D-ST slot] with the most sacks in the league".
  6: { week: 6, type: 'player_stat', pool: 'starters', positions: ['DEF'], stat: 'sack', pick: 'max', tiebreak: 'teamTotal' },
  7: { week: 7, type: 'player_stat', pool: 'starters', positions: ['TE'], stat: 'rec yds', pick: 'closest', target: 69 },
  8: { week: 8, type: 'player_stat', pool: 'starters', positions: ['WR'], stat: 'points', pick: 'max' },
  9: { week: 9, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'inc', pick: 'max' },
  10: { week: 10, type: 'team_score', filter: 'losers', pick: 'minMargin' },
  11: { week: 11, type: 'team_score', filter: 'winners', pick: 'maxMargin' },
  12: { week: 12, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'points', pick: 'max' },
  13: { week: 13, type: 'team_score', filter: 'losers', pick: 'maxScore' },
  14: { week: 14, type: 'player_stat', pool: 'starters', positions: 'any', stat: 'points', pick: 'closestUnder', target: 21 },
  15: { week: 15, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'lng', pick: 'max' },
};

module.exports = { CHALLENGES };
