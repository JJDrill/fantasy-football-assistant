# 2026 Weekly Challenges

Source: `reference/2026_League_Rules.pdf` and `reference/FFL_2026_Weekly_Challenges_Mobile.pdf`.
$10 prize per week, 15 weeks (Weeks 1-15). Only players in the stated lineup position
count unless a challenge says otherwise.

| Week | Name | Rule |
|------|------|------|
| 1 | Revis and Butthead | Highest-scoring player or D/ST left on the bench, league-wide. |
| 2 | You're Killin' Me, Smalls | Among winning teams, the lowest-scoring starter in a winning lineup. |
| 3 | Scobee Snacks | Highest-scoring starting kicker, league-wide. |
| 4 | Give It Away, Give It Away Now | Starting QB (or superflex) with the most interceptions thrown. |
| 5 | Gotta Catch Jamaal | Starting RB with the most fantasy points. |
| 6 | Sack Up | Starting IDP with the most sacks. Tie broken by highest team fantasy score that week. |
| 7 | Gronk Memorial Challenge | Starting TE whose receiving yardage is closest to 69 (over or under). |
| 8 | Jerry Rice Week | Highest-scoring starting WR, league-wide. |
| 9 | If at First You Don't Succeed | Starting QB (or superflex) with the most incomplete passes. |
| 10 | Horseshoes and Hand Grenades | Losing team with the smallest margin of defeat. |
| 11 | Fatality! | Winning team with the largest margin of victory. |
| 12 | Uncle Rico | Starting QB with the most fantasy points. |
| 13 | Come On! | Highest-scoring team that still loses its matchup. |
| 14 | Closest to 21 | Any starter closest to 21 fantasy points without going over. |
| 15 | Longest Pass | Starting QB (or superflex) who threw the longest single pass. |

Administration: scoring source is final Yahoo scoring after stat corrections. Contact the
commissioner for questions or scoring errors.

## Open question: superflex / IDP references don't match this league's roster

This league's actual roster (per `reference/League_Settings.pdf`) is
`QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6, IR×2` — **no superflex/OP slot and no IDP
slot**. But Weeks 4, 9, and 15 reference a "starter or superflex" QB, and Week 6 is built
entirely around a "starting IDP." As written, Week 6 has no eligible players and the
superflex clause in Weeks 4/9/15 can never apply.

Most likely explanation: the challenge pack looks like a template reused across leagues
with different roster settings, not customized for this one. Flagged to the commissioner
(2026-08-18); update this note once there's a ruling.

**Until resolved:** `challenge-tracker` should treat these as: Weeks 4/9/15 evaluate the
starting QB only (superflex clause is a no-op since the slot doesn't exist); Week 6 has no
valid entrants and should be reported as unresolved rather than guessing a winner.
