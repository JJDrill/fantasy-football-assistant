// yahoo/smoke-test-week-stats.js
//
// Run this once a week has real, final stats (i.e. after Week 1's games finish). It
// prints the "Stats view" numbers for two different completed weeks side by side. If
// `stat1=S` is genuinely per-week, the two columns will differ by roughly that week's
// individual production. If it's a season-aggregate bug, week N will show a number
// LARGER than or equal to week N-1's (monotonically increasing across weeks, matching
// a running season total) even when compared against DIFFERENT weeks' pages, and the
// numbers will look implausibly large for a single game (e.g. a QB with 40+ pass
// attempts, 300+ yards, in what should be one week's stat line is a strong signal this
// is still season-to-date, not that week alone).
//
// See docs/superpowers/specs/2026-08-26-run-challenge-stats-design.md's "Category-stat
// source: pending verification" section for full context.
const { launchContext } = require('./browser');
const { teamUrl, assertLoggedIn } = require('./pages/base-page');

async function dumpWeekStats(page, teamId, week) {
  const url = `${teamUrl(teamId)}?week=${week}&stat1=S`;
  await page.goto(url);
  await assertLoggedIn(page);

  const table = page.locator('table#statTable0');
  const headers = (await table.locator('thead tr').nth(1).locator('th').allTextContents()).map((h) => h.trim());
  const firstRowCells = (await table.locator('tbody tr').first().locator('td').allTextContents()).map((c) => c.trim());
  return { url, headers, firstRowCells };
}

async function main() {
  const teamId = process.argv[2] || '2';
  const weekA = process.argv[3] || '1';
  const weekB = process.argv[4] || '2';

  const context = await launchContext();
  try {
    const page = await context.newPage();
    const a = await dumpWeekStats(page, teamId, weekA);
    const b = await dumpWeekStats(page, teamId, weekB);

    console.log(`=== Week ${weekA} (${a.url}) ===`);
    console.log(JSON.stringify(a.firstRowCells, null, 2));
    console.log(`\n=== Week ${weekB} (${b.url}) ===`);
    console.log(JSON.stringify(b.firstRowCells, null, 2));
    console.log('\nCompare the two rows above against headers:', JSON.stringify(a.headers));
    console.log(
      '\nIf these look like plausible SINGLE-GAME lines that differ between the two\n' +
      'weeks (not a monotonically growing season total), stat1=S is per-week — proceed\n' +
      'with Task 3 as written. If not, the per-week source needs to be found elsewhere\n' +
      '(most likely a per-matchup box-score page) before Task 3 can be trusted.'
    );
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
