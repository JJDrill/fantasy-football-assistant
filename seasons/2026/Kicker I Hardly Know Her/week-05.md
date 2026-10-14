# Week 5: J's Pancakes (0-4) vs. Knights Who Say Ni (3-1)

## This week's challenge: "Gotta Catch Jamaal"

Starting RB with the most fantasy points (`reference/challenges.md`). No lineup constraint beyond
starting our best RBs. Our RBs rank RB25-32 in FantasyPros ECR, so this is a long shot.

## Pre-game check #1 (2026-10-06, Tuesday; `pre-game-check`)

All live scripts worked: `get-matchup 5`, `get-alerts 5`, `run-challenge 5`, plus Sleeper usage
(Wks 2-4) and `fantasypros-ecr.js` (9 experts, updated 10/06). User: no pending trades, no
specific concerns.

### Lineup: 3 changes

| Slot | Current | Start | Usage (Wks 2/3/4) | ECR (range) | Implied total | Decided by |
|---|---|---|---|---|---|---|
| QB | Allen | **Allen** | 74-66-59 snaps (100%) | QB1 (1-1) | BUF 25.0 (at LAR, MNF) | Everything |
| RB | Montgomery | **Montgomery** | carries 6/11/10, tgt 2/2/0, pts 3.4/5.8/4.3 | RB25 (23-27) | HOU 23.5 | ECR (close call, see below) |
| RB | Marks | **Gordon** ⬆ | carries 3/17/9, snaps 19% → 84% → 56%, pts 0.7/13.0/17.0 | RB29 (29-30) | MIA 21.5 | Usage + ECR agree over Marks |
| WR | St. Brown | **St. Brown** | tgt 13/8/11 | WR3 (2-3) | DET 28.5 (at ARI, dome) | Everything |
| WR | Pickens | **Pickens** | tgt 8/11/3 | WR15 (15-17) | DAL 28.0 (**Thursday** vs. TB) | Usage + ECR |
| TE | Sadiq | **Likely** ⬆ | Likely tgt 10/5/12 vs. Sadiq 3/8/4 | Likely TE8 (7-10) vs. Sadiq TE16 | NYG 23.0 vs. NYJ 20.5 (slate's lowest total) | Usage + ECR + Vegas agree |
| W/R/T | McMillan (**bye**) | **Burden** ⬆ | tgt 7/11/6, snaps ~57-61% | WR20 (20-25) | CHI 23.0 (at GB) | Usage + ECR |
| K | McPherson | **McPherson** | — | K2 (2-6) | CIN 28.0 (at MIA) | ECR + Vegas |
| DEF | Vikings | **Vikings** | — | DST2 (1-5) | NO 21.5 | ECR |

**Moves to make in Yahoo:** Gordon → RB (Marks → BN), Likely → TE (Sadiq → BN), Burden → W/R/T
(McMillan → BN). **Pickens plays Thursday night**, so his slot locks Thursday. The others can wait,
but there's no reason to.

### Bench, ranked (so nobody goes unreviewed)

- **RB:** Marks (RB32; carries 8/5/6, but 6.0/8.6/8.2 pts, best of the Houston pair on points).
  Dowdle (IR, Q, toe; not in any FantasyPros list, so not expected to play). Mahomes-for-Tuten
  would change this group.
- **WR:** McMillan, bye.
- **TE:** Sadiq (TE16; his back injury cost him no role in Wk4 at 69% of snaps, but the Jets have the
  slate's lowest total). Pitts (TE23, grade F; targets 3/2/3 all season).
- **QB:** Mahomes, bye.
- **K:** Pineiro (K10).

### Close call: RB2, Montgomery vs. Marks (usage and ECR disagree)

- **ECR says Montgomery:** RB25 vs. RB32, with narrow ranges on both (low expert disagreement).
- **Usage leans Marks:** Montgomery gets more carries (6/11/10 vs. 8/5/6) and more snaps (31 vs. 24
  in Wk4), but Marks has outscored him three weeks running (6.0/8.6/8.2 vs. 3.4/5.8/4.3) on targets
  (6/1/1). Weighted opportunity (0.5×carries + 1.5×targets) is about 6.5 vs. 7.2 per game.
- **Call: Montgomery**, on ECR. The usage edge is small and the `season-lessons.md` backtest found a
  mechanical RB usage rule unreliable. Logged in `reference/source-accuracy.md` as a test case.
- Props weren't posted yet (Tuesday). Re-check Thursday/Saturday. If Marks' line is clearly higher,
  flip it.

### Vegas (implied totals)

From [sportsbrackets.net's Week 5 odds sheet](https://sportsbrackets.net/wp-content/uploads/2026/09/nfl-week5-pickem-odds-sheet.pdf)
(look-ahead lines captured 9/7, so stale) and the BUF/DET/CHI lines from the same site's
[Week 5 page](https://sportsbrackets.net/?p=41081). **Re-check before Sunday.**

| Game | Spread | Total | Our team's implied |
|---|---|---|---|
| BUF at LAR (MNF) | LAR -3.5 | 53.5 | BUF 25.0 |
| HOU at TEN | HOU -3.5 | 43.5 | HOU 23.5 |
| DET at ARI | DET -8.5 | 48.5 | DET 28.5 |
| TB at DAL (TNF) | DAL -3.5 | 52.5 | DAL 28.0 |
| CHI at GB | GB -3.5 | 49.5 | CHI 23.0 |
| NYG at WAS | WAS -2.5 | 48.5 | NYG 23.0 |
| CLE at NYJ | NYJ -1.5 | 39.5 | NYJ 20.5 |
| CIN at MIA | CIN -6.5 | 49.5 | CIN 28.0 / MIA 21.5 |
| MIN at NO | MIN -1.5 | 44.5 | NO 21.5 (vs. our DEF) |

### Weather (outdoor games, passing/kicking slots)

| Player | Game | Forecast | Flag? |
|---|---|---|---|
| Burden (flex) | CHI at GB | High 68°F, thunderstorms possible ([weatheronthisday.com](https://weatheronthisday.com/54301/10/11)). 5-day forecast, low confidence | Re-check Saturday |
| Likely (TE) | NYG at WAS | Not checked yet | Re-check Saturday |
| McPherson (K) | CIN at MIA | Not checked yet | Re-check Saturday |

Allen (SoFi), St. Brown (ARI dome), Pickens (DAL) and the Vikings DEF (NO dome) are indoors.

### Matchup grades: not gathered yet

A Tuesday search found no usable 2026 defense-vs-position table (only
[Sharp Football's tool](https://www.sharpfootballanalysis.com/fantasy/nfl-defense-vs-position-expected-fantasy-points-allowed/amp/),
which needs interactive filtering). They're a tiebreaker only (7/21 season hit rate), and every call
above was decided by usage, ECR or Vegas. Gather them Saturday for the accuracy tracker.

## Injury/Availability Report (cached)

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Rico Dowdle | Q (Yahoo), on our IR | Toe. Missed Wks 3-4. Not listed in FantasyPros Wk5 rankings. **Q on IR blocks every add (Error #845)** | 2026-10-06 | [RotoBaller](https://www.rotoballer.com/?p=1953123), Yahoo roster |
| Kenyon Sadiq | No tag | Back injury limited him all of Wk4's practice week; played 22/32 snaps Wk4. No Wk5 report yet (practice starts Wed) | 2026-10-06 | [Fantasy Footballers](https://www.thefantasyfootballers.com/news/640079/kenyon-sadiq-dealing-with-back-issue/) |
| Isaiah Likely | No tag | Nothing new found. Played 44/67 snaps in Wk4 | 2026-10-06 | Yahoo roster, Sleeper |
| Ollie Gordon II | No tag | Jaylen Wright back from injury but out-snapped 22-12 in Wk4. Coaches say both "will have their roles" | 2026-10-06 | [RotoBaller](https://www.rotoballer.com/?p=1953158), Sleeper |
| David Montgomery / Woody Marks | No tag | No injury news; role unchanged | 2026-10-06 | [NFL.com](https://www.nfl.com/news/texans-view-david-montgomery-as-a-three-down-back) |
| All other starters | No tag | Allen, St. Brown, Pickens, Burden, McPherson: no Yahoo tag, no news | 2026-10-06 | Yahoo roster |

Legal watch list: Pickens' PED rumor is still unverified (10 checks, and he keeps playing). Nothing
new on our roster.

### Yahoo alerts (`get-alerts.js 5`)

- **Dowdle, Pitts, Sadiq dropping** (5.3k, 3.3k, 3.3k drops): reactions to known news (Dowdle's toe,
  Pitts' four quiet weeks, Sadiq's 0). None changes anything; Pitts and Sadiq are already benched.
- **Gordon and McPherson adding**: consistent with starting them.
- **Knights:** dropping the Bills DEF (18k drops, likely the LAR matchup) and Sutton. Tee Higgins is Q.
  No transactions involve us since our Wk4 claims and the McPherson add.
- **No pending claims.** Waiver priority 9th. IR 1 of 2 used.

### Waivers (process Wed Oct 7)

None of the targets beats this week's starters (Robinson Jr. RB42, Mitchell RB35, Hockenson TE14 vs.
Likely TE8). They're depth claims. Before any claim, **move Dowdle off IR or the add will be blocked.**
If the bench is full, that means a drop first (Pineiro or Pitts).

### Drop analysis (2026-10-06, Tuesday)

**Roster count:** 15 of 15 active (named players only; the "(Empty)" BN rows are placeholders),
plus Dowdle on IR. Dowdle's tag reset from O to Q, so his IR slot is illegal and Yahoo will block
every add (Error #845), the same as Wk4. Moving him to BN makes 16 active, so **the first drop is
forced by any transaction at all**. A waiver claim on top of that needs a second drop.

**Byes ([NFL.com](https://www.nfl.com/news/2026-nfl-schedule-release-every-team-bye-week)) change
who's expendable:**

| Week | Our players on bye |
|---|---|
| 5 | McMillan, Mahomes |
| **6** | **St. Brown (DET), Gordon (MIA), McPherson (CIN), Vikings DEF (MIN)** |
| 7 | **Allen (BUF)** |
| 8 | Montgomery + Marks (HOU), Likely (NYG), Pineiro (SF) |
| 9 | Dowdle (PIT) |
| 10 | Burden (CHI) |
| 11 | Pitts (ATL) |
| 13 | Sadiq (NYJ) |
| 14 | Pickens (DAL) |

**Drop ranking**

1. **Kyle Pitts: drop now.** He's the third TE behind Likely (TE8) and Sadiq (TE16), ranked TE23 with
   an F grade. Targets have been 3/2/3/3 and he's scored 9.2 points in four weeks. He covers no bye.
2. **Eddy Pineiro: keep through Week 6, then he's next.** He's our only cover for McPherson's Wk6
   bye. After that he's a dead roster spot, since kickers can be streamed from free agency.
3. **Woody Marks / Kenyon Sadiq: hold for now.** Marks is RB depth for Gordon's Wk6 bye (our RB room is
   thin). Sadiq is the only TE cover for Likely's Wk8 bye.
4. **Rico Dowdle: hold one more week.** He missed Wks 3-4 with a toe injury and wasn't practicing as
   of the last report ([RotoBaller](https://www.rotoballer.com/?p=1953123)). If Pittsburgh lists him
   Out again, his tag should return to O and he can go back on IR for free. If he's still out with no
   timeline after Wk5, he becomes the drop for the Wk6 DEF add.
5. **Patrick Mahomes: don't drop.** He's Allen's Wk7 bye cover and the chip for trade #11.

**Coming next week:** the Vikings' Wk6 bye forces a DEF pickup, which needs another drop (Pineiro
can't go until after Wk6, so it'll be Dowdle, Marks or Sadiq depending on Dowdle's news).

### Roster moves made (2026-10-06, 3:55 pm; verified with `get-matchup 5` / `get-alerts 5`)

- Dropped **Kyle Pitts** (to waivers). Moved **Dowdle** IR → BN (Q). IR now 0 of 2, 15 of 15 active.
- Lineup set: Gordon RB, Likely TE, Burden W/R/T. Marks, Sadiq and McMillan (bye) on BN.
- No pending claims. Adds are unblocked.

### Trades and free agents review (2026-10-06, evening)

- **Trade #11 (Mahomes for Tuten): send tonight**, before Wednesday's waivers. See `trades.md`.
  Mahomes' Wk7 cover for Allen is replaceable: Stafford (QB2 this week) and Love are free agents.
- **#12 (Mahomes for Hubbard)** is the fallback only.
- **No free-agent adds worth a drop this week.** The best RBs available are Allgeier (RB33), Mitchell
  (RB35) and Robinson Jr. (RB42), none better than Marks (RB32). Hunter Henry (TE15) is roughly even with Sadiq (TE16).
- **Week 6 plan:** add a DEF for the Vikings' bye (Broncos, Bengals, Cowboys, Commanders and others
  are available; pick from the Wk6 matchups). Pineiro covers McPherson. If #11 goes through, Montgomery
  and Tuten start at RB while Gordon is off.
- **2026-10-06 evening: trade #11 sent** (Mahomes for Tuten, straight up). Pending. If it's accepted:
  start Tuten over Montgomery this week (RB15 vs. RB25), and plan a free-agent QB for Allen's Wk7 bye.
- **2026-10-07: trade #11 rejected.** Dusty added Kirk Cousins off waivers instead. #12 (Hubbard) is a
  free long shot. #13 (Croskey-Merritt) was considered and dropped. Mahomes has almost no trade value
  while Stafford (QB2) is a free agent, so he stays as Allen's Wk7 cover. See `trades.md`.

## Pre-game check #2 (2026-10-08, Thursday before TNF; `pre-game-check`)

Live: `get-matchup 5`, `get-alerts 5`, `fantasypros-ecr.js` (41-42 experts, updated 10/08). User: no
pending trades, no other concerns. Trade #11 rejected (see `trades.md`). Stafford is now rostered by
4th Qtr Maria.

### Lineup: no changes

| Slot | Start | ECR 10/08 (range) | Implied total (fresh) | Note |
|---|---|---|---|---|
| QB | Allen | QB1 (1-1) | BUF 25.75 (at LAR -3, 54.5) | |
| RB | Montgomery | RB23 (20-28) | HOU 22.75 (-7.5, 38) | Gap over Marks widened (RB35, 29-37). Props not found |
| RB | Gordon | RB25 (21-31) | MIA 18.0 (+6.5, 42.5) | Total fell 3.5 pts, still ahead of Marks |
| WR | St. Brown | WR3 (2-4) | DET 30.0 (-5.5, 54.5) | |
| WR | Pickens | WR14 (12-20) | DAL 28.5 (-8.5, 48.5) | Not on the TNF out/inactive lists. Locked tonight |
| TE | Likely | TE7 (4-10) | NYG 19.0 (+3.5, 41.5) | **Q: knee/groin, limited Wed + Thu.** See below |
| W/R/T | Burden | WR20 (18-25) | CHI 23.5 (-1.5, 45.5) | |
| K | McPherson | — | CIN 24.5 | |
| DEF | Vikings | — | NO 19.75 (MIN -2.5, 42) | |

Lines: [Fox Sports Week 5 odds](https://www.foxsports.com/stories/nfl/2026-nfl-odds-week-5-lines-spreads-results-all-15-games),
[Yahoo Week 5 spreads](https://sports.yahoo.com/nfl/betting/article/2026-nfl-week-5-odds-betting-full-list-of-week-5-spreads-143316022.html),
checked 2026-10-08. They replace the stale 9/7 look-ahead lines above.

### TE: Likely stays, decide finally on Friday's report

- **Health tier: High (provisional).** Groin is soft tissue, and he was limited Wed and Thu. He also
  qualifies for the recently-returned bump if he's designated Friday. Reports call it soreness and
  expect him to play ([NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-10-07/isaiah-likely-knee-groin-limited-to-begin-week-5),
  [RotoWire](https://www.rotowire.com/football/headlines/isaiah-likely-injury-another-limited-practice-641390)).
- **Why he still starts:** this isn't close. Usage is targets 10/5/12 vs. Sadiq's 3/8/4, and ECR is
  TE7 vs. Sadiq TE15. The experts ranked him with the injury known. The High tier is a tiebreaker,
  and it doesn't overcome a gap that size.
- **Alternatives ranked:** Sadiq TE15 (NYJ 20.5; back injury Wk4, so he gets the soft-tissue bump too,
  game 2 of 3). Free agent Hockenson TE13 (MIN 22.25), but MIN is on bye Wk6, and an add needs a drop.
  Free agent Henry TE16.
- **Friday trigger:** if Likely is **Doubtful/Out**, start Sadiq. If he's Q with a full Friday
  practice, he drops to Medium. If he's Q and limited again, keep him (High, but the gap holds).

### Close-call log update

RB2 Montgomery vs. Marks: ECR now RB23 vs. RB35, Montgomery's lead widened. No prop lines found.
TE Likely vs. Sadiq: Likely's health tier is High (provisional), and the call is unchanged.

### Injury cache refresh (2026-10-08)

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Isaiah Likely | Q (Yahoo) | Knee/groin, limited Wed + Thu. Expected to play. Tier High (provisional) | 2026-10-08 | [NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-10-07/isaiah-likely-knee-groin-limited-to-begin-week-5), [RotoWire](https://www.rotowire.com/football/headlines/isaiah-likely-injury-another-limited-practice-641390) |
| George Pickens | No tag | Not on the TNF out/inactive lists (DAL out: Durant, Overshown, Shelton; Porter Jr. late scratch) | 2026-10-08 | [Yahoo Sports](https://sports.yahoo.com/articles/buccaneers-cowboys-final-injury-report-010757745.html), [SI](https://www.si.com/nfl/cowboys/onsi/joey-porter-jr-shockingly-headlines-dallas-cowboys-week-5-inactives-vs-buccaneers) |
| Rico Dowdle | Q (Yahoo), BN | Toe (dislocated). Limited Wed + Thu, first practice in 2+ weeks. McCarthy: "up in the air." RB68. Stays on the bench | 2026-10-08 | [RotoWire](https://www.rotowire.com/football/headlines/rico-dowdle-injury-officially-limited-wednesday-641206), [Steelers Depot](https://steelersdepot.com/2026/10/steelers-week-five-thursday-injury-report-two-players-dnp-three-others-limited/) |
| Kenyon Sadiq | No tag | No new Wk5 news found. Bump applies (back, Wk4) | 2026-10-08 | search, nothing new |

## Pre-game check #3 (2026-10-09, Friday final injury reports; `pre-game-check`)

Live: `get-matchup 5`, `get-alerts 5 3` worked, so no questions were asked. No pending trades or
claims. Waiver priority 8, IR 0 of 2. Pickens already played TNF: **23.5 pts**.

- **Likely: full practice Friday, no designation. He starts.** His Yahoo Q is gone. Tier: Low by
  practice, bumped to **Medium** by the recently-returned rule (game 1 of 3, since groin is soft
  tissue). It doesn't matter here: no close call at TE (TE7 vs. Sadiq TE15). Sources:
  [NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-10-09/isaiah-likely-knee-groin-good-to-go-for-week-5),
  [CBS Sports](https://www.cbssports.com/fantasy/football/news/giants-isaiah-likely-good-to-go-for-week-5/).
  Log him in the tier tracker after the game ("Yes, game 1 of 3").
- **Other starters:** no Yahoo tags.
- **Dowdle:** still Q on Yahoo, on the bench. No final designation found yet
  ([Steelers.com report](https://www.steelers.com/news/week-5-injury-report-colts)). Nothing to do.
- **Alerts:** Sadiq and Dowdle dropping, Gordon adding, all already known. The Knights added the
  Broncos DEF and KC Concepcion Jr., which doesn't change anything for us.
- **Lineup: no changes.**

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Isaiah Likely | No designation | Full practice Fri after limited Wed/Thu (knee/groin). Tier Medium (recently-returned bump) | 2026-10-09 | NBC Sports, CBS Sports (above) |

## Pre-game check #4 (2026-10-10, Saturday final; `pre-game-check`)

Auth refreshed. `get-matchup 5`, `get-alerts 5 2` and `fantasypros-ecr.js` (updated 10/11) all
worked, so no questions were asked. No pending trades or claims.

- **Lineup: no changes.** ECR: Montgomery RB22, Gordon RB23 (Marks RB33), Burden WR21, Likely TE7
  (Sadiq TE15), St. Brown WR3.
- **Final reports** ([CBS Sports](https://www.cbssports.com/nfl/news/nfl-week-5-injury-report-eagles-saquon-barkley-devonta-smith-out/),
  [NFL.com](https://www.nfl.com/news/nfl-week-5-injury-report-player-statuses-for-all-15-games)):
  none of our starters is designated.
  - **Bears: Caleb Williams Q (hamstring, Grade 2); Tyson Bagent expected to start**
    ([NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-10-09/williams-hamstring-q-tag-bagent-likely-starts)).
    That's a downgrade for Burden, but ECR (WR21, updated after the news) still puts him far ahead of
    the flex alternatives (Marks RB33, Sadiq TE15). He stays.
  - **Dolphins: Jaylen Wright Q (foot).** Good for Gordon's share.
  - Bills: DJ Moore Q, Josh Palmer out. A slight volume boost for Allen's pass catchers, nothing to change.
- **Weather:** Green Bay sunny, 76°F, wind 11 mph SSW
  ([WeatherBug](https://www.weatherbug.com/markdown/weather-forecast/10-day-weather/green-bay-wi-54304)). No flag.
- **League:** THE Lil Unk Rayrays and 4th Qtr Maria traded Jaylen Waddle for Aaron Jones Sr. (Oct 10).
  Doesn't involve us. Our opponent (the Knights) is adding Sutton and the Broncos DEF per trends.
- **Pickens** already has 23.5 pts.

## Pre-game check #5 (2026-10-11, Sunday before 1 pm kickoffs; `pre-game-check` + `waiver-targets`)

Live: `get-matchup 5`, `get-alerts 5 3`, `get-free-agents.js` (all positions), `fantasypros-ecr.js`.
User moved Dowdle BN → IR this morning (his tag is back to O, so the slot is legal).

- **Lineup: no changes.** No starter has a tag or is on an inactive list. Tee Higgins (Knights) is active.
- **Pineiro:** the user saw something about him being out. No report found and no Yahoo tag
  ([search](https://www.rotowire.com/football/headlines/eddy-pineiro-injury-expected-to-play-sunday-638058)
  only turned up his Wk2 illness). He's on the bench anyway. The "out" was likely **Dowdle**, inactive again
  ([NFL.com](https://www.nfl.com/news/week-5-injuries-sunday-pregame-2026-nfl-season),
  [Steelers.com](https://www.steelers.com/news/steelers-inactives-for-week-5-vs-colts)).
- **Why add before kickoff:** free agents go to waivers once their game starts (TNF/London players
  already show "W (Oct 14)"). Adding before 1 pm skips our 8th waiver priority.

### Free-agent moves (2026-10-11, 9:41-9:44 am PT; verified with `get-matchup 5` / `get-alerts 5 1`)

| Move | ECR | Why |
|---|---|---|
| **Add Alvin Kamara (NO)** into the open bench spot | RB28 | Leads the NO committee with Etienne on IR; active today (back, Q) ([NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-10-11/alvin-kamara-back-active-for-week-5-vs-vikings)). Wk6 RB2 option with Gordon on bye |
| **Add Keaton Mitchell (LAC), drop Woody Marks** | RB32 vs. RB35 | Role rising (out-snapped Hampton Wk4, 10 carries) ([RotoBaller](https://www.rotoballer.com/player-news/keaton-mitchell-carries-deep-league-flex-appeal-in-week-5-vs-broncos/1963140)). Marks shared Montgomery's Wk8 bye |

Roster: 15 of 15 active, Dowdle (O) on IR (1 of 2). **Wk8 bye note:** Kamara (NO) shares the HOU Wk8 bye
with Montgomery, so Gordon + Mitchell are the Wk8 RBs.

**Week 6 DEF (Vikings bye):** not added yet; 22 DEFs are FAs. Candidates: Colts vs. TEN, 49ers vs. WAS,
Saints vs. NYG ([RotoBaller](https://www.rotoballer.com/fantasy-football-defense-d-st-rankings-streamers-for-weeks-5-6-7-8-2026/1959760)).
Needs a drop before Wk6. Sadiq is the likely one (TE14, about even with FA Henry). Pineiro (McPherson's Wk6 cover) and Mahomes (Allen's Wk7 cover) stay until their bye weeks pass.

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Rico Dowdle | O, inactive Wk5 | Toe. On our IR (legal again) | 2026-10-11 | NFL.com, Steelers.com (above) |
| Eddy Pineiro | No tag | No Wk5 injury report found | 2026-10-11 | search, Yahoo roster |
| Alvin Kamara | Q (back), active | Leads NO committee | 2026-10-11 | NBC Sports (above) |

## Post-game check (2026-10-13, Tuesday; `post-game-check`)

Auth refreshed. `get-matchup 5`, `get-scoreboard 5`, `get-all-rosters`, `run-challenge 5`, `get-free-agents`
(all, RB, DEF, TE, WR) and `fantasypros-ecr.js` (Wk6, 21 experts, updated 10/13) all worked, so no
questions were asked.

**Result: W 132.60 – 131.04 vs. Knights Who Say Ni (now 1-4).** Allen 31.5, Likely 26.9, Pickens 23.5,
Gordon 14.8, Vikings 11, St. Brown 9.9, McPherson 7, Burden 6.9, Montgomery 1.1. The Knights benched
McLaurin (10.2) and Sutton (8.8) and started RJ Harvey (0.7); either swap wins it for them. Jaylen
Warren's 33.8 nearly did it anyway.

**Challenge ("Gotta Catch Jamaal", top starting RB):** Russini's Source, Jahmyr Gibbs 35.2 (Warren
33.8, Irving 30.5). Ours: Gordon 14.8. Pre-stat-correction.

**Montgomery: groin injury in the 2nd quarter, ruled out, no timeline** ([RotoBaller](https://www.rotoballer.com/?p=1963765),
[RotoBaller](https://www.rotoballer.com/?p=1963820)). Yahoo tag D, so he isn't IR-eligible until it
turns O. He isn't in the Wk6 FantasyPros RB rankings. **Woody Marks (whom we dropped Sunday) took over:
85% of snaps, 15 carries, 4 targets, 10.5 half-PPR.** He's on waivers (clears Oct 14) and is RB25 for Wk6.

### Week 6 waiver plan (process Wed Oct 14)

| Priority | Move | ECR Wk6 | Why |
|---|---|---|---|
| 1 | **Claim Woody Marks**, drop **Kenyon Sadiq** | RB25 | Houston's lead back while Montgomery is out. Sadiq: 19% of snaps in Wk5, not in the TE top 20 (Likely is TE4) |
| 2 | **Claim Chiefs DEF** (vs. LAC), drop **Keaton Mitchell** | DST2 | Vikings on bye. Patriots (DST3 vs. NYJ) and Ravens (DST5) are also free agents, as backups |

- Keep Pineiro (K6 this week, McPherson's bye) and Mahomes (Allen's Wk7 bye), per the earlier plan.
- If Montgomery's tag turns O, move him to IR and keep Mitchell instead.
- **Wk6 lineup sketch:** Allen; RB Marks + Kamara (RB28); WR Pickens (WR16) + McMillan (WR13); TE Likely;
  W/R/T Burden (WR20); K Pineiro; DEF Chiefs. St. Brown, Gordon, McPherson and the Vikings are on bye.
- Trade: #14 (Burden for Chase Brown, Lil Unk) is the top candidate. Send it after the Marks claim.
  See `trades.md`.
- Season acquisition cap is 60. The used count wasn't checked this pass.

### Roster moves (2026-10-13, after the post-game check; verified with `get-matchup 6` / `get-alerts 6 1`)

- **Dropped Rico Dowdle from IR.** His tag reset O → Q again, which made the IR slot illegal and
  blocked adds (Error #845). He'd missed 3 straight games, and Warren owns the PIT backfield. IR is
  now 0 of 2, 15 of 15 active.
- **Marks claim blocked: Error #245** ("You cannot add a player you dropped until the waiver period
  ends"). We dropped him Sunday, so we can't claim him this cycle. **Lesson: dropping a player locks
  us out of re-adding him until he clears waivers, so weigh that before dropping someone whose role
  could grow** (Marks was Montgomery's direct backup).
- **Revised Wk6 plan:** claim the Chiefs DEF, dropping Sadiq. On Wed after waivers clear, if Marks goes
  unclaimed, add him as a free agent and drop Mitchell. No other free-agent RB beats Kamara and
  Mitchell (Corum RB30, B. Robinson RB31, K. Miller RB32). Trade #14 (Burden for Chase Brown) is now
  the main path to an RB2.
- **Claim submitted (2026-10-13):** add Chiefs DEF, drop Kenyon Sadiq. Processes Oct 14. Verified pending
  via `get-alerts 6 1` (claim 2_100012_42638, waiver priority 8).
- **Backup claim (2026-10-13):** add Patriots DEF, drop Sadiq, order 2 behind the Chiefs (verified
  via `get-alerts 6 1`). If the Chiefs claim succeeds, Sadiq is gone and this claim fails on its own.
- **Wk6 lineup set (2026-10-13, verified `get-matchup 6`):** Allen; RB Kamara + Mitchell; WR Pickens +
  McMillan; TE Likely; W/R/T Burden; K Pineiro. Benched: St. Brown, Gordon and McPherson (byes) and
  Montgomery (D, groin). **DEF is still the Vikings (bye): swap in the Chiefs or Patriots after Wed waivers.**
- **Trade #14 accepted (2026-10-13, 12:36 pm):** McMillan → Lil Unk for Chase Brown. In the 2-day veto
  window. McMillan stays in the Wk6 lineup until it processes. Afterward: Brown to BN (CIN bye Wk6),
  and fill the WR slot McMillan leaves (Burden moves to WR; flex goes to Marks if added, or a free-agent WR).
- **Waivers processed (2026-10-14; verified `get-matchup 6` / `get-alerts 6 1` / `get-all-rosters`):**
  the Chiefs claim succeeded (Sadiq dropped), and the Chiefs are in the DEF slot vs. LAC. The Patriots backup
  failed as intended. **Marks was claimed by 4th Qtr Maria.** Trade #14 is still in the veto window, not
  processed. Plan once it processes: add a free-agent WR (Shakir or Worthy) for the flex, drop McPherson
  (or move Montgomery to IR if his tag turns O).

### Week 6-8 plan (updated 2026-10-14)

**Keep the Vikings DEF.** It's fantasy's #1 defense over Wks 1-5 (13.0 per game: 10/18/17/9/11, Sleeper).
The Chiefs are a one-week rental for the Vikings' bye. Ravens and Patriots were claimed by others.
Free-agent DEF fallbacks for later: **Raiders** (12.0 per game, #2, but 15/16/16/1; check the matchup),
49ers (9.0, #4), Jaguars (waivers until Oct 16).

**Keep McPherson.** He's perfect on FGs in 2026, 5 of them from 50+
([Roundtable](https://roundtable.io/sports/nfl/bengals/players/evan-mcpherson-earns-recognition-for-red-hot-start-to-2026)).
Pineiro is a Wk6-only fill-in. His health history: kicking-leg hamstring Nov 2025, illness Wk2 2026.
If he's hurt before Sunday, swap in a free-agent K.

**Montgomery: week-to-week (groin)** ([RotoBaller](https://www.rotoballer.com/?p=1964436)). Likely out Wk6,
probably Wk7, and HOU is on bye Wk8, so Wk9 at the earliest. Yahoo tag D (not IR-eligible).

| When | Move |
|---|---|
| **Thu/Fri (HOU injury report)** | If Montgomery's tag is **O**: move him to **IR** and add **Brenton Strange** (TE12). No drop. If he's still **D** on Friday: add Strange and **drop Montgomery** (RB68, likely out until Wk9). Mahomes stays (see refresh below) |
| When trade #14 processes | Lineup: Burden → WR, Strange → W/R/T, Brown → BN (CIN bye). Strange stays on BN until then |
| Before Sunday | Check Pineiro is active. If Strange was claimed by someone else, add Freiermuth (TE13) or Higbee (TE15) instead |
| After Wk6 | Drop the **Chiefs** (Vikings back) and **Pineiro** (McPherson back). That frees 2 spots |
| Wk7 | Allen on bye: start **Mahomes** |
| Wk8 | Likely on bye: start **Strange** at TE (JAX plays Wk8; its bye is Wk7). Kamara (NO) is also on bye Wk8: RBs Brown, Gordon, Mitchell |

**Why the plan changed (2026-10-14, critical review):**
- **The TE add replaces the Tucker idea.** Freiermuth (FLEX 76 vs. Tucker 66, about a 1-pt gap) fills the Wk6
  flex and also covers Likely's Wk8 bye plus his knee/groin risk.
- **Freiermuth's usage:** targets 5/5/4/5/7, 60-75% of snaps, 10.2 per game. Darnell Washington's 53-76% of
  snaps caps his ceiling.
- **Higbee is the closest alternative:** targets 11/6/6 over the last 3 weeks, 12.1 per game.
- **Montgomery isn't dropped yet.** HOU will likely rule him out for London, which should flip his tag to O
  and make him IR-eligible for free.
- **Our RB depth is fragile:** Brown/Perine split in Wk5, Gordon/Wright, Kamara in a committee, Mitchell at
  about 35% of snaps. Montgomery (RB22-25 when healthy) is a stash worth keeping from Wk9.

**Free-agent refresh (2026-10-14, later; `get-free-agents` all positions + ECR updated 10/14):**
- **Jordan Love was claimed.** The best free-agent QBs now are Caleb Williams QB13 (Grade 2 hamstring),
  Stroud QB15 (waivers until Oct 16), Brissett, Rodgers. Streaming a QB in Wk7 would cost about 4-6 pts vs.
  Mahomes (QB11), so **Mahomes stays, and Montgomery is the Friday fallback drop.**
- **TE pick switched to Strange** (TE12; targets 8/8 and 81-87% of snaps over the last 2 weeks; no
  committee) over Freiermuth (TE13, shares snaps with Darnell Washington). Higbee is TE15.
- **No changes elsewhere.** Chiefs are now DST1 for Wk6, Pineiro is K5, and Butker (K7) is a free-agent
  backup K. The best free-agent RB is Corum (RB29), about even with Mitchell (RB30). Tucker (WR31) is
  still available. The Raiders DEF is still available for later.
