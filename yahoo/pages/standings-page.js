const { LEAGUE_URL, assertLoggedIn } = require('./base-page');

function parseStandingsRow(raw) {
  const teamId = raw.teamHref.split('/').filter(Boolean).pop();
  const [wins, losses, ties] = raw.record.split('-').map(Number);
  return {
    teamId,
    teamName: raw.teamName,
    wins,
    losses,
    ties,
    pointsFor: Number(raw.pf),
    pointsAgainst: Number(raw.pa),
  };
}

async function getStandings(page) {
  await page.goto(LEAGUE_URL);
  await assertLoggedIn(page);

  const rows = page.locator('table:has(th:has-text("Rank")) tbody tr');
  const count = await rows.count();
  const results = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const teamLink = row.locator('a[href*="/f1/"]').last();
    const cells = row.locator('td');

    const raw = {
      teamHref: await teamLink.getAttribute('href'),
      teamName: (await teamLink.textContent()).trim(),
      record: (await cells.nth(2).textContent()).trim(),
      pf: (await cells.nth(3).textContent()).trim(),
      pa: (await cells.nth(4).textContent()).trim(),
    };
    results.push(parseStandingsRow(raw));
  }

  return results;
}

module.exports = { parseStandingsRow, getStandings };
