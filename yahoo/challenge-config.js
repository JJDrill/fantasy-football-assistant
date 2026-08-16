// yahoo/challenge-config.js
// type: 'player_stat' | 'team_score'
// pool: 'starters' | 'bench' (player_stat only)
// positions: array of Yahoo position codes, or 'any', or 'IDP' (DL/LB/DB)
// includeSuperflex: also count a player started in a superflex/OP slot as QB-eligible
// stat: display_name of the stat to compare (resolved via buildStatNameMap)
// pick: 'max' | 'min' | 'closest' | 'closestUnder'
// target: number, required when pick is 'closest' or 'closestUnder'
// teamFilter (player_stat only): 'winners' | 'losers' | undefined (no filter)
// filter (team_score only): 'winners' | 'losers'

const IDP_POSITIONS = ['DL', 'LB', 'DB', 'DE', 'DT', 'CB', 'S'];

const CHALLENGES = {
  1: { week: 1, type: 'player_stat', pool: 'bench', positions: 'any', stat: 'points', pick: 'max' },
  2: { week: 2, type: 'player_stat', pool: 'starters', positions: 'any', teamFilter: 'winners', stat: 'points', pick: 'min' },
  3: { week: 3, type: 'player_stat', pool: 'starters', positions: ['K'], stat: 'points', pick: 'max' },
  4: { week: 4, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'int', pick: 'max' },
  5: { week: 5, type: 'player_stat', pool: 'starters', positions: ['RB'], stat: 'points', pick: 'max' },
  6: { week: 6, type: 'player_stat', pool: 'starters', positions: IDP_POSITIONS, stat: 'sack', pick: 'max', tiebreak: 'teamTotal' },
  7: { week: 7, type: 'player_stat', pool: 'starters', positions: ['TE'], stat: 'rec yds', pick: 'closest', target: 69 },
  8: { week: 8, type: 'player_stat', pool: 'starters', positions: ['WR'], stat: 'points', pick: 'max' },
  9: { week: 9, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'inc', pick: 'max' },
  10: { week: 10, type: 'team_score', filter: 'losers', pick: 'minMargin' },
  11: { week: 11, type: 'team_score', filter: 'winners', pick: 'maxMargin' },
  12: { week: 12, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'points', pick: 'max' },
  13: { week: 13, type: 'team_score', filter: 'losers', pick: 'maxScore' },
  14: { week: 14, type: 'player_stat', pool: 'starters', positions: 'any', stat: 'points', pick: 'closestUnder', target: 21 },
  15: { week: 15, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'lng', pick: 'max' },
};

module.exports = { CHALLENGES, IDP_POSITIONS };
