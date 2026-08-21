// Testing-only helper for driving Yahoo mock drafts during manual/subagent verification.
// NOT used by run-draft.js or any production code — the real draft has a fixed URL with
// no lobby-joining step at all (see base-page.js's draftUrl()), so nothing here runs on
// the actual draft day.
//
// Exists because a throwaway test script once clicked a lobby "Join" link a second time
// without checking whether our account already held a seat in an active mock draft,
// landing in a second seat in the same room (see the "Known gap" follow-up in
// docs/superpowers/specs/2026-08-20-draft-driver-design.md). Any future test script that
// needs to join a mock draft should use joinMockDraftSafely() below instead of clicking a
// lobby "Join"/team-size button directly.

const MOCK_LOBBY_URL = 'https://football.fantasysports.yahoo.com/f1/109715/mock_lobby?lobby=standard';

// Live-verified (2026-08-20): the lobby page's "Live Mock Drafts" table shows a row with
// "Started (<time>)" and a "Launch Draft App" link whenever our account already holds a
// seat in an in-progress mock draft.
function classifyLobbyState(launchDraftAppLinkCount) {
  if (launchDraftAppLinkCount === 0) return 'none';
  if (launchDraftAppLinkCount === 1) return 'one';
  return 'multiple';
}

async function findExistingActiveDraft(page) {
  await page.goto(MOCK_LOBBY_URL);
  const launchLinks = page.getByRole('link', { name: 'Launch Draft App' });
  const count = await launchLinks.count();

  const state = classifyLobbyState(count);
  if (state === 'multiple') {
    throw new Error(
      `MULTIPLE_ACTIVE_MOCK_DRAFTS: found ${count} "Launch Draft App" links in the lobby — ` +
        'this account already holds seats in more than one in-progress mock draft. Resolve ' +
        'this manually (leave the extras) before joining another.'
    );
  }
  if (state === 'none') return null;

  const href = await launchLinks.first().getAttribute('href');
  return new URL(href, MOCK_LOBBY_URL).toString();
}

// Joins a fresh mock draft ONLY if we don't already hold a seat in one — reuses an
// existing single active draft instead of joining a second one. Returns the draftclient
// URL (with ?auth=...) to pass to enterDraft(). Throws MULTIPLE_ACTIVE_MOCK_DRAFTS if
// findExistingActiveDraft finds we're already in more than one.
//
// NOT independently live-verified since being written (built from patterns already
// observed working in earlier manual/subagent testing sessions, e.g. the "8 Team" button
// sometimes opening a popup tab and sometimes navigating the same page) — verify this
// against a real lobby before trusting it for the next round of testing, the same way
// every other piece of this project's Playwright code was verified live before being
// trusted.
async function joinMockDraftSafely(page, { teamSize = '8 Team' } = {}) {
  const existing = await findExistingActiveDraft(page);
  if (existing) return existing;

  await page.goto(MOCK_LOBBY_URL);
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.getByRole('button', { name: teamSize }).click(),
  ]);
  const draftPage = popup || page;

  // Live-verified (2026-08-21): 120000ms wasn't quite enough once — the join succeeded
  // and the lobby's waiting-room countdown had just finished right as the timeout hit.
  // Bumped with margin, not just the user's literal "at least 10 seconds" ask.
  await draftPage.waitForURL(/draftclient\/f1\//, { timeout: 150000 });
  return draftPage.url();
}

module.exports = { classifyLobbyState, findExistingActiveDraft, joinMockDraftSafely, MOCK_LOBBY_URL };
