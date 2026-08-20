const { LEAGUE_URL, assertLoggedIn } = require('./base-page');

function findUserMatchup(pairings, userTeamId) {
  const pairing = pairings.find(
    (p) => p.teamAId === userTeamId || p.teamBId === userTeamId
  );
  if (!pairing) return null;

  const userIsA = pairing.teamAId === userTeamId;
  return {
    userTeamId,
    userTeamName: userIsA ? pairing.teamAName : pairing.teamBName,
    userScore: userIsA ? pairing.teamAScore : pairing.teamBScore,
    opponentTeamId: userIsA ? pairing.teamBId : pairing.teamAId,
    opponentTeamName: userIsA ? pairing.teamBName : pairing.teamAName,
    opponentScore: userIsA ? pairing.teamBScore : pairing.teamAScore,
  };
}

// Live-verified (pre-draft, 2026-08-20). The plan's target URL,
// `matchupUrl(week)` -> `/f1/109715/matchup?matchup_week=<week>`, was checked first and
// does NOT render the 5-pairing list the plan describes: it redirects to a single
// "Compare Managers" detail page for the *logged-in user's own* team only (one pairing,
// e.g. "J's Pancakes" vs "Lil Unk Rayray"), using different markup than a list of <li>s.
// The plan's guessed `ul li:has(a[href*="/f1/109715/"])` selector, run against that page,
// actually matched the site *navigation* menu (36 <li> items: League Chat, Rosters,
// Transactions, etc. — real hrefs like `/f1/109715/messages`, `/f1/109715/teams`), not
// matchup data at all, and produced garbage pairings.
//
// The real "list item with two team blocks separated by vs" structure the plan describes
// does exist, but it lives in the "Week 1 Matchups" widget on the LEAGUE HOME page
// (LEAGUE_URL), not at the matchup-detail URL. Confirmed via DOM dump: a
// `.matchups-body ul.List` containing one `<li class="Listitem">` per matchup (5 for
// week 1, matching all 5 pairings on the league home page), each with two team-name
// links (`a.F-link`, href like `https://.../f1/109715/2`) and two score elements
// (`div.Fz-lg`, currently rendering "0.00" placeholders) separated by a
// `<span>vs</span>`. Rewrote getPairings() to navigate to LEAGUE_URL and use these
// selectors, which were verified live to return all 5 pairings with correct team ids,
// names, and scores (see task report for full sample output).
//
// Not yet verified: whether appending a week query param actually switches which week's
// widget the home page renders (only week 1 currently has any matchups to check against),
// and whether scores parse correctly once games are live/final (still "0.00" everywhere
// pre-draft). Both must be re-checked per Step 5 after Week 1 has real scores.
const ITEM_SELECTOR = '.matchups-body ul.List > li.Listitem';
const NAME_LINK_SELECTOR = 'a.F-link';
const SCORE_SELECTOR = '.Fz-lg';

async function getPairings(page, week) {
  const url = week ? `${LEAGUE_URL}?matchup_week=${week}` : LEAGUE_URL;
  await page.goto(url);
  await assertLoggedIn(page);

  const items = page.locator(ITEM_SELECTOR);
  const count = await items.count();
  const pairings = [];

  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    const nameLinks = item.locator(NAME_LINK_SELECTOR);
    const scores = item.locator(SCORE_SELECTOR);

    const linkCount = await nameLinks.count();
    if (linkCount < 2) continue;

    const teamAHref = await nameLinks.nth(0).getAttribute('href');
    const teamBHref = await nameLinks.nth(linkCount - 1).getAttribute('href');
    const teamAName = (await nameLinks.nth(0).textContent()).trim();
    const teamBName = (await nameLinks.nth(linkCount - 1).textContent()).trim();

    const scoreCount = await scores.count();
    pairings.push({
      teamAId: teamAHref.split('/').filter(Boolean).pop(),
      teamAName,
      teamAScore: scoreCount > 0 ? Number(await scores.first().textContent()) : null,
      teamBId: teamBHref.split('/').filter(Boolean).pop(),
      teamBName,
      teamBScore: scoreCount > 1 ? Number(await scores.last().textContent()) : null,
    });
  }

  return pairings;
}

module.exports = { findUserMatchup, getPairings };
