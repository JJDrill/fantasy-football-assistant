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

async function takeOurTurn(page, currentRound) {
  const [roster, available] = await Promise.all([getOurRoster(page), getAvailablePlayers(page)]);
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

    let currentRound = 1;
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
        const attempt = takeOurTurn(page, currentRound).catch((err) => {
          log({ event: 'pick_error', round: currentRound, error: err.message });
        });
        await withDeadline(attempt, PICK_DEADLINE_MS, () => {
          log({ event: 'deadline_missed', round: currentRound, note: 'letting Yahoo autopick take this turn' });
        });
        currentRound += 1;
        // Give the UI a moment to reflect the new state before polling again, whether
        // our pick landed or Yahoo's autopick took over.
        await page.waitForTimeout(POLL_INTERVAL_MS);
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
