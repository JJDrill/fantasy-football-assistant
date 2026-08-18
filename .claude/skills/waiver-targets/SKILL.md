---
name: waiver-targets
description: Use when the user wants waiver-wire or free-agent pickup suggestions for the "Kicker? I Hardly Know Her" Yahoo league.
---

# Waiver Targets

Suggests free agents worth adding, given the user's roster needs.

## Steps

1. Determine the position(s) of interest, if any (e.g. "I need a WR"), or consider all
   positions.
2. **Try live data first, if it's available:**
   - Check whether `yahoo/token.json` and `yahoo/get-free-agents.js` exist. If both exist,
     run `node yahoo/get-free-agents.js <position>` (or without a position for all) to see
     currently-available free agents, and `node yahoo/get-matchup.js <current week>` (or
     `yahoo/smoke-test-roster.js`) to see the user's current roster.
   - If any of these are missing or error, fall through to the manual path — expected until
     OAuth + Yahoo API approval are done and Task 15's script is built.
3. **Manual path (used until live data works):**
   - Ask the user to paste or screenshot their current roster and, separately, the waiver
     wire / available-players list for the position(s) they're interested in from the Yahoo
     app.
4. Cross-reference `reference/2026_League_Rules.pdf` for the season acquisition cap (60
   total) — remind the user this cap exists, and ask/note how many they've used if that's
   known.
5. Recommend 2-3 specific pickups with one-line reasoning each (role, opportunity, matchup),
   using your general knowledge since neither the live data nor manual pastes include
   forward-looking projections.
