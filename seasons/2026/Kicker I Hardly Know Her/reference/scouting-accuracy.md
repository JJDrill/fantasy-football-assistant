# Scouting Accuracy Tracker

Tests which kinds of reads about **other teams** hold up. Started Week 7 (2026-10-23). It works like `source-accuracy.md`, but for the
`team-scout` reports in `scouting/week-NN.md`.

`team-scout` logs every "Post-game grading" item as a row here, with the result left blank. `post-game-check` fills in **Actual** and **Result**:
**hit**, **miss**, or **push** (too close to call, or the premise didn't happen, e.g. the player didn't play). After a few weeks, the
hit rate by **Type** shows which reads to trust and which are noise.

**Types** (keep to these so the rows can be compared):
- **score**: a team's forecast total (hit = within 15 points)
- **winner**: who wins a matchup
- **lineup**: a start/sit call another team made, scored against our pick (ECR-first)
- **weakness** / **strength**: a positional read (e.g. "TE under 10")
- **injury**: whether a Q/returning player plays, or how big his role is
- **trend**: a role or usage change carrying forward (e.g. "8+ targets again")
- **manager**: a read on manager behavior (inactive, set-and-forget, sloppy lineups)
- **luck**: whether a team's record is running ahead of or behind its scoring

Week 7 is partial: reports were written after TNF, so no prediction is logged whose outcome was already known. Week 8 is the first clean week.

## Hit rate by type

| Type | Hits | Misses | Pushes | Rate |
|---|---|---|---|---|
| (filled in by `post-game-check` from Wk7 on) | | | | |

## Predictions

| Wk | Team | Type | Prediction | Actual | Result |
|---|---|---|---|---|---|
| 7 | J's Pancakes vs. Maria | score | Us ~127 (script 126.4), Maria ~117 (script 113.7) | | |
| 7 | J's Pancakes vs. Maria | winner | We win | | |
| 7 | 4th Qtr Maria | weakness | Fannin scores fewer than Likely | | |
| 7 | 4th Qtr Maria | weakness | Jameson Williams under 10 | | |
| 7 | 4th Qtr Maria | injury | Henry's output tracks Lamar's status (under 10 if Huntley starts) | | |
| 7 | 4th Qtr Maria | injury | Puka plays; note whether Maria handled his status right | | |
| 7 | 4th Qtr Maria | strength | LAR-LV or HOU-NYG is a shootout that spikes her score | | |
| 7 | 4th Qtr Maria | lineup | Stroud vs. Stafford (near coin flip; whoever scores more) | | |
| 7 | True & Living 12th Gospel | luck | Scores near the league median (luck read: record < scoring) | | |
| 7 | True & Living 12th Gospel | lineup | Downs (started) vs. Keenan Allen (bench) | | |
| 7 | True & Living 12th Gospel | trend | Bernard gets 8+ targets again | | |
| 7 | True & Living 12th Gospel | injury | Judkins gets a full workload (14+ carries) back from his ankle | | |
| 7 | True & Living 12th Gospel | weakness | Smack under 8 | | |
| 7 | True & Living 12th Gospel | lineup | Love (started) vs. Burrow (bench) | | |
| 7 | Queen of the Damned | winner | Queen beats Brian, near 115.8 | | |
| 7 | Queen of the Damned | weakness | Kraft under 10 | | |
| 7 | Queen of the Damned | weakness | Dobbins under 10 | | |
| 7 | Queen of the Damned | luck | Queen scores below the league median again | | |
| 7 | Russini's Source | winner | Russini beats Brigid (129.2 vs. 91.2) | | |
| 7 | Russini's Source | lineup | A.J. Brown (flex, TNF) < Braelon Allen (bench) | | |
| 7 | Russini's Source | strength | Gibbs is a top-5 RB this week | | |
| 7 | Russini's Source | trend | Golden gets 8+ targets | | |
| 7 | Man Coverage Brigid | manager | Lawrence stays in the lineup on his bye | | |
| 7 | Man Coverage Brigid | weakness | Henderson under 6 | | |
| 7 | Man Coverage Brigid | strength | Smith-Njigba is a top-5 WR this week | | |
| 7 | Man Coverage Brigid | score | Brigid under 100 | | |
| 7 | Knights Who Say Ni | winner | Knights beat Rayrays, 130+ | | |
| 7 | Knights Who Say Ni | weakness | Prescott under 18 | | |
| 7 | Knights Who Say Ni | trend | Nabers gets 10+ targets | | |
| 7 | Knights Who Say Ni | lineup | Higgins (started) vs. DeVonta Smith (bench), if Smith plays | | |
| 7 | THE Lil Unk Rayrays | lineup | Bryce Young scores under Caleb Williams' 22.1 (benching Caleb was wrong) | | |
| 7 | THE Lil Unk Rayrays | weakness | Andrews under 6 | | |
| 7 | THE Lil Unk Rayrays | winner | Rayrays lose to Knights | | |
| 7 | Dusty Bottoms | injury | Lamar plays | | |
| 7 | Dusty Bottoms | weakness | Skattebo under 6 | | |
| 7 | Dusty Bottoms | injury | Jacobs gets 12+ carries in his first game back | | |
| 7 | Dusty Bottoms | winner | Dusty loses to Gospel | | |
| 7 | Smokin Base Brian | manager | Brian starts the same 4 zeros (3 byes + T. Warren O) | | |
| 7 | Smokin Base Brian | score | Brian under 90 | | |
