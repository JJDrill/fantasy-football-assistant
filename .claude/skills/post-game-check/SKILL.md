---
name: post-game-check
description: Use when the user wants a full post-game/weekly wrap-up in the "Kicker? I Hardly Know Her" Yahoo league — recap, new trade opportunities, challenge status, and waiver targets for next week.
---

# Post-Game Check

Runs a full post-week wrap-up: recaps how the week went, scans for new trade
opportunities the results opened up, checks the $10 challenge standing, and surfaces
waiver targets for next week. Chains `weekly-recap`, `trade-finder`, `challenge-tracker`,
and `waiver-targets` — for a deeper dive on any one of these individually, use that skill
directly instead.

## Steps

1. Determine the week (default: most recently completed).

2. **Check live-data availability** for everything this checklist needs:
   - `yahoo/get-matchup.js` / `yahoo/get-scoreboard.js` (recap)
   - `yahoo/get-all-rosters.js` (trade-finder)
   - `yahoo/run-challenge.js` (challenge-tracker)
   - `yahoo/get-free-agents.js` (waiver-targets)

   Try each; note which succeed and which fall back (missing script, expired session,
   Yahoo API not yet approved — all expected until OAuth + Yahoo API approval is done).

3. **Ask everything needed, in ONE combined message, before doing any analysis:**
   - If live recap data is unavailable: ask for the final box score for that week (both
     teams' starters and points, and the final score).
   - If live trade-finder data is unavailable: ask for every other team's roster in one
     message (text or screenshots).
   - If live challenge data is unavailable: ask for whatever this week's specific
     challenge rule requires per `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md`.
   - If live waiver data is unavailable: ask for the waiver wire / available-players
     list, and which position(s) they're interested in (or "all").
   - **Don't ask what the user wants flagged** (changed 2026-10-08). When every script in
     Step 2 worked, ask nothing and go straight to Step 4.

   If a message was needed, don't proceed to Step 4 until it's answered. Never ask a follow-up mid-checklist —
   if something else comes up while running Step 4, note it in the final summary instead
   of interrupting.

4. **Run the rest of the checklist without further questions**, using whatever was
   gathered in Step 3:
   - Invoke the `weekly-recap` skill.
   - Invoke the `trade-finder` skill.
   - **Trades, always:** for any trade that comes up in this pass (one the user mentions,
     an incoming offer, a `trade-finder` candidate, or an idea you raise yourself), run
     `trade-analyzer` on it without asking. Then make sure `seasons/2026/Kicker I Hardly Know Her/trades.md`
     reflects it: new entries for new trades, and dated status updates for existing ones
     (proposed / accepted / vetoed / canceled / dropped).
   - Invoke the `challenge-tracker` skill.
   - Invoke the `waiver-targets` skill.
   - **Matchup grades are retired** (2026-10-11, 7/21 hit rate). Don't score them.
     `reference/matchup-grade-accuracy.md` is a closed record.
   - **Source accuracy**: for each close call logged that week in
     `seasons/2026/Kicker I Hardly Know Her/reference/source-accuracy.md`, fill in both players'
     actual points, score each source ✓/✗/—, and update the running record. Mention in the
     summary which source has been most reliable so far.
   - **Injury-risk tier check**: for every starter that week's `lineup-advice` pass gave a
     health risk tier (see the week's injury cache), append a row to the "Injury-risk tier
     tracker" in `seasons/2026/Kicker I Hardly Know Her/reference/season-lessons.md`: practice
     trend, final report, injury type, recently returned, play risk, limited risk, tier,
     **snap % in that game vs. his average over the previous 2-3 healthy games** (Sleeper
     `off_snp`/`tm_off_snp`; a 10+ point drop = "Limited", else "Full"), actual points,
     positional average, above/below.
     Also update that file's cross-week audit: for any loss, note which bench swap would have
     flipped it and whether that was knowable at decision time or random.
   - **Legal watch-list refresh**: check every open entry in
     `seasons/2026/Kicker I Hardly Know Her/reference/legal-watch-list.md` for a status update (`WebSearch` the player's name
     plus their concern, e.g. "Josh Jacobs suspension decision"), update the row, and
     mark it `Resolved` with a one-line outcome if it's been settled. Only clear an
     `Unverified` status once a Tier 1 source (per `methodology/trusted-sources.md`)
     corroborates it — a second Tier 2 hit doesn't count. Also append any new off-field/
     legal flag surfaced anywhere else in this pass (recap, trade-finder, waiver-targets)
     — including an unconfirmed rumor, marked `Unverified` per the same source tiering —
     so it isn't rediscovered from scratch later.

5. **Present one consolidated summary**, not four separate walls of text:
   - Recap: 2-3 sentence version of the full recap
   - Trades: top candidate, if any, or "nothing worth pursuing this week"
   - Challenge: current standing/result
   - Waivers: top 2-3 pickups
   - Matchup-grade accuracy: this week's hit rate and the running season hit rate
   - Legal watch list: anything newly resolved, still open, or newly added
   - Note that full detail from any individual step is available on request
