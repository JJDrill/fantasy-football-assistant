# run-challenge Stats Fix — Design

## Purpose

`yahoo/run-challenge.js` (the live-data script `challenge-tracker` calls) outputs roster
data in `roster-page.js`'s shape (`{ slot, playerName, points }`), but
`yahoo/evaluate-challenge.js` needs a richer shape: `position` *and* `selected_position`
as separate fields, per-stat category values (`int`, `sack`, `rec yds`, `inc`, `lng`), and
per-team `isWinner`/`teamTotal` derived from matchup results. Today these don't line up, so
`challenge-tracker` always falls through to its manual-paste path even with a live,
logged-in Yahoo session (see `yahoo_run_challenge_shape_mismatch` memory).

This closes that gap so all 15 weekly challenges in `reference/challenges.md` can be
evaluated automatically from live-scraped data.

**Out of scope:** the official Yahoo Fantasy Sports API path (`yahoo/client.js`,
`getTeamRosterWithStats`, `buildStatNameMap`) would solve the stat-category problem more
cleanly than scraping, but it's blocked — `.env`'s API credentials are empty and the user is
waiting on Yahoo's developer-app approval (see `yahoo_official_api_pending_approval`
memory). This design stays entirely within the existing Playwright-scraping approach and
should be revisited once/if API access comes through.

## Investigation findings (live-verified 2026-08-26)

- `roster-page.js`'s existing table (`table[id^="statTable"]`) only has a `Fan Pts` column
  — no stat breakdown. The same URL with `?week=N&stat1=S` appended renders a **Stats
  view** of the same three tables (offense/kickers/DEF) with category columns (Passing
  Yds/TD/Int, Rushing Att/Yds/TD, Receiving Tgt/Rec/Yds/TD, DEF Sack/Safe/Int/etc.) that
  *look* like exactly what's needed for `int`/`sack`/`rec yds`.
- **However, this view's numbers do not appear to respect the `?week=N` parameter.**
  Checked against Josh Allen (offense table) and a DEF team on 2026-08-26 — with the
  current NFL season not yet underway (first game 2026-09-13) — `stat1=S` showed 3,668
  passing yards and a DEF total of 49 sacks, both clearly full-season totals carried over
  from a prior season, not zeros or small per-game numbers. **This means `stat1=S` is
  most likely a season-aggregate view regardless of the week param, not a per-week
  box score, and cannot be trusted as the `int`/`sack`/`rec yds` source as originally
  assumed.** A `stat1=SPS` ("Split Stats") variant was also checked and produced
  internally inconsistent numbers (large passing-stat values alongside a `0.00` Fan Pts
  total for the same row) — consistent with Yahoo defaulting an unplayed week to some
  other split (e.g. "vs. this week's opponent, all-time") rather than an actual game box
  score.
- **Root cause of the uncertainty:** it is currently impossible to observe what a
  genuinely-completed week's per-week stat view looks like, because no games have been
  played yet this season. Every "week 1" number available right now is either zero or a
  leftover aggregate from a prior season. This can only be resolved by re-checking after
  a real week concludes.
- **Best current guess for the real per-week source:** Yahoo's matchup box-score/compare
  page (reachable per-matchup, distinct from the roster page's Stats tab) is the
  conventional place fantasy sites render a completed week's category-by-category stat
  line for both rosters head-to-head. `matchup-page.js` currently only reads the
  league-home "Week N Matchups" score-summary widget, not a per-matchup detail box score
  — so this would be new territory for that page object, not a small tweak to
  `roster-page.js`. **Task 1 of the implementation plan is a live-verification spike to
  confirm this (or find the real source) once Week 1 has actually finished**, before any
  category-stat-scraping code is written against a guessed selector.
- The player-name cell in every roster row includes team + true position as plain text,
  e.g. `Buf - QB` (span with class `Fz-xxs`), separate from the `slot`/`selected_position`
  a player is currently started in. This gives us `position` for free.
- `inc` (week 9) and `lng` (week 15) are **not available anywhere in the free Yahoo UI**:
  not on the roster page's Stats/Split-Stats views, not on the individual player's Yahoo
  gamelog. Yahoo's "Advanced Stats" view, which might have carried them, is paywalled
  behind Fantasy Plus (confirmed via screenshot — this account doesn't have it).
- **ESPN's public gamelog page does have both**, with no login/paywall:
  `espn.com/nfl/player/gamelog/_/id/<espnId>/<slug>` — columns include `CMP`, `ATT`,
  `INT`, `LNG` (passing) per game, rows keyed by real game date/opponent (not by fantasy
  week number). `inc = ATT - CMP` (computed, not a direct column).
- ESPN's player ID for a given name is resolvable via its public search endpoint:
  `https://site.web.api.espn.com/apis/search/v2?query=<name>` — no auth, returns a `uid`
  field like `s:20~l:28~a:3918298` where `3918298` is the numeric player ID.
- `matchup-page.js`'s existing `getPairings(page, week)` already returns each pairing's two
  team IDs/names/scores for a given week — everything needed to compute `isWinner` and
  `teamTotal` per team. It just isn't wired into `run-challenge.js` today.

## Architecture

```
yahoo/
  pages/
    roster-page.js         MODIFIED — getRoster() now also fetches the `?stat1=S` Stats
                            view of the same URL and merges category stats + true
                            `position` onto each roster row.
    player-gamelog.js       NEW — ESPN-backed lookup for `inc`/`lng` only, used only for
                            the specific weeks/positions that need them (weeks 9 and 15,
                            QBs only).
    matchup-page.js         UNCHANGED — getPairings() already provides what's needed.
  run-challenge.js         MODIFIED — orchestrates standings + pairings + per-team
                            roster+stats (+ player-gamelog for weeks 9/15) into the shape
                            evaluate-challenge.js expects.
  evaluate-challenge.js    UNCHANGED — this is the consumer whose expected shape drives
                            everything above.
```

### Category-stat source: pending verification

The exact page/selector for `int`/`sack`/`rec yds` is **not locked in** — see the
Investigation findings above. The implementation plan's first task is a live spike
(run once Week 1 has real completed games) that checks, in order: (a) whether
`stat1=S`/`stat1=SPS` actually change once real per-week data exists (maybe the
season-total behavior we saw was itself an artifact of the off-season and resolves
itself once games are played), then (b) a per-matchup box-score page as a fallback.
Whichever one is confirmed live becomes the real Task 2 (the `roster-page.js` or
`matchup-page.js` change) — the module boundary (a new/changed page-object function
returning `{ [statName]: numericValue }` per player, merged onto the roster entry
`evaluate-challenge.js` expects) stays the same regardless of which URL it turns out
to be, so the rest of this design (points 2-4 below, `run-challenge.js` wiring,
`player-gamelog.js`) is unaffected by which one it is.

### `roster-page.js` changes (once the source above is confirmed)

`getRoster(page, teamId, { week })` becomes two navigations on the same page (sequential,
same constraint as today — no concurrent navigation on one `Page`):

1. Existing fetch of `teamUrl(teamId)?week=N` → slot, name, points (unchanged parsing).
2. New fetch of the confirmed per-week stats source → for each of the three position
   tables, read the two-row `<thead>` (group label + column label) to build a per-table
   column name list (e.g. `['int']` at the "Passing"+"Int" intersection for the offense
   table, `['sack']` for "Turnovers"... "Sack" on the DEF table), then read each body
   row's cells into `{ [statName]: numericValue }`, keyed by player row identity (row
   order is stable within a single page load, so pair up by index within each of the
   three tables).

Row identity is matched by position **within each of the three tables** (same table,
same row order, both fetched from the same team/week) — not by name string-matching,
which would break on suffixes like "Jr." rendering differently across views.

`parseRosterRow` extends to accept an optional stats object and merge it in, plus extract
`position` from the `Buf - QB`-style text (split on ` - `, take the last segment). Existing
`slot` field is renamed `selected_position` to match `evaluate-challenge.js`'s expected
field name (`slot` stays as an alias no consumer currently reads, can be dropped — check
`get-matchup.js` and any skill docs referencing `slot` before removing it outright).

Final shape per roster entry:
```js
{ name, position, selected_position, points, int, sack, 'rec yds', ... }
```
(only the stat keys present in that player's position-group table are populated — a WR row
never has a `sack` key, etc. — matching how `buildPool` already just reads
`player[config.stat]` and treats `NaN`/missing as "skip this player").

### `player-gamelog.js` (new)

```js
async function getIncAndLng(playerName, { gameDate, opponent }) { ... }
```

- Looks up the ESPN player ID via the search endpoint (plain `fetch`/`axios`, no
  Playwright needed — this is a public JSON API, not a page needing a logged-in session).
- Fetches `espn.com/nfl/player/gamelog/_/id/<id>/...` with Playwright (needs a rendered
  page — the table is client-rendered) and finds the row matching `gameDate` (and
  `opponent` as a tiebreaker/sanity check).
- Returns `{ inc: att - cmp, lng }`, or `null` if no matching row is found (bye week,
  name-resolution miss, etc.) — `evaluate-challenge.js`'s existing `NaN`-skip behavior in
  `buildPool` handles a missing stat gracefully, so this just needs to not throw.
- `gameDate`/`opponent` come from the schedule text already present in the Yahoo roster
  row (e.g. `Sun 10:00 am @ Hou`) — no new Yahoo fetch needed to get them, just parse text
  we're already reading.

This module is called **only** when the current week's challenge config needs `inc` or
`lng` (i.e. only for weeks 9 and 15, and only for the QBs relevant to that config's pool —
`run-challenge.js` doesn't know about challenge configs, so this happens in
`evaluate-challenge.js`'s caller — see Orchestration below), to avoid an ESPN round-trip
per player per week for stats nobody asked for.

### `run-challenge.js` changes

```js
const standings = await getStandings(page);
const pairings = await getPairings(page, week);
const rosters = [];
for (const team of standings) {
  rosters.push(await getRoster(page, team.teamId, { week }));
}
```

New steps after the existing roster loop:

1. **Merge matchup results.** For each team, find its pairing in `pairings`, compute
   `isWinner` (own score > opponent score) and `teamTotal` (own score). Attach both to that
   team's object.
2. **Build the `matchups` shape** `evaluateTeamScoreChallenge` expects:
   `pairings.map(p => ({ teams: [{ team_name: p.teamAName, score: p.teamAScore }, { team_name: p.teamBName, score: p.teamBScore }] }))`.
3. **Conditionally enrich with `inc`/`lng`.** `run-challenge.js` takes an optional check
   against `CHALLENGES[week]` (`challenge-config.js`) — if `stat === 'inc'` or `stat ===
   'lng'`, call `player-gamelog.js` for each QB in the relevant pool (starters, per
   `config.pool`) and merge the result onto that player's roster entry before final output.
   This keeps `run-challenge.js` challenge-aware (it already implicitly is, since it's
   named for the challenge feature), rather than pushing that awareness into
   `roster-page.js`, which stays a generic roster reader.
4. Final shape:
   ```js
   {
     week,
     standings,
     teams: rosters.map(r => ({
       team_name: r.teamName,
       isWinner: ...,
       teamTotal: ...,
       players: r.roster.map(p => ({ name: p.playerName, position: p.position,
         selected_position: p.selected_position, points: p.points, ...categoryStats })),
     })),
     matchups: [...],
   }
   ```
   `evaluate-challenge.js` is called by whatever currently does the manual-paste-shaped
   evaluation today (the `challenge-tracker` skill) — this output is what gets passed to
   `evaluatePlayerStatChallenge`/`evaluateTeamScoreChallenge` for the current week's config,
   in place of the manually-pasted JSON.

## Error handling

- ESPN lookups (search + gamelog) can fail (name mismatch, rate limiting, ESPN layout
  change) independently of the Yahoo scrape succeeding. A failure here must not blow up
  the whole `run-challenge.js` run — catch and return `null` for that player's `inc`/`lng`,
  same as a genuinely missing stat. `challenge-tracker` already has a manual-paste fallback
  path; a `null` result for the one relevant player just means that specific evaluation
  can't run automatically and falls back same as today.
- Existing Yahoo scrape error handling (login-expired, structure-changed) is unchanged.

## Testing

- `roster-page.test.js` gets new unit tests for the stats-view header-to-column-name
  mapping (pure function, no Playwright needed) and the position-extraction logic.
- `player-gamelog.js` gets unit tests for the ESPN-row-matching logic (given a fake table
  of rows + a target date, pick the right one) — the actual network calls aren't mocked
  (matches this project's existing "test against real live data" pattern for scrapers, per
  `yahoo-playwright-pom-design`'s Testing section), so exercise those manually per week
  once real data exists.
- `evaluate-challenge.test.js` is unchanged — it already tests against the target shape;
  this work is entirely about producing that shape correctly.
- Manual smoke test: run `node yahoo/run-challenge.js 1` (or whichever week has live data)
  once games have started, and spot-check `int`/`sack`/`rec yds`/`isWinner`/`teamTotal`
  against the actual Yahoo UI for a couple of teams.

## Known follow-ups (not blocking this work)

- The `int`/`sack`/`rec yds` source is unverified until Week 1 finishes (see "Category-stat
  source: pending verification" above) — this blocks only that one piece; `position`
  extraction, matchup wiring (`isWinner`/`teamTotal`/`matchups`), and `player-gamelog.js`
  don't depend on it and can be built and tested independently.
- Weeks 9 and 15 depend on ESPN as a second data source, matched by game date — this is
  more fragile than the single-source Yahoo scrape used for every other week. Worth an
  extra verification pass once week 9 actually arrives (per-week challenge is ~2 months
  out) and again before week 15 (~3.5 months out).
- If Yahoo's official Fantasy API access is approved later, `int`/`sack`/`rec yds` (and
  possibly `inc`/`lng`, pending checking the league's actual stat category list per Task 8
  of the original API plan) could be fetched from one authenticated source instead of two
  scraped ones — worth a follow-up migration at that point.
