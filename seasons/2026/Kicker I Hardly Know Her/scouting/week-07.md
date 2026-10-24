# Week 7 scouting: every other team (`team-scout`)

**These are scouting reports on other teams, not our lineup** (that's in `week-07.md`). Each one is written from that team's side:
strengths, weaknesses, what we'd tell them, and why it matters to us. The "Post-game grading" lists at the end of each section are logged as rows in
`reference/scouting-accuracy.md`, and `post-game-check` grades them hit / miss / push after the week.

**Week 7 is a partial week.** The Maria and Gospel reports were written Fri 10/23, after TNF (NE at CHI). The other 7 came later the same day, so
Thursday's results were already known for those too. Calls about TNF players aren't graded. **Week 8 is the first clean week.**

**Data (`node yahoo/scout-league.js 7`, 2026-10-23):** Yahoo standings, rosters and scores for Wks 1-7; FantasyPros ECR (10/24, 38-46 experts);
Sleeper half-PPR Wks 1-6 (close to league scoring, not exact). **Forecast** = points already scored + season average for everyone yet to play; a starter on bye counts as 0.
**Flags** = a bench player ranked above a starter he could replace (ECR, FLEX ECR for W/R/T), or a starter on bye or tagged O/D/IR.

| Matchup | Forecast | Flags |
|---|---|---|
| **J's Pancakes vs. 4th Qtr Maria** | **126.4 vs. 113.7** | Maria: Patriots DEF started over Panthers (locked, 2.0) |
| Russini's Source vs. Man Coverage Brigid | 129.2 vs. **91.2** | Brigid: **Lawrence at QB on bye**; Russini: A.J. Brown at flex over Braelon Allen (locked) |
| Knights Who Say Ni vs. THE Lil Unk Rayrays | 137.0 vs. 112.5 | Rayrays: **Caleb Williams 22.1 on the bench** (Bryce Young starts); Douglas at flex over Waddle (locked); Myers over Shrader |
| Queen of the Damned vs. Smokin Base Brian | 115.8 vs. **86.3** | Brian: **3 starters on bye** (Rodriguez, B. Thomas, Dicker) + **T. Warren (O)** |
| Dusty Bottoms vs. True & Living 12th Gospel | 99.0 vs. 108.1 | Gospel: Downs at flex while Loveland scored 16.4 on the bench (locked) |

## Other-team analysis: 4th Qtr Maria (our Wk7 opponent; 2026-10-23, Fri)

Written from Maria's side ("if we were her front office").
Data: `get-matchup 7`, FantasyPros ECR (10/23, 46 experts), Sleeper half-PPR Wks 1-6 (close to, not exactly, league scoring), `get-scoreboard` Wks 1-6.

**Season:** 3-3. 115.7 / 99.3 / 123.2 / 117.0 / **154.4** (league high) / **71.9** (near the low). Avg ~114, about the league median.
**Banked after TNF:** our Burden **21.7**; her Patriots DEF **2.0**.

| Slot | Maria | ECR | Avg Wks 1-6 | Us | ECR |
|---|---|---|---|---|---|
| QB | Stroud | QB7 | 18.9 | Mahomes | QB13 |
| RB | Henry | RB6 | 18.7 | Brown | RB14 |
| RB | Marks | RB16 | 7.8 (85/78% snaps last 2) | Gordon | RB19 |
| WR | **Puka (Q, calf)** | WR1 | 18.3 (23.2, 29.2 healthy) | **Pickens (Q, shoulder)** | WR18 |
| WR | Jameson Williams | WR26 | 9.7 (~4 tgts) | St. Brown | WR4 |
| TE | Fannin | TE12 | 7.3 (0.9, 1.4 last 2) | Likely | TE4 |
| W/R/T | Kyren Williams | FLEX7 | 17.3 | Burden | 21.7 banked |
| K | Reichard | K1 | 13.6 | Fitzgerald | K6 |
| DEF | Patriots | DST16 | 2.0 banked | Vikings | DST2 |

Bench: Stafford (QB8), Nix (QB16), A. Jones (RB20), Barkley (Q, RB29), Worthy (WR29), Panthers DEF (DST8).

**Strengths:** (1) RB depth: Henry + Kyren are both top-7, Kyren gets 6-13 targets; Jones/Barkley behind them. (2) Puka is the best
WR in the matchup, with Davante Adams out. (3) Two stacks: Puka + Kyren (LAR at LV, ~25.75 implied) and Stroud + Marks (HOU −9.5 vs. NYG).
Either one turning into a shootout gets her a 154-type week. (4) Spare QB (Stafford is about even with Stroud). (5) Reichard K1, dome.

**Weaknesses:** (1) **WR2:** Jameson Williams WR26, Worthy WR29 behind him. She has 5 RBs and 3 QBs but only 3 WRs. (2) **TE:** Fannin plays 90% of snaps,
0.9 and 1.4 the last two weeks. That's our biggest positional edge. (3) **Puka's calf** (limited Thu, Rapoport: "believed minor").
He's missed 2 games already, and she mishandled both of his returns (Wk2 started him while out = 0; Wk4 benched him on his return = 23.2 on her bench).
If he sits, Worthy (Sunday night) replaces him, roughly −10. (4) **Henry depends on Lamar.** With Huntley at QB in Wk6: 4.5 pts, and he gets 1-3 targets. Lamar
practiced Wed-Fri but isn't cleared. (5) **DEF already lost:** she started the Patriots (2.0) with the Panthers (DST8) on her bench. (6) Wasted bench: 3 QBs, 2 DEF, Barkley.

**What we'd tell her:** watch Puka's status (Worthy is a late-swap fallback); Stafford over Stroud is a near coin flip that stacks with Puka/Kyren;
trade an RB for a WR (same logic as our #17, and Burden's 21.7 makes that pitch stronger); stream a TE.

**Forecast:** season-average starters come to Maria ~117 vs. us ~127 (hand estimate; `scout-league.js`: 113.7 vs. 126.4). We lead by ~20 after TNF. We're ahead at TE, WR2 and DEF; she's ahead at RB, QB and K.
**Biggest swing: Puka's health and the LAR-LV game.**

**Post-game grading (for `post-game-check`):** score each call above as hit / miss / push. (a) Our ~127 vs. her ~117 forecast; (b) Fannin < Likely;
(c) Jameson Williams under 10; (d) Henry with Lamar's status known; (e) Puka played/limited, and whether she handled it right; (f) did
LAR-LV or HOU-NYG spike; (g) Stroud vs. Stafford, in hindsight.

Sources: [SI, Puka](https://www.si.com/nfl/rams/onsi/rams-puka-nacua-injury-update-week-7-raiders), [Yahoo, Puka](https://sports.yahoo.com/articles/puka-nacua-leaves-practice-early-221949771.html),
[Athlon, Barkley](https://athlonsports.com/nfl/philadelphia-eagles/saquon-barkley-sends-clear-message-regarding-his-status-for-monday-night-football),
[NBC Sports, Lamar](https://www.nbcsports.com/fantasy/football/player-news/2026-10-23/lamar-jackson-ankle-practicing-again-on-friday), [ESPN, Lamar](https://www.espn.com/nfl/story/_/id/50241195/lamar-jackson-practice-unclear-vs-bengals-week-7).

## Other-team analysis: True & Living 12th Gospel (not our opponent this week; Wk15 rematch; 2026-10-23, Fri)

Gospel plays **Dusty Bottoms** in Wk7. We beat them 128.2-112.7 in Wk6 and
play them again in **Wk15, the last regular-season week** (4 of 10 make the playoffs). Data: `get-all-rosters 7`, ECR 10/23, Sleeper Wks 1-6, `get-scoreboard` Wks 1-7.

**Season:** 0-6. 98.4 / 111.7 / 118.7 / 101.0 / 123.4 / 112.7, avg ~111. **Three losses by under 5** (1.8, 4.4, 1.6). This is a
median-ish team with a terrible record, not a bad team, and it won't stay this unlucky. **Wk7 so far:** Stevenson **20** on TNF; Loveland **16.4 on the bench**.

| Slot | Gospel | ECR | Avg Wks 1-6 |
|---|---|---|---|
| QB | Love (GB at DET, week's highest total) | QB3 | 19.1 |
| RB | Stevenson | RB19 | 9.5 (20 banked) |
| RB | Judkins (ankle, cleared Fri, full practice) | RB36 (range 20-97) | 9.5 |
| WR | Germie Bernard | WR23 | 6.8, but 11.4 → 20.2 on 92-94% snaps the last 2 |
| WR | Christian Watson | WR6 | 17.4 |
| TE | McBride | TE3 | 13.1 (9-13 tgts every week) |
| W/R/T | Josh Downs | FLEX79 | 6.9 |
| K | Trey Smack | K15 | 7.0 (1.0 and 2.0 in two games) |
| DEF | Jets (vs. MIA) | DST6 | — |

Bench: **Burrow (QB6, 20.8 avg)**, **James Cook (BUF bye; 18.1 avg, their best RB)**, Loveland (TE7), Keenan Allen (WR34), Godwin (WR40), Pierce (RB34).

**Strengths:** (1) **QB surplus:** Love QB3 and Burrow QB6, two starting QBs for one slot. (2) **TE surplus:** McBride TE3 + Loveland TE7 (rising: 8.7, 15.5, now 16.4).
(3) **Cook** is a top RB when he's not on bye. (4) Watson is a real WR1 with big spikes (29.7, 29.3). (5) Bernard's role just jumped.

**Weaknesses:** (1) **RB2 and flex are thin:** without Cook, the backups are Judkins (just back from injury, wide expert range) and Pierce (RB34). (2) **WR3/flex:**
Downs, Allen and Godwin all average 6-8, and Downs (FLEX79) starts over Allen (FLEX70). (3) **Kicker** is the worst in our data (7.0 avg, K15). (4) Most churn in
the league (21 moves by Wk5) and 0-6 anyway: activity isn't fixing the WR/RB depth. (5) Two of their surplus pieces (Burrow, Loveland) sit on the bench every week.

**What we'd tell them:** they're buyers who have to win now (0-6, 4 playoff spots). Trade Burrow or Loveland for an RB2/WR2 starter; that turns bench value into
weekly points. Start Allen over Downs. Stream a kicker. Their record is mostly bad luck, so don't blow up the roster.

**Why it matters to us:** (a) **Trade partner:** they have spare QB/TE and need RB/WR. We're long at QB too (Allen + Mahomes), so a QB deal doesn't fit, but
they'll be motivated sellers of Burrow/Loveland to whoever has RB/WR to spare. (b) **Wk15 rematch**: expect a much stronger team than its record if they
convert that surplus. (c) Stevenson is the player we dropped Sep 30 (see `league-patterns.md`).

**Post-game grading (for `post-game-check`):** (a) did they lose despite a median-ish score (luck), or play below it; (b) Downs vs. Allen;
(c) Bernard's new role holding (8+ targets); (d) Judkins' workload back from the ankle; (e) Smack under 8; (f) Love vs. Burrow, in hindsight.

Sources: [NBC Sports, Judkins](https://www.nbcsports.com/fantasy/football/player-news/2026-10-23/judkins-not-on-final-report-sampson-questionable),
[RotoBaller, Judkins](https://www.rotoballer.com/player-news/quinshon-judkins-cleared-to-play-in-week-7/1973773).

## Other-team analysis: Queen of the Damned (our Wk8 opponent; 2026-10-23, Fri)

**Season:** 4-2, avg 112.0. 146.7 / 111.0 / 96.9 / 102.6 / 116.5 / 98.4. **Above the league median only 2 of 6 weeks**, and both wins in close games (1.6, 3.5)
with no close losses. **This is the luckiest record in the league**, likely to regress. Wk7 vs. Smokin Base Brian (who's starting 4 zeros): forecast 115.8 vs. 86.3.

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | Purdy | QB1 | 22.7 | 17.2, 17.4 |
| RB | Jeanty | RB15 | 14.6 | 9.2, 13.8 (53-58% snaps) |
| RB | Swift | RB9 | 15.8 | 17.0 banked TNF |
| WR | Flowers | WR10 | 15.7 | 10.6, 9.7 |
| WR | Chase | WR3 | 13.3 | 16.7, bye |
| TE | Kraft | TE6 | 7.3 | 9.1, 6.2 |
| W/R/T | Dobbins | FLEX47 | 7.6 | 14.4, 12.1 |
| K / DEF | McPherson K5 / Titans DST9 | | | |

Bench: Herbert (QB, LAC bye), Hampton (RB, LAC bye), Parker Washington (WR, JAX bye), Tate (WR25), Strange (TE), Evans (O).

**Strengths:** (1) QB1 Purdy. (2) Two good WRs (Chase, Flowers). (3) Swift's role is steady (58% snaps, 16 carries Wk6).
**Weaknesses:** (1) **TE:** Kraft TE6 by rank, but he averages 7.3. (2) **Flex and RB2 are soft:** Dobbins (FLEX47) and Jeanty in a split backfield. (3) Bench is short this week (3 on bye).
(4) Their record outruns their scoring.

**What we'd tell them:** you're 4-2 on close wins. Upgrade TE (Strange is on the bench, a similar player) and get a real flex; Tate (WR25) is the closest thing.
**Why it matters to us:** **our Wk8 opponent.** Their soft spots (TE, flex) are where our Likely/Pitts and RB depth line up. They stream DEFs and have already taken
two players we wanted (McPherson, Strange), so expect them on the waiver wire again before Wk8.

**Post-game grading:** (a) Queen beats Brian, score near 115.8; (b) Kraft under 10; (c) Dobbins under 10; (d) Queen scores below the league median again (luck read).

## Other-team analysis: Russini's Source (Wk13 opponent; 2026-10-23, Fri)

**Season:** 5-1, avg 117.3. 116.1 / 130.0 / 123.0 / 104.7 / 143.3 / 86.8. Two close wins (4.4, 1.5), one close loss (0.3), 3 of 6 weeks above the median: a good team with a
somewhat lucky record. Wk7 vs. Man Coverage Brigid: forecast **129.2 vs. 91.2**.

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | Goff | QB4 | 23.0 | 28.9, bye |
| RB | Gibbs | RB1 | 28.0 | 35.2, bye |
| RB | Irving | RB13 | 12.9 | 30.5, 5.9 |
| WR | Collins | WR12 | 15.6 | 8.1, 9.4 |
| WR | Golden | WR9 | 14.3 | 17.3, 19.4 (13 tgts) |
| TE | Kelce | TE9 | 10.4 | bye, 7.3 |
| W/R/T | A.J. Brown | FLEX34 | **4.2** | 6.3 banked TNF |
| K / DEF | Loop K8 / Broncos DST3 | | | |

Bench: Daniels (QB, WAS bye; 21.4 avg), **Braelon Allen (RB12, FLEX23)**, Metcalf (WR21), Pollard (RB21), Kincaid (TE), Vele; Adams (IR).

**Strengths:** (1) Gibbs is the best RB in the league (28.0). (2) Two starting QBs (Goff, Daniels). (3) RB depth: Allen and Pollard would start for most teams. (4) Golden's role is growing.
**Weaknesses:** (1) **Flex:** A.J. Brown (4.2 avg) starts over Braelon Allen (FLEX23), an 11-spot gap; that's locked now that Brown has played. (2) Kelce is aging, TE9. (3) Collins is cooling (8.1, 9.4).
**What we'd tell them:** Allen goes in the flex every week. Trade Daniels or an RB for a WR2.
**Why it matters to us:** Wk13 opponent. They have spare QB and RB like several teams; since we're long at QB too, the fit isn't QB-for-QB.

**Post-game grading:** (a) Russini beats Brigid; (b) A.J. Brown < Braelon Allen (the lineup call); (c) Gibbs top-5 RB this week; (d) Golden 8+ targets (trend).

## Other-team analysis: Man Coverage Brigid (Wk11 opponent; 2026-10-23, Fri)

**Season:** 5-1, avg 116.6. 124.0 / 126.5 / 124.9 / 108.7 / 112.9 / 102.5. **Above the median 5 of 6 weeks**, three close wins: steady rather than explosive.
Wk7 vs. Russini's Source: forecast **91.2**, because **Trevor Lawrence (QB) is starting on JAX's bye** with Kyler Murray (QB11) on the bench.

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | **Lawrence (BYE)** | — | 19.7 | 22.7, 28.3 |
| RB | Henderson | RB35 | 5.6 | 4.3, 2.5 (16-24% snaps); 3.3 banked TNF |
| RB | E. Wilson | RB29 | 9.0 | 12.2, 5.2 |
| WR | Smith-Njigba | WR2 | 23.4 | 20.3, 19.4 (16 tgts) |
| WR | Olave | WR11 | 15.3 | 6.6, 12.3 |
| TE | Kittle | TE2 | 12.8 | 4.9, 15.4 |
| W/R/T | G. Wilson | FLEX35 | 12.9 | 19.9, 6.4 |
| K / DEF | Fairbairn K2 / Eagles DST24 | | | |

Bench: Murray (QB11), Coker (WR20), Hall (Q, RB74), Lemon (WR50); Achane, Reed (IR).

**Strengths:** (1) **Best pass-catchers in the league:** JSN, Olave, G. Wilson, Kittle, Coker. (2) Consistent: 5 of 6 weeks above the median.
**Weaknesses:** (1) **RB is the worst in the league:** Henderson plays 16-24% of snaps; Achane is on IR and Hall is Q. (2) **Set-and-forget manager** (3 moves all season, per `league-patterns.md`):
a starter on bye with a QB11 on the bench is exactly that blind spot. (3) Eagles DEF, DST24.
**What we'd tell them:** start Murray now. Trade a WR (Coker or G. Wilson) for an RB; you're deep enough to afford it.
**Why it matters to us:** Wk11 opponent, and **the clearest trade fit in the league for our RB depth**: they need RBs, have spare WRs, and rarely trade, so a pitch needs to be clearly good for them.

**Post-game grading:** (a) Brigid leaves Lawrence in (inactive-manager read) and loses; (b) Henderson under 6; (c) JSN top-5 WR; (d) Brigid scores under 100.

## Other-team analysis: Knights Who Say Ni (Wk14 opponent; 2026-10-23, Fri)

**Season:** 4-2, avg **128.0, the league high**. 111.7 / 117.3 / 123.0 / 138.7 / 131.0 / 146.5: rising every week from Wk3. Above the median 5 of 6 weeks; losses by 4.4 and 1.6.
**The best team in the league**, record or not. Wk7 vs. THE Lil Unk Rayrays: forecast **137.0** vs. 112.5.

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | Prescott | QB9 | 18.3 | 14.6, 13.0 |
| RB | McCaffrey | RB3 | 18.0 | 15.8, 26.2 |
| RB | K. Walker | RB4 | 26.2 | bye, 26.9 |
| WR | Higgins | WR19 | 12.4 | 3.2, bye |
| WR | Nabers | WR13 | 13.7 | 23.6, 22.5 (20, 15 tgts) |
| TE | LaPorta | TE5 | 12.6 | 17.3, bye |
| W/R/T | Hubbard | RB10 | 18.5 | bye, 18.6 (28 carries) |
| K / DEF | Boswell K4 / Browns DST4 | | | |

Bench: **Warren (RB11, 15.4 avg)**, D. Smith (Q, WR17), Goedert (Q, TE8), Harvey, Allgeier, Rice (O).

**Strengths:** (1) **Four starting RBs** (CMC, Walker, Hubbard, Warren). (2) Nabers' volume is elite. (3) Strong K/DEF streaming (14 moves, mostly K/DEF).
**Weaknesses:** (1) **QB:** Prescott QB9 and fading (14.6, 13.0). (2) WR2: Higgins vs. Smith (Q) is a coin flip. (3) Bench slots tied up by injured players (Rice O, Smith Q, Goedert Q).
**What we'd tell them:** you have a spare starting RB and a mid QB. Trade Warren for a QB upgrade.
**Why it matters to us:** that's **our trade #19 (Mahomes ↔ Warren)**, and the scouting backs it: they need a QB and have a spare RB. Also our Wk14 opponent, so the deal
strengthens a team we play late. Weigh that, but it's one game against a weekly gain.

**Post-game grading:** (a) Knights beat Rayrays and score 130+; (b) Prescott under 18; (c) Nabers 10+ targets; (d) Higgins vs. D. Smith (if Smith plays).

## Other-team analysis: THE Lil Unk Rayrays (Wk10 opponent; 2026-10-23, Fri)

**Season:** 3-3, avg 106.1. 135.9 / 78.2 / 132.4 / 105.8 / 107.1 / 77.2: **the most boom-or-bust team in the league** (two weeks under 80, two over 130).
Wk7 vs. Knights: forecast 112.5. **Three lineup flags, the most in the league.**

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | **Bryce Young** | QB10 | 22.5 | bye, 19.8 |
| RB | Bijan Robinson | RB2 | 19.8 | 13.8, 6.3 |
| RB | Javonte Williams | RB7 | 16.6 | 13.2, 12.0 |
| WR | London | WR7 | 12.2 | 15.3, 10.2 |
| WR | McMillan | WR14 | 14.6 | bye, 11.6 |
| TE | Andrews | TE15 | 5.6 | 2.8, 0.9 |
| W/R/T | **Douglas** | FLEX83 | 8.2 | 3.8 banked TNF |
| K / DEF | **Myers K13** / Seahawks DST10 | | | |

Bench: **Caleb Williams (QB5): 22.1 on TNF, on the bench**; **Waddle (FLEX55)**; **Shrader (K10)**; Egbuka (O); Schultz (TE18); Charbonnet (IR).

**Strengths:** (1) Two top-7 RBs (Bijan, Javonte). (2) Two starting QBs. (3) London/McMillan are a solid WR pair.
**Weaknesses:** (1) **Lineup decisions:** Caleb QB5 sat for Bryce QB10 and scored 22.1; Douglas (FLEX83) started over Waddle (FLEX55); Myers over Shrader. Each call went against ECR.
(2) **TE:** Andrews 0.9 and 2.8 the last two weeks. (3) Bijan's last two weeks are down (13.8, 6.3).
**What we'd tell them:** start by rank; the roster is fine, the lineup calls are the problem. Find a TE.
**Why it matters to us:** Wk10 opponent. The most active trader and QB-hungry per `league-patterns.md`, but now holding two QBs, so they're **more likely to sell a QB than buy one.**

**Post-game grading:** (a) Bryce Young < 22.1 (Caleb's banked TNF score: was benching Caleb wrong?); (b) Douglas (3.8) < Waddle; (c) Andrews under 6; (d) Rayrays lose to Knights.

## Other-team analysis: Dusty Bottoms (Wk9 opponent; 2026-10-23, Fri)

**Season:** 2-4, avg 101.9. 114.3 / 99.7 / 123.1 / 110.7 / 92.4 / 70.9: **falling three straight weeks.** One close loss (1.8). Wk7 vs. Gospel: forecast 99.0 vs. 108.1.

| Slot | Player | ECR | Avg | Last 2 |
|---|---|---|---|---|
| QB | Lamar Jackson (Q, ankle) | QB12 | 20.0 | out, out |
| RB | Skattebo | RB33 | 7.7 | 6.1, **0.0 (8% snaps)** |
| RB | **Josh Jacobs** | RB17 | — | first game of 2026 |
| WR | CeeDee Lamb | WR5 | 17.9 | 1.9, 11.5 (18 tgts) |
| WR | Jefferson | WR8 | 13.6 | 15.8, bye |
| TE | Bowers | TE1 | 17.1 | 19.0, 9.0 |
| W/R/T | M. Wilson | FLEX52 | 9.1 | 5.3, 5.2 |
| K / DEF | Aubrey K3 / Texans DST1 | | | |

Bench: Tuten (RB, JAX bye; 22.7 Wk6), Lloyd, Diggs, DJ Moore (Q), Juwan Johnson (TE13), Omar Cooper (WR33). **No backup QB.**

**Strengths:** (1) **Elite pass-catchers:** Lamb, Jefferson, Bowers. (2) Top K/DEF by rank. (3) Tuten is back in Wk8.
**Weaknesses:** (1) **QB risk with no backup:** Lamar has missed 2 games and isn't cleared; if he sits, the slot is empty. (2) **RB:** Skattebo's role is gone (0.0 on 8% of snaps).
Jacobs' first game since reinstatement may be limited (LaFleur: "to be determined"), and his NFL conduct review is still open. (3) M. Wilson in the flex (5.2, 5.3). (4) Passive manager (3 moves).
**What we'd tell them:** add a backup QB today. Bench Skattebo.
**Why it matters to us:** Wk9 opponent. They rejected Mahomes ↔ Tuten (trade id 12), and `trades.md` says not to re-pitch that deal. Their QB need is still real, so any new pitch has to be a different deal.

**Post-game grading:** (a) Lamar plays (Q → active); (b) Skattebo under 6; (c) Jacobs gets 12+ carries; (d) Dusty loses to Gospel.

Sources: [NFL.com, LaFleur on Jacobs](https://www.nfl.com/news/packers-head-coach-matt-lafleur-says-josh-jacobs-game-status-for-week-7-to-be-determined),
[Yahoo, Rapoport on Jacobs](https://sports.yahoo.com/articles/ian-rapoport-josh-jacobs-indicates-172957007.html), [NBC Sports, Lamar](https://www.nbcsports.com/fantasy/football/player-news/2026-10-23/lamar-jackson-ankle-practicing-again-on-friday).

## Other-team analysis: Smokin Base Brian (Wk12 opponent; 2026-10-23, Fri)

**Season:** 2-4, avg **88.6, the league low**. 100.1 / 77.5 / 90.6 / 99.5 / 91.3 / 72.8. **Never above the median.** No moves found all season (`league-patterns.md`).
Wk7 vs. Queen: forecast **86.3**, with **four starters scoring 0**: Rodriguez (RB, WAS bye), B. Thomas (W/R/T, JAX bye), Dicker (K, LAC bye) and Tyler Warren (TE, O).

| Slot | Player | ECR | Avg |
|---|---|---|---|
| QB | Maye | QB2 | 19.7 (28.4 banked TNF) |
| RB | J. Taylor | RB8 | 18.5 |
| RB | **C. Rodriguez (BYE)** | — | 5.0 |
| WR | Boston | WR28 | 10.5 |
| WR | Odunze | WR31 | 6.5 (8.9 banked TNF) |
| TE | **T. Warren (O)** | — | 11.0 |
| W/R/T | **B. Thomas (BYE)** | — | 3.5 |
| K / DEF | **Dicker (BYE)** / Steelers DST5 | | |

Bench: Addison (WR38), Mason (IR-R, RB26), McConkey (Q, LAC bye), J. Love (O), Croskey-Merritt (IR), L. McCaffrey.

**Strengths:** Maye (QB2) and J. Taylor (RB8). That's it.
**Weaknesses:** an abandoned roster. Even the bench can't fix it (Addison is the only healthy, active bench player).
**What we'd tell them:** set a lineup; drop the injured and bye players for free agents.
**Why it matters to us:** Wk12 opponent: probably a free win if they stay inactive. It also hands **Queen (our Wk8 opponent) an easy win this week.** An inactive manager won't answer trades.

**Post-game grading:** (a) Brian starts the same 4 zeros (inactive read); (b) Brian scores under 90; (c) Brian loses.
