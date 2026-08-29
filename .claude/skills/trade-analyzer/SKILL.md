---
name: trade-analyzer
description: Use when the user wants help evaluating a specific trade offer in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Trade Analyzer

Evaluates a specific trade: players the user gives up vs. players they receive.

## Steps

1. Ask the user (if not already stated) exactly which players are on each side of the
   trade, and which team they're trading with.
2. **Try live data first, if it's available:**
   - Check whether `yahoo/get-matchup.js` (or the equivalent roster fetch) exists and works.
     If so, use it to see the user's full current roster for context.
   - If unavailable, fall through to the manual path — expected until OAuth + Yahoo API
     approval are done.
3. **Manual path (used until live data works):**
   - Ask the user to paste or screenshot their current full roster from the Yahoo app, so
     you can assess positional depth and how the trade affects it. Ask about the other
     team's roster too, if the user knows it or can share it — helpful but not required.
4. Check `seasons/2026/Kicker I Hardly Know Her/reference/2026_League_Rules.pdf` for trade rules: max 15 trades/season, deadline
   November 21 2026, and that 3 league veto votes cancel a trade — mention these if
   relevant (e.g. if it's getting close to the deadline).
5. Give a clear verdict: favors user / favors other team / fair, with the main reasoning
   (positional value, depth impact, rest-of-season outlook, bye weeks) using your general
   knowledge of the players involved.
