---
name: challenge-tracker
description: Use when the user asks who's winning (or won) this week's or a specific week's $10 side-challenge in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Challenge Tracker

Reports the leader (or final winner) for one of the 15 weekly $10 side-challenges defined
in `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md`.

## Steps

1. Determine which week the user means (default: current NFL week if unspecified).
2. Look up that week's exact rule in `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md` — quote it back to the user
   so they can confirm you're evaluating the right thing.
3. **Try live data first, if it's available:**
   - Check whether `yahoo/run-challenge.js` exists in the project. If it exists, run
     `node yahoo/run-challenge.js <week>` from the project root and use its output.
   - If it's missing or the script errors (missing/expired Playwright session, Yahoo API
     access not yet approved, script not built yet), fall through to the manual path below —
     don't treat this as a failure, it's the expected current state until OAuth + Yahoo API
     approval are both done.
4. **Manual path (used until live data is wired up and working):**
   - Tell the user live data isn't available yet and ask them to paste or screenshot the
     full league scoreboard/boxscores for that week from the Yahoo app — specifically
     whatever's needed for that week's rule (e.g. Week 3 needs every team's starting
     kicker's points; Week 1 needs every team's full roster with bench players' points).
   - Once they provide it, compute the winner yourself by applying the rule text exactly
     as written in `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md`. Show your work (which teams/players you
     compared) so it's easy for the user to spot-check.
5. Report the winner, their team, and the value that won it. Note this is based on
   possibly-not-final scoring — official results use final Yahoo scoring after stat
   corrections (per the league rules).
6. If the week's rule mentions a tiebreak (only Week 6 currently specifies one — highest
   team fantasy score that week), apply it explicitly if a tie occurs, and say so.
