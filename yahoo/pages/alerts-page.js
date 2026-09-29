const { FANTASY_BASE, LEAGUE_ID, assertLoggedIn } = require('./base-page');

// Stands in for the Yahoo app's push alerts (mass add/drop notices, league moves), which
// have no API. Two web pages carry the same underlying data:
//   - Transaction Trends ("buzz index"): league-wide adds/drops/trades across all Yahoo
//     leagues, top 50 per sort. The app's "mass drop" alerts come from this data.
//   - This league's transactions log: adds, drops, and trades (including vetoed ones)
//     by every team.
// DOM shapes were live-verified 2026-09-29. Extraction reads structured pieces in the
// browser; the pure functions below do all the parsing so they can be unit-tested.

const TRENDS_SORTS = { overall: 'BI_S', drops: 'BI_D', adds: 'BI_A' };

function trendsUrl(sort) {
  return `${FANTASY_BASE}/f1/buzzindex?sort=${sort}&sdir=1&pos=ALL&src=combined&bimtab=A&trendtab=O`;
}

function transactionsUrl() {
  return `${FANTASY_BASE}/f1/${LEAGUE_ID}/transactions`;
}

function parseCount(text) {
  const digits = String(text ?? '').replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

function parseTeamPosition(text) {
  const match = String(text ?? '').trim().match(/^([A-Za-z]{2,3}) - ([A-Z]{1,3})$/);
  return match ? { nflTeam: match[1], position: match[2] } : { nflTeam: null, position: null };
}

// cells: the numeric columns after Player, in live order: % Ros, % Start, Drops, Adds,
// Trades, Total.
function normalizeTrendRow(raw) {
  const [pctRostered, pctStarted, drops, adds, trades, total] = raw.cells.map(parseCount);
  return {
    playerId: raw.playerId,
    name: raw.name,
    ...parseTeamPosition(raw.teamPosition),
    injuryStatus: raw.injuryStatus || null,
    pctRostered,
    pctStarted,
    drops,
    adds,
    trades,
    total,
  };
}

const ICON_ACTIONS = { 'Added Player': 'added', 'Dropped Player': 'dropped' };

// A "move" row is one team's add, drop, or add/drop. Its left cell has one icon per
// player, in the same order as the player blocks. A "trade" leg is a list of players plus
// a label like "Traded to" or "Vetoed Trade to" and the receiving team. Yahoo renders
// each leg as its own <tr>; the two legs of one trade share a rowspan=2 icon cell.
function normalizeTransaction(raw) {
  const players = raw.players.map((p, i) => ({
    playerId: p.playerId,
    name: p.name,
    ...parseTeamPosition(p.teamPosition),
    injuryStatus: p.injuryStatus || null,
    action: raw.kind === 'trade' ? 'to team' : ICON_ACTIONS[raw.iconTitles[i]] || 'unknown',
    detail: p.detail,
  }));

  let type;
  if (raw.kind === 'trade') {
    // "Traded to" -> "trade"; anything else keeps its wording, e.g. "Vetoed Trade to" -> "vetoed trade".
    const verb = raw.label.replace(/\s+to$/i, '').trim().toLowerCase();
    type = verb === 'traded' ? 'trade' : verb;
  } else {
    const actions = new Set(players.map((p) => p.action));
    type = actions.has('added') && actions.has('dropped') ? 'add/drop' : actions.has('added') ? 'add' : 'drop';
  }

  return {
    type,
    teamId: raw.teamId,
    teamName: raw.teamName,
    timestamp: raw.timestamp,
    players,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Yahoo shows "Sep 28, 7:39 pm" with no year. Use the reference date's year, stepping
// back a year if that would put the timestamp in the future (a December move read in
// early January).
function parseTimestamp(text, now) {
  const match = String(text ?? '').trim().match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{1,2}):(\d{2}) (am|pm)$/i);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1]);
  if (month === -1) return null;
  let hour = Number(match[3]) % 12;
  if (match[5].toLowerCase() === 'pm') hour += 12;
  const date = new Date(now.getFullYear(), month, Number(match[2]), hour, Number(match[4]));
  if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) date.setFullYear(date.getFullYear() - 1);
  return date;
}

// Raw trend numbers aren't a verdict. A big drop count is usually weekly K/DEF streaming
// churn, so the pre-game-check skill still has to check each flag against injury/legal
// news before calling it a concern. This only narrows the list to players on either
// roster in this week's matchup.
function buildAlerts({ trends, rosters, transactions, now, days = 7, userTeamId }) {
  const owner = new Map();
  for (const [side, key] of [['user', 'userTeam'], ['opponent', 'opponent']]) {
    for (const p of rosters?.[key]?.roster ?? []) {
      if (p.yahooPlayerId) owner.set(String(p.yahooPlayerId), side);
    }
  }

  const seen = new Set();
  const rosterTrendFlags = [];
  for (const t of trends) {
    const team = owner.get(String(t.playerId));
    if (!team || seen.has(t.playerId)) continue;
    seen.add(t.playerId);
    rosterTrendFlags.push({ ...t, team, direction: t.drops > t.adds ? 'dropping' : 'adding' });
  }

  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  const recentLeagueTransactions = transactions.filter((t) => {
    const ts = parseTimestamp(t.timestamp, now);
    return ts && ts.getTime() >= cutoff;
  });

  return {
    windowDays: days,
    rosterTrendFlags,
    recentLeagueTransactions,
    userTeamTransactions: recentLeagueTransactions.filter((t) => String(t.teamId) === String(userTeamId)),
  };
}

async function getTransactionTrends(page, sort = TRENDS_SORTS.overall) {
  await page.goto(trendsUrl(sort));
  await assertLoggedIn(page);
  await page.locator('table.Tst-table tbody tr').first().waitFor();
  const raws = await page.locator('table.Tst-table tbody tr').evaluateAll((rows) =>
    rows.map((row) => {
      const tds = Array.from(row.querySelectorAll('td'));
      const link = tds[0]?.querySelector('a.name');
      return {
        playerId: link?.getAttribute('data-ys-playerid') ?? null,
        name: link?.textContent.trim() ?? '',
        injuryStatus: tds[0]?.querySelector('.ysf-player-status')?.textContent.trim() ?? '',
        teamPosition: tds[0]?.querySelector('span.D-b .Fz-xxs')?.textContent.trim() ?? '',
        cells: tds.slice(1, 7).map((td) => td.textContent.trim()),
      };
    })
  );
  return raws.filter((r) => r.playerId).map(normalizeTrendRow);
}

async function getLeagueTransactions(page) {
  await page.goto(transactionsUrl());
  await assertLoggedIn(page);
  await page.locator('table.Tst-transaction-table tbody tr').first().waitFor();
  const raws = await page.locator('table.Tst-transaction-table tbody tr').evaluateAll((rows) =>
    rows.map((row) => {
      const tds = Array.from(row.querySelectorAll('td'));
      const teamCell = tds[tds.length - 1];
      const teamLink = teamCell?.querySelector('span.Grid-u a');
      const teamHref = teamLink?.getAttribute('href') ?? '';
      const playerBlocks = Array.from(row.querySelectorAll('td div.Pbot-xs, td.No-pstart > p'));
      const isTrade = playerBlocks.length > 0 && playerBlocks[0].tagName === 'P';
      return {
        kind: isTrade ? 'trade' : 'move',
        iconTitles: Array.from(tds[0]?.querySelectorAll('span.F-icon[title]') ?? []).map((s) => s.getAttribute('title')),
        players: playerBlocks.map((b) => {
          // Players link to /nfl/players/<id>; defenses link to a team page instead, so
          // take the first real link, skipping the empty player-note icon link.
          const link = b.querySelector('a:not(.playernote)');
          return {
            // The note icon carries the Yahoo id for players and defenses (e.g. 100009).
            playerId: b.querySelector('[data-ys-playerid]')?.getAttribute('data-ys-playerid') ?? null,
            name: link?.textContent.trim() ?? '',
            teamPosition: b.querySelector('.F-position')?.textContent.trim() ?? '',
            injuryStatus: b.querySelector('.F-injury')?.textContent.trim() ?? '',
            detail: b.querySelector('h6')?.textContent.trim() ?? '',
          };
        }),
        label: isTrade ? (Array.from(tds).find((td) => td.classList.contains('Fz-xxs'))?.textContent.trim() ?? '') : '',
        teamId: (teamHref.match(/\/(\d+)$/) || [])[1] ?? null,
        teamName: teamLink?.textContent.trim() ?? '',
        timestamp: teamCell?.querySelector('.F-timestamp')?.textContent.trim() ?? '',
      };
    })
  );
  return raws.filter((r) => r.players.length > 0).map(normalizeTransaction);
}

module.exports = {
  TRENDS_SORTS,
  parseCount,
  parseTeamPosition,
  normalizeTrendRow,
  normalizeTransaction,
  parseTimestamp,
  buildAlerts,
  getTransactionTrends,
  getLeagueTransactions,
};
