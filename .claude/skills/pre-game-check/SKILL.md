---
name: pre-game-check
description: Use when the user wants to prepare for an upcoming week/game in the "Kicker? I Hardly Know Her" Yahoo league — lineup set correctly, no inactive starters, trades accounted for, challenge rule known, plus (first check of the week) byes, waiver targets, trade scan and legal watch list.
---

# Pre-Game Check

Runs a full readiness checklist before a week's lineup locks: confirms the lineup, flags
inactive/out/bye starters, accounts for any recent trades, and surfaces the week's $10
challenge rule. Chains `lineup-advice` and `challenge-tracker` — for a deeper dive on
either individually, use those skills directly instead.

## Steps

1. Determine the week (default: current).

2. **Check live-data availability** for everything this checklist needs:
   - `yahoo/get-matchup.js` (roster data, used by `lineup-advice`)
   - `yahoo/run-challenge.js` (challenge data, used by `challenge-tracker`)
   - `yahoo/get-alerts.js <week> [days=7]` (stands in for Yahoo app alerts). It returns
     `rosterTrendFlags` (players on your roster or your opponent's who appear in Yahoo's
     league-wide Transaction Trends, with adds/drops counts and a
     `dropping`/`adding` direction), `recentLeagueTransactions` (this league's adds,
     drops, trades and vetoed trades in the window), and `userTeamTransactions`.
     It also returns `userTeamNotes`: `pending` (your pending waiver claims, each with
     add/drop, claim order and process date; pending trades, both ones you proposed and
     offers to you, come through as `kind: "trade"` with Yahoo's raw text and link; anything
     else as `kind: "other"`), `waiverPriority`, and `irUsage`.
     Report pending claims in the checklist. Check that each claim's drop still makes
     sense, and that claim order matches what matters most given the waiver priority
     (the league uses a rolling list, so winning claim 1 drops you to the bottom before
     claim 2 processes). Also check the live roster for an IR-slotted player whose tag
     is no longer O/IR (e.g. reset to Q). Yahoo blocks every add until he's moved to BN
     (Error #845).

   Try each; note which succeed and which fall back (missing script, expired session,
   Yahoo API not yet approved — all expected until OAuth + Yahoo API approval is done).

3. **Ask only for what live data couldn't get, in ONE combined message, before any
   analysis.** When every script in Step 2 worked, ask nothing and go straight to Step 4
   (changed 2026-10-08: the user doesn't want to be asked about trades or concerns).
   - If live roster data is unavailable: ask the user to paste or screenshot their
     current roster (starters and bench, with positions).
   - If live challenge data is unavailable: ask for whatever this week's specific
     challenge rule requires per `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md` (e.g. Week 3 needs every
     team's starting kicker's points).
   - **Don't ask about trades.** Pending trades come from `get-alerts.js`
     (`userTeamNotes.pending`, `kind: "trade"`). Completed, vetoed and canceled ones come
     from its league transactions (a canceled trade appears as "Vetoed Trade"). Cross-check
     `trades.md`: an entry marked proposed that's no longer pending and didn't complete was
     rejected or canceled, so update its status. Only if `get-alerts.js` failed, ask: "Any
     trades proposed or waiting on a response that I should know about?"
   - **Don't ask about Yahoo app alerts.** Use `get-alerts.js` instead. Only if it
     fails, fall back to asking: "Any Yahoo app alerts (mass add/drop notifications,
     injury alerts, etc.) you want looked into?" Either way, evaluate each flag the
     same way: a mass-drop number alone is usually normal streaming churn (common for
     K/DEF, which get streamed weekly), or a reaction to news already known (e.g. a
     player already on IR). Check it against the player's actual injury/legal status,
     ECR and Vegas implied total before deciding whether it matters, and say so explicitly either
     way rather than letting the raw number imply concern.
   - **Don't ask what's worrying the user.** The checklist already covers every injury tag,
     bye and close call. They'll say so if something else matters.

   If a message was needed, don't proceed to Step 4 until it's answered. Never ask a follow-up mid-checklist —
   if something else comes up while running Step 4, note it in the final summary instead
   of interrupting.

4. **Run the rest of the checklist without further questions**, using whatever was
   gathered in Step 3:
   - Invoke the `lineup-advice` skill for start/sit recommendations against the
     roster.
   - Cross-check for inactive/out/bye starters: if live roster data included status
     flags, check them directly. Regardless of whether flags were present, get each
     starter's injury/availability status per the shared cache protocol in
     `methodology/injury-cache-convention.md` — reuse a fresh cached entry if one
     exists, otherwise `WebSearch` and record it there. Flag anything uncertain rather
     than asserting confidently. Cite sources for anything surfaced.
   - If a completed trade shows in the league transactions but not in the roster data,
     note it explicitly rather than trying to resolve it automatically; it needs a fresh
     roster fetch.
   - **Trades, always:** for any trade that comes up in this pass (one the user mentions,
     an incoming offer, a `trade-finder` candidate, or an idea you raise yourself), run
     `trade-analyzer` on it without asking. Then make sure `seasons/2026/Kicker I Hardly Know Her/trades.md`
     reflects it: new entries for new trades, and dated status updates for existing ones
     (proposed / accepted / vetoed / canceled / dropped).
   - Invoke the `challenge-tracker` skill for this week's $10 challenge rule — surfaced
     here because some challenge rules constrain lineup choices (e.g. a challenge scored
     on starting kicker points), worth knowing before locking the lineup.
   - **First pre-game check of the week only** (usually Tue/Wed; moved here from
     `post-game-check` 2026-10-20). Later checks that week skip these unless something
     changed, like an injury or a trade response:
     - **Bye planning:** list byes for this week and next week that hit our roster, and
       plan cover adds (when to add, who to drop).
     - Invoke `waiver-targets` (uses `yahoo/get-free-agents.js`).
     - **Yahoo's own suggestions** (added 2026-10-21): run `yahoo/get-yahoo-suggestions.js`
       (team page "Add/drop suggestions" tab, plus the sit/start tab text). Check each suggested
       add/drop against FantasyPros ECR, byes and planned cover adds, and give a one-line verdict
       on each. Yahoo works from its own projections, so treat these as names worth checking,
       not a signal. The trade tab is paid (Yahoo Fantasy Plus) and isn't read.
     - **Invoke `team-scout`** for all 9 other teams (added 2026-10-23; uses `yahoo/scout-league.js`), writing
       `scouting/week-NN.md` and logging its predictions in `reference/scouting-accuracy.md`. Its trade fits feed
       `trade-finder` below.
     - Invoke `trade-finder` (uses `yahoo/get-all-rosters.js`), and re-check every open
       or watch-list entry in `trades.md` against current rosters.
     - **Legal watch-list refresh:** check every open entry in
       `seasons/2026/Kicker I Hardly Know Her/reference/legal-watch-list.md` (`WebSearch` the player plus
       the concern), update the row, and mark it `Resolved` with a one-line outcome once
       settled. Only clear `Unverified` with a Tier 1 source (`methodology/trusted-sources.md`).
       Append any new off-field flag from this pass, rumors included (marked `Unverified`).
     - Pick up any "Hand-offs to pre-game" lines in the previous week's post-game review.
   - **Close out open to-dos, every check** (added 2026-10-20, after trade #17 was planned
     for "Sunday night" and quietly never sent). Re-read this week's file (and last week's,
     on the first check) for every "Still to do", "send after…", "Sunday:", checklist item
     or planned trade/claim. Mark each one in the week file as **done** (verified via
     `get-alerts.js` or `get-matchup.js`), **dropped** (with a one-line reason), or
     **carried over** (with a new date). Nothing stays open without a status. Mirror
     any trade status in `trades.md`.
   - Run the Yahoo scripts **one at a time**. They share a Playwright profile, and parallel
     runs give a false `NOT_LOGGED_IN`.

5. **Present one consolidated go/no-go checklist:**
   - Lineup: confirmed / N changes suggested (list them)
   - Inactive starters: none found / list
   - Trades: none pending / pending trade X (with `trade-analyzer` verdict) / roster
     doesn't yet reflect completed trade X
   - This week's challenge rule: one-line summary
   - Open to-dos: each one's status (done / dropped / carried over)
   - (First check of the week) Byes and cover plan, top 2-3 waiver pickups, Yahoo's add/drop
     suggestions with a verdict on each, top trade
     candidate (with its verdict) or "nothing worth pursuing", legal watch-list changes, and the `team-scout`
     summary (opponent's top strengths and weaknesses, league-wide findings)
