# Week 0 — Draft (2026-08-23)

**Team**: J's Pancakes, drafted 10th of 10, 15-round snake draft, run live by `run-draft.js`.

## Picks

| Rd | Pick | Notes |
|----|------|-------|
| 1 | Josh Allen (QB) | |
| 2 | Amon-Ra St. Brown (WR) | |
| 3 | George Pickens (WR) | |
| 4 | Tetairoa McMillan (WR) | |
| 5 | Luther Burden III (WR) | Yahoo's post-draft report card flagged this as a steal (71 vs ADP 59) |
| 6 | Carnell Tate (WR) | |
| 7 | Josh Jacobs (RB) | |
| 8 | David Montgomery (RB) | |
| 9 | Rico Dowdle (RB) | |
| 10 | Kyle Monangai (RB) | |
| 11 | Kyle Pitts Sr. (TE) | |
| 12 | Jayden Reed (WR) | |
| 13 | W. Robinson (RB) — **did not land** | `PICK_NOT_REGISTERED`: clicked Draft but he never appeared on the roster; confirmed via official Yahoo results that the pick genuinely failed, not a scraping error |
| 14 | Patrick Mahomes (QB) — autopick | Script was stopped before this pick (see below); wasted bench value behind Allen in a single-QB league |
| 15 | Eddy Pineiro (K) / Vikings (DEF) — autopick | K/DEF were intentionally deferred to the last 2 rounds by strategy; stopping the script early meant Yahoo's autopick filled them instead of the driver |

Final bench: Burden III, Dowdle, Monangai, Reed, Tate, Mahomes.

Yahoo's own post-draft grade: **A**, projected 10-5.

## Why the script got stopped early

Two *expected* behaviors got misread as bugs in the moment:
1. No kicker/DEF drafted by round 12-13 looked wrong but was working as designed — K/DEF are deliberately saved for the last two rounds.
2. A momentary "missing player" in one roster view (C. Tate, round 12) looked like a failed pick but had actually landed fine — likely just a stale view.

Stopping over the false alarm cost more (an autopicked, redundant backup QB) than the one genuine miss (W. Robinson) did. Next draft: don't stop on either signal alone — check the official post-pick-clock roster or wait a few seconds before concluding something broke.

## Roster decisions carried into the season

- **Keeping Mahomes for now.** Dead bench weight in a single-QB league, but not worth burning a waiver move on yet — revisit if Allen gets hurt or a clearly better bench piece becomes available.

## Note for next draft

Josh Jacobs (Rd 7) was drafted without checking for off-field red flags — he's since been in
the news for possible legal issues. Next draft, add a check for significant off-field issues
(ongoing legal trouble, suspension risk, health concerns beyond normal injury status) before
picking a player, not just stats/team fit. Still undecided whether this is a manual pre-draft
check or something the draft-driver screens for automatically — worth a real design
conversation when draft-driver work resumes next preseason.
