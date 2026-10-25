---
name: post-game-check
description: Use when the user wants a post-game review of a completed week in the "Kicker? I Hardly Know Her" Yahoo league — recap, challenge result, and a deep dive on every decision we made that week, separating what we controlled from what was luck.
---

# Post-Game Check

A **backward-looking** review of one completed week: what happened, which of our decisions
were good or bad **given what we knew when we made them**, and what was just chance.

**Scope (changed 2026-10-20):** no next-week planning. No trade scans, waiver targets, bye
planning, lineup sketches or legal-watch refreshes. Those belong to `pre-game-check`.
If something forward-looking turns up, give it **one line** under "Hand-offs to pre-game"
and stop there.

Chains `weekly-recap` and `challenge-tracker`.

## Steps

1. Determine the week (default: most recently completed).

2. **Check live-data availability.** Run these **one at a time**: they share one
   Playwright profile, and parallel runs give a false `NOT_LOGGED_IN`.
   - `yahoo/get-matchup.js <week>` and `yahoo/get-scoreboard.js <week>` (box score, final)
   - `yahoo/run-challenge.js <week>` (challenge result, plus every team's starters/bench)
   - `yahoo/get-alerts.js <next week> 7` (our adds/drops/trades during the week, with timestamps)
   - Sleeper weekly stats (`yahoo/sleeper-stats.js` → `getWeekStats`) for snaps, carries
     and targets

3. **Ask only for what live data couldn't get, in ONE message, before any analysis.**
   - No box score: ask for both teams' starters and bench points and the final score.
   - No challenge data: ask for whatever the week's rule needs, per
     `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md`.
   - When everything worked, ask nothing. Never ask follow-ups mid-review; put open
     questions in the summary instead.

4. **Rebuild the decision log.** Read that week's file
   (`seasons/2026/Kicker I Hardly Know Her/week-NN.md`) and list every decision we made:
   each start/sit call, add/drop, waiver claim, trade sent or accepted, and any call where we
   chose to do nothing. For each one, note **what we knew at decision time**: ECR,
   usage, injury designation and practice trend, Vegas, and the reasoning written down then.
   Don't use anything learned afterward.

5. **Grade each decision on process first, then outcome.** Put each one in one cell:

   |  | Good result | Bad result |
   |---|---|---|
   | **Good process** | **Right call, paid off** | **Right call, bad luck**: keep doing it |
   | **Bad process** | **Wrong call, got away with it**: don't repeat it | **Wrong call, cost us** |

   - **Process** = was it the best call on the information available then, under our
     rules (`methodology/rules.md` for all seasons, `season-lessons.md` "This season's rules", health
     tiers)? A coin flip (a 1-3 spot ECR gap) called with a sensible tiebreak is good
     process **whichever way it lands**.
   - **Outcome** = points vs. the alternative, from the box score.
   - Mark each one **controllable** or **chance**. Chance includes TDs, in-game injuries,
     game script, and opponent players going off. Something we couldn't have known before
     lock isn't our mistake. Don't relitigate it with hindsight.
   - Only a "Wrong call" cell (cost us, or got away with it) can produce a lesson. "Right call, bad luck" cells confirm
     the process and **must not** change a rule.

6. **Margin analysis.**
   - Our bench vs. our starters: the best possible lineup in hindsight, and the gap.
     Then the gap **we could have known about** before lock. These differ, and only the
     second one counts against us.
   - Opponent: their bench mistakes, and whether the result hinged on them.
   - For a loss: the smallest set of swaps that flips it, each tagged knowable or chance.
     For a win: what would have flipped it the other way.

7. **Recap and challenge.**
   - Invoke `weekly-recap` (the short, fun version).
   - Invoke `challenge-tracker` for the final result (note it's pre-stat-correction).

8. **Update the tracking logs** (record outcomes; these don't make next-week decisions):
   - **Source accuracy:** for each close call logged in
     `seasons/2026/Kicker I Hardly Know Her/reference/source-accuracy.md`, fill in actual points
     **and points excluding TDs** (−6 per rushing/receiving TD, Sleeper `rush_td`/`rec_td`),
     score each source ✓/✗/— both ways, and update both running records. A call where
     the two verdicts differ was decided by a TD: grade it as chance. Add the process grade from
     Step 5 in the notes, so a single result doesn't read as a rule change.
   - **Injury-risk tier tracker** in `seasons/2026/Kicker I Hardly Know Her/reference/season-lessons.md`:
     one row for every starter the week's `lineup-advice` pass gave a health tier: practice
     trend, final report, injury type, recently returned, play risk, limited risk, tier,
     **snap % that game vs. his average over the previous 2-3 healthy games** (Sleeper
     `off_snp`/`tm_off_snp`; a 10+ point drop = "Limited", "In-game" if he left injured,
     else "Full"), points, positional average, above/below. If a high-tier player was
     **benched**, log how he did in a note, since that's the ladder's other test.
   - **Cross-week audit** (same file): one line per week covering the margin analysis
     and any real "Wrong call" lessons.
   - **Matchup grades are retired** (2026-10-11, 7/21). Don't score them.
   - **Trades executed that week:** add a dated "how it played out" line to the entry in
     `trades.md` (both sides' points that week). Don't scan for new trades.
   - **Waiver log** (added 2026-10-24; league grading can't see roster moves): one row per add we
     made that week in `reference/waiver-log.md` (DEF and K streams included), from `get-alerts.js`
     `userTeamTransactions`. Record his ECR when added (from that week's pre-game notes, or archived
     FantasyPros `?week=N`), whether he started, his points (and excluding TDs), the dropped player's
     points that week, and the best player we could have had instead (the top scorer at that position
     who was a free agent at add time, if `get-free-agents.js` notes or the week file show it; else
     "—"). Grade it like a decision: process first (was it the best add on what we knew?), then
     outcome. For an earlier add still rostered, update its "Since" column (weeks started, points per start).
   - **Scouting accuracy** (added 2026-10-23, for learning): fill in Actual and Result
     (**hit / miss / push**, with the numbers) for that week's rows in
     `reference/scouting-accuracy.md`, then update its hit-rate-by-type table. Use the
     scoring rules in that file's header. Under each `## Other-team analysis: <team>` section in
     `scouting/week-NN.md`, add a short `### How it played out`: the hits and misses, and which
     misses were bad reads vs. luck. `scout-league.js <week>` re-run after the week gives every
     team's final roster points, which settles most rows.
   - **League-wide start/sit grading** (added 2026-10-23; the main evidence for our lineup rules):
     run `node yahoo/grade-league-decisions.js <week>` (on its own, not alongside another Yahoo
     script), then `node yahoo/grade-league-decisions.js --summary`. Add a dated section to
     `reference/league-decisions.md` with the new cumulative table, and say what moved: is the
     favorite still ~50% inside the coin-flip windows and well above it outside, and is the TE
     watch item (favorite only ~50% even outside the window) holding? Note any of our own calls
     that went against ECR outside a window. The summary also prints a **QB/DEF/K** table (added 2026-10-24:
     starters compared across teams, plus average points by ECR tier). Update that section too, and say
     whether DEF rankings are still near a coin flip (~55%), kickers still look random, and close QBs
     (gap under ~8) are still a coin flip, which would mean widening the QB window. Same check for RB
     pairs with a gap of 4-8 (beyond the current ~3 window): from Wk10, if those are still near 50%,
     propose widening the RB window in "This season's rules" Rule 1 from ~3 to ~8 in Step 9. From Wk10,
     if the better-ranked kicker is still winning under ~50%, propose promoting "kickers are
     interchangeable" (`season-lessons.md` suggestion 6) to `methodology/rules.md` in Step 9.

9. **Lessons learned → process updates.** This is the main output of the review. For each
   "Wrong call" cell, and for any pattern now showing in the running records
   (source accuracy, scouting accuracy, waiver log, league-wide start/sit grading, health-tier tracker, cross-week audit), ask: **does a rule or skill need
   to change?** Check it against `methodology/rules.md` (all seasons), "This season's rules" in `season-lessons.md`, and the
   `lineup-advice` / `pre-game-check` / `waiver-targets` skills. For each candidate change, give:
   - the evidence (which weeks or calls, and the sample size),
   - the exact proposed wording and where it goes,
   - a recommendation: change now / watch (needs more weeks) / no change,
   - **scope** (added 2026-10-23): **all seasons** (`methodology/rules.md`; holds with any roster and
     league, marked Structural or Provisional) or **this season** (`season-lessons.md`; marked Rule or
     Suggestion). Also say if a this-season rule has earned promotion, or an all-seasons rule is contradicted.
   One week's "Right call, bad luck" result is never evidence for a change. Say "no process changes
   this week" when that's the honest answer. **Propose, don't apply.** The user decides,
   and changes are made after they say yes.

10. **Write the review into the week file** as a `## Post-game review` section, then
   **present one summary**:
   - **Result:** score, record, 2-3 sentence recap
   - **Decision scorecard:** every decision in its cell (Right call, paid off / Right call, bad
     luck / Wrong call, got away with it / Wrong call, cost us), with points gained or lost vs. the alternative
   - **Controllable vs. chance:** the margin, what we could have known, and what was luck
   - **Lessons learned and proposed process updates** (from Step 9): each with evidence and
     a change now / watch / no change recommendation. "None this week" is a fine answer
   - **Challenge:** winner, and where we finished
   - **Scouting accuracy:** this week's hit rate, by type, and the biggest miss
   - **Hand-offs to pre-game:** one line each, no analysis (e.g. "Burden's snaps dropped,
     check before Wk7")
