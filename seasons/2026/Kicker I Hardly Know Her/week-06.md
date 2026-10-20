# Week 6 — vs. True & Living 12th Gospel (0-5)

## Matchup gap check (2026-10-14, Wed; `lineup-advice`)

Data: `get-matchup 6`, `get-free-agents` RB/WR, `fantasypros-ecr.js` (14 experts, updated 10/15), Sleeper Wks 3-5.

**Their starters:** Love QB5, Cook RB8, Stevenson RB11, Watson WR4, Doubs WR28, Bernard WR30, McBride TE3, Smack K, Jets DEF.
Bench: Downs WR23 (Q), Judkins RB23 (Q), Loveland TE16, Pierce RB29, K. Allen WR35.
**Ours:** Allen QB1, Kamara RB27 (Q back), Mitchell RB31, Pickens WR13, McMillan WR16, Likely TE4, Burden WR19 (FLEX 43), Pineiro, Chiefs.
The gap is at RB: RB27/RB31 vs. RB8/RB11. No free-agent RB beats ours (Corum RB30, K. Miller RB32, B. Robinson RB33).

Trade #14 (McMillan out, Brown in, CIN bye) costs about 7 pts in Wk6 once it processes. It can't be withdrawn.

| FA candidate | ECR | FLEX | Wk3-5 snaps | Targets | Half-PPR |
|---|---|---|---|---|---|
| Wan'Dale Robinson (TEN at IND) | WR31 | 66 | 63/67/75% | 11/5/7 | 15.2/9.5/8.3 |
| Tre Tucker (LV vs. BUF) | WR32 | 67 | 57/67/75% | 4/8/5 | 6.3/6.4/5.5 |
| Jakobi Meyers (JAX vs. HOU) | WR34 | 71 | 81/82/85% | 8/4/3 | 15.9/4.8/4.7 |
| Brenton Strange (JAX vs. HOU) | TE12 | 73 | 77/87/81% | 5/8/8 | 4.7/13.0/10.3 |

Our RBs: Kamara 32/38/27% snaps, carries 9/7/3, 4.6/20.3/1.6. Mitchell 38/37/34%, carries 8/10/6, 12.2/8.8/4.4.
Kendre Miller (NO, FA) 19/26/31%, carries 4/6/10. He's the pivot if Kamara's back keeps him out.
Mitchell (LAC at KC) plays against our own Chiefs DEF. That's a small negative correlation, not worth a swap at RB30 vs. RB31.

### Decision (2026-10-14): no reactive moves; wait until Friday

User chose not to chase the one-week projection. Friday (Oct 16) checklist:
- Montgomery tag **O** → move to IR, add Wan'Dale Robinson (no drop). Still **D** → drop Montgomery for Robinson.
- Once trade #14 processes: Burden → WR, Robinson → W/R/T, Chase Brown → BN (CIN bye).
- Kamara: swap to Kendre Miller only if he's ruled out or clearly limited on the final report.
- Fallbacks if Robinson is gone: Tucker (FLEX 67), Meyers (71), Strange (73).

## Pre-game check (2026-10-16, Fri; `pre-game-check`)

All scripts worked (`get-matchup 6`, `get-alerts 6 3`, `get-free-agents WR`, `fantasypros-ecr` updated 10/16, `run-challenge 6`).
**Trade #14 processed** (Oct 16, 12:38 am): McMillan out, Chase Brown in (BN, CIN bye). **Montgomery is on IR (O)**, 1 of 2.
That leaves 14 of 15 active, one open spot, and an **empty WR slot**.

**Vegas (Fox Sports/CBS/ESPN, 10/14-16):** BUF -5.5 at LV, O/U 53.5 (BUF 29.5, LV 24). TEN at IND -6.5, 44.5 (TEN 19).
LAC at KC -8.5, 42.5 (LAC 17, KC 25.5). DAL at GB -1.5, 52.5 (DAL 25.5). NO -1.5 at NYG, 46 (NO 23.75, NYG 22.25).
ARI at LAR -12.5, 51.5 (LAR 32).

**Weather:** no forecast found for Green Bay, East Rutherford or Santa Clara (Pickens, Likely, Pineiro). Recheck Sunday. LV and ATL are domes.

**Calls:**
- **WR slot: Tre Tucker** (WR31, FLEX 64; LV implied 24) over Wan'Dale Robinson (WR33, FLEX 68; TEN 19). WR follows ECR + Vegas.
  Robinson has more targets (11/5/7 vs. 4/8/5), so this is logged as an ECR-vs-usage test case. No drop needed (open spot).
- **RB2: Blake Corum over Keaton Mitchell** (RB30 vs. RB32; LAR implied 32 vs. LAC 17). It also removes Mitchell's negative
  correlation with our Chiefs DEF. Drop Mitchell (~35% snaps; RB depth from Wk7 is Brown, Gordon, Kamara).
  Corum's snaps are volatile (29/15/27%), so this is a TD-upside bet in the week's highest-total offense.
- **Kamara: keep (RB27)**, tier High (back, limited Wed + Thu). Watch the Friday designation. If he's Doubtful/Out, start Kendre Miller (RB31) if he's still free.

## Injury/Availability Report (cached)

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Alvin Kamara | Q, LP Wed/Thu (back) | Tier High (soft tissue); play risk medium, limited risk high | 2026-10-16 | [Saints Wed](https://www.neworleanssaints.com/news/injury-report-new-york-giants-vs-new-orleans-saints-2026-nfl-week-6-wednesday), [Saints Thu](https://www.neworleanssaints.com/news/injury-report-new-york-giants-vs-new-orleans-saints-2026-nfl-week-6-thursday) |
| Isaiah Likely | Full practice (foot) | Tier Low | 2026-10-16 | [Saints Wed report](https://www.neworleanssaints.com/news/injury-report-new-york-giants-vs-new-orleans-saints-2026-nfl-week-6-wednesday) |
| Josh Allen, George Pickens, Luther Burden III | No injury news | Tier Low | 2026-10-16 | search |
| David Montgomery | O (groin), on IR | — | 2026-10-16 | Yahoo |
| Alvin Kamara | **Q (back) on Friday final report** | Tier High (soft tissue, limited Wed-Fri). Same back tweak from Wk4 MNF vs. ATL; played through it Wk5 (27% snaps, 3 carries, 1.6 pts; Miller 10 carries). Saints didn't promote a practice-squad RB, which points to him playing. Play risk low-medium, limited risk high | 2026-10-17 | [Saints Fri](https://www.neworleanssaints.com/news/injury-report-new-york-giants-vs-new-orleans-saints-2026-nfl-week-6-friday) |
| Blake Corum, Tre Tucker | No injury news | Tier Low. Role concerns only (Corum 23% snaps Wks 3-4; Tucker ~59% with Bowers healthy) | 2026-10-17 | search ([RotoBaller](https://www.rotoballer.com/?p=1961872)) |
| Giants (Likely's team) | TE Theo Johnson **Out** (neck) | Fewer TEs competing for targets, a small plus for Likely | 2026-10-17 | [Giants.com](https://www.giants.com/news/giants-vs-saints-week-6-injury-report-abdul-carter-jermaine-eluemunor-dnp) |

## Saturday re-check (2026-10-17; `pre-game-check`)

Scripts all worked (`get-matchup 6`, `get-alerts 6 2`, `run-challenge 6`, ECR updated 10/18). No pending claims or trades. Waiver priority 8, IR 1 of 2.
ECR: Allen QB1, Kamara RB27, Corum RB28, Miller RB31 (still FA), Pickens WR12, Burden WR19, Tucker WR30, Likely TE4.
FLEX: Burden 45, Tucker 62, Kamara 73, Corum 76. **Lineup unchanged.** Kamara stays in: Q, not D, and 4 spots ahead of Miller.
Sunday: if Kamara is inactive (~11:30 ET), swap in Miller. Drop McPherson if Kamara's tag doesn't go to O; if it does, move him to IR instead.
Opponent moved Watson to FLEX and benched Doubs (heavily dropped league-wide) for K. Allen and Bernard.
League moves: Queen of the Damned took **Brenton Strange** (our planned Wk8 TE add). Find another Likely bye cover.
Challenge (Sack Up): Chiefs vs. LAC (implied 17). No DEF change.

**Moves done (2026-10-16, verified `get-matchup 6`):** added Corum (dropped Mitchell), added Tucker. Lineup: Allen; Kamara, Corum;
Pickens, Tucker; Likely; W/R/T Burden; Pineiro; Chiefs. Bench: St. Brown, Gordon, Brown, McPherson, Vikings (all bye), Mahomes. Montgomery on IR.
Still to do: Kamara's Friday designation, Sunday weather, and sending #17 Sunday night.

## Waiver scan (2026-10-16, Fri; `waiver-targets`)

Roster is **15 of 15 active** (the BN "(Empty)" rows are Yahoo placeholders). IR is 1 of 2 (Montgomery). About 11 of 60 adds used.
- **Now: no add.** Every bench player is a bye-week starter (St. Brown, Gordon, Brown, McPherson, Vikings) or Allen's Wk7 cover (Mahomes).
- **If Kamara is ruled Out:** move him to IR (Out makes him eligible) and add **Kendre Miller** (RB30, NO's next back). No drop.
  If he's Doubtful, start Miller only if Kamara can go to IR; otherwise drop McPherson for Miller.
- **Monday/Tuesday after Wk6:** drop the Chiefs DEF (Vikings back) and one K. Pineiro (K3 this week) vs. McPherson: keep McPherson
  per the Wk6-8 plan. That frees 2 spots for **Brenton Strange** (TE12; covers Likely's Wk8 bye; targets 8/8, 81-87% snaps) and
  whatever #17 leaves (Wan'Dale Robinson or Tucker as WR depth if Burden leaves).

## Sunday final check (2026-10-18, 8:34 am; `pre-game-check`)

ECR (10/18): Corum RB27, **Kamara RB29**, Miller RB31; FLEX Corum 73, Kamara 74, Miller 84. Miller still a free agent.
Kamara: Rapoport says expected to play; inactives at 11:30 ET. Heavy (10/18, 7:33 am) reads the depth chart as Miller ahead of Kamara
and notes Kamara "vanished" in the Wk5 second half (3 carries; Miller 10 for 30 and a TD; Donaldson 4).
**Call: Miller over Kamara.** ECR gap is 2 positional spots (within flex coin-flip range), Kamara is tier High with limited risk the
main issue, and usage shows a role shift. Add Miller, drop McPherson, Kamara to BN. Pineiro is the K going forward (SF bye Wk8, stream then).
Logged as a usage-vs-ECR test case in `reference/source-accuracy.md`.
Sources: [Heavy](https://heavy.com/sports/nfl/new-orleans-saints/alvin-kamara-injury-playing-status-revealed-saints-rb-depth-chart-kendre-miller/), [CBS Sports](https://www.cbssports.com/fantasy/football/news/saints-alvin-kamara-slated-to-play-sunday/)
Kamara confirmed **active** 11:33 ET ([DraftSharks](https://www.draftsharks.com/fantasy-football-news/83499/alvin-kamara-active)); call unchanged.
**Moves done (2026-10-18, verified `get-matchup 6`):** added Miller (dropped McPherson). Lineup: Allen; Corum, Miller; Pickens, Tucker;
Likely; W/R/T Burden; Pineiro; Chiefs. Bench: Kamara, St. Brown, Gordon, Mahomes, Brown, Vikings. Montgomery on IR.

## Post-game review (2026-10-20, Tuesday; `post-game-check`, revised scope)

Data: `get-matchup 6`, `get-scoreboard 6`, `run-challenge 6`, `get-alerts 7 4`, Sleeper Wk6 stats. All live, all final; no
questions asked. The user's Yahoo PDF recap matches. (Run Yahoo scripts one at a time: parallel runs gave a false NOT_LOGGED_IN.)

**Result: W 128.20 – 112.74 vs. True & Living 12th Gospel (0-6). We're 2-4 (692.76 PF, 4th-most in the league).**
Tucker 24.2, Likely 20.9, Allen 18.3, Chiefs DEF 15, Burden 13.5, Corum 13.0, Pickens 10.3, Miller 8.0, Pineiro 5.
Bench: Kamara 13.9, Mahomes 11.48. Gospel: Cook 22.8, Love 21.24, Bernard 20.2 (projected 8.6), K. Allen 12.2, McBride 8.8,
Watson 7.9, Stevenson 3.6.

### Decision scorecard (graded on what we knew at decision time)

| # | Decision (when) | What we knew then | Outcome vs. alternative | Cell | Controllable? |
|---|---|---|---|---|---|
| 1 | No reactive moves Wed; wait for Friday (10/14) | One-week projections only; Kamara/Montgomery status unknown | Friday had better info; Tucker and Corum still free | **Right call, paid off** | Yes |
| 2 | Montgomery to IR when tagged O (10/16) | O tag = IR-eligible | Opened the spot for Tucker at no cost | **Right call, paid off** | Yes |
| 3 | Tucker (WR31) over Wan'Dale Robinson (WR33) at WR (10/16) | ECR + Vegas (LV 24 vs. TEN 19) for Tucker; targets for Robinson | 24.2 vs. 3.7 (**+20.5**). Without TDs, 12.2 vs. 3.7 | **Right call, paid off** (size partly luck: 2 TDs) | Pick yes; size no |
| 4 | Corum (RB30) over Mitchell (RB32); drop Mitchell (10/16) | ECR + Vegas (LAR 32 vs. LAC 17); drops the anti-correlation with the Chiefs DEF | 13.0 vs. 0.4 (**+12.6**). Without TDs, 7.0 vs. 0.4 | **Right call, paid off** | Yes |
| 5 | Miller over Kamara Sunday; drop McPherson (10/18) | ECR RB29 vs. RB31 (coin flip); Kamara Q, limited Wed-Fri; Wk5 role shift to Miller; Heavy depth-chart report | 8.0 vs. 13.9 (**−5.9**). Miller got the 20 carries we expected. Kamara's edge was one 6-pt receiving TD (7.9 without it) | **Right call, bad luck**: keep doing it | Call yes; TD no |
| 6 | Burden at W/R/T (FLEX 45) | Best flex ECR on the roster | 13.5 vs. Kamara 13.9 (−0.4), a wash | **Right call, paid off** | Yes |
| 7 | Allen, Likely, Pickens, Pineiro, Chiefs DEF started | Clear starters / only options (McPherson on bye) | Likely 20.9 (TE avg 7.9); Chiefs 15 (DEF avg 5.5); Pineiro 5 (K avg 7.9) | **Right call, paid off** | Mostly chance in size |
| 8 | Trade #14 (McMillan for Chase Brown) cost Wk6 (accepted 10/13) | Expected Wk6 cost about −7 (Brown's bye) | McMillan 11.6; his slot went to Tucker 24.2 (+12.6) | **Right call, paid off** (Wk6 part); rest-of-season TBD | Yes |
| 9 | Trade #17 (Burden for Jones): "send Sunday night" | Planned in the 10/14 notes | **Never sent and never formally dropped** | **Wrong call, got away with it** (no cost; RB is healthy now) | Yes, a process slip |

### Controllable vs. chance

- **Our side:** the hindsight-best lineup was +5.9 (Kamara for Miller). **The gap we could have known about: 0.** Every lineup call
  followed the rules on the information we had.
- **Their side:** Gospel's best bench swaps (Loveland 15.5 for Watson 7.9, Pierce 13.0 for Stevenson 3.6) add up to +17.0. That's
  129.74, which **beats us by 1.5.** Bernard's 20.2 (projected 8.6) was also a ceiling game.
- **So the 15.5-pt margin came from chance:** their bench mistakes (+17.0 for us), Tucker's 2 TDs (+12), and Likely's 99 yds and a TD.
  It ran against us in one place: Kamara's TD. The part we controlled was picking the right players to give luck a chance (Tucker, Corum).

### Lessons learned and proposed process updates

1. **No start/sit rule changes.** The only bad result (Kamara) was a TD on a coin-flip call. Wks 5-6 have 6 scored calls, and TDs
   decide most of them.
2. **Proposed (tracking): score close calls TD-adjusted, too.** Add an "excluding TDs" points pair to `source-accuracy.md`, and score
   sources both ways. Evidence: in Wk6, TDs flip one of three verdicts (usage was right on volume and ECR was right on points).
   Recommendation: **change now**. Tracking only; it doesn't change any lineup rule.
3. **Proposed (rules): define the RB tie window.** "Rules going forward" gives TE (~5 spots) and flex (~10) a coin-flip window but
   not RB, so the Wk6 tiebreak was a judgment call. Wording: *"RB: within ~3 ECR spots it's a coin flip. Break it with usage role
   changes, then the health tier."* That's what we did in Wk6. Recommendation: **change now** (it writes down existing practice).
4. **Proposed (process): close out every "Still to do" item.** #17 was planned and then forgotten. Add to `pre-game-check`: "Re-read the
   week file's 'Still to do' and planned-trade lines; mark each done / dropped (with a reason) / carried over." Recommendation:
   **change now**.
5. **Watch, no change: the health-tier ladder.** High-tier started 1 (Sadiq, bust); High-tier benched 1 (Kamara, a TD boom). n=2.

**Applied 2026-10-20 (user approved #2-4):** ex-TD scoring added to `reference/source-accuracy.md` and the `post-game-check` skill; RB ~3-spot
tie window added to `lineup-advice` and `season-lessons.md` Rules; open to-do close-out added to `pre-game-check`. Grade labels renamed
to plain language (right call, paid off / right call, bad luck / wrong call, got away with it / wrong call, cost us).

### Challenge: "Sack Up" (most sacks by a starting DEF)

Ravens (Knights Who Say Ni) and Steelers (Smokin Base Brian) tied at 5. The tiebreak (higher team score) goes to **Knights, 146.52**
vs. 72.8. Our Chiefs had 4 and finished 3rd. Pre-stat-correction.

### Hand-offs to pre-game

- Burden's snaps fell to 39% (65% over Wks 3-5) with no injury report; check before Wk7.
- Allen has a Wk7 bye (BUF). Likely, Pineiro, Miller and Kamara have Wk8 byes (NYG, SF, NO).
- Mahomes is spare after Wk7. The trade options logged in `trades.md` (post-Wk6 re-check) need a pre-game look.
- Legal watch: Jacobs (Dusty's bench) is off the exempt list, eligible Wk7; the NFL review is still open (row already updated).
