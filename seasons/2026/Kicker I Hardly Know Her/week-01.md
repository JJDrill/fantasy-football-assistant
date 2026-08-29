# Week 1 (2026-08-25, initial pass — will update before kickoff)

**Matchup**: J's Pancakes vs. THE Lil Unk Rayray's (team 4).

## Lineup

No changes from default — every starter is the clear best option over the bench at
that position:

| Slot | Starter |
|---|---|
| QB | Josh Allen |
| RB | Josh Jacobs, David Montgomery |
| WR | Amon-Ra St. Brown, George Pickens |
| TE | Kyle Pitts Sr. |
| FLEX | Tetairoa McMillan |
| K | Eddy Pineiro |
| DEF | Vikings |

Bench: Burden III, Dowdle, Monangai, Reed, Tate, Mahomes — none close enough to a
starter to warrant a swap.

## Open item before kickoff

**Josh Jacobs had a "Q" injury-status badge** on the roster page (spotted in raw HTML,
not yet surfaced by `roster-page.js`'s parsed output). Re-check his status before the
lineup locks — if he's out, Dowdle is the natural RB replacement.

## Injury/Availability Report (cached)

Per `reference/injury-cache-convention.md` — check here before re-searching a player
this week. Refreshed 2026-08-28 (previous 2026-08-26 entries were stale per the
freshness rule). Legal/off-field flags folded into the Note column per
`lineup-advice`'s Step 4.

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Josh Allen | Healthy | Not on injury report; no legal/off-field flags found | 2026-08-28 | [Yahoo Sports](https://sports.yahoo.com/articles/josh-allen-announces-injury-surgery-113052349.html) |
| Josh Jacobs | Questionable + legal risk | Back at practice after groin injury. **Not suspended (yet)**: arrested in May on multiple charges, DA has since reduced it to two misdemeanors (battery, criminal damage), NFL hasn't ruled — Adam Schefter expects a suspension eventually (CBA baseline is 6 games for domestic-abuse violations) but no decision before Week 1 confirmed. Treat Week 1 availability as at-risk, re-check right before lock. | 2026-08-28 | [Yahoo Sports](https://sports.yahoo.com/articles/happened-josh-jacobs-latest-packers-000055691.html), [ClutchPoints](https://clutchpoints.com/nfl/green-bay-packers/packers-josh-jacobs-facing-reduced-charges-after-may-arrest), [ProFootballNetwork](https://www.profootballnetwork.com/will-josh-jacobs-be-suspended-packers-week-1/) |
| David Montgomery | Healthy | No current concerns, no legal flags | 2026-08-28 | [FOX Sports](https://www.foxsports.com/nfl/david-montgomery-player) |
| Amon-Ra St. Brown | Healthy | No 2026 flags found; last injury news is from Dec 2025 | 2026-08-28 | [NBC Sports](https://www.nbcsports.com/nfl/amon-ra-st-brown/7075/news) |
| George Pickens | **Unverified suspension rumor — flag, don't act on it** | Multiple uncorroborated social posts (Instagram/Facebook) claim an indefinite suspension for PED use; no accessible primary-source article confirmed it, and dates are ambiguous. Also has a pattern of in-season conduct fines. Recommend manually checking Yahoo's roster page for an active suspension badge before lock rather than trusting this. | 2026-08-28 | [Newsweek reference only, unconfirmed](https://www.newsweek.com/sports/nfl/nfl-announces-punishment-for-cowboys-wr-george-pickens-11208095) |
| Kyle Pitts Sr. | Questionable | Undisclosed injury (reportedly foot) per HC Raheem Morris; also just signed a 3-yr/$54M extension. No legal flags | 2026-08-28 | [Falcons.com](https://www.atlantafalcons.com/news/kyle-pitts-injury-falcons-extremely-cautious-approach) |
| Tetairoa McMillan | Questionable | Ankle soreness from spring practice, participated in camp Aug; no legal flags. Note: prior cache entry (Aug 26) said "hamstring" — re-verify which is current before lock | 2026-08-28 | [Yahoo Sports](https://sports.yahoo.com/articles/panthers-tetairoa-mcmillan-shuts-down-233317367.html) |
| Eddy Pineiro | Healthy | Hamstring strain was Nov 2025, fully resolved by Dec 2025 — no current-season issue despite noisy search results; no legal flags | 2026-08-28 | [ESPN](https://www.espn.com/nfl/story/_/id/47001857/49ers-kicker-eddy-pineiro-hamstring-strain-miss) |
| Vikings (DEF) | Mostly healthy | Core starters fine; depth WR Jeshaun Jones given a 3-game suspension after an April DUI-refusal arrest, but that's a roster/depth issue, not a DEF-slot scoring issue | 2026-08-28 | [Star Tribune](https://www.startribune.com/minnesota-vikings-arrest-nfl-suspension-53-man-roster-jeshaun-jones-wide-receiver-kevin-o-connell/601882539) |
| Luther Burden III (bench) | Questionable | Groin injury since Aug 8, returned to individual drills Aug 26; expected ready for Week 1 | 2026-08-28 | [Bears Talk](https://bearstalk.com/2026/08/26/bears-luther-burden-injury-update-return-practice) |
| Rico Dowdle (bench) | Healthy | Signed with Pittsburgh this offseason (matches roster data); no current flags, no legal issues | 2026-08-28 | [FOX Sports](https://www.foxsports.com/nfl/rico-dowdle-player) |
| Kyle Monangai (bench) | Doubtful | Hyperextended knee (Aug 17), week-to-week; no surgery needed but no confirmed Week 1 timetable | 2026-08-28 | [NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-08-17/kyle-monangai-knee-to-miss-multiple-weeks) |
| Jayden Reed (bench) | Healthy | Recovered from 2025 collarbone/foot injuries, played preseason Week 1. **Subject to the approved Reed↔Stevenson trade — see Open item below, not yet reflected in live roster** | 2026-08-28 | [ESPN](https://www.espn.com/nfl/player/_/id/4362249/jayden-reed) |
| Carnell Tate (bench) | Questionable | Dizziness episode from a hit in practice, missed a few days, returned Aug 21 | 2026-08-28 | [SI](https://www.si.com/nfl/titans/onsi/titans-practice-report-carnell-tate-absent-mitch-trubisky-returns-amidst-new-injury-concerns-01m0dfwqacy3) |
| Patrick Mahomes (bench) | Healthy (limited reps) | Recovering from 2025 ACL/LCL tear; sitting out all of preseason as a precaution, but "extremely confident" for Week 1; no legal flags | 2026-08-28 | [CBS Sports](https://www.cbssports.com/fantasy/football/news/chiefs-patrick-mahomes-eyeing-week-1-return-in-2026) |

## Matchup Grades (Week 1, per `lineup-advice` Step 5)

**Caveat:** the 2026 season hasn't kicked off, so there's no in-season defense-vs-position
data yet. Grades below are proxied from teams' 2025 season-long defensive performance
(and, in a couple of cases, partial-season 2025 snapshots) — treat as directional, not
precise ranks, and re-derive once real 2026 weekly data exists.

| Player | Position | NFL Opponent | Grade | Reasoning |
|---|---|---|---|---|
| Josh Allen | QB | Hou | Unfavorable | Texans were a top-tier defense in 2025 (league-low points allowed, top-10 sacks) |
| Josh Jacobs | RB | Min | Unfavorable | Vikings had the 2nd-ranked run defense in 2025 |
| David Montgomery | RB | Buf | Neutral | Bills defense was middling in 2025 (~10th-11th in points/yards allowed) |
| Amon-Ra St. Brown | WR | NO | Favorable (low confidence) | Saints were a bottom-tier team overall in 2025; couldn't confirm a precise WR-specific rank |
| George Pickens | WR | NYG | Neutral (low confidence) | Giants were mid-pack on scoring defense (6th through Week 8, small sample); no WR-specific figure found |
| Kyle Pitts Sr. | TE | Pit | Neutral (low confidence) | Couldn't find a TE-specific rank for Pittsburgh; generally a solid Steelers defense, leaning Unfavorable |
| Tetairoa McMillan | WR | Chi | Favorable | Bears ranked 29th in points allowed (through 8 games, 2025) — one of the league's weaker defenses |
| Eddy Pineiro | K | LAR | N/A | Matchup grading doesn't meaningfully apply to kickers |
| Vikings (DEF) | DEF | GB | Favorable (sacks) | Packers allowed 36 sacks in 2025, up from 22 the year before — a weaker offensive line to attack |
| Rico Dowdle (bench) | RB | Atl | Favorable | Falcons had the 23rd-ranked run defense in 2025 |
| Luther Burden III (bench) | WR | Car | Favorable | Panthers allowed a league-high 31.7 pts/game in 2025, one of the worst defenses overall |
| Kyle Monangai (bench) | RB | Car | Favorable (moot — hurt) | Same weak Panthers defense, but he's doubtful this week regardless |
| Jayden Reed (bench) | WR | Min | Unfavorable | Same elite Vikings defense as Jacobs faces |
| Carnell Tate (bench) | WR | NYJ | Favorable (low confidence) | Jets showed up as one of the softer RB matchups in 2025 searches; no direct WR figure found, treat as a lean |
| Patrick Mahomes (bench) | QB | Den | Unfavorable | Broncos were the No. 1-ranked fantasy defense in 2025 |

## Notes

- Opponent has the edge at RB2 (Bijan Robinson) and QB depth (Williams/Stafford), but
  our WR corps and Allen offset that. Not expected to change our starters either way.
- Roster `points` field is still last-season totals, not Week 1 projections — fine for
  a rough pass, not for close calls.
- **Trade not yet reflected**: the Jayden Reed ↔ Rhamondre Stevenson trade (see
  `trades.md`) was reported approved, but the live roster pulled 2026-08-28 still shows
  Reed on the bench and no Stevenson. Re-pull the roster closer to kickoff to confirm it's
  posted before finalizing bench decisions.
