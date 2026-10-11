# Source Accuracy Tracker

Tests which signal actually picks the right player on **close start/sit calls**. Started Week 5
(2026-10-05) after the Weeks 1-4 audit (`season-lessons.md`) showed matchup grades at 33%.

`lineup-advice` logs each close call (starter vs. best bench alternative at a slot, or any call
where the signals disagree) with what each source recommended. `post-game-check` fills in the
points and scores each source: **✓** if it favored the player who scored more, **✗** if not,
**—** if it had no opinion or wasn't gathered.

Sources:
- **Usage**: last 2-3 weeks of snaps, carries and targets (Sleeper)
- **ECR**: FantasyPros half-PPR weekly consensus rank (`yahoo/fantasypros-ecr.js`)
- **Props**: player prop lines (yards/receptions/anytime TD)
- **Matchup**: defense-vs-position grade. **Retired 2026-10-11** (7/21 hit rate); recorded as — from Wk5 on
- **Final call**: what we actually started

## Close calls

| Wk | Slot | Option A | Option B | Usage | ECR | Props | Matchup | Final call | A pts | B pts | Usage | ECR | Props | Matchup | Call |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 | RB2 | Montgomery | Marks | Marks (slight: more pts on targets; Montgomery more carries) | Montgomery (RB25 vs. RB32) | — (not posted Tue) | — (not gathered) | Montgomery | | | | | | | |
| 5 | TE | Likely | Sadiq | Likely (tgt 10/5/12 vs. 3/8/4) | Likely (TE8 vs. TE16) | — | — | Likely | | | | | | | |
| 5 | Flex | Burden | Marks | Burden (tgt 7/11/6) | Burden (WR20 vs. RB32) | — | — | Burden | | | | | | | |

## Running record

| Source | Correct | Wrong | Hit rate |
|---|---|---|---|
| Usage | 0 | 0 | — |
| ECR | 0 | 0 | — |
| Props | 0 | 0 | — |
| Matchup | 0 | 0 | — |
| Final call | 0 | 0 | — |

## Notes

- Week 5 pre-check (2026-10-05, Monday night ECR): the first usage-vs-consensus disagreement is
  already there. Usage says Gordon over Montgomery (22-12 snaps over Wright, 9-100 in Wk4;
  Montgomery 6/11/10 carries). ECR has Montgomery RB24 (at TEN), Gordon RB30 (vs. CIN), Marks RB32.
  At TE they agree: Likely TE7, Sadiq TE17, Pitts TE22.
- Byes in Wk5: KC and CAR (Mahomes, McMillan).
