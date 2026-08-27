const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pickPlayerResult, pickGamelogRow } = require('./player-gamelog');

test('pickPlayerResult picks the NFL player whose subtitle matches the team name', () => {
  const searchResponse = {
    results: [
      {
        type: 'player',
        contents: [
          { description: 'NFL', subtitle: 'Jacksonville Jaguars', uid: 's:20~l:28~a:3915239' },
          { description: 'NFL', subtitle: 'Buffalo Bills', uid: 's:20~l:28~a:3918298' },
          { description: 'NFL', subtitle: 'Maryland Terrapins', uid: 's:20~l:28~a:10795' },
        ],
      },
    ],
  };
  assert.equal(pickPlayerResult(searchResponse, 'Buf'), '3918298');
});

test('pickPlayerResult falls back to the first NFL result when the team is unknown', () => {
  const searchResponse = {
    results: [
      { type: 'player', contents: [{ description: 'NFL', subtitle: 'Someplace Team', uid: 's:20~l:28~a:111' }] },
    ],
  };
  assert.equal(pickPlayerResult(searchResponse, 'ZZ'), '111');
});

test('pickPlayerResult returns null when there is no player result group', () => {
  assert.equal(pickPlayerResult({ results: [{ type: 'article', contents: [] }] }, 'Buf'), null);
});

test('pickGamelogRow picks the chronological game for a week before the bye', () => {
  const rows = [
    { opponent: 'CIN', cmp: 10 },
    { opponent: 'NYJ', cmp: 20 },
    { opponent: 'BAL', cmp: 30 },
  ];
  const row = pickGamelogRow(rows, { week: 1, byeWeek: 7 });
  assert.deepEqual(row, { opponent: 'BAL', cmp: 30 });
});

test('pickGamelogRow shifts the index by one for a week after the bye', () => {
  const rows = [
    { opponent: 'CIN', cmp: 10 },
    { opponent: 'BAL', cmp: 30 },
  ];
  const row = pickGamelogRow(rows, { week: 3, byeWeek: 2 });
  assert.deepEqual(row, { opponent: 'CIN', cmp: 10 });
});

test('pickGamelogRow returns null for the bye week itself', () => {
  const rows = [{ opponent: 'BAL', cmp: 30 }];
  assert.equal(pickGamelogRow(rows, { week: 2, byeWeek: 2 }), null);
});
