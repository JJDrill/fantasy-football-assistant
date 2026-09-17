# Week 2 (2026-09-12 pre-game check)

**Matchup**: J's Pancakes vs. Man Coverage Brigid (team 6).

No pending trades (user confirmed 2026-09-12). No Yahoo app alerts flagged. No specific
worry flagged going in.

---

# Week 2 Final Pre-Game Check (2026-09-17, last pass before lock)

**Lions @ Bills is tonight (Thu 9/17, 8:15pm)** — Josh Allen and Amon-Ra St. Brown both
lock tonight; the rest of the roster locks with Sunday's games.

Live data confirmed working again (`get-matchup.js 2`, `run-challenge.js 2`).

**Trade flagged by user**: Carnell Tate ↔ Tucker Kraft (see `trades.md` #2, proposed
2026-09-16) is still pending — not yet reflected in the roster fetch (Tate still shows on
bench, no Kraft). Nothing to reconcile yet; re-check once it clears or is vetoed.

No Yahoo app alerts flagged this pass. User's specific worry: kicker Eddy Pineiro
possibly questionable — see refreshed table below, this is confirmed real.

## What changed since the 2026-09-12 pass

Every starter/relevant bench player re-searched fresh (5 days is well past the freshness
window). Source tiering per `methodology/trusted-sources.md`.

| Player | 09-12 status | 09-17 status | Note |
|---|---|---|---|
| Josh Allen | Cleared to play | **Confirmed active** | Not on Bills' final Thu injury report (Bishop, Sanders, Ty Johnson are the ones listed questionable — none are Allen). [SI/Onsi final report](https://www.si.com/nfl/bills/onsi/injury-report-week-2-final-buffalo-bills-three-cleared-three-questionable-for-thursday-vs-lions) |
| Amon-Ra St. Brown | No new flags (inconclusive) | **Confirmed active** | Lions' two ruled-out players are OL (Mahogany, Miller); ARSB reported "participating in practice." [CBS Sports](https://www.cbssports.com/fantasy/football/news/lions-amon-ra-st-brown-participating-in-practice), [ClickOnDetroit final report](https://www.clickondetroit.com/sports/2026/09/17/detroit-lions-injury-report-2-players-out-1-questionable-for-thursday-night-football-game-vs-bills/) |
| David Montgomery | No new flags | No new flags | Nothing on Texans' Week 2 report; expected to start. [Yahoo Sports](https://sports.yahoo.com/articles/david-montgomery-injury-analysis-joins-094919869.html) |
| Rico Dowdle | Healthy | Healthy | No injuries reported. |
| George Pickens | Healthy | **Off injury report** | Confirmed set to play. [NBC Sports](https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/george-pickens-off-injury-report-set-to-play-vs-lions-on-thursday) |
| Kyle Pitts Sr. | No confirmed status | No confirmed status | Search surfaced only other-week limited-practice mentions; nothing dated specifically to this Week 2 vs Car game found either way — **check Yahoo's badge before Sunday lock**. Falcons' own QB competition (Stefanski "leaving open every possibility") is a separate variable worth watching, per the Week 1 QB-outage lesson in `reference/matchup-grade-accuracy.md`. |
| Tetairoa McMillan | No confirmed status | **Confirmed no flag** | Panthers "go into Week 2 mostly healthy" — only 4 players on report (Patrick Jones, Darren Waller rest day, Jalen Coker minor ankle); McMillan not among them. The "questionable/illness" hits from earlier searches were from Week 10/17, a different week — confirmed by re-search, not applicable here. [Cat Scratch Reader](https://www.catscratchreader.com/carolina-panthers-injuries/60930/carolina-panthers-injury-report-go-into-week-2-mostly-healthy) |
| Vikings DEF | Clean bill | Clean bill | Vikings' Week 2 injury news (Kyler Murray concussion, Jordan Mason IR) is offense-side; doesn't touch the defense. [Star Tribune](https://www.startribune.com/minnesota-vikings-injury-report-updates-kyler-murray-news-carson-wentz-chicago-bears-nfl-week-2-game/601889384) |
| **Eddy Pineiro (K)** | **No flags found** | **Watch closely — illness, missed Wed practice** | Missed Wednesday practice (9/16) with an illness; 49ers **carry no other kicker** on the active roster or practice squad. No "questionable" tag confirmed yet as of this search (Thu/Fri reports still pending), but this is a real, developing situation — **check Yahoo's injury badge Saturday/Sunday before the early-game lock.** His game is Sunday vs. Miami, not tonight, so there's still time for status to firm up. [NBC Sports Bay Area](https://www.nbcsportsbayarea.com/nfl/san-francisco-49ers/eddy-pineiro-kyle-juszczyk/1898235/), [49ers Webzone](https://www.49erswebzone.com/articles/203329-dolphins-injury-report-pieiro-practice/) |
| Josh Jacobs (bench) | OUT (exempt list) | **No change — still OUT** | Re-searched; no new coverage beyond the 9/12 status. Still on Commissioner's Exempt List, no return timeline. See `reference/legal-watch-list.md`. |
| Kyle Monangai (bench) | Still recovering | Still recovering, trending up | Hyperextended knee (Aug 16), officially "week-to-week." Some positive noise (progressed to running per teammate D'Andre Swift) but no official clearance confirmed for Week 2 — not a confirmed start candidate yet even if he were closer to Dowdle's production. |

Not re-checked this pass (no swap under consideration, prior status stands): Luther
Burden III, Carnell Tate, Patrick Mahomes, Rhamondre Stevenson.

## Bottom line this pass

- **Lineup unchanged from the 09-12 recommendation** — no bench player clears a starter
  on health or matchup grounds, and tonight's two starters (Allen, St. Brown) are both
  confirmed clean.
- **Only real watch item: Eddy Pineiro.** No K on the bench to replace him with if he's
  ultimately ruled out Sunday — if that happens, a waiver kicker pickup would be the only
  option, and that's a same-day decision once his status firms up (out of scope for
  tonight's check).

## Lineup — NO CHANGE

Current live-roster starters are already optimal given this week's research; Josh Jacobs
remains unavailable (see below), and no other bench player clears its starter on health +
matchup grounds.

| Slot | Starter | Status |
|---|---|---|
| QB | Josh Allen | Cleared to play (minor hand injury, Week 1) — start |
| RB | David Montgomery | Healthy — start |
| RB | Rico Dowdle | Healthy — start |
| WR | Amon-Ra St. Brown | No new flags — start |
| WR | George Pickens | Healthy — start |
| TE | Kyle Pitts Sr. | No confirmed flags — start |
| W/R/T | Tetairoa McMillan | No confirmed flags — start |
| K | Eddy Pineiro | No flags found — start |
| DEF | Vikings | Clean bill of health (Week 1 report) — start |

Bench: Josh Jacobs (OUT — see below), Luther Burden III, Kyle Monangai (still recovering,
see below), Carnell Tate, Patrick Mahomes, Rhamondre Stevenson — none close enough to a
starter to warrant a swap this week.

## Injury/Availability Report (fresh search 2026-09-12)

Per `methodology/injury-cache-convention.md`. Week 1's cache entries are stale
(previous week) — every player re-searched fresh for Week 2. Source tiering per
`methodology/trusted-sources.md`.

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Josh Allen | Cleared to play | Injured non-throwing hand diving over a defender in the Week 1 win; cleared to practice and play. **Note**: one source referenced a "Dolphins" opponent for this game, which conflicts with the live roster's listed opponent (Det) — treating the live roster's opponent as authoritative and flagging the discrepancy as likely search noise rather than fact. | 2026-09-12 | [CBS Sports](https://www.cbssports.com/nfl/news/bills-josh-allen-injured-non-throwing-hand-cleared-for-practice-status-revealed-for-week-2-vs-dolphins) |
| David Montgomery | No new flags | No Week-2-specific report surfaced; one older headline references a practice absence for "illness" with no date confirmed as current. Treat as no change from healthy Week 1 status. | 2026-09-12 | [Yahoo Sports, inconclusive](https://sports.yahoo.com/articles/david-montgomery-injury-analysis-joins-094919869.html) |
| Rico Dowdle | Healthy | No injuries reported entering the season; expected to be Pittsburgh's early-down back. | 2026-09-12 | [FantasyFootballCalculator](https://fantasyfootballcalculator.com/players/rico-dowdle/injury) |
| Amon-Ra St. Brown | No current flags found | Search mostly surfaced stale 2025-season ankle coverage; nothing Week-2-2026-specific found — **check Yahoo's injury badge before lock** | 2026-09-12 | [FantasyPros, inconclusive](https://www.fantasypros.com/nfl/myplaybook/are-they-playing/amonra-stbrown) |
| George Pickens | Healthy | No new injury reports. CeeDee Lamb (Dal) reportedly out multiple weeks with an ankle sprain — if accurate, this raises Pickens' target share as Dallas' de facto WR1, a positive signal independent of the matchup grade. | 2026-09-12 | [SI Onsi](https://www.si.com/onsi/fantasy/injuries/ceedee-lamb-ruled-out-multiple-weeks-with-ankle-sprain-george-pickens-emerges) |
| Kyle Pitts Sr. | No confirmed Week 2 status | Falcons' injury reports have shown him intermittently limited in practice at various points; nothing dated to Week 2 confirmed either way — **check Yahoo's injury badge before lock** | 2026-09-12 | [Atlanta Falcons official site, general](https://www.atlantafalcons.com/news/falcons-injury-report-kyle-pitts-darnell-mooney-carolina-panthers) |
| Tetairoa McMillan | No confirmed Week 2 status | Offseason foot soreness was expected resolved by training camp; no fresher Week 2-specific report surfaced. | 2026-09-12 | [Yahoo Sports, offseason](https://sports.yahoo.com/articles/panthers-tetairoa-mcmillan-shuts-down-233317367.html) |
| Eddy Pineiro | No flags found | No current-season injury news surfaced (only unrelated future hamstring-injury coverage dated after this point in the season). | 2026-09-12 | Search inconclusive, no confident source |
| **Josh Jacobs** | **OUT (Commissioner's Exempt List)** | **Pleaded no contest** to both misdemeanor charges at Thursday's (9/10) court date — $1,000 fine + deferred judgment; case evidence was separately sealed 9/11 at his own request. Criminal case is now resolved, but he **remains on the NFL's Commissioner's Exempt List** with no return timeline — the plea did not end his NFL-side suspension. Confirmed **OUT for Week 2**. See `reference/legal-watch-list.md` (updated). | 2026-09-12 | [WISN](https://www.wisn.com/article/judge-seals-video-records-in-josh-jacobs-case-after-plea-deal/73687768), [Dallas Sports Nation](https://dalsportsnation.com/2026/09/12/packers-josh-jacobs-pleads-no-contest-to-battery-charge-remains-on-exempt-list/) |
| Kyle Monangai (bench) | Still recovering | Hyperextended knee (mid-August); "week-to-week," timeline of several weeks. No clearance confirmed for Week 2 — treat as unavailable/not a start candidate. | 2026-09-12 | [ESPN](https://www.espn.com/nfl/story/_/id/49643703/bears-rb-kyle-monangai-knee-expected-miss-multiple-weeks-source-says) |
| Luther Burden III (bench) | Expected available | Cleared groin strain in time for the Week 1 opener; no new setback reported. | 2026-09-12 | [SI Onsi](https://www.si.com/nfl/bears/onsi/luther-burden-injury-update-from-bears-brings-more-optimism-for-week-1-status) |
| Carnell Tate (bench) | Healthy | Off the injury report entering the season after a minor preseason stiffness issue; no new flags. | 2026-09-12 | [NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-09-01/carnell-tate-stiffness-not-practicing-tuesday) |
| Patrick Mahomes (bench) | Healthy | Full recovery from 2025 ACL/LCL tear confirmed; full practice participation, no new flags. | 2026-09-12 | [Yahoo Sports](https://sports.yahoo.com/articles/patrick-mahomes-injury-latest-chiefs-155051631.html) |
| Rhamondre Stevenson (bench) | Healthy | No current injury flags; minor undisclosed issue from late July resolved. | 2026-09-12 | Search inconclusive, no confident single source |

## Matchup Grades (Week 2, per `lineup-advice` Step 5)

Precise defense-vs-position ranks were hard to pin down this early in the season (most
sites only publish overall DST rankings, not position-specific splits, this early) —
confidence is noted per grade.

- **David Montgomery vs Cin**: **Favorable** (medium-high confidence) — Bengals' run defense rated among the league's worst last season (allowed 5.2 YPC, ~31st), and defensive-line losses (traded Trey Hendrickson) don't help.
- **George Pickens vs Was**: **Favorable** (low-medium confidence) — Commanders defense was "one of the worst in football" last year; no WR-specific rank confirmed, but a defense that bad overall is unlikely to shut down a WR1.
- **Rico Dowdle vs NE**: **Unfavorable** (low confidence) — Patriots' overall defense ranked a strong 6th in 2026 fantasy DST rankings; no run-defense-specific split confirmed.
- **Josh Allen vs Det**: **Favorable** (low-medium confidence) — Lions are missing both starting safeties (Kerby Joseph, Brian Branch) to injury, weakening the secondary Allen faces.
- **Amon-Ra St. Brown vs Buf**: **Neutral** (low confidence) — Bills overhauled their defense this offseason (new DC, several free-agent additions); too early for a confirmed WR-specific rank.
- **Kyle Pitts Sr. vs Car**: **Neutral** (low confidence) — Panthers added pass-rushers (Jaelan Phillips, Devon Lloyd) but no TE-specific defensive data surfaced.
- **Tetairoa McMillan vs Atl**: **Neutral** (low confidence) — no Falcons-vs-WR-specific data surfaced.
- **Eddy Pineiro**: N/A (kicker).
- **Vikings DEF vs Chi**: not separately graded (DEF is evaluated as a starter, not against an opposing "position").

## Weather & Vegas Signals (Week 2, per `lineup-advice` Step 6)

Games are 8 days out from this check (all Week 2 games fall on 2026-09-20) — most detailed
forecasts aren't published yet, consistent with the same pattern noted in Week 1's check.
Domes/closed-roof games skipped entirely: Buf@Det is at Ford Field (dome) despite being
called a "Bills new stadium debut" in one stale search result — that source appears to be
describing a different (incorrect) game; treating the live roster's listed opponent/park
as authoritative. Hou (Montgomery's team, NRG retractable — typically closed) and
Dal/Atl (Pickens'/Pitts' road-or-home retractable roofs, typically closed) also skipped.

| Game | Affected player(s) | Weather | Vegas (spread / total) | Implied totals | Signal vs. matchup grade |
|---|---|---|---|---|---|
| Steelers @ Patriots (Gillette Stadium, outdoor) | Rico Dowdle (Pit) | Not yet published (8 days out) | Patriots -4.5, O/U 43.5 | Patriots ~24 / Steelers ~19.5 | Steelers' modest implied total agrees with the Unfavorable read on Dowdle |
| Panthers @ Falcons (Mercedes-Benz Stadium — **retractable roof, typically closed**, skip weather) | Tetairoa McMillan (Car), Kyle Pitts Sr. (Atl, home) | N/A — indoor | Falcons -1.5, O/U 43.5 | Falcons ~22.5 / Panthers ~21 | Fairly even implied totals — no strong signal either way for McMillan's Neutral grade |
| Dolphins @ 49ers (Levi's Stadium, outdoor) | Eddy Pineiro (SF, home) | Not yet published (8 days out) | Not confirmed in search | Not confirmed | No signal available yet |
| Vikings @ Bears (Soldier Field, outdoor) | Vikings DEF (Min) | Not yet published; "shouldn't be an issue for scoring" per one source, but no numeric forecast yet | Vikings -2.5, O/U 48.5 | Vikings ~25.5 / Bears ~23 | A total this high is a mild positive signal for offensive production against the Vikings, but doesn't move the Vikings' own DEF grade much |

## Notes

- **Key swing factor this week was Josh Jacobs' legal case** — his court date (Sept. 10)
  has now happened and resolved with a plea deal, but it did **not** end his NFL
  Commissioner's Exempt List status, so he stays benched exactly as in Week 1. Worth a
  fresh check again next week since the criminal case being closed removes one variable
  the league might have been waiting on.
- Several matchup grades this week carry low confidence — position-specific
  defense rankings (vs. WR/RB/TE) aren't well-published yet this early in the season;
  most sources only had overall team DST fantasy rankings. Re-check once a few weeks of
  real defensive stats exist.
- Roster `points` field from the live fetch is still null for all players (pre-game) —
  expected, not an error.
- This week's $10 challenge ("You're Killin' Me, Smalls" — lowest-scoring starter among
  winning teams) can't be evaluated pre-game; it's a post-game computation. Flagged here
  because, unlike Week 3's kicker challenge, it doesn't constrain any Week 2 lineup
  choice.
