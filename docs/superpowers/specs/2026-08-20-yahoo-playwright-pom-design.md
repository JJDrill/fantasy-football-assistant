# Yahoo Playwright Page Object Model — Design

## Purpose

The Yahoo Fantasy Sports API is still pending approval (see main README). Until it's
granted, the five skills (`challenge-tracker`, `lineup-advice`, `trade-analyzer`,
`waiver-targets`, `weekly-recap`) run in "manual mode" — asking the user to paste or
screenshot data from the Yahoo app.

This project adds a Playwright-based browser-scraping layer that logs into
`football.fantasysports.yahoo.com` as the user and extracts the same data the API would
have provided, using a persistent browser profile so login only has to happen once. It
gives the skills a working "live data" path now, without waiting on Yahoo's API approval.

**Out of scope for this spec:** an autonomous draft-day agent that reads the live draft
board and submits picks. That shares this spec's login/navigation foundation but adds
substantial additional complexity (pick timing, draft-board parsing, decision logic, and
the risk of auto-submitting a real pick) and will get its own design once this foundation
is in place.

## League context

- League: "Kicker? I Hardly Know Her", ID `109715`
- URL: `https://football.fantasysports.yahoo.com/league/kickerseattle`
- 10 teams, head-to-head, no median/second-opponent scoring
- Roster: `QB, WR, WR, RB, RB, TE, W/R/T, K, DEF, BN×6, IR×2`

## Architecture

```
yahoo/
  browser.js                  Launches a persistent-context Chromium instance against a
                               gitignored profile dir (yahoo/.playwright-profile/),
                               shared by every script below.
  pages/
    base-page.js               Shared navigation helpers + isLoggedIn() check used by
                                every other page object. Holds the league URL constant.
    standings-page.js          League standings/scoreboard table (final or in-progress
                                scores, all teams, for a given week).
    roster-page.js              A single team's roster (starters + bench + IR) for a
                                given week.
    matchup-page.js              Head-to-head box score (both teams' starters + points)
                                for a given week.
    free-agents-page.js          Available free agents, filterable by position.
  login.js                    One-time interactive script: opens a headed browser,
                               waits for the user to log in, then exits. Run manually
                               whenever the session has expired.
  get-matchup.js <week>           Wraps roster-page + matchup-page.
  get-free-agents.js [position]   Wraps free-agents-page.
  run-challenge.js <week>         Wraps standings-page + roster-page per that week's
                                rule in reference/challenges.md.
  get-scoreboard.js <week>        New script — wraps standings-page for final scores.
                                Needed by weekly-recap, which currently has no script.
  smoke-test-roster.js            Wraps roster-page for a quick manual sanity check.
```

Each `get-*.js` / `run-*.js` script is a thin CLI wrapper: parse argv, call one or more
page objects, print a single JSON object to stdout, exit 0. This matches the interface the
five skills already expect (see each `SKILL.md`'s "try live data first" step), so **no
changes to any SKILL.md are required** — the manual-mode fallback simply stops being
needed once these scripts exist and work.

## Session handling

- `browser.js` uses Playwright's `launchPersistentContext` against
  `yahoo/.playwright-profile/` (already gitignored). Cookies/session persist across runs.
- `login.js` is the only script that launches headed. The user runs it manually
  (`node yahoo/login.js`), logs into Yahoo in the opened window, and the script exits once
  it detects a successful redirect off the login page.
- All `get-*`/`run-*` scripts launch **headless** and assume a valid session.
- `base-page.js` exposes `assertLoggedIn()`, called at the start of every page object
  method. If the current page redirects to `login.yahoo.com`, it throws
  `Error('NOT_LOGGED_IN: run `node yahoo/login.js` to refresh your session')`.
- Skills already treat a script error as "fall through to manual mode," so an expired
  session degrades gracefully — the user sees a clear next step instead of a hang or a
  cryptic Playwright timeout.

## Data extraction approach

- Page objects use Playwright locators (roles, text, table structure) against Yahoo's
  actual rendered markup — not the accessibility-snapshot format used interactively by the
  Playwright MCP tool (that format is designed for an LLM to read, not for structured
  parsing).
- Extraction happens via `locator.all()` + `.textContent()` / `.evaluate()` over table
  rows, converted into plain JS objects/arrays.
- Output shape for each script mirrors what the corresponding skill already expects (per
  each SKILL.md's description of what the live-data script returns) — e.g.
  `get-matchup.js` returns `{ week, userTeam: { name, roster: [...] }, opponent: { name,
  roster: [...] } }`.

## Config

- `.env` gains `YAHOO_LEAGUE_URL=https://football.fantasysports.yahoo.com/league/kickerseattle`
  (no discovery step needed — we already have this from `reference/League_Settings.pdf`).
- `yahoo/.playwright-profile/` added to `.gitignore` (already done in the pre-cleanup PR).

## Error handling

- Login expired → `NOT_LOGGED_IN` error with the exact command to fix it (see above).
- Page structure unexpectedly different (Yahoo layout change) → page object throws a
  specific `Error('<PageName>: expected element not found — Yahoo may have changed their
  markup')` rather than a generic Playwright timeout, so failures are diagnosable.
- Requested week has no data yet (e.g. asking for a future week's box score) → return
  `{ available: false, reason: '...' }` rather than throwing, since this is an expected
  case the skill should handle gracefully (e.g. lineup-advice for an upcoming week).

## Testing

No mocks/fixtures — this is a scraper against a live third-party site, so the practical
test is running it against the real logged-in session, matching the existing pragmatic
approach in `yahoo/smoke-test-leagues.js`. `smoke-test-roster.js` (already in the script
list above) serves this purpose for roster-page; ad hoc manual runs of the other scripts
serve the same purpose during development.

## Dependencies

- Add `playwright` (not `@playwright/test`, since this isn't a test suite) as a
  dependency in `package.json`. Requires `npx playwright install chromium` once, locally.
