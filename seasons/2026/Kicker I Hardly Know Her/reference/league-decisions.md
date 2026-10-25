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

## Weeks 1-6 (graded 2026-10-23, regraded 2026-10-24): 518 pairs

| Group | ECR gap | Pairs | ECR favorite won | Excl. TDs | Calls against ECR | Points lost going against ECR |
|---|---|---|---|---|---|---|
| QB | ≤3 (coin-flip window) | 5 | 4 (80%) | 4 (80%) | 2 | −1.3 |
| QB | >3 | 27 | 20 (74%) | 20 (74%) | 4 | −10.5 |
| RB | ≤3 (coin-flip window) | 9 | 3 (33%) | 5 (56%) | 3 | 8.2 |
| RB | >3 | 118 | 90 (76%) | 95 (81%) | 4 | −0.2 |
| WR | ≤5 (coin-flip window) | 9 | 6 (67%) | 6 (67%) | 6 | 20.4 |
| WR | >5 | 151 | 101 (67%) | 102 (68%) | 5 | −2.0 |
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

The 2026-10-24 regrade (to add DEF/K, below) found 3 fewer WR pairs than the first run (Yahoo's past-week rosters came back slightly
different). Outside the window WR moved from 68% to 67%; nothing else changed.

## QB, DEF and K, compared across teams (Wks 1-6, added 2026-10-24; QB added the same day)

Every team starts one QB, DEF and K. No one benches a DEF or K, and only 7 teams ever benched a QB, so the table above barely tests them. Instead each week's 10 starters are compared
with each other: **did the better-ranked starter score more?** Each starter appears in up to 9 pairs, so the real sample is the ~60
starters, not the pair count. Only rostered starters are in it (mostly well-ranked), not all 32 at each position.

| Position | Pairs | Better-ranked starter scored more |
|---|---|---|
| QB | 270 | 151 (56%) |
| DEF | 249 | 141 (57%) |
| K | 250 | 101 (40%) |

| Position | ECR tier | Starters | Avg points |
|---|---|---|---|
| QB | 1-5 | 27 | 22.4 |
| QB | 6-12 | 25 | 19.9 |
| QB | 13+ | 8 | 16.6 |
| DEF | 1-5 | 28 | 7.9 |
| DEF | 6-12 | 19 | 4.6 |
| DEF | 13+ | 12 | 7.3 |
| K | 1-5 | 26 | 8.0 |
| K | 6-12 | 20 | 10.9 |
| K | 13+ | 13 | 9.2 |

By ECR gap between the two starters (better-ranked scored more):

| Position | Gap 1-3 | 4-8 | 9-15 | 16+ |
|---|---|---|---|---|
| QB | 53/103 (51%) | 60/108 (56%) | 29/49 (59%) | 9/10 (90%) |
| DEF | 42/76 (55%) | 50/79 (63%) | 30/59 (51%) | 19/35 (54%) |
| K | 30/83 (36%) | 34/82 (41%) | 23/62 (37%) | 14/23 (61%) |

**What it says so far:**
1. **QB rankings sort tiers, but not close QBs.** Top-5 QBs averaged 22.4, 6-12 averaged 19.9, 13+ averaged 16.6: a clean gradient.
   But across teams the better-ranked QB won only 51% with a gap of 1-3, 56% at 4-8 and 59% at 9-15; only a 16+ gap was reliable (9 of
   10). Within teams it was 75% because benched QBs are usually far behind the starter. So the QB coin-flip window is likely much wider
   than the placeholder 3 (closer to ~8-15). Watch item; it matters for trades (a QB8 isn't much worse than a QB4 week to week) more than
   for our lineup (Allen has been ranked 1-5 every week, 27.5 a game).
2. **DEF rankings barely beat a coin flip (57%).** A top-5 defense averaged 7.9 points, but one ranked 13th or worse still averaged 7.3.
   Small sample (12 starters in the 13+ tier), but so far streaming defenses by ranking hasn't bought much league-wide.
3. **K rankings did worse than random (40%), and top-5 kickers scored the least.** Kicker scoring looks close to pure noise. Treat
   any kicker as interchangeable: don't spend waiver priority or roster thought on one.
4. **Our DEF:** we started the Vikings Wks 1-5 (ranked 1-20) and the Chiefs in Wk6 (ranked 1); 12.7 points per week, well above every
   tier's average. That's more likely good fortune than a better method, since the rankings themselves predicted little.

**Watch:** if DEF stays near 55% through ~Wk10, consider holding one solid defense instead of streaming, and test that in the waiver
log (`waiver-log.md`).

## Manager habits (Wks 1-6, for trade pitches)

How often each manager started the lower-ranked player. "Points lost" is summed over those calls (positive = it cost them).

| Team | Pairs | Calls against ECR | Outside a window | Points lost |
|---|---|---|---|---|
| J's Pancakes (us) | 52 | 10 | 4 | 17.9 |
| Russini's Source | 50 | 8 | 3 | −0.8 |
| THE Lil Unk Rayrays | 52 | 6 | 3 | −7.6 |
| Smokin Base Brian | 49 | 6 | 2 | −7.6 |
| 4th Qtr Maria | 33 | 5 | 3 | 24.3 |
| Dusty Bottoms | 77 | 5 | 2 | 19.8 |
| True & Living 12th Gospel | 48 | 3 | 3 | −19.8 |
| Queen of the Damned | 63 | 1 | 1 | −15.8 |
| Knights Who Say Ni | 59 | 0 | 0 | 0 |
| Man Coverage Brigid | 38 | 0 | 0 | 0 |
