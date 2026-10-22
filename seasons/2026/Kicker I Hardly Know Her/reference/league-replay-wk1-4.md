# League-wide lineup replay, Weeks 1-4 (2026-10-11)

Replays all 10 teams' lineups (40 team-weeks) under different start/sit rules, to test our
process on a sample 10x bigger than our own four games.

**Data:** each team's actual weekly roster and every player's points, bench included
(`get-all-rosters.js <wk>`, `get-scoreboard.js <wk>`; every team's computed total matched Yahoo).
FantasyPros' **final pre-kickoff** half-PPR ECR for each week (archived pages, `?week=N`, last
updated the Sunday of each week: 9/13, 9/20, 9/27, 10/04), including the cross-position FLEX ranks.
Sleeper usage (carries, targets, snap share) for the prior two weeks.

**Rules replayed** (each team's own roster, same opponent score):

| Rule | How it picks |
|---|---|
| Actual | What the manager started |
| ECR | Best positional ECR at each slot; FLEX ECR for W/R/T |
| Usage (our old rule) | RB/WR/TE and flex by prior 2-wk opportunity (0.5×carries + 1.5×targets); ECR elsewhere |
| Hybrid (our current rule) | TE by prior 2-wk targets; everything else ECR (Wk1 falls back to ECR, since there's no usage yet) |
| Optimal | Hindsight best lineup (the ceiling, not a rule) |

Players missing from a week's ECR list (bye, inactive) can't be picked by any rule.

## Results

| Rule | Pts vs. actual (40 team-wks) | Wins (of 40) | Team-weeks better / worse |
|---|---|---|---|
| Actual | — | 20 | — |
| **ECR** | **+36.6** | **24** | 14 / 12 |
| **Hybrid** | **+45.3** | **24** | 15 / 12 |
| Usage (Wks 2-4 only) | **−155.2** | 10 of 30 (actual: 15) | 6 / 20 |
| Optimal | +644.2 | 35 | — |

- **ECR-first is supported.** A modest gain (~1 pt per team-week), but it flips 4 results net.
- **Usage-first at RB/WR is clearly wrong.** It lost points in 20 of 30 team-weeks.
- **TE targets add a little on top of ECR** (+8.7 over 30 team-weeks). When usage and ECR picked
  different TEs, usage was right 3 of 5. That's a tiny sample.
- **Most of the gap to optimal is noise.** ECR captures ~6% of hindsight's +644. 9 of 20 games were
  decided by under 5 points.

### By team

| Team | Actual W | ECR Δ | Hybrid Δ | Results flipped by hybrid |
|---|---|---|---|---|
| Man Coverage Brigid | 4 | 0.0 | 0.0 | — (started the ECR lineup every week) |
| Knights Who Say Ni | 3 | +0.4 | +0.4 | — (nearly the ECR lineup every week) |
| Russini's Source | 3 | −1.7 | −0.4 | W3 L→W, W4 W→L |
| Queen of the Damned | 2 | −18.7 | −18.7 | — (beat ECR, mostly one call: Likely TE11 over Kraft TE5 in Wk1, 23.8 vs. 8.0) |
| 4th Qtr Maria | 2 | +25.9 | +25.9 | W1 L→W |
| THE Lil Unk Rayrays | 2 | −1.9 | −4.1 | — |
| Dusty Bottoms | 2 | +3.4 | +13.0 | W3 L→W |
| Smokin Base Brian | 2 | +8.9 | +8.9 | — |
| **J's Pancakes** | **0** | **+18.5** | **+18.5** | **W4 L→W** |
| True & Living 12th Gospel | 0 | +1.8 | +1.8 | W4 L→W |

The 4-0 team started the ECR lineup every week, and the 3-1 Knights nearly did. But True & Living
(0-4) was also within 2 points of ECR, so following ECR doesn't win by itself. Roster strength
decides more than lineup calls.

### Our team

| Wk | Actual | Opp | ECR/Hybrid | What ECR changed |
|---|---|---|---|---|
| 1 | 121.16 | 135.86 | 130.06 | Stevenson (RB19) over Dowdle (RB27). Still a loss |
| 2 | 123.92 | 126.46 | 125.42 | Likely (TE8) over Pitts (TE17) +3.8, but Stevenson (RB22) over Dowdle (RB32) −2.3. Still a loss by ~1 |
| 3 | 83.66 | 90.56 | 81.66 | Likely over Pitts +1.3; Stevenson over Marks −3.3 |
| 4 | 103.22 | 104.68 | **113.32** | **Likely (TE10) over Sadiq (TE12) +10.1. A win** |

**Wk4 revision:** `season-lessons.md` calls Likely-vs.-Sadiq "close call, not clearly knowable."
The final Sunday ECR (TE10 vs. TE12) and usage (11.3 vs. 8.3 targets) **both** favored Likely. Under
the current rules it's a start. It was close, but the signals agreed.

## Where managers overrode ECR (41 cases, bench player ranked better than the starter)

| Slot | n | ECR right | Manager right | Net pts (ECR pick − started) |
|---|---|---|---|---|
| QB | 4 | 1 | 3 | −7.1 |
| RB | 6 | 3 | 3 | −0.9 |
| **WR** | 10 | **7** | 3 | **+28.6** |
| TE | 9 | 5 | 4 | +11.9 |
| **FLEX** | 12 | 6 | 6 | −12.6 |

- **WR is where overriding ECR costs the most.** All 3 WR cases where usage disagreed with ECR went ECR's way.
- **FLEX is a coin flip.** Cross-position flex ranks have no edge on close calls (9 of 12 were within 10 flex spots).
- Rank-gap buckets (1-4, 5-10, 11+) were noisy. ECR won 8/12 at a 1-4 gap and 5/12 at 5-10. There isn't
  enough data for a "trust ECR only above gap X" threshold.

## Losses one bench swap would have flipped (13 of 20 losses)

ECR pointed to a flipping swap in **6 of 13**. Only one was a clear call: **ours, Wk2, Likely TE8
over Pitts TE17**. The other five were 1-4 rank gaps (Goedert TE6 / Fannin TE7, Andrews TE13 /
Schultz TE14, Metcalf / Vele, Samuel / Downs, Likely TE10 / Sadiq TE12). The other 7 flips needed a
bench player ECR ranked *lower* (e.g. Hubbard RB30 over McCaffrey RB3, Monangai RB42 over Dowdle RB27,
Burden flex #79 over McMillan #37). Those were random.

## Other findings

- **Starting an inactive player happened once in 40 team-weeks:** 4th Qtr Maria started Puka Nacua
  (out) in Wk2 and scored 0 there, though they still won. The inactive check is cheap insurance against a
  rare but costly miss.
- **The opposite mistake, benching a returning star, cost more:** Maria benched Puka in Wk4, his
  first game back (ECR WR7, ahead of the starters at WR22/WR27), and he scored 23.2 on the bench. Our
  recently-returned bump is a tiebreaker only, so it wouldn't have benched him across a 15-spot gap.
  That's the right design.
- **Usage can't see players returning from injury.** Dusty Bottoms Wk3: TE usage picked Juwan Johnson
  (TE13) over Brock Bowers (TE3, 0 prior targets because he missed time). Bowers scored more.
  ECR caught it.
- **Snap share as an outcome measure is validated.** Among started RB/WR/TE in Wks 2-4, players whose
  snap share fell 10+ points below their prior average scored below the positional average **82%**
  of the time (27/33), vs. **51%** (74/144) for everyone else. But most of those drops were
  **in-game injuries** (Achane 5%, Jefferson 12%, Rice 10%, Chase 20%), which no pre-game tier can
  predict. The tracker needs to tell those apart from pre-game "limited" cases.
- **Health tiers can't be replayed.** Historical practice reports and designations aren't in any data
  source we have, so the tiers can only be tested going forward.
