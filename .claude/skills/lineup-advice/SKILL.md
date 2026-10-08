---
name: lineup-advice
description: Use when the user wants start/sit help or lineup optimization advice for an upcoming or current week in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Lineup Advice

Gives start/sit recommendations for the user's team for a given week.

## Steps

1. Determine which week the user means (default: current NFL week).
2. **Try live data first, if it's available:**
   - Check whether `yahoo/get-matchup.js` exists. If it exists, run
     `node yahoo/get-matchup.js <week>` from the project root to get the user's roster,
     opponent name, and opponent's roster as JSON.
   - If it's missing or it errors, fall through to the manual path — this is expected
     until OAuth + Yahoo API approval are done and the script is built.
3. **Manual path (used until live data works):**
   - Ask the user to paste or screenshot their current roster for that week (starters and
     bench, with positions) from the Yahoo app. If known, also ask for their opponent's
     roster — useful for context but not required.
   - Also ask if there's anything specific worrying them (a bye week, an injury designation,
     a tough matchup) so you can focus there.
4. Get injury/availability status for every player on the full roster (starters and
   bench), plus any off-field legal/status red flags (arrests, citations, suspensions,
   DUIs, etc. — the kind of thing that can sideline a player independent of health; see
   the Josh Jacobs note in `seasons/2026/Kicker I Hardly Know Her/week-00-draft.md` for
   why this check exists). First check `seasons/2026/Kicker I Hardly Know Her/reference/legal-watch-list.md` for an existing
   open entry on the player — if one exists, treat it as still active and search fresh
   anyway to see if it's progressed (update the row rather than duplicating it; append a
   new row for anything newly discovered, per that file's protocol). Then, per the
   shared cache protocol in `methodology/injury-cache-convention.md`, reuse a fresh cached
   entry if one exists for that player this week, otherwise `WebSearch` both (injury
   status, and something like "<player name> arrest OR charged OR suspended OR DUI") and
   record them there so other skills (and later calls this week) don't re-search it.
   Cite sources for anything surfaced, tiered per `methodology/trusted-sources.md` — a
   Tier 2-only claim (social media, fan blogs/aggregators) gets reported labeled
   **Unverified** rather than stated as fact, per that file's protocol. A legal/off-field
   flag is informational only — surface it clearly in the final list (step 10), but don't
   auto-bench the player for it.
5. **Usage first.** Pull the last 2-3 weeks of usage for every player on the full roster,
   bench included, from Sleeper (`yahoo/sleeper-stats.js`: `getWeekStats(2026, week)`,
   keyed by Sleeper player id). Use `off_snp`/`tm_off_snp` (snap share), `rush_att`,
   `rec_tgt` and `pts_half_ppr`. Build a usage table per position group in the week's notes
   file. This is the **primary** start/sit input. It's why this step comes before the
   matchup grade. See `seasons/2026/Kicker I Hardly Know Her/reference/season-lessons.md` for the
   Weeks 1-4 audit that set this order: Likely's 8/10/5/12 targets sat on the bench behind
   Pitts' 1/3/2, and the matchup grade kept a fading Montgomery in the lineup.
   - **Re-rank the whole position group, bench included.** Never frame a decision as only
     "current starter vs. new option." Every eligible player at the position gets ranked.
   - A player whose carries/targets/snap share are **falling** stays in that tier even with
     a Favorable matchup. A Favorable grade doesn't rescue declining usage.
   - **Byes:** a player missing from every FantasyPros list (step 5b) is usually on bye. Confirm
     it and fill the slot.
5b. **Expert consensus + player props** (added 2026-10-05, being tested; see
   `seasons/2026/Kicker I Hardly Know Her/reference/source-accuracy.md`):
   - **Consensus rank:** run `node yahoo/fantasypros-ecr.js --players "<every rostered player,
     comma-separated>"`. It returns FantasyPros' half-PPR weekly ECR per player, with the best/worst
     expert rank and a start/sit grade. Free, Tier 1. Rankings refresh through the week, so re-run
     before Sunday. A wide best-to-worst range means experts disagree, so treat it as low confidence.
   - **Player props** (lines usually post Tue-Thu): for each close call, `WebSearch` the candidates'
     main prop lines, e.g. "<player> receiving yards prop week <N>", "<player> rushing yards prop",
     "<player> anytime touchdown odds". Prefer a consensus or sportsbook-quoted line (BettingPros,
     Action Network, a sportsbook's own page). Log the line, source and date. A prop is the betting
     market's estimate of that player's output this week, and it moves on injury and role news. A
     low line on a Q-tagged player is a direct read on the "active but limited" risk.
   - Don't scrape BettingPros' private API (it needs a key pulled from their site code). Use pages
     and search results only.
6. Get a matchup grade for every player on the full roster: look up their real-life NFL
   opponent for the week and that opponent's defensive rank against the player's
   position (e.g. rushing yards allowed to RBs, for a RB). `WebSearch` per team+position
   if not already cached this week (e.g. "CIN defense vs RB rank 2026") — reuse the same
   cache file as step 4, keyed by team+position+week, since defense-vs-position rank
   doesn't change within a week and is shared across every player facing that defense.
   Grade on a 3-tier scale from the 32-team rank:
   - Rank 1–10 (stingiest defense) → Unfavorable
   - Rank 11–21 → Neutral
   - Rank 22–32 (most generous defense) → Favorable
   Source rank claims per `methodology/trusted-sources.md`'s tiering; if only a Tier 2 site
   gives a specific rank, say so and note it as lower-confidence rather than stating it
   flatly (as already done for a few Week 1 grades).
   **The matchup grade is a tiebreaker only.** It hit 7/21 (33%) through Week 4, and `Favorable`
   grades hit 5/16 (see `reference/matchup-grade-accuracy.md`). Use it only between players
   whose usage and Vegas signals are about equal, and say so when it decides a call.
7. For every player in an **outdoor-stadium game** (skip domes and closed-roof
   retractable stadiums entirely), gather two more signals:
   - **Weather**: `WebSearch` the game's forecast (e.g. "<city> weather <game date>").
     Record the actual wind speed and precipitation chance in the week's notes file —
     log the raw numbers, not just a flag, so a future pass can analyze whether weather
     should eventually fold into the matchup grade itself instead of standing alone.
     Only note it as relevant for QB/WR/TE/K (passing-and-kicking-sensitive positions);
     skip it for RB/DEF. Treat wind >15mph or a high precipitation chance as worth
     flagging in the final list; anything milder is just logged, not surfaced.
   - **Vegas signal**: `WebSearch` the game's spread and over/under, and derive each
     team's implied point total. Log it as a second, independent signal next to the
     matchup grade — note whether it agrees or disagrees with the defense-rank grade
     (e.g. "signals agree" when a Favorable grade also has a top-10 implied total, or
     "signals disagree" when they point opposite directions), since agreement raises
     confidence and disagreement is worth calling out explicitly rather than picking one.
8. Decide each slot by weighing the evidence **in this order**:
   1. **Usage** (step 5): recent snap share, carries, targets.
   2. **Market and consensus** (steps 5b and 7): player props, the Vegas implied team total, and
      FantasyPros ECR. When usage and consensus/props **disagree** on a close call, say so
      explicitly and log it as a test case in `reference/source-accuracy.md`. Don't silently
      pick one: these disagreements are how we learn which source to trust.
   3. **Health risk tier**, not the raw Yahoo tag. A Yahoo Q early in the week is often a
      carryover; official designations come on the final injury report (usually Friday).
      Assign every tagged or recently injured starter a tier from the practice trend, the
      final report, and the injury type:

      | Tier | Profile | Treatment |
      |---|---|---|
      | Low | Full practice by Thursday, no final designation | Treat as healthy |
      | Medium | Full/limited by Friday, Q on final report, not soft tissue | Start if clearly better on usage |
      | High | Limited all week or worse, Q on final report, soft tissue (hamstring, back, groin, calf), game-time decision, or snap-limit/"pitch count" reports | Counts against him when close. With a low implied total, prefer the healthy option |
      | Doubtful/Out | — | Don't start |

      **Recently returned bump** (added 2026-10-08): players aren't 100% the moment a tag
      drops. Raise a player one tier (Low → Medium, Medium → High) for the **first 2 games**
      after his last Q/D/O designation or missed game, even with full practices and no tag.
      For soft-tissue injuries (hamstring, calf, groin, back) the bump lasts **3 games**. In
      his first game back, expect reduced snaps, and treat any "pitch count" report as High.
      Like the tiers themselves, the bump is a tiebreaker on close calls, not an auto-bench.
      Check the previous weeks' injury caches to find who qualifies. Log the bump in the
      tier tracker (`reference/season-lessons.md`, "Recently returned" column) so we can
      test whether these players actually underperform.

      Re-tier as reports come in (Wed → Fri → inactives). Record the tier in the week's
      injury cache. Prefer the healthy, steady-volume player when a High-tier player and a
      healthy one are close. A late-kickoff backup (e.g. an MNF
      player) only hedges against a pre-game *inactive*. Once the Q player is active, his
      kickoff locks him in, and nothing protects against "active but limited or bad" (Sadiq,
      Wk4: active, 0 catches, Jets offense collapsed). So weigh that risk at lineup time,
      not on Sunday morning.
   4. **Matchup grade** (step 6), tiebreaker only.
   Then the weather flag (step 7) for passing/kicking positions. You have no live stat
   projections from any script, so combine fetched data with general knowledge of the
   players and say clearly when you're speculating vs. reporting fetched data.
   Don't over-correct for randomness: kicker swings, an uncleared backup booming, or a
   low-usage WR spiking don't justify a different call next time (see the "Accept as random"
   list in `reference/season-lessons.md`).
9. Flag anything roster-rule-relevant from `seasons/2026/Kicker I Hardly Know Her/reference/2026_League_Rules.pdf` if applicable
   (e.g. IR eligibility rules, no median matchup so only your own score matters).
10. Present recommendations as a short list per player: position, current starter,
   suggested replacement (if any), **recent usage (e.g. "targets 8/10/12", "carries 6/11/10")**,
   FantasyPros ECR (e.g. "TE7, range 5-10"), the main prop line when gathered, the Vegas implied total, health tag, matchup grade (Favorable/Neutral/Unfavorable,
   labeled as a tiebreaker), any weather flag, any off-field legal/status flag, and one-line
   start/sit reasoning that names which signal decided it. For each position group, list the
   bench players you ranked and why they sit, so no bench player goes un-reviewed for weeks.
