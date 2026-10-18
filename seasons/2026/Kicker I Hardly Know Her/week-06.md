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
