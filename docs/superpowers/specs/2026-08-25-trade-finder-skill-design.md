# Trade Finder Skill — Design

## Purpose

The existing `trade-analyzer` skill evaluates one specific trade offer the user already
has in mind. There's no way today to ask "is there a good trade out there for me?" without
the user first proposing something themselves.

This adds a new skill, `trade-finder`, that scans every other team in the league, looks
for surplus/need matches against the user's roster, and surfaces a ranked shortlist of
realistic trade ideas — including why each side would plausibly want it.

## League context

Same league as the rest of this repo: "Kicker? I Hardly Know Her" (ID `109715`), 10 teams,
head-to-head. Roster: `QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6, IR×2`. Trade rules from
`reference/2026_League_Rules.pdf`: max 15 trades/season, deadline November 21 2026, 3
league veto votes cancel a trade.

## Steps

1. **Get the user's roster.**
   - Live path: `yahoo/get-matchup.js <week>` or `yahoo/smoke-test-roster.js`.
   - Manual fallback: ask the user to paste/screenshot their current roster.

2. **Get the full team list.**
   - Live path: `yahoo/pages/standings-page.js`'s `getStandings(page)` returns every
     team's `teamId`, name, and record.
   - Manual fallback: ask the user to list the other teams in the league (names are
     enough; records aren't required for this skill).

3. **Get every other team's roster.**
   - Live path: loop `yahoo/pages/roster-page.js`'s `getRoster(page, teamId)` over each
     `teamId` from step 2. This is the same function `get-matchup.js` already uses to
     fetch an opponent's roster, so it works for arbitrary teams, not just the current
     matchup.
   - If the loop fails partway (a team's page errors, login issue, etc.) or live data
     isn't available at all: fall back to asking the user to paste all other teams'
     rosters in one message (text or screenshots), once, and work from that snapshot for
     the rest of the scan. This is heavier than a single-team ask, but avoids repeated
     back-and-forth mid-scan — expected to be needed until OAuth + Yahoo API approval and
     matchup-page.js live-score support are both finished (see
     `yahoo_pom_post_draft_verification` memory).

4. **Find candidate surplus/need matches.**
   For each other team, compare their bench depth against the user's roster needs, and
   the user's bench depth against their needs, position by position. Use general NFL
   knowledge for player value/role (no live projections or rankings source exists in this
   repo — same constraint `waiver-targets` and `trade-analyzer` already operate under).

5. **Filter for plausibility.**
   Discard anything that's a one-sided win for the user. Keep only trades where the other
   team also has a believable reason to say yes — they offload a real surplus, fill a real
   need, or it fits their competitive context (e.g. a rebuilding team valuing a younger
   asset, a contender prioritizing an immediate starter over a bench piece).

6. **Rank and present.**
   Output a flat, ranked list of the top 3–5 candidate trades across the whole league
   (not grouped by team). For each candidate, include:
   - Teams and players on each side
   - **Why it helps the user** — need filled, positional upgrade, bye-week/depth relief
   - **Why it helps the other team** — their surplus offloaded, their need filled, or
     standing/competitive context that makes it attractive to them

   The second point exists so the user has ready-made talking points to justify the trade
   when pitching it, even if they don't use the full write-up verbatim.

7. **Note league constraints if relevant.**
   Mention the trade cap and/or deadline from `reference/2026_League_Rules.pdf` if the
   season is close to either.

8. **Point to trade-analyzer for depth.**
   This skill does its own lighter-weight inline scoring to build and rank the shortlist —
   it does not invoke `trade-analyzer` for every candidate (too slow/costly for a full
   league sweep). Tell the user they can run `trade-analyzer` on any specific candidate
   for a fully vetted verdict.

## Out of scope

- Actually proposing/sending trades through Yahoo (this is analysis/suggestion only,
  same as `trade-analyzer`).
- Multi-team (3-way+) trades — two-team trades only, consistent with `trade-analyzer`.
- Persisting scan results between runs — each invocation is a fresh scan.
