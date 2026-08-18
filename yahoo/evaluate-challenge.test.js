// yahoo/evaluate-challenge.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge } = require('./evaluate-challenge');

test('week 1: highest-scoring bench player wins', () => {
  const config = { pool: 'bench', positions: 'any', stat: 'points', pick: 'max' };
  const teams = [
    { team_name: 'A', players: [{ name: 'Bench Star', selected_position: 'BN', position: 'WR', points: 28 }] },
    { team_name: 'B', players: [{ name: 'Bench Dud', selected_position: 'BN', position: 'RB', points: 5 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'Bench Star');
  assert.equal(winner.team_name, 'A');
});

test('week 7: TE closest to 69 receiving yards wins, over or under', () => {
  const config = { pool: 'starters', positions: ['TE'], stat: 'rec yds', pick: 'closest', target: 69 };
  const teams = [
    { team_name: 'A', players: [{ name: 'TE Over', selected_position: 'TE', position: 'TE', 'rec yds': 74 }] },
    { team_name: 'B', players: [{ name: 'TE Under', selected_position: 'TE', position: 'TE', 'rec yds': 65 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'TE Under'); // |65-69|=4 vs |74-69|=5
});

test('week 14: starter closest to 21 points without going over', () => {
  const config = { pool: 'starters', positions: 'any', stat: 'points', pick: 'closestUnder', target: 21 };
  const teams = [
    { team_name: 'A', players: [{ name: 'Over', selected_position: 'RB', position: 'RB', points: 22 }] },
    { team_name: 'B', players: [{ name: 'Perfect', selected_position: 'WR', position: 'WR', points: 21 }] },
    { team_name: 'C', players: [{ name: 'Close', selected_position: 'QB', position: 'QB', points: 19 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'Perfect');
});

test('week 2: lowest-scoring starter among winning teams wins', () => {
  const config = { pool: 'starters', positions: 'any', teamFilter: 'winners', stat: 'points', pick: 'min' };
  const teams = [
    { team_name: 'A', isWinner: true, players: [{ name: 'A Starter', selected_position: 'RB', position: 'RB', points: 4 }] },
    { team_name: 'B', isWinner: true, players: [{ name: 'B Starter', selected_position: 'WR', position: 'WR', points: 9 }] },
    { team_name: 'C', isWinner: false, players: [{ name: 'C Starter', selected_position: 'QB', position: 'QB', points: 1 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  // C Starter has the lowest points overall (1) but C is a losing team and
  // should be excluded by teamFilter: 'winners'.
  assert.equal(winner.name, 'A Starter');
});

test('week 6: sacks tied, tiebreak resolves by highest team weekly score, not iteration order', () => {
  const config = {
    pool: 'starters',
    positions: ['DL', 'LB', 'DB', 'DE', 'DT', 'CB', 'S'],
    stat: 'sack',
    pick: 'max',
    tiebreak: 'teamTotal',
  };
  const teams = [
    {
      team_name: 'A',
      teamTotal: 88,
      players: [{ name: 'IDP A (first, lower team score)', selected_position: 'LB', position: 'LB', sack: 2 }],
    },
    {
      team_name: 'B',
      teamTotal: 121,
      players: [{ name: 'IDP B (second, higher team score)', selected_position: 'DB', position: 'DB', sack: 2 }],
    },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  // Both players tie at 2 sacks. IDP A is encountered first by reduce/iteration
  // order, but IDP B's team scored higher that week, so IDP B must win.
  assert.equal(winner.name, 'IDP B (second, higher team score)');
  assert.equal(winner.team_name, 'B');
});

test('week 6: no tie on sacks, tiebreak is irrelevant, pure max wins', () => {
  const config = {
    pool: 'starters',
    positions: ['DL', 'LB', 'DB', 'DE', 'DT', 'CB', 'S'],
    stat: 'sack',
    pick: 'max',
    tiebreak: 'teamTotal',
  };
  const teams = [
    { team_name: 'A', teamTotal: 200, players: [{ name: 'Low Sacks High Score', selected_position: 'LB', position: 'LB', sack: 1 }] },
    { team_name: 'B', teamTotal: 50, players: [{ name: 'High Sacks Low Score', selected_position: 'DB', position: 'DB', sack: 3 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'High Sacks Low Score');
});

test('week 11: winning team with largest margin of victory', () => {
  const config = { filter: 'winners', pick: 'maxMargin' };
  const matchups = [
    { teams: [{ team_name: 'A', score: 120 }, { team_name: 'B', score: 100 }] },
    { teams: [{ team_name: 'C', score: 90 }, { team_name: 'D', score: 88 }] },
  ];
  const winner = evaluateTeamScoreChallenge(config, matchups);
  assert.equal(winner.team_name, 'A');
  assert.equal(winner.margin, 20);
});

test('week 12: QB points, excludes QB started in superflex/OP slot', () => {
  const config = { pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'points', pick: 'max' };
  const teams = [
    { team_name: 'A', players: [{ name: 'QB1', selected_position: 'QB', position: 'QB', points: 18 }] },
    { team_name: 'B', players: [{ name: 'QB2-in-superflex', selected_position: 'OP', position: 'QB', points: 40 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  // QB2 scored higher but was started in the superflex slot, not the QB slot,
  // so week 12 (starter only, not superflex) must exclude them.
  assert.equal(winner.name, 'QB1');
});

test('week 9: QB incompletions, includes QB started in superflex/OP slot', () => {
  const config = { pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'inc', pick: 'max' };
  const teams = [
    { team_name: 'A', players: [{ name: 'QB1', selected_position: 'QB', position: 'QB', inc: 10 }] },
    { team_name: 'B', players: [{ name: 'QB2-in-superflex', selected_position: 'OP', position: 'QB', inc: 15 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'QB2-in-superflex');
});

test('week 10: losing team with smallest margin of defeat', () => {
  const config = { filter: 'losers', pick: 'minMargin' };
  const matchups = [
    { teams: [{ team_name: 'A', score: 120 }, { team_name: 'B', score: 100 }] }, // B lost by 20
    { teams: [{ team_name: 'C', score: 92 }, { team_name: 'D', score: 90 }] }, // D lost by 2
  ];
  const winner = evaluateTeamScoreChallenge(config, matchups);
  assert.equal(winner.team_name, 'D');
  assert.equal(winner.margin, 2);
});

test('week 13: highest-scoring team that still loses', () => {
  const config = { filter: 'losers', pick: 'maxScore' };
  const matchups = [
    { teams: [{ team_name: 'A', score: 120 }, { team_name: 'B', score: 130 }] },
    { teams: [{ team_name: 'C', score: 90 }, { team_name: 'D', score: 95 }] },
  ];
  const winner = evaluateTeamScoreChallenge(config, matchups);
  assert.equal(winner.team_name, 'A'); // A lost 120-130, highest score among losers
});
