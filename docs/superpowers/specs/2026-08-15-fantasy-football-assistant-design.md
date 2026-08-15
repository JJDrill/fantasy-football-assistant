# Fantasy Football Assistant — Design

## Context

User is new to fantasy football, playing in a Yahoo head-to-head league called
"Kicker? I Hardly Know Her" (league URL: https://football.fantasysports.yahoo.com/f1/109715).
The league has standard head-to-head scoring, a 4-team playoff in Weeks 16-17, and a
$500 payout pool: $200/$100/$50 for final standings plus fifteen $10 weekly side-challenges
with quirky rules (e.g. "highest-scoring player left on the bench," "starting TE closest
to 69 receiving yards," "starting kicker with the most points"). Full rules and the
challenge list are in `reference/2026_League_Rules.pdf` and
`reference/FFL_2026_Weekly_Challenges_Mobile.pdf`.

No fantasy-football-specific Claude Code agents or skills existed prior to this project
(checked `~/.claude/agents` and `~/.claude/skills` — only generic superpowers skills present).

## Goals

Build on-demand Claude Code skills that help the user with, in priority order:
1. Weekly lineup/waiver advice
2. Tracking the 15 weekly side-challenges (who's currently winning each one)
3. Trade evaluation (and future draft prep)
4. Flavor: dynamic weekly recaps / trash talk referencing the actual opponent and data

## Non-goals

- No scheduled/automated runs (cron digests) — on-demand only, for now. Revisit later if
  there's appetite.
- No persistent per-opponent "coach" agent personas. A single flavor skill generates
  dynamic banter about whichever opponent is relevant that week, using real data. Distinct,
  maintained personas per rival were considered and explicitly rejected as low functional
  value for the setup cost.
- No draft-day tooling yet (draft already happened for 2026; revisit next August).

## Architecture

```
Fantasy Football/
├── reference/
│   ├── 2026_League_Rules.pdf
│   ├── FFL_2026_Weekly_Challenges_Mobile.pdf
│   └── challenges.md            # extracted summary of the 15 weekly challenges, for quick skill lookup
├── yahoo/
│   ├── auth.*                   # OAuth flow: register app, authorize, cache/refresh token
│   └── client.*                 # fetch helpers: roster, league boxscores, standings, transactions
├── .env                          # Yahoo client id/secret + cached token (gitignored)
└── .claude/skills/
    ├── lineup-advice/SKILL.md
    ├── waiver-targets/SKILL.md
    ├── trade-analyzer/SKILL.md
    ├── challenge-tracker/SKILL.md
    └── weekly-recap/SKILL.md
```

**Shared data layer (`yahoo/`):** one-time OAuth setup against the Yahoo Fantasy Sports
API; helper functions each skill calls to get fresh data (my roster, full-league
boxscores/matchups, standings, transactions/waivers). Handles token refresh transparently.

**Skills:** each is a focused, independently invocable unit built on top of the data layer.

- `/lineup-advice` — start/sit recommendations for the current week, using my roster +
  opponent's roster + matchup context.
- `/waiver-targets` — suggests available free agents worth adding, given roster needs and
  the 60-acquisition season cap.
- `/trade-analyzer` — evaluates a specific trade offer (my side vs. their side) for
  value and roster fit.
- `/challenge-tracker` — for the current (or a specified) week, looks up that week's
  specific challenge rule in `reference/challenges.md`, pulls every team's boxscore, and
  reports who's currently winning the $10 prize.
- `/weekly-recap` — generates a flavorful recap/trash-talk writeup for the current
  matchup, grounded in real data (no fixed persona).

## Data flow

1. One-time setup: user registers a Yahoo Developer app, completes OAuth, token cached
   locally.
2. Skill invoked → calls `yahoo/client` for current data → combines with
   `reference/challenges.md` or league rules as needed → produces the answer.

## Key open risk: league-wide data scope

It is unconfirmed whether the Yahoo Fantasy Sports API exposes read access to every
team's roster/boxscore for a league member (needed by `/challenge-tracker` and useful for
`/lineup-advice` opponent context), or only the authenticated user's own team.

**Resolution plan:** confirm this during OAuth setup, before building `/challenge-tracker`,
by making a test call for another team's boxscore.

**Fallback if scope is limited to own team:** `/challenge-tracker` prompts the user to
paste or screenshot the full league scoreboard instead of fetching it automatically. Other
skills (`/lineup-advice`, `/trade-analyzer`) are less affected since they mostly need the
user's own roster plus one opponent's, which should be visible either way as a fellow
league member.

## Error handling

- OAuth tokens expire (~1hr); the data layer refreshes transparently.
- If a Yahoo API call fails (rate limit, stat corrections not yet final, etc.), the skill
  says so plainly rather than guessing or silently using stale data.
- Secrets (client id/secret, OAuth tokens) live in a git-ignored `.env`; never committed,
  never printed in full.

## Testing / verification approach

No formal automated test suite (personal tool, single user). Verification is manual:
1. OAuth smoke test — fetch own roster and standings, confirm they match the Yahoo app.
2. Confirm league-wide data scope (see risk above).
3. Build and dry-run each skill once against live current-week data; sanity-check output
   against what's visible in the Yahoo app/site.

## Build order

1. `yahoo/` data layer + OAuth setup + smoke test + scope confirmation
2. `reference/challenges.md` extraction from the PDF
3. `/challenge-tracker` (validates the riskiest assumption first)
4. `/lineup-advice`
5. `/waiver-targets`
6. `/trade-analyzer`
7. `/weekly-recap`
