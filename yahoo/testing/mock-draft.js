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

// Live-verified (2026-08-22): "Launch Draft App" now renders as a <button>, not a <link>
// as originally assumed — matching both roles here is more robust to that kind of
// incidental markup change than pinning to one.
async function findExistingActiveDraft(page) {
  await page.goto(MOCK_LOBBY_URL);
  const launchLinks = page
    .getByRole('button', { name: 'Launch Draft App' })
    .or(page.getByRole('link', { name: 'Launch Draft App' }));
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
  if (href) return new URL(href, MOCK_LOBBY_URL).toString();

  // Live-verified (2026-08-22): unlike the old "Launch Draft App" link, the button variant
  // doesn't always expose a plain href to read directly — click it (it opens a popup tab
  // for an in-progress draft) and use the resulting page's URL instead.
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    launchLinks.first().click(),
  ]);
  const target = popup || page;
  await target.waitForURL(/draftclient\/f1\//, { timeout: 15000 });
  const url = target.url();
  // Bug found live (2026-08-22): leaving this popup open and then separately navigating
  // the caller's own `page` to the same URL (as enterDraft() does with the URL this
  // returns) put TWO tabs on the same draft seat at once — Yahoo's server treats that as a
  // second client logging in and evicts one with "logged in from another draft client".
  // Only ever one tab should end up driving a given seat.
  if (popup) await popup.close();
  return url;
}

// Live-verified (2026-08-22): a seat reserved in a room that hasn't started yet shows an
// "Enter Draft Waiting Room" button instead of "Launch Draft App" — findExistingActiveDraft
// alone misses this case entirely (no "Launch Draft App" present yet), which is exactly
// what let a throwaway debugging session accidentally leave a pending seat undetected by a
// later run. Checking for this separately closes that gap: a crashed/restarted run should
// resume the SAME pending seat rather than trying to join a second one (which Yahoo/this
// account's one-draft-at-a-time assumption doesn't support) or leaving the first seat to
// silently autopick unattended.
async function findExistingPendingSeat(page) {
  await page.goto(MOCK_LOBBY_URL);
  const enterButtons = page.getByRole('button', { name: 'Enter Draft Waiting Room' });
  const count = await enterButtons.count();
  if (count === 0) return null;
  if (count > 1) {
    throw new Error(
      `MULTIPLE_PENDING_MOCK_DRAFT_SEATS: found ${count} "Enter Draft Waiting Room" buttons — ` +
        'this account already holds more than one pending seat. Resolve this manually before joining another.'
    );
  }
  await enterButtons.first().click();
  return page;
}

// Joins a fresh mock draft ONLY if we don't already hold a seat in one — reuses an
// existing single active draft instead of joining a second one. Returns the draftclient
// URL (with ?auth=...) to pass to enterDraft(). Throws MULTIPLE_ACTIVE_MOCK_DRAFTS if
// findExistingActiveDraft finds we're already in more than one.
//
// Live-verified (2026-08-22): the team-size button click, the intermediate waiting-room
// page, and the eventual auto-navigation to draftclient/f1/... once its countdown ends
// all confirmed working against a real lobby. findExistingActiveDraft's "Launch Draft App"
// detection was also confirmed live (both while a joined draft is still pending in its
// waiting room — where it shows "Enter Draft Waiting Room" instead, not yet handled by
// this function — and once it's actually in progress).
async function joinMockDraftSafely(page, { teamSize = '10 Team' } = {}) {
  const existing = await findExistingActiveDraft(page);
  if (existing) return existing;

  // Live-verified (2026-08-22): Yahoo now routes a fresh join through an intermediate
  // "waiting room" page (mock_waiting) showing a "Starts In MM:SS" countdown, rather than
  // navigating straight to draftclient/f1/... — a resumed pending seat (found via
  // findExistingPendingSeat) and a brand-new join both land here and both auto-navigate to
  // draftclient once the countdown hits zero, so both paths converge on the same wait
  // below. Observed countdowns/lobby start times range from under a minute up to ~12
  // minutes depending which room has an open seat, so wait generously rather than assuming
  // a fixed short join time.
  const pending = await findExistingPendingSeat(page);
  let draftPage;
  if (pending) {
    draftPage = pending;
  } else {
    await page.goto(MOCK_LOBBY_URL);
    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      page.getByRole('button', { name: teamSize, exact: true }).click(),
    ]);
    draftPage = popup || page;
  }

  await draftPage.waitForURL(/draftclient\/f1\//, { timeout: 600000 });
  const url = draftPage.url();
  // Same "two tabs on one seat" bug as findExistingActiveDraft's popup path above — close
  // it here too rather than leaving it open alongside the caller's own `page`, which
  // enterDraft() will separately navigate to this same URL.
  if (draftPage !== page) await draftPage.close();
  return url;
}

module.exports = {
  classifyLobbyState,
  findExistingActiveDraft,
  findExistingPendingSeat,
  joinMockDraftSafely,
  MOCK_LOBBY_URL,
};
