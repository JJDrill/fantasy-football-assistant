# 2026 Weekly Challenges

Source: `reference/2026_League_Rules.pdf` and `reference/FFL_2026_Weekly_Challenges_Mobile.pdf`.
$10 prize per week, 15 weeks (Weeks 1-15). Only players in the stated lineup position
count unless a challenge says otherwise.

| Week | Name | Rule |
|------|------|------|
| 1 | Revis and Butthead | Highest-scoring player or D/ST left on the bench, league-wide. |
| 2 | You're Killin' Me, Smalls | Among winning teams, the lowest-scoring starter in a winning lineup. |
| 3 | Scobee Snacks | Highest-scoring starting kicker, league-wide. |
| 4 | Give It Away, Give It Away Now | Starting QB with the most interceptions thrown. |
| 5 | Gotta Catch Jamaal | Starting RB with the most fantasy points. |
| 6 | Sack Up | Team defense (DEF slot) with the most sacks league-wide. Tie broken by highest team fantasy score that week. |
| 7 | Gronk Memorial Challenge | Starting TE whose receiving yardage is closest to 69 (over or under). |
| 8 | Jerry Rice Week | Highest-scoring starting WR, league-wide. |
| 9 | If at First You Don't Succeed | Starting QB with the most incomplete passes. |
| 10 | Horseshoes and Hand Grenades | Losing team with the smallest margin of defeat. |
| 11 | Fatality! | Winning team with the largest margin of victory. |
| 12 | Uncle Rico | Starting QB with the most fantasy points. |
| 13 | Come On! | Highest-scoring team that still loses its matchup. |
| 14 | Closest to 21 | Any starter closest to 21 fantasy points without going over. |
| 15 | Longest Pass | Starting QB who threw the longest single pass. |

Administration: scoring source is final Yahoo scoring after stat corrections. Contact the
commissioner for questions or scoring errors.

## Resolved: superflex / IDP mismatch (flagged 2026-08-18, fixed 2026-08-26)

Earlier versions of this pack referenced a "starter or superflex" QB in Weeks 4, 9, and 15,
and built Week 6 entirely around a "starting IDP" — but this league's actual roster (per
`reference/League_Settings.pdf`) is `QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6, IR×2`,
with **no superflex/OP slot and no IDP slot**. Week 6 as originally written had no eligible
players, and the superflex clause in Weeks 4/9/15 could never apply.

The commissioner reissued `FFL_2026_Weekly_Challenges_Mobile.pdf` on 2026-08-26 with the
mismatch fixed: Weeks 4/9/15 now just say "QB" (no superflex mention), and Week 6 was
redefined from "starting IDP" to "the defensive team [DEF slot] with the most sacks in the
league" — a stat this league's roster actually has. The table above reflects the corrected
wording; `yahoo/challenge-config.js` was updated to match (Week 6 now evaluates the `DEF`
slot's sack total instead of the never-eligible IDP positions).
