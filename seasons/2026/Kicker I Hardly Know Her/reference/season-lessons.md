# Season Lessons (cross-week audit)

A running audit of lineup decisions across the whole season, not one week at a time. For each loss,
it asks: **could we have known better at decision time, or was it random?** Started 2026-10-05 after
an 0-4 start. Update it in each `post-game-check`.

## Weeks 1-4 audit (2026-10-05)

Every loss so far would have flipped with **one** bench swap. The question is which swaps were
knowable.

| Wk | Margin | Swap that wins | Knowable at the time? | Why |
|---|---|---|---|---|
| 1 | −14.70 | Monangai (19.4) for Dowdle (3.1) | **No: random** | Monangai was officially doubtful (hyperextended knee, no clearance). Starting him would have been reckless. |
| 2 | −2.54 | McLaughlin (16.0) for Pineiro (5.0) | **No: random** | Pineiro was expected to play through illness, so swapping back was reasonable. Kicker scoring is noise. |
| 2 | | **Likely (5.8) for Pitts (2.0)**, wins by 1.3 | **Yes** | Wk1: Likely had 8 targets and 23.8 pts; Pitts had 1 target and 0 pts. Not compared in the notes. |
| 2 | | Monangai (6.8) for Montgomery (3.4) | No | Monangai still not cleared. |
| 3 | −6.90 | Burden (16.3) for McMillan (2.7) | **No: random** | Burden had 7.0 and 4.7 before. McMillan was coming off 100+ yards. No signal. |
| 4 | −1.46 | **Likely (10.1) for Sadiq (0.0)** | **Yes, by the current rules** (revised 2026-10-11 after the league replay; earlier: "close call, not clearly knowable") | Final Sunday ECR had Likely TE10 vs. Sadiq TE12, and targets favored Likely (11.3 vs. 8.3). Both signals agreed. |
| 4 | | **Gordon (17.0) for Montgomery (4.3)** | **No: leaned wrong on the info** (revised) | Wright returned as RB1, and MIA had the slate's lowest total (~14.75). Every agent rated Gordon's case Weak. |

**Verdict (revised 2026-10-11 after the league-wide replay, `league-replay-wk1-4.md`):** Wks 1 and 3 were
mostly bad luck. **Wk2 (Likely over Pitts, TE8 vs. TE17) and Wk4 (Likely over Sadiq, TE10 vs. TE12 with
more targets) were both knowable.** Each single swap would have won. Under the current rules, the Wk4
lineup wins (113.32 vs. 104.68). The Wk2 ECR lineup still loses by ~1, since ECR also swaps Stevenson in
at RB. *Earlier verdict (2026-10-05): Wk4 was "a close call where our lineup was the defensible pick."
That predated the archived Sunday ECR.* The original "2-2 with fixes" claim had hindsight bias. All-play is 16-20 (~1.8 expected wins), and points against is 4th-highest.

### Correction: mechanical backtest (2026-10-05, same night)

The "2-2 with the knowable fixes" verdict above has **hindsight bias**: it picked only the swaps that
worked. A mechanical backtest applied one usage rule to *every* RB/WR/TE slot in Wks 2-4, using only
the prior two weeks of Sleeper data and skipping uncleared players:

| Wk | Rule: opportunity (0.5×carries + 1.5×targets) | Rule: recent half-PPR pts | Actual RB/WR/TE/flex |
|---|---|---|---|
| 2 | 61.0 (−0.1) | 60.3 (−0.8) | 61.1 |
| 3 | 37.7 (−2.0) | 26.0 (−13.7) | 39.7 |
| 4 | 52.0 (−18.7) | 54.6 (−16.1) | 70.7 |

**Neither rule wins a single week, and both lose ground overall.** Usage applied blindly benched
McMillan (38.2 in Wk4). Averaging two weeks also missed Gordon's role change (0 → 17 carries).

**But the TE slot alone is different.** Likely over Pitts/Sadiq by usage gains +3.8 (Wk2), +1.3
(Wk3) and +10.1 (Wk4) = +15.2. That flips **Wk2 and Wk4**. So:
- **TE usage rule: supported.** TE targets have been sticky and predictive.
- **RB/WR usage rule: not supported yet** as a mechanical primary signal. Role *changes* (injury
  to a teammate, a depth-chart move) matter more than averages. Treat usage as one input alongside
  ECR and props, and test it in `source-accuracy.md`.
- Sample is 3 weeks. Re-run the backtest as weeks accumulate.

The attention check on the notes explains the TE miss. In Wk2, Pineiro's illness got 17 mentions and
Likely got 2. In Wk4, Likely got 13 mentions, but only one as a lineup option ("NYG vs. ARI. Bench.").
The rest treated him as a trade chip. **Once a player was labeled trade bait, the lineup analysis
stopped evaluating him.**

### Agent experiment: replaying Week 4 (2026-10-05)

Tested whether more AI viewpoints would have changed the Wk4 lineup. Both runs got the same fact
packet: only what was known Sunday morning before kickoff (Wks 1-3 usage from Sleeper, Vegas lines,
injury reports, depth charts). There were no Wk4 results, no web search, and no repo access. The model's
knowledge ends mid-2026, so it couldn't know the outcomes. FantasyPros ECR and Wk4 props weren't
available historically, so they're not in the packet.

| Run | Setup | Agents | ~Tokens | Lineup picked | Wk4 pts | Result |
|---|---|---|---|---|---|---|
| B | One bench advocate (honest case for each bench player) → fresh judge | 2 | ~100k | **Identical to ours** | 103.22 | Loss by 1.46 |
| A | One advocate per contested player (9) → fresh judge | 10 | ~500k | **Identical to ours** | 103.22 | Loss by 1.46 |

**Findings**
1. **Neither format found the winning swaps.** Every agent, including Gordon's and Likely's own
   advocates, rated their cases Weak or Moderate on the pre-game facts. So the Wk4 audit above was
   too harsh: on the information we had, our lineup was the consensus defensible call. **Wk4 was
   closer to bad luck than a mistake.**
2. **Run A cost 5× more for the same answer.** Advocates from the same model share blind spots, so
   nine advocates aren't nine independent opinions.
3. **Run A's judge was a good error-catcher.** It rejected 8 false or misleading advocate claims,
   including Sadiq's advocate saying Pitts (MNF) could replace him "if the back flares up early."
   That's impossible once Sadiq's game locks, and it's the same flawed hedge reasoning our own notes
   used. Checking claims has value even when it doesn't change the lineup.
4. **The missing ingredient was information, not viewpoints.** More agents re-arguing the same
   packet converge on the same answer. New signals (ECR, props) are the only way to add something.
5. Caveats: one week (n=1). The packet was written after the fact, so its framing could carry
   hindsight (e.g. "weight DvP lightly").

**Decision:** don't build per-player agents. If an agent is added, use one cheap judge-style
**claim checker** on the Saturday pass that verifies each recommendation's claims against the data.
Re-run the Run B format on future weeks once ECR and props are in the packet.

## League-wide grading: what it says about our lineup (2026-10-23, Wks 1-6)

From `grade-league-decisions.js` (521 pairs league-wide, 52 ours; `league-decisions.md`).

1. **Going against ECR likely cost us two wins.** We started the lower-ranked player 10 times, at a net cost of 17.9 points, and 9 of
   those came before the ECR-first rule (2026-10-11). Wk4: Sadiq (TE12, 0.0) over Likely (TE10, 10.1), lost by 1.46. Wk2: Pitts (TE17,
   2.0) over Likely (TE8, 5.8), lost by 2.54. Each single swap wins its game (matches the Wks 1-4 audit above), so we'd likely be 4-2,
   not 2-4.
2. **Since the rule, we've followed it.** One call against ECR in Wks 5-6 (Wk6 Miller RB30 over Kamara RB27), inside the RB window, so
   it's fine by our rules. Both weeks won. Too few weeks to call it proof, but nothing argues against the rule.
3. **Our roster behaves like the league's:** the ECR favorite won 34/51 of our pairs (67%) vs. 69% league-wide. No special rules needed.
4. **Our worst "followed ECR and lost" calls were random:** mostly Burden in Wk3 (WR36, 16.3) beating St. Brown, Pickens and McMillan
   from the bench. That's the "low-usage WR spikes from nowhere" case in "Accept as random." Don't chase it.
5. **TE rankings are shaky league-wide, but mostly not because of us.** Most upsets were other teams (Queen's Kraft lost to his own
   bench 4 times, Gospel's McBride twice to Loveland). Our TE lesson is the opposite: ECR was right about Likely over Pitts and we
   didn't listen. With Pitts covering in Wk8, a small TE gap should lean on health and targets, which the rules already say.

**What it can't tell us yet:** whether our rules beat ECR (since Wk5 we've mostly just followed it), and anything about roster moves
(dropping Stevenson and Marks); the grader only sees start/sit.
**Takeaway:** keep following ECR outside the coin-flip windows. The weekly grading decides whether the TE window widens; check at about Wk10.

## League-wide grading: what it says about trades (2026-10-24, Wks 1-6)

The grader tests start/sit calls, not trades, so it can't say whether a trade worked (that's the "how it played out" lines in
`trades.md`, too few so far). But the same data says three things about trades:

1. **Rankings are a fair way to value RBs, QBs and WRs in a trade, not TEs.** Outside the coin-flip windows the higher-ranked player
   outscored the other 74-76% of the time at RB, QB and FLEX and 68% at WR, but only 50% at TE (n=22, still a watch item). So "my RB
   ranks higher than yours" is solid ground; paying extra for a higher-ranked TE isn't. It backs keeping Pitts rather than selling on
   his rank, and not paying a premium for another team's TE (e.g. Russini's benched Kelce, TE6).
2. **Bench surplus shows who can trade.** Wk6 benches with starter-quality players (QB/TE top 12, RB top 24, WR top 30): Knights (Warren
   RB11, Allgeier RB22, D. Smith WR23), Gospel (Pierce, Downs, Loveland), Russini (Pollard, Metcalf, Kelce), Rayrays (Caleb Williams QB7,
   Shough QB10), us (Mahomes QB9); Brigid and Maria almost none. The Knights are the only team benching a starting RB, which makes them
   the right partner for #19. Rayrays has two spare QBs to sell, so Mahomes's value drops the longer #19 waits (backs Rule 3, move fast
   on QB trades). Brigid and Maria are buyers, not sellers.
3. **Managers differ in how closely they follow rankings.** Knights and Brigid never started a lower-ranked player in six weeks; Maria
   and Dusty did several times and lost ~20-24 points doing it. Thin evidence, but: pitch the Knights with rankings, and look for
   lopsided value with managers who trust their gut over the rankings.

**Suggestion (this season):** `trade-finder` now runs this bench-surplus check weekly on current rosters (step 3).

## League-wide grading: what it says about waivers (2026-10-24, Wks 1-6)

The grader only compares rostered players, so this is indirect. Re-cut by how deep the lower-ranked player was (outside the
coin-flip windows):

| Lower-ranked player | Beat the higher-ranked one |
|---|---|
| RB13-24 | 10 of 23 (43%) |
| RB25-36 | 13 of 59 (22%) |
| RB37+ | 4 of 32 (13%) |
| WR37+ | 24 of 78 (31%) |
| TE, top 12 or below | 11 of 22 (~50%) |

1. **Waiver RBs are bets on a role, not weekly points.** Most wire RBs rank RB37+ and beat a starter about one week in eight. Add
   them for upside (a handcuff, a backup one injury from the job), not as a fill-in starter. Fits Rule 3 (RBs are scarce).
2. **Waiver WRs pop more often.** A deep WR wins about one in three, so a bye-week WR pickup is a fair one-week gamble.
3. **A streamed TE may do about as well as a ranked one** (same n=22 TE watch item). It matters more to other teams than to us.

**What it can't tell us:** DEF (no pairs: teams roster one), K (5 pairs), and whether our own adds and drops worked. To fill that
gap, `post-game-check` now logs every add we make in `reference/waiver-log.md` (added 2026-10-24): his rank when added, his
points, the dropped player's points, and the best player left on the wire. DEF streaming gets its first real test there.

## League-wide grading: what it says about kickers (2026-10-24, Wks 1-6)

Every team starts one kicker and benches none, so the grader compares each week's 10 starting kickers with each other
(`league-decisions.md`, DEF and K section).

| Kicker's rank that week | Starters | Avg points |
|---|---|---|
| 1-5 | 26 | 8.0 |
| 6-12 | 20 | 10.9 |
| 13+ | 13 | 9.2 |

1. **Kicker rankings predicted nothing.** The better-ranked starter outscored the other only 40% of the time (101 of 250 pairs), worse
   than a coin flip, and the 6-12 tier outscored the top 5. With ~60 kickers that's most likely noise, not low-ranked kickers being better.
2. **Ours fit the pattern.** We started a top-3-ranked kicker in 5 of 6 weeks (Pineiro, McPherson) and averaged 6.8, below every tier.
   Not a mistake; the ranking just didn't help.
3. **Almost no bench data** (4 pairs), since no one carries two kickers, and the finding above says a second one wouldn't help.

**Takeaway:** spend nothing on kickers (suggestion 6 in "This season's rules"). The only kicker challenge (Wk3 "Scobee Snacks") is past.

## Recurring mistakes (the part we can fix)

1. **The TE blind spot: Likely never got re-ranked.** Targets by week: Likely 8 / 10 / 5 / 12;
   Pitts 1 / 3 / 2 / 3. Every week the TE question was framed as "Pitts vs. the new guy" (Pitts vs. Sadiq
   in Wk4), and Likely stayed on the bench. That cost about +3.8 (Wk2), +1.3 (Wk3) and +10.1 (Wk4).
2. **Trusting role/name over usage at RB.** Montgomery's carries: 20 / 6 / 11 / 10. Marks: 9 / 8 / 5 / 6.
   Two halves of one stalled Houston backfield started every week because the matchup grade said
   "Favorable." Gordon's Wk3 usage was a clear signal we overrode with a matchup/committee worry.
3. **Leaning on matchup grades.** They're 7/21 (33%) this season; `Favorable` is 5/16. See
   `matchup-grade-accuracy.md`.
4. **The "inactive" hedge covers only half the Q-tag risk.** A late-game backup protects against a
   scratch, but not against "active but limited or bad," because the player locks at kickoff.

## This season's rules (2026)

**All-seasons rules are in `methodology/rules.md`** (split out 2026-10-23): bye/inactive check, re-rank the whole group, ECR first,
no matchup grades, process vs. outcome, judge on points scored, read the trade market, and more. This section holds how those apply in
2026 (the calibrated numbers) plus suggestions that only fit this year's league and roster. Each one is marked **Rule** (follow it) or
**Suggestion** (lean this way, and re-check as the season goes).

1. **Rule: evidence order by position, with the 2026 tie windows** (applies all-seasons rules 2-5; revised 2026-10-11 after the
   league-wide replay, `league-replay-wk1-4.md`; RB window added 2026-10-20):
   - **TE:** ECR + Vegas → targets break ties **within ~5 ECR spots** → health tier.
   - **RB:** ECR + Vegas → usage, mainly to catch role changes (a teammate hurt, a depth-chart move, a snap jump like Gordon's)
     → health tier. **Within ~3 ECR spots it's a coin flip:** break it with usage/role change, then health tier (Wk6 Kamara vs. Miller).
   - **WR:** ECR + Vegas. Override only for a clear role change ECR hasn't caught.
   - **Flex:** FLEX ECR. Within ~10 flex spots it's a coin flip, so start the **later kickoff**.
   - **QB/K/DEF:** ECR + Vegas → health tier.
2. **Rule: we're a playoff-scoring team; don't rebuild** (applies all-seasons rule 7; 2026-10-23). Through Wk6 we're 2-4 but **4th in
   average points (115.5)**, above the league median in 4 of 6 weeks, with losses by 2.5 and 1.5. Make changes that add points,
   not changes that react to the record.
3. **Rule: move fast on QB trades; RBs are the scarce asset** (applies all-seasons rule 12; 2026-10-23, Wk7 scouting). Five teams carry
   two starting-caliber QBs (Russini, Rayrays, Gospel, Maria, us), and only Knights clearly need one (Dusty too if Lamar sits). When a
   QB-needy team shows up, pitch promptly. RBs are short league-wide (Brigid most of all), so our RB depth is worth more in trades than
   the spare QB. Re-check supply and demand on each `team-scout` run; drop this if more teams need QBs.
4. **Suggestion: TE is our biggest edge; keep a real backup.** Maria (Fannin), Rayrays (Andrews) and Queen (Kraft) get under ~7 a week
   at TE (Wk7 scouting). Likely is scarce, not just good, so lean toward keeping Pitts after Likely's Wk8 bye rather than cutting him.
5. **Suggestion: manager reads for trade pitches** (applies all-seasons rule 13). Smokin Base Brian: no moves all season, don't
   bother. Man Coverage Brigid: 3 moves, set-and-forget, only a clearly-good-for-them offer. THE Lil Unk Rayrays and Knights: active,
   the best places to pitch. Dusty: rejected trade id 12, don't re-pitch that deal (`trades.md`).
6. **Suggestion: kickers are interchangeable** (2026-10-24, league grading Wks 1-6: better-ranked kicker won 40%). Start any kicker
   whose team plays that week, preferring indoors or good weather. No waiver priority, no backup kicker, no lineup time on K matchups;
   put that roster spot and attention on an RB handcuff instead. **Promotion check ~Wk10:** if the better-ranked kicker still wins
   under ~50% across 10 weeks of league grading, propose it for `methodology/rules.md` as an all-seasons Provisional rule.

*Superseded 2026-10-11: "usage → Vegas → health → matchup grade" for every position. That made usage
primary at RB/WR, which the backtest didn't support.*

## Injury-risk tier tracker

Tests whether the `lineup-advice` health risk ladder (Low / Medium / High) predicts anything.
Log every **started** player who carried a Yahoo injury tag, appeared on an injury report, or
got the recently-returned bump that week. Appended by `post-game-check`.

**Two risks, rated separately** (split 2026-10-11):
- **Play risk:** will he be inactive or leave the game early? Practice trend and the final
  designation drive it, and the inactive list settles most of it before kickoff.
- **Limited risk:** if he plays, will his role shrink (fewer snaps, a pitch count, a decoy)?
  Injury type (soft tissue), the recently-returned bump and pitch-count reports drive it.
  This is the risk that cost us with Sadiq in Wk4, and no pre-kickoff hedge covers it.
The overall **Tier** stays the start/sit input (the higher of the two, in practice). The two
sub-ratings are logged so we can learn which one actually predicts a bad game.

**Outcomes, two ways:**
- **Snap % (game vs. prior):** his offensive snap share in that game vs. his average over the
  previous 2-3 healthy games (Sleeper `off_snp`/`tm_off_snp`). A drop of **10+ points** = **Limited**.
  This is the low-noise test of Limited risk: a touchdown can hide a reduced role, and a healthy
  player can still score 3.
- **Pts vs. pos avg:** league-wide average of started players at his position that week (flex
  counted under the real position). "Below avg" = a bad outcome.
- **In-game injury?** (added 2026-10-11) If the snap drop came from an injury **during** the game
  (left early, didn't return), write **"In-game"** in the Role column instead of "Limited." Those
  don't count against the pre-game tier: no pre-game report could predict them. League-wide in
  Wks 2-4, 10+ pt snap drops meant a below-average game 82% of the time (vs. 51%), but most were
  in-game exits (Achane, Jefferson, Rice, Chase). Check game recaps or the injury report for an
  "exited / did not return" note.
If High-tier starters aren't Limited or Below avg more often than Low-tier ones over the season,
the ladder isn't earning its place.

| Wk | Player | Pos | Practice trend | Final report | Injury type | Recently returned? | Play risk | Limited risk | Tier | Snap % (game vs. prior) | Role | Pts | Pos avg | Result |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 4 | Josh Allen | QB | Practiced Wed onward | No designation | Knee contusion | No | Low | Low | Low | 100% vs. 100% | Full | 19.52 | 19.20 | Above avg |
| 4 | Kenyon Sadiq | TE | Limited Wed/Thu/Fri | Q, active Sunday | Back (soft tissue) | No (injured that week) | Medium | High | High | 69% vs. — (not pulled) | — | 0.00 | 9.23 | Below avg |
| 5 | Isaiah Likely | TE | Limited Wed/Thu, full Fri | No designation | Knee/groin (soft tissue) | Yes (game 1 of 3) | Low | Medium | Medium | 80% vs. 73% (Wks 2-4) | Full | 26.9 | 11.91 | Above avg |
| 6 | Isaiah Likely | TE | Full Wed onward | No designation | Foot (listed, not limiting) | Yes (game 2 of 3) | Low | Low | Low | 91% vs. 77% (Wks 3-5) | Full | 20.9 | 7.90 | Above avg |
| 6 | Josh Allen | QB | No report | No designation | None | No | Low | Low | Low | 100% vs. 100% | Full | 18.3 | 19.93 | Below avg |
| 6 | George Pickens | WR | No report | No designation | None | No | Low | Low | Low | 88% vs. 86% | Full | 10.3 | 10.64 | Below avg |
| 6 | Luther Burden III | WR | No report | No designation | None | No | Low | Low | Low | **39% vs. 65%** (Wks 3-5) | Limited (cause not found) | 13.5 | 10.64 | Above avg |
| 6 | Blake Corum | RB | No report | No designation | None (role risk only) | No | Low | Low | Low | 28% vs. 24% | Full | 13.0 | 11.67 | Above avg |
| 6 | Tre Tucker | WR | No report | No designation | None (role risk only) | No | Low | Low | Low | 70% vs. 66% | Full | 24.2 | 10.64 | Above avg |

**Week 6 note (2026-10-20):** the one **High**-tier player, Kamara (Q, back; limited all week), was **benched** for Kendre Miller,
so he isn't a starter row. He played 26% of snaps vs. 32% average over Wks 3-5 (not a 10+ drop, so Full by the snap test) and scored
13.9, above the 11.67 RB average. He outscored Miller (8.0) by 5.9, all from **one receiving TD** (7.9 without it). His role
did shrink a bit (7 carries, Miller 20), so the High tier's limited-risk read was roughly right. Grade: **right call, bad luck.**
Ladder record so far: High-tier started 1 (Sadiq Wk4, bust); High-tier benched 1 (Kamara Wk6, a TD-driven boom). n=2, keep watching.
Burden's snap drop came with no injury tag, so the Low tier can't be blamed for it.
**Cross-week audit, Wk6 (W 128.20-112.74):** hindsight-best lineup +5.9 (Kamara for Miller, a TD). **Knowable gap: 0.** Every call
followed the rules. The opponent's best bench swaps (Loveland for Watson +7.6, Pierce for Stevenson +9.4) would have beaten us by 1.5,
so the margin was **their mistakes plus Tucker's 2 TDs**, both outside our control. Process slip: trade #17 was planned for Sunday
night and never sent or formally dropped (no cost this time).

**Recently returned** (column added 2026-10-08): "Yes (game N of 2/3)" when the `lineup-advice`
bump applied, meaning within 2 games of the last Q/D/O or missed game, or 3 for soft tissue. Log
those starters even when they have no tag that week. That's the case this column tests.

Wk4 play/limited ratings were assigned retroactively on 2026-10-11. Tiers for Wk4 were assigned retroactively (2026-10-05) from the `week-04.md` injury cache.
Wk5 (logged 2026-10-13): Likely was the only tiered starter. Montgomery had no tag before kickoff and left Wk5 in the 2nd quarter with a groin injury (14% of snaps); that was an in-game injury and he wasn't tiered, so he isn't logged. Wk5 was a 1.56-pt win, so there's no loss to audit.
Weeks 1-3 have no tagged starters worth tiering (Dowdle Wk1-2 was healthy at lineup time).

## Accept as random (don't over-correct)

- Kicker swings (Wk2 McLaughlin +11).
- A just-recovered backup booming (Wk1 Monangai) when he wasn't cleared.
- A low-usage WR spiking out of nowhere (Wk3 Burden).
- Opponent ceiling weeks (Wk1 Rayrays 135.86, 2nd-highest that week).
