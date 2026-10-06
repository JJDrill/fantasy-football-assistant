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
