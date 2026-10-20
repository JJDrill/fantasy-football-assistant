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

**To-do (Wed Oct 21, carried over):** retry **add McPherson, drop Pineiro** once he clears waivers. If another team claims him, add
**Cairo Santos (K9, CHI)** *before Thursday's NE-CHI kickoff*, or Matt Gay (K10, LV, Sunday). Either way, Pineiro (K13) is fine as a
Wk7 fallback but has an SF bye in Wk8, so a kicker add is needed by next week regardless.

**To-do (before Thu kickoff, open):** lineup is only partly set. Still to do: RB Miller → **Gordon**, Corum → **Brown** (RB slots),
WR Tucker → **St. Brown**, W/R/T Burden → **Corum**. Burden locks at Thursday kickoff, so move him out before then.

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
| David Montgomery | Groin, week-to-week; HOU bye Wk8 | Likely out Wk7, back Wk9 at the earliest | 2026-10-20 | [RotoBaller](https://www.rotoballer.com/?p=1963820) |
