---
name: pre-game-check
description: Use when the user wants to confirm they're ready for an upcoming week/game in the "Kicker? I Hardly Know Her" Yahoo league — lineup set correctly, no inactive starters, trades accounted for, challenge rule known.
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

   Try each; note which succeed and which fall back (missing script, expired session,
   Yahoo API not yet approved — all expected until OAuth + Yahoo API approval is done).

3. **Ask everything needed, in ONE combined message, before doing any analysis:**
   - If live roster data is unavailable: ask the user to paste or screenshot their
     current roster (starters and bench, with positions).
   - If live challenge data is unavailable: ask for whatever this week's specific
     challenge rule requires per `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md` (e.g. Week 3 needs every
     team's starting kicker's points).
   - Always ask (no live source exists for trade approval/veto status today): "Any
     trades proposed, approved, or vetoed recently that might not be reflected yet in
     your roster?"
   - Always ask: "Any Yahoo app alerts (mass add/drop notifications, injury alerts,
     etc.) you've gotten recently that you want looked into?" (no API access to these
     exists today — this only works when the user pastes/describes one). Evaluate any
     alert the user reports: a mass-drop number alone is usually just normal
     streaming churn (common for K/DEF, which get streamed weekly) rather than a
     signal, so check it against that player's actual injury/legal status and matchup
     grade before deciding whether it's worth worrying about, and say so explicitly
     either way rather than letting the raw number imply concern on its own.
   - Always ask: "Anything specific worrying you this week — an injury, a tough
     matchup — you want me to focus on?"

   Do not proceed to Step 4 until this single message has been sent and answered (or
   skipped because live data covered everything). Never ask a follow-up mid-checklist —
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
     exists, otherwise `WebSearch` and record it there. Combine that with the user's
     Step 3 answer, and flag anything uncertain rather than asserting confidently.
     Cite sources for anything surfaced.
   - If the user flagged a trade in Step 3 that isn't reflected in the roster data
     you have, note this explicitly rather than trying to resolve it automatically —
     it requires a fresh roster fetch after the trade posts, which is out of scope for
     this pass.
   - Invoke the `challenge-tracker` skill for this week's $10 challenge rule — surfaced
     here because some challenge rules constrain lineup choices (e.g. a challenge scored
     on starting kicker points), worth knowing before locking the lineup.

5. **Present one consolidated go/no-go checklist:**
   - Lineup: confirmed / N changes suggested (list them)
   - Inactive starters: none found / list
   - Trades: none pending / user should double-check roster reflects trade X
   - This week's challenge rule: one-line summary
