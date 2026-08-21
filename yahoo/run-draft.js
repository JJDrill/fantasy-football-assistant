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
  return choice;
}

// Cross-check requested after live testing: record every player we actually clicked
// "Draft" on (draftPlayer() returned without throwing), then at draft completion compare
// that list against the real final roster scraped from the page. This catches the exact
// failure mode Task 4/6 already found once (a click reporting success without actually
// drafting the intended player) — belt-and-suspenders on top of draftPlayer()'s own
// dialog-match check, verified against ground truth rather than trusting our own logs.
function verifyFinalRoster(finalRoster, ourPicks) {
  const finalNames = finalRoster.filter((s) => s.playerName).map((s) => s.playerName);
  // Real red flag: we believe we drafted this player (draftPlayer didn't throw), but
  // they're nowhere in the final roster — our own success signal was wrong.
  const clickedButMissingFromFinalRoster = ourPicks.filter((name) => !finalNames.includes(name));
  // Informational, not necessarily a bug: a player in the final roster we never logged
  // as picked ourselves is expected whenever Yahoo's autopick took a turn for us
  // (deadline_missed / pick_error cases) — only worth scrutinizing alongside those logs.
  const inFinalRosterButNeverClickedByUs = finalNames.filter((name) => !ourPicks.includes(name));
  return { clickedButMissingFromFinalRoster, inFinalRosterButNeverClickedByUs };
}

async function main() {
  // Headed, not headless: the user wants to watch this run live (both for testing and
  // for the real draft Sunday) to monitor for bugs in real time rather than fly blind.
  const context = await launchContext({ headless: false });
  try {
    const page = await context.newPage();
    // draftUrl() is UNVERIFIED against the real league (see its comment in base-page.js) —
    // it hasn't been possible to confirm until the real draft room opens. Before running
    // this for real on draft day, open that URL manually first to confirm it lands in the
    // live draft room rather than a dead page; if not, get the real entry URL the same way
    // the mock ones were found (open it manually, copy page.url()) and swap it in here.
    await enterDraft(page, draftUrl());
    log({ event: 'entered_draft' });

    let lastState = null;
    const ourPicks = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const state = await getTurnState(page);
      if (state !== lastState) {
        log({ event: 'state_change', state });
        lastState = state;
      }

      if (state === 'complete') {
        log({ event: 'draft_complete' });
        const finalRoster = await getOurRoster(page);
        log({ event: 'final_roster', roster: finalRoster });
        const { clickedButMissingFromFinalRoster, inFinalRosterButNeverClickedByUs } =
          verifyFinalRoster(finalRoster, ourPicks);
        if (clickedButMissingFromFinalRoster.length > 0) {
          log({
            event: 'verification_MISMATCH',
            note: 'We believed we drafted these players (draftPlayer succeeded) but they are NOT in the final roster — investigate before trusting this run.',
            clickedButMissingFromFinalRoster,
          });
        } else {
          log({
            event: 'verification_ok',
            note: 'Every player we clicked Draft on appears in the final roster.',
            ourPicks,
            inFinalRosterButNeverClickedByUs, // expected to be non-empty whenever Yahoo autopicked for us
          });
        }
        break;
      }

      if (state === 'ours') {
        // Note: if the deadline fires first, `attempt` keeps running in the background —
        // withDeadline() doesn't cancel it (Playwright has no way to abort an in-flight
        // click). Its own .catch() below still logs a pick_error whenever it eventually
        // settles, and a late success still logs 'picked' from inside takeOurTurn, so
        // nothing is silently swallowed — but a very late completion could submit a click
        // against a page state the main loop has already moved past (e.g. Yahoo autopicked
        // and it's now a different turn). Accepted risk: this has never been observed live
        // (picks have consistently finished well under the deadline), and Playwright offers
        // no clean way to cancel an in-flight action short of closing the page.
        const attempt = takeOurTurn(page)
          .then((choice) => {
            ourPicks.push(choice.name);
          })
          .catch((err) => {
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

module.exports = { verifyFinalRoster };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
