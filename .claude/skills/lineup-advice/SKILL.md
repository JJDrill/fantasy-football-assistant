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
   - Don't ask what's worrying them (changed 2026-10-08): the full pass already covers
     every injury tag, bye and close call.
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
5. **Usage.** Pull the last 2-3 weeks of usage for every player on the full roster,
   bench included, from Sleeper (`yahoo/sleeper-stats.js`: `getWeekStats(2026, week)`,
   keyed by Sleeper player id). Use `off_snp`/`tm_off_snp` (snap share), `rush_att`,
   `rec_tgt` and `pts_half_ppr`. Build a usage table per position group in the week's notes
   file. How much it weighs depends on position (see step 8): it **breaks close TE calls** and
   acts as a **role-change detector at RB/WR**. The league-wide replay
   (`seasons/2026/Kicker I Hardly Know Her/reference/league-replay-wk1-4.md`) found usage-first
   lost 155 pts over 30 team-weeks, while ECR-first gained. **Usage can't see a player returning
   from injury** (his recent weeks show 0 targets), so it never overrides ECR for a returning player.
   - **Re-rank the whole position group, bench included.** Never frame a decision as only
     "current starter vs. new option." Every eligible player at the position gets ranked.
   - **Flag role changes** at RB/WR: a teammate's injury or return, a depth-chart move, or a
     big jump or drop in snaps/carries/targets (Gordon's 0 → 17 carries in Wk3). These are
     what usage catches that ECR can be slow to price in.
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
6. **Matchup grade: retired 2026-10-11.** Don't gather defense-vs-position grades. They hit
   7/21 (33%) through Week 4, worse than a coin flip on an above/below-average call, and no
   usable 2026 table was findable without interactive filtering. The matchup itself is already
   priced into the Vegas implied total and FantasyPros ECR. `reference/matchup-grade-accuracy.md`
   stays as the closed record of why.
7. For every player in an **outdoor-stadium game** (skip domes and closed-roof
   retractable stadiums entirely), check **weather**: `WebSearch` the game's forecast
   (e.g. "<city> weather <game date>"). Record the actual wind speed and precipitation
   chance in the week's notes file (raw numbers, not just a flag). Only note it as relevant
   for QB/WR/TE/K (passing-and-kicking-sensitive positions); skip it for RB/DEF. Treat wind
   >15mph or a high precipitation chance as worth flagging in the final list; anything
   milder is just logged, not surfaced.
   For **every** game with a rostered player, get the **Vegas signal**: `WebSearch` the
   spread and over/under, and derive each team's implied point total.
8. Decide each slot by weighing the evidence **in this order**, which depends on position
   (set 2026-10-11 from the Wks 2-4 backtest in `reference/season-lessons.md`; revisit as
   `reference/source-accuracy.md` fills in):

   | Position | 1st | 2nd | Then |
   |---|---|---|---|
   | **TE** | ECR + Vegas | Targets, **only when the two TEs are within ~5 ECR spots** | Health tier |
   | **RB** | ECR + Vegas (+ props when gathered) | **Within ~3 ECR spots:** usage (role changes first) | Health tier |
   | **WR** | ECR + Vegas (+ props when gathered) | Usage only for a clear role change | Health tier |
   | **W/R/T flex** | FLEX ECR (`half-point-ppr-flex.php`) | Within ~10 flex spots: **later kickoff** | Health tier |
   | **QB / K / DEF** | ECR + Vegas | — | Health tier |

   (Revised 2026-10-11 after the league-wide replay in `reference/league-replay-wk1-4.md`.)

   1. **Leading signal** per the table.
      - **TE:** when two TEs are within ~5 ECR spots, start the one with more targets over the
        last 2-3 games (Likely TE10 vs. Sadiq TE12 in Wk4: targets said Likely, who scored 10.1
        to Sadiq's 0). Beyond ~5 spots, follow ECR. In Wk3, usage would have picked Juwan
        Johnson (TE13) over Brock Bowers (TE3), who had 0 recent targets after missing time.
        Bowers scored more.
      - **WR:** follow ECR. Managers who overrode it league-wide were wrong 7 of 10 times
        (−28.6 pts), and every usage-vs.-ECR disagreement went ECR's way. Override only for a
        clear role change that ECR hasn't caught yet, and say so.
      - **RB:** within ~3 ECR spots it's a coin flip (added 2026-10-20). Break it with usage,
        role changes first (a depth-chart move, a snap or carry shift), then the health tier.
        Wk6: Kamara RB29 vs. Miller RB31. Miller had taken over the Wk5 role and Kamara was
        Q/limited, so start Miller. That was the right call even though one Kamara TD beat it.
        Beyond ~3 spots, a clear **role change** caught by usage (step 5) can still override
        ECR when the rankings look stale, e.g. ECR was set before the teammate's injury news. Say so.
      - **Flex:** compare RB/WR/TE candidates on FantasyPros' FLEX ECR, not positional ranks.
        Within ~10 flex spots it's a coin flip (league-wide, managers and ECR each won 6 of 12),
        so start the player with the **later kickoff**. Yahoo lets you swap a player until his
        own kickoff, so that keeps the swap option open longest, e.g. if the other guy is ruled
        out late. Don't spend research time on close flex calls.
      - **Recently-returned players:** the bump stays a tiebreaker. Don't bench a returning
        player across a big ECR gap. Maria benched Puka (WR7) in his Wk4 return for WR22/WR27,
        and he scored 23.2 on the bench.
   2. **Disagreements:** when usage and ECR/props point to different players on a close call,
      say so and log it as a test case in `reference/source-accuracy.md`. Don't silently pick
      one: these disagreements are how we learn which source to trust.
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

      **Rate two risks behind the tier** (added 2026-10-11): **play risk** (inactive or an
      early exit; practice trend and final designation) and **limited risk** (active but a
      reduced role; soft-tissue injury, the recently-returned bump, pitch-count reports). The
      overall tier is the higher of the two. Once the inactive list is out, play risk is mostly
      settled, so on Sunday morning the **limited risk** is what's left to weigh. Log both in
      the week's injury cache.

      Re-tier as reports come in (Wed → Fri → inactives). Record the tier in the week's
      injury cache. Prefer the healthy, steady-volume player when a High-tier player and a
      healthy one are close. A late-kickoff backup (e.g. an MNF
      player) only hedges against a pre-game *inactive*. Once the Q player is active, his
      kickoff locks him in, and nothing protects against "active but limited or bad" (Sadiq,
      Wk4: active, 0 catches, Jets offense collapsed). So weigh that risk at lineup time,
      not on Sunday morning.
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
   FantasyPros ECR (e.g. "TE7, range 5-10"), the main prop line when gathered, the Vegas implied total, health tag and tier, any weather flag, any off-field legal/status flag, and one-line
   start/sit reasoning that names which signal decided it. For each position group, list the
   bench players you ranked and why they sit, so no bench player goes un-reviewed for weeks.
