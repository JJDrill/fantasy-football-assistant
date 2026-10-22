# Source Accuracy Tracker

Tests which signal actually picks the right player on **close start/sit calls**. Started Week 5
(2026-10-05) after the Weeks 1-4 audit (`season-lessons.md`) showed matchup grades at 33%.

`lineup-advice` logs each close call (starter vs. best bench alternative at a slot, or any call
where the signals disagree) with what each source recommended. `post-game-check` fills in the
points and scores each source: **✓** if it favored the player who scored more, **✗** if not,
**—** if it had no opinion or wasn't gathered.

**Scored two ways (added 2026-10-20).** Raw points, plus points **excluding TDs** (subtract 6 per
rushing/receiving TD, from Sleeper `rush_td`/`rec_td`). TDs are the noisiest part of a score. The
ex-TD score tests whether a source picked the player who got the **role and production**, so one
lucky TD doesn't read as a signal. When the two scores disagree, the call was decided by a TD:
treat it as chance and weigh the ex-TD record more heavily.

Sources:
- **Usage**: last 2-3 weeks of snaps, carries and targets (Sleeper)
- **ECR**: FantasyPros half-PPR weekly consensus rank (`yahoo/fantasypros-ecr.js`)
- **Props**: player prop lines (yards/receptions/anytime TD)
- **Matchup**: defense-vs-position grade. **Retired 2026-10-11** (7/21 hit rate); recorded as — from Wk5 on
- **Final call**: what we actually started

## Close calls

| Wk | Slot | Option A | Option B | Usage | ECR | Props | Matchup | Final call | A pts | B pts | Usage | ECR | Props | Matchup | Call | A ex-TD | B ex-TD | Usage ex-TD | ECR ex-TD | Call ex-TD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 | RB2 | Montgomery | Marks | Marks (slight: more pts on targets; Montgomery more carries) | Montgomery (RB25 vs. RB32) | — (not posted Tue) | — (not gathered) | Montgomery | 1.1 | 10.5 | ✓ | ✗ | — | — | ✗ | 1.1 | 10.5 | ✓ | ✗ | ✗ |
| 5 | TE | Likely | Sadiq | Likely (tgt 10/5/12 vs. 3/8/4) | Likely (TE8 vs. TE16) | — | — | Likely | 26.9 | -0.7 | ✓ | ✓ | — | — | ✓ | 14.9 | -0.7 | ✓ | ✓ | ✓ |
| 5 | Flex | Burden | Marks | Burden (tgt 7/11/6) | Burden (WR20 vs. RB32) | — | — | Burden | 6.9 | 10.5 | ✗ | ✗ | — | — | ✗ | 6.9 | 10.5 | ✗ | ✗ | ✗ |
| 6 | RB1 | Kamara (Q back, tier High) | K. Miller | Miller (carries 9/7/3 vs. 4/6/10) | Kamara (RB29 vs. RB31, Sun) | — | — | Miller (health-tier tiebreak) | 13.9 | 8.0 | ✗ | ✓ | — | — | ✗ | 7.9 | 8.0 | ✓ | ✗ | ✓ |
| 6 | RB2 | Corum | K. Mitchell | Mitchell (34-38% snaps, carries 8/10/6 vs. Corum 15-29%, 6/5/5) | Corum (RB30 vs. RB32) | — | — | Corum | 13.0 | 0.4 | ✗ | ✓ | — | — | ✓ | 7.0 | 0.4 | ✗ | ✓ | ✓ |
| 6 | WR2 | Tucker | Wan'Dale Robinson | Robinson (targets 11/5/7 vs. 4/8/5) | Tucker (WR31 vs. WR33) | — | — | Tucker | 24.2 | 3.7 | ✗ | ✓ | — | — | ✓ | 12.2 | 3.7 | ✗ | ✓ | ✓ |
| 7 | Flex | Corum | Burden | Burden (targets 11/6/6/8, 39-77% snaps vs. Corum 15-29%, carries 5-9) | Burden (FLEX 42 vs. 50 on 10/20; 45 vs. 57 on 10/21) | — | — | Burden (10/21: gap widened to 12 flex spots, outside the coin-flip window, so ECR decides; clean final injury report) | | | | | — | — | | | | | | |

## Running record

| Source | Correct | Wrong | Hit rate | Ex-TD correct | Ex-TD wrong | Ex-TD hit rate |
|---|---|---|---|---|---|---|
| Usage | 2 | 4 | 33% | 3 | 3 | 50% |
| ECR | 4 | 2 | 67% | 3 | 3 | 50% |
| Props | 0 | 0 | — | 0 | 0 | — |
| Matchup | 0 | 0 | — | — | — | — |
| Final call | 3 | 3 | 50% | 4 | 2 | 67% |

Through Wk6 (6 calls), **with TDs removed, usage and ECR are dead even at 3-3.** The whole difference from the raw record is one
call: Kamara's receiving TD in Wk6, which flips it from usage to ECR. Too few calls to separate them yet; ECR-first stays the rule.

## Notes

- Week 5 pre-check (2026-10-05, Monday night ECR): the first usage-vs-consensus disagreement is
  already there. Usage says Gordon over Montgomery (22-12 snaps over Wright, 9-100 in Wk4;
  Montgomery 6/11/10 carries). ECR has Montgomery RB24 (at TEN), Gordon RB30 (vs. CIN), Marks RB32.
  At TE they agree: Likely TE7, Sadiq TE17, Pitts TE22.
- Byes in Wk5: KC and CAR (Mahomes, McMillan).
- **Week 5 scored (2026-10-13, `post-game-check`).** Points are Sleeper half-PPR. Marks scored
  10.5 for us only on paper: we dropped him Sunday morning for Keaton Mitchell (4.4).
  - **RB2:** the miss is mostly random. Montgomery left in the 2nd quarter with a groin injury
    (5 carries, 14% of snaps), and Marks took over (85% of snaps).
  - **Flex:** the only real signal miss. Burden (6/7/11/6/6 targets) had a quiet game with Bagent at QB.
  - Three calls is far too small a sample to change the ECR-first rule.
- **Week 6 scored (2026-10-20, `post-game-check`, revised the same day).** Points are Sleeper half-PPR, matching Yahoo.
  - **RB1 (Kamara vs. Miller): right call, bad luck.** A 2-spot ECR gap is a coin flip. The tiebreaks (Wk5 role shift, Kamara
    Q/limited all week) both pointed to Miller. **Usage called the role correctly**: Miller got 20 carries on 44% of snaps, Kamara 7
    carries on 26%. Kamara's whole edge was **one 6-pt receiving TD**. Without TDs it's Kamara 7.9, Miller 8.0. The ✗ for usage
    and the call is outcome noise, not a signal.
  - **RB2 (Corum vs. Mitchell): right call, paid off.** Without TDs Corum still wins, 7.0 to 0.4 (Mitchell fell to 25% of snaps).
  - **WR2 (Tucker vs. Robinson): right call, paid off (size partly luck).** Without TDs Tucker still wins, 12.2 to 3.7. His 2 TDs were the bonus.
  - Running record after 6 calls: ECR 4-2, usage 2-4, but with TDs stripped out Wk6 goes usage 1-2 / ECR 2-1. **No rule change
    from this week.** Six outcome-scored calls is too small a sample to change anything, and TDs drive most of the swing.
