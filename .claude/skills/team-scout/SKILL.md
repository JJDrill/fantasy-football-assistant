---
name: team-scout
description: Use when the user wants a scouting report or deep dive on another team, or on every team, in the "Kicker? I Hardly Know Her" Yahoo league — strengths, weaknesses, what we'd tell them, what it means for us, plus predictions to grade after the week.
---

# Team Scout

Writes a scouting report on each other team, from that team's side ("if we were their front office"). The point is learning:
every report ends with checkable predictions, and `post-game-check` grades them, so over the season we learn which kinds of
reads hold up. The user is new to fantasy, so explain the why and define jargon.

Runs automatically on the **first pre-game check of each week** (all 9 other teams). Can also be run on its own for one team.

## Steps

1. **Pull the data in one pass:** `node yahoo/scout-league.js <week> --out <scratchpad>/scout<week>.json` (about 1 minute).
   Don't run it alongside another Yahoo script; they share one Playwright profile. Per team it gives standings, the season so far
   (scores, close wins and losses under 5 points, weeks above the league median), this week's opponent and live score, every
   player's ECR, FLEX ECR, Sleeper season average and last-weeks usage, **lineup flags**, and a **forecast**. The forecast is
   points already scored plus season averages for everyone yet to play; a starter on bye counts as 0.
   If it fails with `NOT_LOGGED_IN`, ask the user to run `node yahoo/login.js`.

2. **Check the news only where it matters.** `WebSearch` each other team's **starter** that is Q/D/O-tagged, returning from injury
   or suspension, or has no season stats (e.g. just reinstated). Follow `methodology/injury-cache-convention.md` and
   `methodology/trusted-sources.md`. Bench players need a search only if a lineup flag depends on them. Append any new off-field flag
   to `reference/legal-watch-list.md`.

3. **Write each team's report** in `seasons/2026/Kicker I Hardly Know Her/scouting/week-NN.md` as
   `## Other-team analysis: <team> (<when we play them>; <date>)`. Our current opponent comes first and gets the deepest dive.
   File header: the line "These are scouting reports on other teams, not our lineup", the data sources, and a summary table of
   every matchup (forecast for each side, plus flags). Each report has:
   - **Season:** record, scores, average, close games, weeks above the median, and a one-line read on whether the record
     matches the scoring (luck).
   - A **lineup table**: slot, player, ECR, season average, last 2 weeks.
   - **Strengths** and **Weaknesses**: numbered, each backed by a number (ECR, average, snaps, targets).
   - **What we'd tell them:** the 1-3 moves we'd make if we ran that team.
   - **Why it matters to us:** when we play them, trade fits (cross-check `trades.md`, and respect any "don't re-pitch"), and
     effects on the standings.
   - **Post-game grading:** 3-7 checkable predictions, each one a **Type** from `reference/scouting-accuracy.md`.
   - **Sources** for any news cited.

4. **Log every prediction** as a row in `reference/scouting-accuracy.md` (Wk, team, type, prediction; Actual and Result left
   blank). Don't log a prediction whose outcome is already known (e.g. a player who has already played).

5. **Lineup flags are a read on the other manager, not a rule.** A `bench-ranked-higher` flag inside our own coin-flip windows
   (`lineup-advice`) is a judgment call, not a mistake. Call it a mistake only when the gap is outside those windows, or the
   starter is on bye or inactive. `locked: true` means it can't be fixed now (a player in the swap has already played).

6. **Present a short summary:** the matchup table, our opponent's top 2 strengths and weaknesses, and the 2-3 league-wide findings
   most useful to us (trade fits, inactive managers, upcoming opponents). The full reports stay in the file.
