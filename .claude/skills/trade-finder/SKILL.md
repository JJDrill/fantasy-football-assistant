---
name: trade-finder
description: Use when the user wants to scan the whole league for good trade opportunities, rather than evaluate one specific offer, in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Trade Finder

Scans every other team in the league for realistic trade opportunities against the
user's roster, and ranks the best candidates. For evaluating one specific trade the user
already has in mind, use `trade-analyzer` instead.

## Steps

1. **Get the user's roster.**
   - Live data: run `node yahoo/get-matchup.js <current week>` (or
     `yahoo/smoke-test-roster.js`) to get the user's roster.
   - If unavailable, ask the user to paste or screenshot their current roster.

2. **Get every other team's roster.**
   - Live data: run `node yahoo/get-all-rosters.js` to fetch every team's roster in one
     pass (includes the user's own team too — you can skip re-fetching it if step 1
     already got it live).
   - If that errors or live data isn't available at all, ask the user to paste or
     screenshot every other team's roster in one message. Do this once per scan rather
     than team-by-team, to avoid a long back-and-forth.

3. **Find candidate surplus/need matches.**
   For each other team, compare their bench depth against the user's roster needs, and
   the user's bench depth against their needs, position by position (`QB, WR, WR, RB,
   RB, TE, W/R/T, K, DEF`, plus bench). Use your general knowledge of the players
   involved — there's no live projections/rankings data source in this repo, same
   constraint `waiver-targets` and `trade-analyzer` already work under.

4. **Filter for plausibility.**
   Discard anything that's a one-sided win for the user. Keep only trades where the
   other team also has a believable reason to say yes: they offload a real surplus,
   fill a real need, or it fits their competitive context (e.g. a team with a losing
   record valuing a younger/upside asset, a team near the top prioritizing an immediate
   starter over a bench piece). Use each team's win/loss record from `get-all-rosters.js`
   (or the standings, if pasted) as a hint of their competitive context.

5. **Rank and present the top 3-5.**
   Output a flat, ranked list of the best candidate trades league-wide, not grouped by
   team. For each candidate, give:
   - The teams and players on each side
   - **Why it helps the user** — need filled, positional upgrade, bye-week/depth relief
   - **Why it helps the other team** — their surplus offloaded, their need filled, or
     competitive-context reasoning that makes it attractive to them

   The "why it helps the other team" point is meant as a ready-made talking point the
   user can lean on when pitching the trade, even if they don't use the full write-up.

6. **Check league constraints.**
   Check `seasons/2026/Kicker I Hardly Know Her/reference/2026_League_Rules.pdf` for the trade cap (15/season) and deadline
   (November 21, 2026) — mention these if the season is getting close to either. Also
   note that 3 league veto votes can cancel a trade, same as `trade-analyzer` surfaces.

7. **Run trade-analyzer on every shortlisted candidate, without asking.**
   This skill's ranking is a lighter inline pass to build the shortlist. Automatically
   invoke `trade-analyzer` on each top candidate to get a vetted
   favors-user/favors-other-team/fair verdict, and present the verdicts with the list.
   Don't offer it as an optional next step.

8. **Always update `seasons/2026/Kicker I Hardly Know Her/trades.md`.** Every candidate gets an entry (via
   `trade-analyzer`'s step 6), including ones you drop after analysis. Also re-check
   existing open or watch-list entries in that file against the current rosters and
   news, and add a dated update line when their outlook changes.
