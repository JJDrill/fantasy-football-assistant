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
                                  BPA while any of the 7 non-K/DEF starting slots
                                  (QB, RB, RB, WR, WR, TE, W-R-T) are open; once all 7
                                  are filled, switch to need-based (best-ranked player at
                                  a position we still need — open bench slots count as
                                  "need any position", subject to roster max-per-position
                                  implied by available slots); K and DEF are excluded from
                                  consideration entirely until the final 2 rounds.

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
