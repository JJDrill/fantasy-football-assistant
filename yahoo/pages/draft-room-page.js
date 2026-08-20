const { assertLoggedIn } = require('./base-page');

// Live-verified (2026-08-20, mock drafts): the browser tab title reliably reflects turn
// state — "YOUR TURN, DRAFT NOW | ..." when it's our pick, "N picks until your turn | ..."
// while waiting, and the draft-room body shows a "Draft Complete" heading once finished.
// Using page.title() avoids depending on any particular DOM structure for this signal.
function classifyTurnState(title) {
  if (title.includes('YOUR TURN')) return 'ours';
  if (/picks until your turn/i.test(title)) return 'waiting';
  if (title.includes('Draft Complete') || title === 'Draft Complete') return 'complete';
  return 'unknown';
}

async function getTurnState(page) {
  // "Draft Complete" is shown as page body text/heading, not always in the title —
  // check both.
  const title = await page.title();
  const fromTitle = classifyTurnState(title);
  if (fromTitle !== 'unknown') return fromTitle;

  const complete = await page.getByText('Draft Complete').count();
  return complete > 0 ? 'complete' : 'unknown';
}

async function enterDraft(page, draftUrl) {
  await page.goto(draftUrl);
  await assertLoggedIn(page);
  // The draft client shows "Connecting to draft server" before the room is interactive.
  await page.getByText('Connecting to draft server').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
}

module.exports = { classifyTurnState, getTurnState, enterDraft };
