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

## League-wide grading: what it says about QBs (2026-10-24, Wks 1-6)

Two views (`league-decisions.md`): starter vs. benched QB on the same team (32 pairs, 7 teams), and every two teams' starting QBs in
the same week (~60 starters).

1. **Within a team, follow the ranking.** The better-ranked QB won 24 of 32 (75%). Benched QBs are usually well behind the starter, so
   these gaps are big.
2. **Across teams, the rankings sort tiers but not close QBs.** Top-5 QBs averaged 22.4, 6-12 averaged 19.9, 13+ averaged 16.6. But the
   better-ranked QB won only 51% with a 1-3 spot gap, 56% at 4-8 and 59% at 9-15; only a 16+ gap was reliable (9 of 10). So the QB
   coin-flip window is likely much wider than the placeholder 3, maybe ~8-15. Watch item through ~Wk10.
3. **Going against the ranking worked 5 of 6 times (+11.8 points),** mostly Rayrays with two close QBs. Too few calls, mostly one
   manager: luck-sized, no rule change.
4. **Mahomes is wasted on our bench.** Allen outscored him 6 of 6 (Allen ranked 1-5 every week, 27.5 a game), so benching Mahomes cost
   nothing, but Mahomes scored 11.5-29.0 a week there: starter points for most teams. That's the strongest case for #19 (Mahomes ↔ Warren).
5. **Point 2 matters for trades:** a QB8 isn't much worse than a QB4 week to week, so QB-needy teams can get by with a mid-ranked QB, and
   with Rayrays selling two, Mahomes's price should be pitched on his season points, not his rank. Backs Rule 3 (move fast).
6. **Wk8:** Queen starts Herbert (ranked ~23-25 most weeks) with Purdy on bye. A plus for us.

## League-wide grading: what it says about RBs (2026-10-24, Wks 1-6)

Starter vs. benched RB on the same team, 127 pairs (`league-decisions.md`), by ECR gap:

| Gap | Better-ranked RB scored more | Excl. TDs |
|---|---|---|
| 1-3 | 3 of 9 (33%) | 5 of 9 (56%) |
| 4-8 | 7 of 16 (44%) | 8 of 16 (50%) |
| 9-15 | 13 of 19 (68%) | 14 of 19 (74%) |
| 16-30 | 50 of 62 (81%) | 53 of 62 (85%) |
| 31+ | 20 of 21 (95%) | 20 of 21 (95%) |

1. **Big gaps: RB ECR is the most reliable of any position. Close gaps: a coin flip, wider than our window.** Within 8 spots the
   better-ranked RB won only 10 of 25, so the RB window (Rule 1, ~3) looks closer to ~8. Same pattern as QB (window looks ~8-15) and
   FLEX (38% within 10, 61% at 11-25, 76% beyond). Small sample (25 pairs): watch item.
2. **TDs flip RB results often:** 23 of 127 pairs (18%) changed winner once TDs were removed. A close RB call lost to a TD is chance.
3. **Our RB2 is the real problem.** League-wide only 7 RB calls went against ECR in six weeks, and 4 were ours (Dowdle over Stevenson
   Wks 1-2, Marks over Stevenson Wk3, Miller over Kamara Wk6; ~9 points net cost). More telling: in those pairs we were choosing among
   RBs ranked 23-34 almost every week (RB2 starters ~8.7 a game), while a 10-team RB2 is about RB20. Without Jacobs we've picked between
   backups, and that's a coin flip whichever way we go.

**Takeaway:** fix RB2 with a better RB, not better start/sit calls. #19 (Mahomes ↔ Warren, ~RB11) is the clearest upgrade on the
roster: 15-20 spots better than what we've started, the size of gap where RB ranks become reliable. Waivers won't fix it (wire RBs at
RB37+ beat a starter ~13% of the time). Between two of our RBs within ~8 spots, call it a coin flip and break it on usage/role.

**Wk10 window check:** if close RB pairs (gap ≤8) are still near 50% after 10 weeks of league grading, propose widening the RB window in
Rule 1 from ~3 to ~8 (and the QB placeholder likewise, from the QB section above). Until then Rule 1 stays at ~3.

## League-wide grading: what it says about WRs (2026-10-24, Wks 1-6)

Starter vs. benched WR on the same team, 160 pairs (`league-decisions.md`), by ECR gap:

| Gap | Better-ranked WR scored more |
|---|---|
| 1-5 | 6 of 9 (67%) |
| 6-10 | 10 of 14 (71%) |
| 11-20 | 22 of 45 (49%) |
| 21-40 | 40 of 59 (68%) |
| 41+ | 29 of 33 (88%) |

1. **WR ECR is only reliable at big gaps.** The small 1-10 rows are noisy; read them together: within ~20 spots the better-ranked WR
   won 38 of 68 (56%). Only past ~20 does ECR clearly beat a coin flip, and even a top-12 favorite won just 72%.
2. **It isn't TDs.** Removing TDs changed the winner in only 8% of WR pairs (RB: 18%). The swings come from targets and big plays,
   which is also why wire WRs at WR37+ beat a starter about a third of the time (waivers section).
3. **Going against ECR broke about even, except benching a top-10 WR.** 11 calls league-wide (Russini 4, Gospel 2, Brian 2, Maria 2,
   Dusty 1; none ours). Maria benching Puka (WR7) in Wk4 cost ~21 points.
4. **Ours: right calls, noisy results.** We followed ECR every time. Pickens (ranked 7-16 in Wks 1-4) scored 4.3, 7.0, 11.7 and 8.5,
   and a lower-ranked bench WR (Burden or Tate) beat him in 4 of 5 pairs. That's point 1's noise, not a mistake.

**Takeaway:**
- **Lineup:** within ~10 WR spots, call it a coin flip and start the **later kickoff** (same tiebreak as FLEX) to keep options open.
  Never bench a top-10 WR on a hunch.
- **Trades:** WR rank is fuzzy within ~20 spots, so don't pay much to move up 10 at WR; 15-20 spots at RB is worth far more.
- **Waivers:** a deep WR is a fair one-week bye fill-in.

**Wk10 window check:** the grader's WR window is a placeholder 5, and Rule 1 has no WR window. If WR pairs within ~20 spots are still
near 55% after 10 weeks, propose a WR window (~10-20) in Rule 1, alongside the RB and QB checks above.

## League-wide grading: what it says about TEs (2026-10-24, Wks 1-6)

Starter vs. benched TE on the same team, 33 pairs across 7 teams (`league-decisions.md`), by ECR gap:

| Gap | Better-ranked TE scored more |
|---|---|
| 1-5 | 5 of 11 (45%) |
| 6-10 | 8 of 16 (50%) |
| 11-20 | 3 of 6 (50%) |

1. **Below the elite tier, TE ECR is a coin flip at every gap: 16 of 33 (48%).** Unlike RB and WR, it never pulls away within 20
   spots (almost no pair is further apart). Week to week, a TE5 and a TE20 look about the same.
2. **Elite TEs are the exception.** Bowers (ranked 1-3) won 4 of 4, McBride 2 of 4; top-3 TEs won 6 of 10. Small, but a true top TE
   separates and nobody else does.
3. **It isn't TDs.** Removing TDs changed only 1 of 33 results. TE weeks swing on targets: Loveland 0 and 0.8, Sadiq 0, Kraft 2.5,
   Pitts 1 and 2 were all ranked TEs.
4. **Ours: ~15 points lost going against ECR, all Wks 2-4.** Pitts over Likely Wks 2-3 (−3.8, −1.3), Sadiq over Likely Wk4 (−10.1,
   Sadiq 0). Given point 1 those were mostly coin flips lost, except Wk4: a rookie with no clear role. Since ECR-first we've started
   Likely (26.9 in Wk5).

**Takeaway:**
- **Lineup:** Rule 1's TE order (ECR, then targets within ~5) is right in spirit, but nearly every non-elite TE call is a toss-up, so
  lean on targets and health, not the size of the ECR gap. Wk8: Pitts covering Likely's bye costs less than his rank suggests.
- **Trades:** don't pay for a TE upgrade unless it's a true top 3. TE12 to TE6 buys almost nothing week to week (e.g. Russini's
  benched Kelce). Suggestion 4 below is softened to match.
- **Wk10 window check:** this is the existing TE watch item. If non-elite TE pairs are still near 50% at any gap after 10 weeks,
  propose in Rule 1: "TE outside the top 3: treat every call as a toss-up; decide on targets, then health tier."

## League-wide grading: what it says about FLEX (2026-10-24, Wks 1-6)

FLEX starter vs. eligible bench player, 154 pairs (`league-decisions.md`), positions mapped from Sleeper.

| FLEX ECR gap | Better-ranked player scored more |
|---|---|
| 1-10 | 5 of 13 (38%) |
| 11-25 | 14 of 23 (61%) |
| 26+ | 90 of 118 (76%) |

| RB vs. WR call, FLEX ECR preferred... | ...and he scored more |
|---|---|
| the RB | 26 of 36 (72%) |
| the WR | 16 of 30 (53%) |

1. **The FLEX window is right at ~10, and 11-25 is only a bit better than a coin flip.** Same pattern as every position.
2. **FLEX ECR overrates WRs against RBs in this league.** In RB-vs-WR pairs the RB outscored the WR 40 of 66 (61%) regardless of rank;
   RBs started at FLEX averaged 14.8, WRs 10.5. Likely cause (a guess, not shown by the data): this is half-PPR, and FLEX ECR may lean
   toward full-PPR value, where WR catches count more.
3. **Not TDs:** removing TDs changed only 13 of 154 results (8%). RBs win on volume.
4. **Ours:** a WR at FLEX every week (McMillan Wks 1-4, FLEX 31-42; Burden Wks 5-6, FLEX 45-49), 13.7 a game but ~10 median
   (McMillan's 38.2 in Wk4 lifts it). That fit our roster, since our RB options were RB23-34. Our two against-ECR FLEX calls (McMillan
   over Stevenson Wks 1-2) netted about even.
5. **Not tested:** the later-kickoff tiebreak (the grader has no kickoff times). It's about reacting to late news, not scoring, so it stays.

**Takeaway:** in a close FLEX call (within ~25 spots) between an RB and a WR, lean RB, then later kickoff (suggestion 7 in "This
season's rules"). If FLEX ECR prefers the RB, trust it. For trades, an RB is worth more than an equally ranked WR here: he fills RB2
and outscores WRs at FLEX. That makes #19 (Mahomes ↔ Warren) better still.

**Wk10 check:** if WR-favored RB-vs-WR pairs are still near 50% and RB-favored ones near 70%, propose making suggestion 7 a Rule. If
FLEX pairs at 11-25 are still near 60%, consider widening the FLEX window from ~10 toward ~20.

## Our games, re-scored as if both teams had followed ECR (2026-10-24, Wks 1-6)

`grade-league-decisions.js` now re-scores our game each week: every starter who was picked over a higher-ranked bench player is
swapped for his best-ranked such player (each bench player used once), for both teams. Swap value = bench points − starter points.

| Wk | Opponent | Result | Our swaps | Their swaps | If both followed ECR |
|---|---|---|---|---|---|
| 1 | Rayrays | L by 14.7 | Stevenson for Dowdle +8.9 | none | L by 5.8 |
| 2 | Brigid | L by 2.5 | Stevenson for Dowdle −2.3; Likely for Pitts +3.8 | none | L by 1.0 |
| 3 | Brian | L by 6.9 | Stevenson for Marks −3.3; Likely for Pitts +1.3 | Boston for Addison −10.4; Thomas Jr. for Odunze −4.6 | **W by 6.1** |
| 4 | Russini | L by 1.5 | Likely for Sadiq +10.1 | Golden for Vele −4.2; Kincaid for Kelce −1.3 | **W by 14.1** |
| 5 | Knights | W by 1.6 | none | none | W by 1.6 |
| 6 | Gospel | W by 15.5 | Kamara for Miller +5.9 | Downs for Bernard −13.5 | W by 34.9 |

1. **Our own against-ECR calls cost one game outright: Wk4 (Sadiq over Likely).** Following ECR on our side alone would make us 3-3,
   not 2-4. Wk2 is closer than it looks: ECR's whole lineup still loses by 1.0, because Stevenson over Dowdle would have cost 2.3.
   The Wk2 Pitts-for-Likely swap on its own (+3.8) wins it, which is why the Wk1-4 audit counts it as knowable.
2. **Wk3 was decided by Brian's calls, not ours.** Addison over Boston (inside the WR window) and Odunze over Thomas Jr. gained Brian
   15.0. With both teams following ECR we win by 6.1. That's chance, so no rule change.
3. **Rayrays, Brigid and Knights never went against ECR** in their games against us, so those three came down to rosters and scoring.
4. **Both wins were safe:** Wk5 had no swaps on either side; Wk6 we won by 15.5 even though Gospel's call gained 13.5.

**Takeaway:** the record overstates our problems. One loss was our own early mistake (Wk4, now fixed by ECR-first), one was nearly a
coin flip (Wk2), one was an opponent's coin flip landing (Wk3), and only Wk1 was a clear loss with clean lineups. That backs Rule 2:
we're a playoff-scoring team, don't rebuild.

*Correction (2026-10-24):* the first, hand-made version of this table counted one bench player in two slots and flipped only the
Pitts call in Wk2. It said following ECR would have made us 4-2 and won Wk2 by ~1.3; the grader's version (above) shows 3-3, with
Wk2 still a loss by 1.0. It also named Thomas Jr. instead of Boston for Brian's Wk3 call.

## League-wide grading: what it says about the playoffs (2026-10-24, through Wk6)

4 of 10 make it (Wks 16-17), 15-game regular season. The grading doesn't measure standings, but it says where playoff odds come from.

**Odds now** (`node yahoo/playoff-odds.js 6`: Wks 7-15 simulated on the real schedule, 20,000 runs; each team's points per game
regressed halfway to the league average, weekly spread 22; ties broken on points for, which is Yahoo's default and an assumption):

| Team | Record | PF/game | Proj. wins | Playoff odds |
|---|---|---|---|---|
| Knights | 4-2 | 128.0 | 9.6 | 88% |
| Russini | 5-1 | 117.3 | 9.9 | 86% |
| Brigid | 5-1 | 116.6 | 9.8 | 85% |
| Queen | 4-2 | 112.0 | 8.6 | 57% |
| Maria | 3-3 | 113.6 | 7.6 | 36% |
| **Us** | **2-4** | **115.5** | **6.8** | **21%** |
| Rayrays | 3-3 | 106.1 | 7.2 | 20% |
| Dusty | 2-4 | 101.9 | 5.9 | 5% |
| Gospel | 0-6 | 111.0 | 4.5 | 1% |
| Brian | 2-4 | 88.6 | 5.1 | 1% |

1. **Lineup calls won't get us in.** Since ECR-first our against-ECR calls cost about zero, and league-wide hunches net to nothing.
   From here odds come from roster points per week.
2. **#19 (Mahomes ↔ Warren) is worth about +10 to +16 points of playoff odds.** Warren averages 15.4 half-PPR (median ~11.4; one
   33.8 game) against our RB2 options at 6-11 (Gordon 11.4, Kamara 9.0, Corum 8.0, Miller 6.0), so +4 to +6 a week: **21% → 32%
   at +4, 38% at +6.** That's more than the Wk5 rule of thumb (+5 points of odds per +5 a week), because we're on the bubble with 9
   games left. Mahomes costs us no points (Allen outscored him 6 of 6, and Allen's bye is Wk7), only injury insurance. Nothing else the
   grading found comes close: DEF/K streaming and 10-spot WR/TE upgrades barely move weekly points.
3. **Our record understates us:** 6th in odds but 4th in points per game; 3-3 had we followed ECR (see "Our games, re-scored").
   Queen (57%) has the luckiest record and should drift down; Gospel is a median team at 0-6, so the Wk15 rematch is harder than it looks.
4. **Maria (Wk7) is the direct rival:** 5th at 36%, one spot above us. Wk7 is close to a two-game swing.
5. **Don't count on opponents' mistakes:** most set ECR lineups (Manager habits, `league-decisions.md`).
6. **Playoff weeks are coin flips at the margin.** In Wks 16-17 follow ECR and the tiebreak rules as usual. Don't pick a playoff DEF by
   its Wk16-17 schedule: DEF ranks barely predict even one week.

**Takeaway:** get #19 done, and soon (Rule 3; Rayrays is selling QBs too). Re-run `playoff-odds.js` after each week; the Wk5 estimate
in `league-patterns.md` is superseded.

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
4. **Suggestion: TE is an edge for us, but a noisy one; keep a real backup.** Maria (Fannin), Rayrays (Andrews) and Queen (Kraft) get
   under ~7 a week at TE (Wk7 scouting). Likely is scarce, not just good, so lean toward keeping Pitts after Likely's Wk8 bye rather than
   cutting him. *Softened 2026-10-24:* league grading shows non-elite TE weeks are close to random (better-ranked TE won 48%, TEs
   section), so the edge is real over a season but small and unreliable in any one week. Not a reason to turn down a good trade.
5. **Suggestion: manager reads for trade pitches** (applies all-seasons rule 13). Smokin Base Brian: no moves all season, don't
   bother. Man Coverage Brigid: 3 moves, set-and-forget, only a clearly-good-for-them offer. THE Lil Unk Rayrays and Knights: active,
   the best places to pitch. Dusty: rejected trade id 12, don't re-pitch that deal (`trades.md`).
6. **Suggestion: kickers are interchangeable** (2026-10-24, league grading Wks 1-6: better-ranked kicker won 40%). Start any kicker
   whose team plays that week, preferring indoors or good weather. No waiver priority, no backup kicker, no lineup time on K matchups;
   put that roster spot and attention on an RB handcuff instead. **Promotion check ~Wk10:** if the better-ranked kicker still wins
   under ~50% across 10 weeks of league grading, propose it for `methodology/rules.md` as an all-seasons Provisional rule.
7. **Suggestion: in a close FLEX call, lean RB over WR** (2026-10-24, league grading Wks 1-6). Within ~25 FLEX spots, start the RB,
   then use the later kickoff (Rule 1) as the next tiebreak. FLEX ECR's RB picks won 72% against WRs, its WR picks only 53%, and RBs
   at FLEX averaged 14.8 vs. 10.5 (66 RB-vs-WR pairs, only 10 of them close). **Wk10 check** in the FLEX section above.
   *Caveat (2026-10-24, once the grader split it out):* the 10 close RB-vs-WR pairs don't back this yet. The favored RB won 1 of 5
   and the favored WR 2 of 5, so close calls look like coin flips either way. The lean rests on the overall split; treat it as the
   weakest suggestion here until close pairs build up.

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
