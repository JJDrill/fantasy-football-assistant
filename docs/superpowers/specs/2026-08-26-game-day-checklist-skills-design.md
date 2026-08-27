# Pre-Game and Post-Game Checklist Skills — Design

## Purpose

Today the user runs `lineup-advice`, `challenge-tracker`, `trade-finder`,
`trade-analyzer`, `waiver-targets`, and `weekly-recap` individually, deciding each time
which ones are relevant. There's no single "am I ready for this game" or "what happened
and what's next" checklist that chains the right existing skills together.

This adds two new thin-orchestrator skills:

- `pre-game-check` — run any time before that week's lineup locks, to confirm the lineup
  is set correctly, no starters are ruled out, any trades are accounted for, and the
  week's challenge rule is known.
- `post-game-check` — run after a game/week completes, to recap it, scan for new trade
  opportunities the results opened up, check challenge standing, and surface waiver
  targets for next week.

## League context

Same league as the rest of this repo: "Kicker? I Hardly Know Her" (ID `109715`), 10 teams,
head-to-head, no median matchup. Roster: `QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6,
IR×2`.

## Design principle: front-load all questions

Both skills chain 2-4 existing skills together, each of which may need manual-paste input
if live data isn't available. Asking question-by-question as each downstream skill runs
would leave the user stuck answering prompts throughout — bad for a checklist meant to be
run and then walked away from.

Instead, each skill's first phase determines exactly what live data is and isn't
available, and any questions needed across the *entire* chain are asked once, up front, in
a single combined message. Once answered (or if live data covers everything), the rest of
the chain runs without further questions, ending in one consolidated summary.

If live data is fully available for every downstream skill, no questions are needed at
all and the whole checklist can run unattended start to finish.

## `pre-game-check` skill

**Description (for skill frontmatter):** Use when the user wants to confirm they're ready
for an upcoming week/game in the "Kicker? I Hardly Know Her" Yahoo league — lineup set
correctly, no inactive starters, trades accounted for, challenge rule known.

**Steps:**

1. Determine the week (default: current).
2. **Check live-data availability** for everything the chain will need: the roster fetch
   `lineup-advice` uses (`yahoo/get-matchup.js`), and `challenge-tracker`'s
   `yahoo/run-challenge.js`.
3. **Ask everything needed, in one message, up front:**
   - If live roster data is unavailable: ask the user to paste/screenshot their current
     roster (starters and bench, with positions), same as `lineup-advice` would ask.
   - If live challenge data is unavailable: ask for whatever `challenge-tracker` needs for
     this week's specific rule (per `reference/challenges.md`).
   - Always ask (no live source exists for this today — confirmed during design):
     whether any trades have been proposed, approved, or vetoed recently that aren't yet
     reflected in the roster the user will paste/that live data will show.
   - Always ask: anything specific worrying them (injury news, a tough matchup) so the
     lineup pass can focus there.
4. **Run the rest of the chain without further questions**, using whatever was gathered:
   - Invoke `lineup-advice` for start/sit recommendations.
   - Cross-check for inactive/out/bye starters: if live roster data included status flags,
     check them directly; otherwise rely on the user's answer from step 3 plus general
     injury-news knowledge, and flag anything uncertain rather than asserting confidently.
   - If the user flagged a trade in step 3 that isn't reflected in the roster data, note
     this explicitly and ask them to double check the new player is in the lineup (this one
     exception can't be resolved automatically since it requires re-fetching after the
     trade posts).
   - Invoke `challenge-tracker` for this week's $10 challenge rule — surfaced here because
     some challenge rules constrain lineup choices (e.g. a challenge scored on starting
     kicker points), worth knowing before locking.
5. **Present a single go/no-go checklist:**
   - Lineup: confirmed / N changes suggested
   - Inactive starters: none found / list
   - Trades: none pending / user should double-check roster reflects trade X
   - This week's challenge rule: one-line summary

## `post-game-check` skill

**Description (for skill frontmatter):** Use when the user wants a full post-game/weekly
wrap-up in the "Kicker? I Hardly Know Her" Yahoo league — recap, new trade opportunities,
challenge status, and waiver targets for next week.

**Steps:**

1. Determine the week (default: most recently completed).
2. **Check live-data availability** for everything the chain will need:
   `yahoo/get-matchup.js` / `get-scoreboard.js` (recap), `yahoo/get-all-rosters.js`
   (trade-finder), `yahoo/run-challenge.js` (challenge-tracker), `yahoo/get-free-agents.js`
   (waiver-targets).
3. **Ask everything needed, in one message, up front:**
   - For each downstream skill whose live data is unavailable, ask for the specific manual
     input it needs (final box score for recap; all-team rosters for trade-finder;
     whatever `reference/challenges.md` requires for this week's challenge rule; a
     position of interest, or "all," plus the waiver wire for waiver-targets).
   - Always ask: anything specific they want flagged (a position need, a challenge they're
     chasing) so downstream steps can prioritize it.
4. **Run the rest of the chain without further questions**, using whatever was gathered:
   - Invoke `weekly-recap`.
   - Invoke `trade-finder`.
   - Invoke `challenge-tracker`.
   - Invoke `waiver-targets`.
5. **Present one consolidated summary**, not four separate walls of text:
   - Recap: 2-3 sentence version of the full recap
   - Trades: top candidate, if any, or "nothing worth pursuing this week"
   - Challenge: current standing/result
   - Waivers: top 2-3 pickups
   - Note that full detail from any step is available if the user wants it

## Out of scope

- Automatically detecting trade approval/veto status — no live source exists for this
  today (the "Evaluate Trade" Yahoo page shows projected fairness, not approval status).
  This stays a direct question to the user indefinitely unless a future skill finds a live
  source.
- Actually setting the lineup or submitting waiver claims through Yahoo — both skills stay
  read-only/advisory, consistent with every skill they chain into.
- Persisting checklist results between runs — each invocation is a fresh pass.
