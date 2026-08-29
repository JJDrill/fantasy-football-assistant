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
     challenge rule requires per `reference/challenges.md`.
   - If live waiver data is unavailable: ask for the waiver wire / available-players
     list, and which position(s) they're interested in (or "all").
   - Always ask: "Anything specific you want me to flag — a position need, a challenge
     you're chasing?"

   Do not proceed to Step 4 until this single message has been sent and answered (or
   skipped because live data covered everything). Never ask a follow-up mid-checklist —
   if something else comes up while running Step 4, note it in the final summary instead
   of interrupting.

4. **Run the rest of the checklist without further questions**, using whatever was
   gathered in Step 3:
   - Invoke the `weekly-recap` skill.
   - Invoke the `trade-finder` skill.
   - Invoke the `challenge-tracker` skill.
   - Invoke the `waiver-targets` skill.
   - **Matchup-grade accuracy check**: for every one of your starters that got a
     matchup grade in that week's `lineup-advice` pass (see the week's notes file),
     compare their actual fantasy points to the league-wide positional average for that
     week. A grade is a **hit** if a Favorable player scored above the positional
     average or an Unfavorable player scored below it; otherwise it's a **miss**
     (Neutral grades aren't scored either way). Append one row per graded starter to
     `reference/matchup-grade-accuracy.md` (create it if it doesn't exist yet, with
     columns Week | Player | Position | Grade | Vegas Signal | Actual Pts | Position Avg
     | Hit/Miss), so a hit rate accumulates across the season. Mention the resulting
     week's hit rate and the running season hit rate in the summary.
   - **Legal watch-list refresh**: check every open entry in
     `reference/legal-watch-list.md` for a status update (`WebSearch` the player's name
     plus their concern, e.g. "Josh Jacobs suspension decision"), update the row, and
     mark it `Resolved` with a one-line outcome if it's been settled. Also append any
     new off-field/legal flag surfaced anywhere else in this pass (recap, trade-finder,
     waiver-targets) — including an unconfirmed rumor, marked `Unverified` — so it isn't
     rediscovered from scratch later.

5. **Present one consolidated summary**, not four separate walls of text:
   - Recap: 2-3 sentence version of the full recap
   - Trades: top candidate, if any, or "nothing worth pursuing this week"
   - Challenge: current standing/result
   - Waivers: top 2-3 pickups
   - Matchup-grade accuracy: this week's hit rate and the running season hit rate
   - Legal watch list: anything newly resolved, still open, or newly added
   - Note that full detail from any individual step is available on request
