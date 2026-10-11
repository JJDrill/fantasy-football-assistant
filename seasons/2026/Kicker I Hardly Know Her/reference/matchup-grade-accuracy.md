# Matchup-Grade Accuracy Tracker

> **Closed 2026-10-11.** Matchup grades are retired from `lineup-advice` after hitting 7/21 (33%)
> through Week 4, worse than a coin flip. The matchup is already priced into Vegas implied totals
> and FantasyPros ECR. Kept as the record of why; no new rows.

Accumulates, across the season, how well the `lineup-advice` Step 6 matchup grades
actually predicted performance. Appended once per week by `post-game-check`.

## Scoring rule

Per the `post-game-check` checklist: compare each **graded starter's** actual fantasy
points to the **league-wide positional average for that week** (computed across all
started players at that position, league-wide, with W/R/T flex players counted under
their real position).

- **Hit** — a `Favorable` player scored **above** the positional average, or an
  `Unfavorable` player scored **below** it.
- **Miss** — otherwise.
- `Neutral` grades are **not scored either way** (logged for reference only).
- Kickers are ungraded (`N/A`) and never scored.

## League-wide positional averages by week

Computed from `node yahoo/get-all-rosters.js <week>` (started players only).

| Week | QB | RB | WR | TE | K | DEF |
|---|---|---|---|---|---|---|
| 1 (2026-09-14, provisional — KC@Den not yet played) | 22.40 (n=10) | 16.52 (n=24) | 12.60 (n=24) | 8.68 (n=9) | 7.20 (n=10) | 6.90 (n=10) |
| 1 (2026-09-15, **FINAL** — after MNF) | 22.40 (n=10) | 17.16 (n=25) | 12.12 (n=25) | 8.67 (n=10) | 7.20 (n=10) | 6.90 (n=10) |
| 2 (2026-09-22, **FINAL**) | 20.38 (n=8) | 12.69 (n=18) | 14.92 (n=21) | 9.94 (n=9) | 7.56 (n=9) | 7.89 (n=9) |
| 3 (2026-09-29, **FINAL**, all 10 teams) | 19.37 (n=10) | 13.90 (n=24) | 13.07 (n=26) | 10.74 (n=10) | 9.90 (n=10) | 5.80 (n=10) |
| 4 (2026-10-06, **FINAL** — re-pulled after stat corrections, unchanged; from `run-challenge.js 4` starters, all 10 teams) | 19.20 (n=10) | 14.26 (n=23) | 11.43 (n=27) | 9.23 (n=10) | 11.70 (n=10) | 5.40 (n=10) |

KC@Den added one qualifying starter each to RB (Kenneth Walker) and TE (Travis Kelce),
plus one to WR (Jaylen Waddle) — QB/K/DEF slots for that game were already filled by
players on other teams' byes/rosters or the averages simply didn't change. Re-checked
all 9 graded Week 1 starters below against the final averages: **no hit/miss flips** —
none of them were close enough to the small shift in the RB/WR averages to change
outcome.

Week 2's averages are computed from 9 of 10 teams — `run-challenge.js`'s per-team roster
fetch silently failed for one team ("True & Living 12th Gospel") on this run (returned 0
players despite `fetchError: null`), not a real bye-week gap (all 10 teams played Week
2). Small-sample caveat noted; not worth re-running just to recover one team's worth of
denominator.

## Graded starters

| Week | Player | Position | Grade | Vegas Signal | Actual Pts | Position Avg | Hit/Miss |
|---|---|---|---|---|---|---|---|
| 1 | Josh Allen | QB | Unfavorable | Dome (Buf @ Hou, NRG) — weather skipped, no Vegas read recorded | 35.66 | 22.40 | **Miss** |
| 1 | Rico Dowdle | RB | Favorable | Not separately graded | 3.10 | 16.52 | **Miss** |
| 1 | Amon-Ra St. Brown | WR | Favorable (low confidence) | Dome (Det @ NO, Superdome) — skipped | 23.70 | 12.60 | **Hit** |
| 1 | Tetairoa McMillan | WR (W/R/T) | Favorable | Agreed — Car/Chi O/U 47.5, moved up from 45.5 | 8.00 | 12.60 | **Miss** |
| 1 | Vikings | DEF | Favorable (sacks vs. GB) | Not separately graded | 8.00 | 6.90 | **Hit** |
| 1 | David Montgomery | RB | Neutral | — | 27.40 | 16.52 | n/a (Neutral) |
| 1 | George Pickens | WR | Neutral (low confidence) | Neutral-to-positive (Dal -2.5, O/U 48.5) | 4.30 | 12.60 | n/a (Neutral) |
| 1 | Kyle Pitts Sr. | TE | Neutral (low confidence) | **Disagreed** — Atl implied total only 19.75, notes said "worth leaning Unfavorable" | 0.00 | 8.68 | n/a (Neutral) |
| 1 | Eddy Pineiro | K | N/A (kicker) | — | 11.00 | 7.20 | n/a (kicker) |
| 2 | Josh Allen | QB | Favorable | Not separately graded | 40.82 | 20.38 | **Hit** |
| 2 | David Montgomery | RB | Favorable | Not separately graded | 3.40 | 12.69 | **Miss** |
| 2 | Rico Dowdle | RB | Unfavorable | Agreed — Patriots -4.5, O/U 43.5 → Steelers implied ~19.5 (modest) | 5.40 | 12.69 | **Hit** |
| 2 | George Pickens | WR | Favorable (low-medium confidence) | Not separately graded | 7.00 | 14.92 | **Miss** |
| 2 | Amon-Ra St. Brown | WR | Neutral (low confidence) | Not separately graded | 30.70 | 14.92 | n/a (Neutral) |
| 2 | Kyle Pitts Sr. | TE | Neutral (low confidence) | No strong signal — Falcons -1.5, O/U 43.5, fairly even implied totals | 2.00 | 9.94 | n/a (Neutral) |
| 2 | Tetairoa McMillan | WR (W/R/T) | Neutral (low confidence) | No strong signal — Falcons -1.5, O/U 43.5, fairly even implied totals | 12.60 | 14.92 | n/a (Neutral) |
| 2 | Eddy Pineiro | K | N/A (kicker) | No signal available yet at grading time | 5.00 | 7.56 | n/a (kicker) |
| 3 | Josh Allen | QB | Neutral | Vegas more bullish (BUF implied ~28.75) | 18.96 | 19.37 | n/a (Neutral) |
| 3 | David Montgomery | RB | Favorable | Agreed (mild): HOU implied ~22.0 | 5.80 | 13.90 | **Miss** |
| 3 | Woody Marks | RB | Favorable | Agreed (mild): HOU implied ~22.0 | 8.60 | 13.90 | **Miss** |
| 3 | Amon-Ra St. Brown | WR | Unfavorable | **Disagreed**: DET implied ~27.5 | 9.90 | 13.07 | **Hit** |
| 3 | George Pickens | WR | Neutral | Vegas bullish (O/U 53.5, DAL ~25.0) | 11.70 | 13.07 | n/a (Neutral) |
| 3 | Tetairoa McMillan | WR (W/R/T) | Favorable | Agreed (mild): CAR implied ~22.5 | 2.70 | 13.07 | **Miss** |
| 3 | Kyle Pitts Sr. | TE | Favorable (low-medium; 9/22 grade, TNF) | Mild disagree: ATL implied ~18.75 | 1.00 | 10.74 | **Miss** |
| 3 | Vikings | DEF | Favorable | Agreed: TB implied ~20.5 | 17.00 | 5.80 | **Hit** |
| 3 | Eddy Pineiro | K | N/A (kicker; 9/25 table listed Unfavorable) | Disagreed: SF implied ~28.0 | 8.00 | 9.90 | n/a (kicker) |
| 4 | Josh Allen | QB | Unfavorable | **Disagreed**: BUF implied ~27.75 | 19.52 | 19.20 | **Miss** (by 0.32) |
| 4 | David Montgomery | RB | Favorable | Agreed: HOU implied ~25.0 | 4.30 | 14.26 | **Miss** |
| 4 | Woody Marks | RB | Favorable | Agreed: HOU implied ~25.0 | 8.20 | 14.26 | **Miss** |
| 4 | Amon-Ra St. Brown | WR | Unfavorable | **Disagreed**: DET implied ~27.0 | 11.50 | 11.43 | **Miss** (by 0.07) |
| 4 | George Pickens | WR | Favorable | Mild agree: DAL ~22.5 | 8.50 | 11.43 | **Miss** |
| 4 | Tetairoa McMillan | WR (W/R/T) | Favorable | Mild agree: CAR ~23.5 | 38.20 | 11.43 | **Hit** |
| 4 | Kenyon Sadiq | TE | Not graded (replaced Favorable-graded Pitts) | NYJ implied ~19.75 | 0.00 | 9.23 | n/a (ungraded) |
| 4 | Vikings | DEF | Not graded | Strong: MIA ~14.75 | 8.00 | 5.40 | n/a (ungraded) |
| 4 | Evan McPherson | K | N/A (kicker) | CIN vs JAX | 5.00 | 11.70 | n/a (kicker) |

## Running hit rate

| Week | Week Hit Rate | Season Hit Rate |
|---|---|---|
| 1 | 2/5 (40%) | 2/5 (40%) |
| 2 | 2/4 (50%) | 4/9 (44%) |
| 3 | 2/6 (33%) | 6/15 (40%) |
| 4 | 1/6 (17%) | 7/21 (33%) |

## Observations

- **Week 1 (40%) is a small, noisy sample** — five scored grades. Don't over-read it.
- The two misses at the extremes (Allen 35.66 on an `Unfavorable`, Dowdle 3.10 on a
  `Favorable`) were both graded off **2025 season-long defensive data**, explicitly
  flagged as a proxy in `week-01.md`. That proxy is the most likely source of error.
- **The Vegas signal beat the matchup grade on Kyle Pitts.** The grade was
  `Neutral (low confidence)`, but the Week 1 notes flagged Atlanta's 19.75 implied
  total as "worth leaning Unfavorable." Pitts scored 0.00. Neutral grades aren't
  scored, so this doesn't enter the hit rate — but it's the first evidence this season
  that when the implied total disagrees with a low-confidence grade, the implied total
  deserves the tiebreak. Worth watching whether the pattern repeats.
- Note the Pitts zero had a **cause the matchup grade structurally cannot see**: Atlanta
  started third-string QB Cooper Rush. See `week-01.md` "Post-Game" and the QB-dependency
  note there.
- **Week 2 (50%) flips the pattern from Week 1**: both `Favorable`-graded RBs/WRs missed
  (Montgomery, Pickens), while `Favorable` Allen and `Unfavorable` Dowdle both hit. Small
  sample again (4 scored) — combined season rate is 44% (4/9) through two weeks, still
  close to a coin flip.
- **The two Neutral-graded WR/TE (Pitts, McMillan) shared the same low-confidence
  no-signal Vegas read** (Panthers @ Falcons, fairly even implied totals) but split hard
  in outcome — Pitts blanked at 2.00, McMillan scored just under the WR average. Neither
  the grade nor the Vegas signal had a strong opinion here, and the outcomes didn't
  either, which is at least internally consistent (a genuine coin-flip matchup produced
  a genuine mixed result) rather than a miss to investigate.
- St. Brown's Neutral grade (Bills' overhauled defense, too early to read) undersold him
  badly (30.70 vs a 14.92 WR average) — but Neutral grades aren't scored, so this is a
  reference note, not a miss. Worth revisiting once Buffalo's defensive profile has more
  weeks of real data instead of an offseason-overhaul guess.
- **Week 3 (33%)**: all four `Favorable` offensive grades missed (Montgomery, Marks,
  McMillan, Pitts). The only hits were `Unfavorable` St. Brown and `Favorable` Vikings DEF.
  The season rate is 6/15 (40%), now below a coin flip. Defense-vs-position ranks built on
  2-3 games look too noisy to lean on. Treat them as a tiebreaker, not a driver, until
  more weeks accumulate.
- **Vegas vs. grade split again**: Vegas disagreed with the grade twice. The grade won on
  St. Brown, and Vegas won on Pitts (as it did in Week 1). Pitts' problems come from his
  role and his QB, which neither signal captures.
- **Yahoo projection vs. matchup grade (Marks vs. Stevenson)**: Yahoo projected Stevenson
  +1.85. Actual: Marks 8.60, Stevenson 5.30, so the matchup-grade call won by 3.3. Both
  scored well below the RB average, though, so this is one data point in a low-stakes call.
- **Week 4 (17%)**: 1/6, and two misses came by under a third of a point (Allen +0.32, St. Brown
  +0.07 over average). Through four weeks, **`Favorable` grades have hit 5 of 16 (31%)**, worse than a
  coin flip. `Unfavorable` grades hit 2 of 5. The defense-vs-position grade has no predictive value
  so far. **Recommendation: stop using it as a start/sit input.** Use it only as a last tiebreaker
  between players with equal *usage*.
- **What did predict Wk4 was usage, not matchup.** Montgomery (10 carries) and Marks (6) split a
  stalled Houston run game despite a "Favorable" DAL matchup. Gordon (benched partly for the tough MIN
  matchup) out-snapped Wright 22-12 and ran 9-100. Likely (benched) drew 12 targets. The lineup process
  should rank on recent snap share, carries and targets first, then Vegas, then matchup.

