# Draft Driver — Design

## Purpose

The league "Kicker? I Hardly Know Her" (ID 109715) drafts live on Sun Aug 23 2026, 5pm
EDT, 1-minute pick clock, 10 teams, 15 rounds. This project adds a fully autonomous
Playwright-driven agent that drafts the user's team on their behalf — no human clicking
required — using Yahoo's own in-draft player rankings and a standard BPA-then-need
strategy.

This builds directly on the Yahoo Playwright page object model foundation (see
`docs/superpowers/specs/2026-08-20-yahoo-playwright-pom-design.md`), reusing
`yahoo/browser.js` for the persistent logged-in session, and follows the same pure/impure
split pattern established by the page objects there (`yahoo/pages/standings-page.js`,
`yahoo/pages/roster-page.js`, etc.).

**Validated during manual testing (2026-08-20)** against mock drafts at
`draftclient/f1/<leagueId>/<teamId>?auth=<token>`:
- Turn-state is readable from page title / text (`"YOUR TURN, DRAFT NOW"`,
  `"N picks until your turn"`, `"Draft Complete"`).
- The available-players table is pre-filtered to available-only and default-sorted by
  Yahoo's own ranking (ADP), with columns including Proj Pts, Pos Rank, XRank, position,
  team, bye week.
- Picking a player requires: click the player's name (opens a confirmation dialog with
  player detail) → click "Draft" inside that dialog. A direct one-click "Draft" button
  also exists per-row in some views but is less reliable to target than the name→dialog
  flow.
- A "Your Team" panel (`YOUR TEAM (N/15)`) shows filled slots with player name/position.
- Yahoo puts an inactive drafter into its own autopick mode automatically after a missed
  pick — this is the safety net this design deliberately relies on rather than fights.
- The draft-room URL/interaction pattern is identical for mock and real leagues, so this
  feature can be smoke-tested against a fresh live mock draft before Sunday without
  touching the real league.
- **Known gap**: an unrelated "Yahoo Fantasy Plus" upsell modal appeared once during
  testing and blocked clicks until dismissed via "Exit Preview" (which exits the draft
  entirely). Cause not fully isolated — possibly triggered by a specific UI interaction
  (sorting/filtering) rather than appearing unconditionally. Needs to be watched for
  during implementation; if it reproduces reliably, the picker must detect and dismiss it
  (or avoid whatever triggers it) rather than let it block a pick.

## Architecture

```
yahoo/pages/draft-room-page.js   Draft-room page object:
                                  - enterDraft(page, draftUrl) — navigate, wait for
                                    connection
                                  - getTurnState(page) — 'ours' | 'waiting' | 'complete'
                                  - getAvailablePlayers(page, { limit }) — top N rows of
                                    the available-players table: name, position, nflTeam,
                                    adp, projPts, posRank
                                  - getOurRoster(page) — parsed "Your Team" panel: which
                                    slots are filled, with what player
                                  - draftPlayer(page, playerRef) — click name → confirm
                                    dialog → Draft button

yahoo/draft/strategy.js          Pure function: pickPlayer(availablePlayers, ourRoster,
                                  { totalRounds, currentRound }) -> chosen player.
                                  Updated per Task 7's live-testing findings (see below) —
                                  this no longer matches the "switch once all 7 are full"
                                  wording from earlier in this doc:
                                  - BPA (highest raw Proj Pts, any position) while MORE
                                    THAN 2 of the 7 non-K/DEF starting slots (QB, RB, RB,
                                    WR, WR, TE, W-R-T) are still open. Below that threshold
                                    (2 or fewer open), switches to need-based: best-ranked
                                    player at a position we still need, falling back to
                                    pure BPA if nothing in the pool matches an open need.
                                  - QB is a hard exception: once our starting QB slot is
                                    filled, QB is excluded from consideration for the rest
                                    of the draft, regardless of raw value. Yahoo's Proj Pts
                                    isn't scarcity-adjusted, so pure BPA/need logic alone
                                    kept re-drafting QB — live-verified this was a real,
                                    repeated problem before the fix (see Task 7 below).
                                  - K and DEF are excluded from consideration entirely
                                    until the final 2 rounds, at which point they're folded
                                    into the same need-matching logic as every other
                                    position (an earlier version of this fold-in had a bug
                                    where it didn't check which of K/DEF specifically was
                                    still open — see Task 7 below).

yahoo/run-draft.js               CLI orchestrator:
                                  - launchContext(), enter the draft
                                  - poll loop (~2-3s) reading getTurnState()
                                  - on our turn: internal deadline ~50-55s (tuned after
                                    seeing real scrape+decide+click timing) — read
                                    roster + available players, call pickPlayer(),
                                    draftPlayer(); if the deadline is hit first, do
                                    nothing (Yahoo's autopick takes the turn)
                                  - logs every observed pick (ours and opponents') plus
                                    our own reasoning to a local file for a post-draft
                                    audit trail
                                  - exits cleanly on 'complete'
```

## Data flow & timing

1. **Enter draft**: navigate to the real league's draft room (reached via the league's own
   "Draft" nav link once the live draft opens, not the mock lobby).
2. **Poll loop** (~2-3s): read turn state.
   - Not our turn → keep polling.
   - Our turn → run the pick sequence.
   - Complete → exit.
3. **Pick sequence** (target: finish well inside the ~50-55s internal deadline):
   - Read "Your Team" panel → open slots.
   - Read top ~30-50 rows of the available-players table (already available-only,
     Yahoo-sorted — no separate "who's drafted" tracking needed, since Yahoo maintains
     that for us and we just re-read fresh each turn).
   - `strategy.js` picks a player per the BPA/need/K-DEF-defer rule above.
   - `draftPlayer()` executes the click sequence.
   - Log round, pick number, player, and which phase (BPA vs need) drove the choice.
4. **Deadline guard**: if the pick sequence isn't done in time, abandon it — do nothing,
   let Yahoo's autopick take the turn, log that this happened loudly (this is an accepted,
   intentional degrade path, not a crash).

## Error handling

- Selector/scrape failure during the pick sequence → caught, logged, deadline guard
  naturally applies (no pick attempted, Yahoo autopicks).
- `NOT_LOGGED_IN` mid-draft → same fallback. No attempt to auto-relogin (no time for an
  interactive login within a pick window); logged loudly since this would likely affect
  every subsequent turn until a human notices and runs `node yahoo/login.js` between
  turns.
- Draft room temporarily unreachable (network blip) → poll loop catches, retries next
  interval; if it's our turn when this happens, deadline guard applies.
- The Yahoo Plus upsell modal (see "Known gap" above) → to be handled during
  implementation once its trigger is understood; at minimum, `draftPlayer()`'s click
  sequence should detect a blocking dialog that isn't the expected confirm dialog and
  either dismiss it or abandon the pick attempt (never let it silently eat the whole
  deadline window, which is what happened during manual testing).

## Testing

Same philosophy as the scraper: no mocks, since this is fundamentally live DOM
interaction. Practical testing is running `run-draft.js` against a fresh live mock draft
(same URL/interaction pattern as the real league, confirmed during manual testing) and
watching it actually pick correctly through multiple rounds before relying on it for the
real draft Sunday.

## Out of scope

- Trade/waiver automation — this is draft-day only.
- A UI/dashboard for watching the driver work — the local log file is sufficient for this
  personal tool.
- Handling a snake-draft edge case where the driver is picking back-to-back (last pick of
  one round, first pick of the next) — not expected in a 10-team league from a mid-order
  slot, but worth a note if it comes up during testing.

## Task 7: live end-to-end test results (2026-08-20)

Ran `run-draft.js` (via a throwaway copy pointed at a live 14-team mock draft's
`draftclient/...?auth=` URL, per the plan — the copy was deleted after testing, never
committed) against a real mock draft from slot 8, unattended, through 16 rounds (this
mock lobby's roster is one bench spot larger than the real league's 15; not a driver bug).
This surfaced three real, live-only-reproducible bugs, all fixed and re-verified live in
the same running draft before it completed:

1. **QB dominates raw BPA and never stops** (the most serious finding). Yahoo's "Proj Pts"
   column is a raw projected season point total, not adjusted for positional scarcity — a
   startable QB routinely projects ~250-270 pts against ~150-160 for the best available
   RB/WR/TE at the same point in the draft (passing yards/TDs simply accumulate points
   faster than one rushing/receiving line). Since only 1 QB slot starts, pure
   highest-projPts BPA kept taking QB after QB — **5 QBs drafted** in the live test, one as
   late as after the entire starting lineup and bench need-matching had already fallen
   through to pure bench-value BPA. Fixed in `yahoo/draft/strategy.js`: once the starting
   QB slot is filled, QB is excluded from consideration for the rest of the draft, the same
   treatment K/DEF already got and for the same reason. Re-verified live immediately after
   the fix: the next three picks all correctly skipped QB (RB, TE, WR) despite QB still
   showing the highest raw points every time.
2. **K/DEF need-matching didn't know about K/DEF.** K and DEF are deliberately left out of
   `STARTING_SLOTS` (they're gated separately by the final-2-rounds check), but that also
   meant the need-matching pass in the final rounds never checked whether K or DEF
   specifically was already filled. With K already drafted and DEF still open, the driver
   drafted a **second kicker** (higher raw points than any available DEF) instead — the
   real draft ended with DEF never filled. Fixed by folding any still-open K/DEF slot into
   the same need-matching pass once K/DEF become eligible, so an already-filled one-slot
   position can't outrank a genuinely open one on raw points alone. Covered by two new
   symmetric unit tests (K-filled/DEF-open and DEF-filled/K-open); **not** independently
   re-verified against a second live draft after the fix, since the mock draft had already
   finished by the time this second bug was found and fixed (the K/DEF-eligible window is
   only the last 2 rounds) — logically sound and unit-tested, but flagged here as the one
   fix in this batch that didn't get a live re-run.
3. **A successful pick's own confirmation dialog could block the next click.** After
   clicking "Draft" successfully, `draftPlayer()` returned immediately without waiting for
   the confirmation dialog to actually close. If the poll loop's very next iteration still
   read the turn-state title as `'ours'` (the title can take a couple seconds to flip after
   a pick), it would immediately attempt another pick — landing on the still-open/closing
   dialog, which intercepted the click and burned a 30s timeout before failing
   (`pick_error`, caught cleanly; no hang, no wrong pick, but wasted time on every
   occurrence). Fixed two ways: `draftPlayer()` now waits for its own dialog to close
   before returning (`yahoo/pages/draft-room-page.js`), and `run-draft.js` now waits
   (bounded, 15s) for turn-state to move off `'ours'` before resuming normal polling
   instead of assuming one `POLL_INTERVAL_MS` pause is always enough — while still falling
   through to treat a turn that doesn't clear as a legitimate new one, since that's also
   what a real back-to-back snake-draft turn looks like.

Also fixed, found by code inspection while investigating the above rather than by a live
failure: `currentRound` was tracked as a plain in-memory counter incremented once per own
turn. If the process is ever restarted mid-draft (crash, manual intervention — which
happened repeatedly during this test session), the counter resets to 1 and desyncs from
the real round, throwing off the K/DEF final-rounds gate. Now derived from the count of
filled roster slots (`roster.filter(s => s.playerName).length + 1`), which is ground truth
the page itself provides and self-corrects across a restart or after a turn Yahoo
auto-picked for us while the driver was stalled.

**Confirmed working correctly, live, after all fixes**: turn detection (title-based
`getTurnState`) tracked "ours"/"waiting"/"complete" reliably across ~16 rounds including
several reconnects; BPA phase picked regardless of position early (J. Allen QB round 1
with position varying thereafter); no K/DEF picked before the final-rounds window even
though kickers had higher raw points than several available skill players in rounds
10-13; K/DEF correctly became eligible exactly at round 14 (`totalRounds - 2`); the
transient `"You are next"` and other non-matching title strings correctly fell through to
`'unknown'` (treated as "not our turn yet," never mis-fired as `'ours'`) and always
resolved correctly once it truly was our turn; the draft finished cleanly with a
`draft_complete` log line and the process exited on its own.

**Known limitation surfaced but not fixed**: during testing, a manual second browser
connection to the same draft slot (opening the mock draft's URL in a second tab while the
driver's own tab was still connected) left the driver's tab reading a stale, unchanging
turn-state title indefinitely — Yahoo's autopick eventually claimed that turn for us with
**zero log entry**, not even `deadline_missed`. This was very likely self-inflicted (the
Playwright MCP tool used for manual browsing happened to share the exact same persistent
Chrome profile directory, `yahoo/.playwright-profile`, as `yahoo/browser.js`, so a "second
tab" was really a second process on the same profile) and is not expected to occur during
the unattended real draft, where nothing else will touch that profile. But `run-draft.js`
still has **no self-detection or recovery if its live connection to the draft room ever
goes genuinely stale** (network blip, Yahoo evicting an idle connection, etc.) — if that
happens for real on Sunday, the driver would silently stop picking for the rest of the
draft with no error surfaced. Given the risk of a watchdog/reload mechanism introducing
its own new failure modes on a tight timeline, this was deliberately left unfixed;
mitigate operationally instead: run the driver from a profile nothing else touches during
the draft, and keep an eye on `yahoo/draft-log.jsonl` for an unexpectedly long gap with no
`state_change` line as a signal to check in manually.

The Yahoo Fantasy Plus upsell modal noted in "Known gap" above did not reappear during
this ~16-round run; `draftPlayer()`'s existing `Exit Preview` detection was never
exercised for real. Its risk is not eliminated, just not observed again.
