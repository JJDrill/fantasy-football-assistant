// yahoo/run-draft.js
const fs = require('node:fs');
const path = require('node:path');
const { launchContext } = require('./browser');
const {
  enterDraft,
  getTurnState,
  getAvailablePlayers,
  getOurRoster,
  draftPlayer,
} = require('./pages/draft-room-page');
const { draftUrl } = require('./pages/base-page');
const { pickPlayer } = require('./draft/strategy');

const POLL_INTERVAL_MS = 2500;
const PICK_DEADLINE_MS = 52000; // Yahoo's clock is 60s; leave margin for network/render time.
const TOTAL_ROUNDS = 15;
const LOG_PATH = path.join(__dirname, 'draft-log.jsonl');

function log(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

async function withDeadline(promise, ms, onTimeout) {
  let timedOut = false;
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve(undefined);
    }, ms);
  });
  const result = await Promise.race([promise, timeout]);
  if (timedOut) {
    onTimeout();
    return undefined;
  }
  return result;
}

// Live-verified (2026-08-20 mock draft test): tracking "which round are we in" as a plain
// in-memory counter incremented once per own-turn is fragile — if the process is ever
// restarted mid-draft (crash, manual intervention), the counter resets to 1 and desyncs
// from the real round, throwing off the K/DEF final-rounds gate in strategy.js. The number
// of our own roster slots already filled is ground truth the page itself provides and
// naturally self-corrects across a restart (or after a turn Yahoo auto-picked for us while
// this driver was stalled) — derive the round from that instead of a local counter.
async function takeOurTurn(page) {
  const [roster, available] = await Promise.all([getOurRoster(page), getAvailablePlayers(page)]);
  const currentRound = roster.filter((s) => s.playerName).length + 1;
  const choice = pickPlayer(available, roster, { currentRound, totalRounds: TOTAL_ROUNDS });
  await draftPlayer(page, choice.name);
  log({ event: 'picked', round: currentRound, player: choice.name, position: choice.position });
}

async function main() {
  const context = await launchContext();
  try {
    const page = await context.newPage();
    await enterDraft(page, draftUrl());
    log({ event: 'entered_draft' });

    let lastState = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const state = await getTurnState(page);
      if (state !== lastState) {
        log({ event: 'state_change', state });
        lastState = state;
      }

      if (state === 'complete') {
        log({ event: 'draft_complete' });
        break;
      }

      if (state === 'ours') {
        const attempt = takeOurTurn(page).catch((err) => {
          log({ event: 'pick_error', error: err.message });
        });
        await withDeadline(attempt, PICK_DEADLINE_MS, () => {
          log({ event: 'deadline_missed', note: 'letting Yahoo autopick take this turn' });
        });
        // Live-verified (2026-08-20, mock draft): a single POLL_INTERVAL_MS pause here
        // isn't always enough — Yahoo's turn-state title can take a few seconds to flip
        // away from "YOUR TURN, DRAFT NOW" after a pick is submitted, and the very next
        // poll sometimes still read 'ours', re-entering this branch for a turn already
        // taken and burning ~30s re-clicking a player who'd already been drafted (a
        // locator timeout) before recovering via pick_error. Explicitly wait (bounded) for
        // the state to move off 'ours' before resuming normal polling. If it never clears
        // within the bound, fall through and treat it as a legitimate new turn — this is
        // also what a real back-to-back snake-draft turn (last pick of one round, first of
        // the next) looks like, and we want to act on that, not suppress it.
        const clearBy = Date.now() + 15000;
        while (Date.now() < clearBy) {
          await page.waitForTimeout(POLL_INTERVAL_MS);
          if ((await getTurnState(page)) !== 'ours') break;
        }
        continue;
      }

      await page.waitForTimeout(POLL_INTERVAL_MS);
    }
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
