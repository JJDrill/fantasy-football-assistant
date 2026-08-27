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

5. **Present one consolidated summary**, not four separate walls of text:
   - Recap: 2-3 sentence version of the full recap
   - Trades: top candidate, if any, or "nothing worth pursuing this week"
   - Challenge: current standing/result
   - Waivers: top 2-3 pickups
   - Note that full detail from any individual step is available on request
