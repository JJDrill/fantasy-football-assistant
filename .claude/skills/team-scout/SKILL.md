---
name: team-scout
description: Use when the user wants a scouting report or deep dive on another team, or on every team, in the "Kicker? I Hardly Know Her" Yahoo league — strengths, weaknesses, what we'd tell them, what it means for us, plus predictions to grade after the week.
---

# Team Scout

Scouts the other 9 teams each week, from each team's side ("if we were their front office"). It feeds trades, waivers and our
read on upcoming opponents. It does **not** decide our start/sit: our best lineup is the one with the most expected points,
whoever we play. The user is new to fantasy, so explain the why and define jargon.

**What it's not for:** testing our lineup rules. That's `yahoo/grade-league-decisions.js` (`reference/league-decisions.md`), which
grades every manager's start/sit calls automatically after the week, and that's where the rule evidence comes from.

Runs on the **first pre-game check of each week**. Can also be run on its own for one team (then write just that team's report).

## Steps

1. **Pull the data in one pass:** `node yahoo/scout-league.js <week> --out <scratchpad>/scout<week>.json` (about 1 minute).
   Don't run it alongside another Yahoo script; they share one Playwright profile. Per team it gives standings, the season so far
   (scores, close wins and losses under 5 points, weeks above the league median), this week's opponent and live score, every
   player's ECR, FLEX ECR, Sleeper season average and last-weeks usage, **lineup flags**, and a **forecast**. The forecast is
   points already scored plus season averages for everyone yet to play; a starter on bye counts as 0.
   FantasyPros posts a week's rankings on Tuesday, so run this on Tuesday or later; before that the ECR is last week's.
   If it fails with `NOT_LOGGED_IN`, ask the user to run `node yahoo/login.js`.

2. **Pick who gets a full report** (trimmed 2026-10-23; nine full reports a week was more reading than it was worth):
   - **This week's opponent** (deepest dive; it goes first).
   - **Next week's opponent** (shorter: what to expect, and any waiver/trade overlap with us).
   - **Live trade partners:** any team in an open or watch entry in `trades.md`, or a clear fit the data shows this week (they're
     short at a position where we're deep, or the reverse). At most 2.
   Everyone else gets **one row in the summary table**, not a report.

3. **Check the news only where it matters.** `WebSearch` each full-report team's **starter** that is Q/D/O-tagged, returning from
   injury or suspension, or has no season stats (e.g. just reinstated). Follow `methodology/injury-cache-convention.md` and
   `methodology/trusted-sources.md`. Append any new off-field flag to `reference/legal-watch-list.md`.

4. **Write `seasons/2026/Kicker I Hardly Know Her/scouting/week-NN.md`:**
   - Header: the line "These are scouting reports on other teams, not our lineup", the data sources, and the **summary table**:
     every matchup with each side's forecast, record and average, plus a one-line note per team (lineup flags; anything that changed,
     like a new injury, a bye problem or a big trade).
   - A full report per team from Step 2, as `## Other-team analysis: <team> (<why it's here>; <date>)`, with:
     - **Season:** record, scores, average, close games, weeks above the median, and a one-line luck read (record vs. scoring).
     - A **lineup table**: slot, player, ECR, season average, last 2 weeks.
     - **Strengths** and **Weaknesses:** numbered, each backed by a number (ECR, average, snaps, targets).
     - **What we'd tell them:** the 1-3 moves we'd make if we ran that team.
     - **Why it matters to us:** when we play them, trade fits (cross-check `trades.md`, and respect any "don't re-pitch"), and
       effects on the standings.
     - **Post-game grading:** 3-5 checkable predictions, each one a **Type** from `reference/scouting-accuracy.md`.
     - **Sources** for any news cited.

5. **Log each full report's predictions** as rows in `reference/scouting-accuracy.md` (Wk, team, type, prediction; Actual and
   Result left blank). Don't log a prediction whose outcome is already known (e.g. a player who has already played).

6. **Lineup flags are a read on the other manager, not a rule.** A `bench-ranked-higher` flag inside our own coin-flip windows
   (`lineup-advice`) is a judgment call, not a mistake (league-wide, the ECR favorite wins only ~50% inside them;
   `reference/league-decisions.md`). Call it a mistake only when the gap is outside those windows, or the starter is on bye or inactive.
   `locked: true` means it can't be fixed now (a player in the swap has already played).

7. **Present a short summary:** the matchup table, our opponent's top 2 strengths and weaknesses, and the 2-3 league-wide findings
   most useful to us (trade fits, inactive managers, upcoming opponents). The full reports stay in the file.
