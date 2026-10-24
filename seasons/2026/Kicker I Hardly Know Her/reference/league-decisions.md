# League-wide Start/Sit Grading

Every week all 10 managers make start/sit calls. Each one is a free test of our lineup rules: **did the player FantasyPros ranked
higher (the "ECR favorite") actually score more?** `node yahoo/grade-league-decisions.js <week>` grades a completed week, using
FantasyPros' final Sunday rankings (archived at `?week=N`) and Yahoo's final lineups and points. `post-game-check` runs it each week
and refreshes the table below (`--summary` prints it across all graded weeks). Raw pairs are in `scouting/data/week-NN-decisions.json`.

**How a "pair" works:** each starter in a team's final lineup is compared with every bench player who could have taken his slot and
had a rank. Out/Doubtful/IR players are skipped, and so are tied scores. "Excl. TDs" removes 6 points per rushing/receiving TD to
see who got the role, not the lucky score. "Coin-flip window": the ECR gap inside which our rules call it a toss-up (TE ~5, RB ~3,
FLEX ~10 from `season-lessons.md`; QB/WR/K/DEF windows are placeholders, since no rule has set them yet).

**Caveats:** pairs aren't independent (one starter is compared with several bench players), the windows hold small samples, and the
Sunday rankings can differ from what a manager saw when he set his lineup.

## Weeks 1-6 (graded 2026-10-23): 521 pairs

| Group | ECR gap | Pairs | ECR favorite won | Excl. TDs | Calls against ECR | Points lost going against ECR |
|---|---|---|---|---|---|---|
| QB | ≤3 (coin-flip window) | 5 | 4 (80%) | 4 (80%) | 2 | −1.3 |
| QB | >3 | 27 | 20 (74%) | 20 (74%) | 4 | −10.5 |
| RB | ≤3 (coin-flip window) | 9 | 3 (33%) | 5 (56%) | 3 | 8.2 |
| RB | >3 | 118 | 90 (76%) | 95 (81%) | 4 | −0.2 |
| WR | ≤5 (coin-flip window) | 9 | 6 (67%) | 6 (67%) | 6 | 20.4 |
| WR | >5 | 154 | 105 (68%) | 107 (69%) | 5 | −2.0 |
| TE | ≤5 (coin-flip window) | 11 | 5 (45%) | 5 (45%) | 5 | 35.7 |
| TE | >5 | 22 | 11 (50%) | 12 (55%) | 5 | −24.8 |
| FLEX | ≤10 (coin-flip window) | 13 | 5 (38%) | 6 (46%) | 6 | −9.3 |
| FLEX | >10 | 141 | 104 (74%) | 110 (78%) | 3 | −5.8 |
| K | ≤3 | 1 | 1 | 1 | 0 | 0 |
| K | >3 | 3 | 1 | 1 | 0 | 0 |

"Points lost going against ECR" is summed over the calls where a manager started the lower-ranked player. Positive = it cost them;
negative = it paid off.

## What it says so far

1. **The coin-flip windows hold up.** Inside a window the ECR favorite won **24 of 48 (50%)**, exactly a coin flip. Outside one it
   won **331 of 465 (71%)**. That supports the all-seasons rule "follow ECR, but a narrow gap is a toss-up" (`methodology/rules.md` #3),
   and it's the first evidence for the window idea beyond our own roster.
2. **Outside the windows, ECR is reliable at RB (76%, 81% excluding TDs), FLEX (74%), QB (74%) and WR (68%).** Going against it
   there was rare (16 calls in 6 weeks league-wide), and on net it gained or lost almost nothing.
3. **TE is the exception: the favorite won only 50% even with a gap over 5 spots (n=22).** TE scoring hangs on TDs and a few targets,
   so ECR may separate TEs less well than other positions. The sample is small and includes several of our own Pitts/Likely weeks, so
   this is a **watch item, not a rule change**. If it holds through ~Wk10, the TE window should be wider than 5.
4. **Our own calls against ECR were all early.** We went against ECR 10 times, the most in the league, but 9 came in Wks 1-4, before the
   ECR-first rule (2026-10-11). The one since then (Wk6, Miller RB30 over Kamara RB27) was inside the RB window: a coin flip by our rules.
5. **League-wide, managers went against ECR on 9% of pairs in Wks 1-4 (34/388) and 8% in Wks 5-6 (10/133).**
