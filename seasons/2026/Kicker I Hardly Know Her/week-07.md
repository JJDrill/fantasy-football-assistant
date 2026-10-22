# Week 7 — vs. 4th Qtr Maria (3-3)

## Pre-game check #1 (2026-10-20, Tue; `pre-game-check`, first check of the week)

Scripts (run one at a time): `get-matchup 7`, `get-alerts 7 3`, `run-challenge 7` all worked. `fantasypros-ecr.js` updated 10/20
(8 experts for QB/RB/WR, 9 for TE, 14 for K). Earlier today: `get-all-rosters`, `get-free-agents` (all positions), Sleeper Wks 3-6,
and the legal watch-list refresh, all reused. No pending claims or trades. Waiver priority 8, IR 1 of 2 (Montgomery, tag Q on Yahoo
but still IR-slotted with no add block reported).

**Byes this week: BUF (Allen)**, JAX, WAS, LAC. **Next week (Wk8): NO (Miller, Kamara), NYG (Likely), SF (Pineiro), HOU (Montgomery).**
**TNF: NE at CHI (Burden), Thu Oct 22. MNF: DAL at PHI (Pickens), Mon Oct 26.**

### Lineup (ECR 10/20) — 4 changes needed

| Slot | Current | Recommended | ECR / FLEX | Usage (Wks 3-6) | Vegas implied | Decided by |
|---|---|---|---|---|---|---|
| QB | **Allen (BYE)** | **Mahomes** | QB11 | 100% snaps; 16.9/17.0/—/11.5 | KC at SEA: not found yet | Bye. Stroud (FA) is QB10, only a 1-spot gap, not worth a move |
| RB | Corum | Chase Brown | RB15 | 70/79/60% Wks 3-5; carries 13/9/13 | CIN 24 (at BAL −3.5, 51.5) | ECR |
| RB | **Miller** | **Ollie Gordon II** | RB21 | 84/56/65%; carries 17/9/18; 13.0/17.0/14.8 | MIA 19.5 (at NYJ −2.5, 41.5) | ECR; 1 spot over Corum (RB22), so the ~3-spot coin flip goes to usage: Gordon |
| WR | Pickens | Pickens | WR14 | 85-88%; targets 11/3/13/11 | DAL at PHI (MNF): not found yet | ECR |
| WR | **Tucker** | **St. Brown** | WR5 | 74/96/86%; targets 8/11/11 | DET vs. GB: not found yet | ECR |
| TE | Likely | Likely | TE4 | 84/66/80/91%; targets 5/12/13/11 | NYG 19 (at HOU −5.5, 43.5) | ECR (Pitts TE12, more than 5 spots behind) |
| W/R/T | **Burden** | **Corum** | FLEX 50 vs. Burden 42 | Corum 29/15/27/28%, carries 6/5/5/9 | LAR at LV: not found yet | Within ~10 flex spots it's a coin flip, so **start the later kickoff**: Corum (Sun) over Burden (Thu). Burden's snaps also fell to 39% in Wk6 (no injury report found) |
| K | Pineiro | **McPherson** if addable (see moves) | K5 vs. Pineiro K13 | — | CIN 24 | ECR, and it covers Pineiro's Wk8 bye |
| DEF | **Chiefs** | **Vikings** | DST1 vs. Chiefs DST4 | — | IND 22 (at MIN −2.5, 46.5) | ECR |

Bench ranked: RB Miller RB26, Kamara RB27 (both NO, Wk8 bye); WR Burden WR22, Tucker WR30; QB Allen (bye); Chiefs DST4 (to drop).
Vegas source: look-ahead lines on the sportsbrackets.net Wk7 pick'em sheet (dated 10/6, may be stale). The 4 missing games get rechecked Thu/Fri.

**Health:** no tagged starters. Likely is **recently returned, game 3 of 3** (soft-tissue bump) → Medium, but TE4 vs. TE12 is beyond a tiebreak.
Burden: 39% snaps in Wk6 vs. 65% before, cause not found (he's benched anyway). Mahomes: no current injury news (2025 ACL/LCL, playing since Wk1).
Practice reports start Wed; recheck Thu/Fri.
**Weather (outdoor, pass/kick):** KC at SEA (Mahomes), DAL at PHI (Pickens). Forecasts aren't out yet; recheck Sat. SF at ATL, GB at DET and
IND at MIN are domes; NYG at HOU is a retractable roof.

### Moves (bye cover; both are free-agent adds, no waiver priority)

1. **Add Kyle Pitts, drop the Chiefs DEF** (Vikings are back and DST1). Pitts covers Likely's Wk8 bye: snaps 51→67→78% over Wks 4-6,
   targets 3/6/7, 6.2/12.7/20.5; TE12 this week; ATL has no bye before Wk11+. Fallbacks: Hunter Henry (TE15), Tyler Higbee (TE13).
2. **Add Evan McPherson, drop Eddy Pineiro.** McPherson is K5 this week (Pineiro K13) and CIN has already had its bye, so this fixes
   Wk8 too. We dropped him Oct 18, so Yahoo may block the re-add (Error #245) until he clears waivers; if so, retry Wed/Thu. Fallbacks:
   Cairo Santos (K9, CHI, plays Thu), Matt Gay (K10).

**Revised 2026-10-20 (user):** Montgomery's tag is **Q**, so he's no longer IR-eligible and blocks all adds (Error #845). New order:
(1) drop Chiefs DEF → (2) Montgomery IR → BN (IR 0 of 2) → (3) add Pitts, **drop Kamara** (6th RB once Montgomery is active; NO
bye Wk8; Miller has the role, 20 carries to 7) → (4) add McPherson, drop Pineiro. Montgomery: week-to-week (groin) plus the HOU Wk8 bye,
so Wk9 at the earliest.

**Moves done (2026-10-20, verified `get-matchup 7` / `get-alerts 7 1`):** dropped Chiefs DEF (10:00 am), Montgomery IR → BN (IR 0 of 2),
Vikings at DEF, Mahomes at QB. **Pitts was on waivers, so it's a claim, not an add:** claim 2_33392_30180 (add Pitts, drop Kamara),
order 1, processes **Oct 21**, waiver priority 8.
**McPherson blocked: Error #245** (we dropped him Oct 18; can't re-add until his waiver period ends).

**To-do (Wed Oct 21, carried over; dropped 10/21, McPherson claimed by Queen → Fitzgerald):** retry **add McPherson, drop Pineiro** once he clears waivers. If another team claims him, add
**Cairo Santos (K9, CHI)** *before Thursday's NE-CHI kickoff*, or Matt Gay (K10, LV, Sunday). Either way, Pineiro (K13) is fine as a
Wk7 fallback but has an SF bye in Wk8, so a kicker add is needed by next week regardless.

**Lineup verified (2026-10-20, `get-matchup 7`):** Mahomes; Gordon, Brown; Pickens, St. Brown; Likely; W/R/T Burden; Pineiro; Vikings.
Bench: Tucker, Corum, Miller, Allen, Kamara, Montgomery (Q). IR 0 of 2. Pitts claim (drop Kamara) still pending for Oct 21.
Only the flex call and the kicker remain (see below).

**To-do (before Thu kickoff):** ~~RB Miller → Gordon, Corum → Brown, WR Tucker → St. Brown~~ (done 10/20). **W/R/T Burden vs. Corum: decide Thu Oct 22 afternoon** (user, 2026-10-20). Check CHI's Wed/Thu practice
reports and any coach or beat-reporter comment on Burden's Wk6 snap drop (39% vs. ~65%). A clear explanation (a planned rotation, game
script, a one-off) → **start Burden** (FLEX 42, the better usage). Still unexplained or a new limitation → **start Corum** (FLEX 50,
later-kickoff rule). Burden locks at the NE-CHI kickoff Thursday night, so decide before then.

**Kicker update (2026-10-21, Wed):** McPherson was claimed by Queen, so the retry is **dropped**. FA kickers by ECR (updated 10/21):
**Ryan Fitzgerald K7** (CAR vs. TB, Sun, range 5-9), Santos K9 (CHI, Thu), Gay K10 (LV, Sun), Bates K11 (DET), Pineiro K13 (ours).
**Plan: add Fitzgerald, drop Pineiro.** He's the top FA by ECR, plays Sunday so he can still be swapped late, and CAR has no Wk8 bye
(Pineiro's SF does). Fitzgerald wasn't in the 10/20 fallback list because that list was built from the earlier ECR pull. Fallbacks if he's
gone: Santos (before Thursday's kickoff), then Gay.

**Roster check (2026-10-21, `get-matchup 7`):** Fitzgerald added and Pineiro dropped. **The Pitts claim went through** (Kamara dropped),
so that to-do is **done**. **Issue found: the K slot is empty.** Fitzgerald is on the BN. He has to be moved to K before CAR's Sunday kickoff.
**Fixed (2026-10-21, re-verified `get-matchup 7`):** Fitzgerald is at K.

### Flex decision (2026-10-21, Wed): start Burden

- **Final CHI injury report is out** (a TNF team's Wednesday report is the final one). **Burden isn't on it.** Bears out: Monangai (RB),
  Sanborn (LB). Doubtful/Q: Edwards (LB). Patriots out: starting CB **Carlton Davis III** and two reserve CBs, so NE's secondary is thin.
- **The snap drop is still unexplained**, but it didn't cost production: 39% of snaps (30) and still **8 catches, 95 yards, team high**
  in the 31-23 win over ATL. No coach comment found on a rotation.
- **FLEX ECR updated 10/21: Burden FLEX45 (range 42-51) vs. Corum FLEX57 (46-82).** That's a 12-spot gap, **outside the ~10-spot coin-flip
  window**, so the flex rule says follow ECR, not the later kickoff. Corum's wide range also means low expert agreement.
- **Call: Burden stays at W/R/T** (already set). The original plan (unexplained → Corum) assumed a coin flip, and the ranks have since moved apart.
- Sources: [NBC Chicago, final Bears report](https://www.nbcchicago.com/news/local/the-chicago-bears-injury-report-has-been-released-ahead-of-patriots-game/4005619/),
  [Patriots.com Week 7 report](https://www.patriots.com/news/week-7-injury-report-patriots-at-bears),
  [SI, Wk6 snap observations](https://si.com/nfl/bears/onsi/kyler-gordon-s-playing-time-and-other-bears-snap-count-observations-from-week-6-win).

### Vegas lines (2026-10-21, Wed)

Implied total = total/2 ± spread/2. Books differ by a point or so; midpoints used.

| Our player(s) | Game | Spread / total | Our team's implied | Change vs. 10/6 look-ahead |
|---|---|---|---|---|
| Mahomes | KC at SEA (SNF) | SEA −2.5 / 42.5 | **KC 20.0** | new |
| St. Brown | GB at DET | DET −3.5 / 53.5 | **DET 28.5** | new (week's highest total) |
| Pickens | DAL at PHI (MNF) | DAL −4.5 / 44.5 | **DAL 24.5** | new |
| Corum (BN), Tucker (BN) | LAR at LV | LAR −4 / 47.5 | LAR 25.75, LV 21.75 | new |
| Brown | CIN at BAL | BAL −2.5 / 51 | **CIN 24.25** | about the same (24) |
| Gordon | MIA at NYJ | NYJ −5 / 39 | **MIA 17.0** | down from 19.5 |
| Likely | NYG at HOU | HOU −9.5 / 43.25 | **NYG 16.9** | down from 19 |
| Vikings DEF | IND at MIN | MIN −6.5 / 41.5 | **IND 17.5 (opponent)** | down from 22: good for our DEF |
| Fitzgerald | TB at CAR | CAR −3.25 / 44.5 | **CAR 23.9** | new |
| Burden | NE at CHI (TNF) | not found | — | already decided (start) |

**Changes: none.** Mahomes has the lowest QB-relevant total (KC 20.0), so free-agent QBs were checked: Stroud (QB9) has been rostered
since 10/20. The best free agents (Shough QB13, Rodgers QB14) rank below Mahomes (QB11), so keep him. **Gordon (MIA 17) vs. Corum (LAR 25.75):** the totals favor Corum,
but ECR re-pulled 10/22 still has Gordon RB21 vs. Corum RB24. That's 3 spots, the edge of the RB coin-flip window, so usage breaks it,
and usage is lopsided: Gordon 56-84% snaps, 9-18 carries vs. Corum 15-29%, 5-9 carries. **Keep Gordon.** Likely (NYG 16.9) is TE4 vs.
Pitts TE13, too wide a gap for the total to matter. Sources: [Complex](https://www.complex.com/bets/a/matt-burke/nfl-week-7-odds-point-spreads-totals),
[FantasyAlarm](https://www.fantasyalarm.com/articles/nfl/predictions/2026-nfl-week-7-picks-straight-up-odds-spreads-all-14-games/197488),
[SI DAL-PHI](https://www.si.com/betting/cowboys-vs-eagles-prediction-odds-spread-injuries-trends-for-nfl-week-7-2026),
[Fox Sports](https://www.foxsports.com/stories/nfl/2026-nfl-odds-week-7-lines-spreads-results-all-14-games),
[Sportsbook Review](https://www.sportsbookreview.com/picks/nfl/week-7-odds-betting-lines-2026/).

### Weather (2026-10-21, Wed; NWS hourly forecasts from api.weather.gov)

Outdoor games with a QB/WR/TE/K of ours. Domes skipped: LAR at LV, GB at DET, IND at MIN. NYG at HOU has a retractable roof. CIN at BAL and MIA at NYJ have only our RBs.

| Player | Game / stadium | Game-window forecast | Flag? |
|---|---|---|---|
| Burden | NE at CHI, Thu 7:15 pm CT, Soldier Field | 57-62°F, wind 5 mph ENE, 0% precip | No |
| Mahomes | KC at SEA, Sun 5:20 pm PT, Lumen Field | 50-54°F, wind 2-3 mph N, **26-33% chance of light rain** | No (light rain, low chance, calm) |
| Fitzgerald | TB at CAR, Sun, Bank of America Stadium | 60-67°F, **wind 9-12 mph NNE/NE**, 0% precip | No (under 15 mph) |
| Pickens | DAL at PHI, Mon night, Lincoln Financial Field | 56-65°F, wind 0-5 mph W, 0% precip | No |

**No weather flags.** The SEA and PHI forecasts are 4-5 days out, so take a quick look Saturday in case Seattle's rain chance or the
Carolina wind picks up (flag at wind over 15 mph or a high rain chance).

### Yahoo add/drop suggestions (2026-10-21, team page, probe script)

| Yahoo suggests | ECR (10/22) | Verdict |
|---|---|---|
| Add Malik Washington (MIA WR), drop Kendre Miller | Washington WR37 vs. Miller RB26 | **Pass.** Washington would be our WR5, behind Tucker (WR30), and never start. Miller is low value too, but his spot is earmarked for a QB add if the Tuten trade lands |
| Add Chris Godwin Jr. (TB WR), drop Kyle Pitts | Godwin WR46 vs. Pitts TE13 | **Pass.** Pitts is Likely's Wk8 bye cover, and Godwin is a bench WR at best |
| Add Jake Bates (DET K), drop Ryan Fitzgerald | Bates K11 vs. Fitzgerald K6 | **Pass.** ECR favors Fitzgerald |

Yahoo's suggestions run on Yahoo's own projections. We decide on ECR, so treat them as a list of names to check, not a signal.
Trade-suggestions tab: Yahoo Fantasy Plus (paid) only, apart from naming one team (Smokin Base Brian).

### To-do status (2026-10-21)

| Item | Status |
|---|---|
| Lineup swaps (Mahomes, Gordon/Brown, St. Brown, Vikings) | **Done** (verified 10/20) |
| Pitts claim (drop Kamara) | **Done** (won 10/21) |
| McPherson re-add | **Dropped**: claimed by Queen. Replaced by Fitzgerald |
| Add a kicker, drop Pineiro (also covers Pineiro's Wk8 bye) | **Done**: Fitzgerald at K (10/21) |
| Burden vs. Corum flex | **Done 10/21: start Burden** (see the flex decision below) |
| Vegas lines: KC@SEA, LAR@LV, DAL@PHI, GB@DET | **Done 10/21**: no lineup changes (see Vegas lines) |
| Weather: KC@SEA (Mahomes), DAL@PHI (Pickens), plus CAR (Fitzgerald), CHI (Burden) | **Checked 10/21: no flags.** Quick recheck Sat (SEA rain, CAR wind) |
| Friday injury reports for starters | **Wed check done 10/21** (no tags; Mahomes full). **Final reports → Fri** (Pickens' DAL plays Mon, so his final comes Sat) |
| Trade: Mahomes deal | **Updated 10/21:** send **#11 re-pitch Mahomes ↔ Tuten (Dusty)** now. Dusty cut Cousins, and Lamar isn't practicing. If accepted before Sunday: add Rodgers (QB14), drop Miller, start Rodgers. #19 Warren = fallback after Wk7. Stroud is no longer available (Maria). See `trades.md` |
| Wk8 byes: Likely (Pitts covers), Pineiro (gone), Miller (bench), Montgomery (out anyway) | **Covered**. Nothing else needed |

### Trades

None pending. Top candidate from today's scan (`trades.md`, post-Wk6 re-check): **#19 Mahomes ↔ Jaylen Warren (Knights)**: favors us, the
most plausible Mahomes deal. **Timing caveat:** if it's accepted, Mahomes leaves mid-week (2-day veto window). Then add C.J. Stroud
(QB10, HOU vs. NYG) and drop Kamara (RB27, 5th RB, Wk8 bye). Send now if you want it done before Sunday; otherwise hold it until after Wk7.

### Challenge: Gronk Memorial

Rule: "Starting TE whose receiving yardage is closest to 69 (over or under)." Our TE is Likely (94 and 99 yds the last two weeks). No lineup
impact; a TE is in the slot either way.

### Open to-dos (from `week-06.md`)

| Item | Status |
|---|---|
| Friday 10/16 checklist (Montgomery IR, add WR, Kamara watch) | **Done** (10/16-10/18, verified `get-matchup 6`) |
| "Still to do: Sunday weather" (Pickens/Likely/Pineiro) | **Dropped**: games are played; no weather issue was noted |
| "Still to do: send #17 Sunday night" | **Dropped 2026-10-20**: RB is healthy again, Maria is our Wk7 opponent (`trades.md`) |
| Waiver scan: "Mon/Tue after Wk6, drop Chiefs DEF; add Strange as Likely's Wk8 cover" | **Carried over → Pitts** (Strange went to Queen 10/17); move #1 above |
| Waiver scan: "drop one K (Pineiro vs. McPherson)" | **Done differently**: McPherson dropped 10/18 for Miller. Now move #2 above (re-add McPherson for Pineiro) |
| Post-game hand-off: Burden's snaps | **Done**: no cause found; benched this week on the flex rule anyway. Recheck the CHI report Wed |
| Post-game hand-off: Mahomes spare after Wk7 | **Carried over**: #19 decision (send now / after Wk7), user's call |

## Injury/Availability Report (cached)

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Whole roster | No Yahoo tags except Montgomery (Q, on IR) | Practice reports not out yet (Tue) | 2026-10-20 | `get-matchup 7` |
| Isaiah Likely | Healthy | Recently returned, game 3 of 3 (knee/groin soft tissue) → Medium | 2026-10-20 | week-05/06 caches |
| Luther Burden III | No injury report found | 39% snaps Wk6 vs. 65% Wks 3-5 | 2026-10-20 | search (no 2026 result) |
| Whole roster (Wed recheck) | No Yahoo tags except Montgomery (Q) | Wednesday reports are out for Sunday teams; Friday finals aren't yet | 2026-10-21 | `get-matchup 7` |
| Patrick Mahomes | **Full practice Wed** (knee, listed as maintenance) | Low tier. KC's weapons are thinner: WR Rashee Rice (hamstring) DNP, Kelce (ankle) limited, RT Jaylon Moore (concussion) DNP, LT Simmons DNP (non-injury). Watch Fri | 2026-10-21 | [Seahawks.com](https://www.seahawks.com/news/2026-week-7-injury-report-chiefs-at-seahawks), [Arrowhead Pride](https://www.arrowheadpride.com/kansas-city-chiefs-injuries/213789/chiefs-seahawks-week-7-wednesday-injury-report-josh-simmons-misses-practice) |
| Chase Brown (game context) | No tag | BAL QB Lamar Jackson (ankle) still not practicing; a backup QB for BAL could mean a more run-heavy CIN script | 2026-10-21 | [CBS Sports](https://www.cbssports.com/nfl/news/nfl-week-7-injury-report-ravens-lamar-jackson-jets-breece-hall/) |
| George Pickens | Healthy; no tag | Called out for lack of effort after the Wk6 GB loss; Schottenheimer said it's on the staff to involve him more. Trade-candidate talk (ESPN's Solak; Jerry Jones open to it), NFL deadline Nov 10. Media noise, not a role change: 11 targets in Wk6, ECR WR14. Keep starting him; recheck for a trade before each lineup lock | 2026-10-21 | [Yahoo](https://sports.yahoo.com/articles/cowboys-wr-george-pickens-called-003839630.html), [Athlon](https://athlonsports.com/nfl/trending/cowboys-brian-schottenheimer-breaks-silence-on-george-pickens-problem) |
| David Montgomery | Groin, week-to-week; HOU bye Wk8 | Likely out Wk7, back Wk9 at the earliest | 2026-10-20 | [RotoBaller](https://www.rotoballer.com/?p=1963820) |
