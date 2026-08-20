# Fantasy Football Assistant

A personal Claude Code assistant for the Yahoo Fantasy Football league **"Kicker? I Hardly
Know Her"** — lineup advice, waiver/trade help, and tracking the league's 15 weekly $10
side-challenges.

## Status

Yahoo's Fantasy Sports API access is pending approval (applied via
[sports.yahoo.com/developer/access](https://sports.yahoo.com/developer/access/)). Until
that comes through, all five skills below work in a **manual mode** — they'll ask you to
paste or screenshot whatever they need from the Yahoo app instead of fetching it
automatically. Once API access is approved and OAuth is set up (see below), the same
skills switch to using live data automatically — no changes needed on your end.

## Skills

Invoke these from Claude Code by describing what you want, or by name. Each one is defined
in `.claude/skills/<name>/SKILL.md`.

| Skill | What it does |
|---|---|
| `challenge-tracker` | Tells you who's winning (or won) a given week's $10 side-challenge, per the rules in `reference/challenges.md`. |
| `lineup-advice` | Start/sit recommendations for your roster for a given week. |
| `waiver-targets` | Suggests free-agent pickups based on your roster needs. |
| `trade-analyzer` | Evaluates a specific trade offer (your side vs. theirs). |
| `weekly-recap` | Generates a flavorful, data-grounded recap/trash-talk writeup of your matchup. |

**Example prompts:**
- "Who's winning this week's challenge?"
- "Help me set my lineup for this week."
- "Should I add anyone off waivers?"
- "Is this trade fair: I give up X, get Y?"
- "Write me a recap of this week's matchup."

In manual mode, just answer whatever the skill asks for (usually a screenshot or copy/paste
of a roster, matchup, or scoreboard from the Yahoo app).

## Setup (for live data)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Register a Yahoo Developer app** at [developer.yahoo.com/apps/create](https://developer.yahoo.com/apps/create/):
   - Redirect URI: `urn:ietf:wg:oauth:2.0:oob` (Yahoo's app-creation form rejects the bare
     string `oob`, even though Yahoo's own docs reference it — use the full URN instead)
   - API Permissions: **Fantasy Sports**, Read access (only available after Yahoo approves
     your [Fantasy Sports API access request](https://sports.yahoo.com/developer/access/) —
     apply there first if you haven't)

3. **Create your local `.env`:**
   ```bash
   cp .env.example .env
   ```
   Fill in `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET` from your app's details page. Leave
   `YAHOO_LEAGUE_KEY` blank for now.

4. **Run the OAuth login** (one-time, opens a URL for you to approve in a browser):
   ```bash
   node yahoo/setup-auth.js
   ```

5. **Discover your league key:**
   ```bash
   node yahoo/smoke-test-leagues.js
   ```
   Copy the `league_key` for "Kicker? I Hardly Know Her" into `.env` as `YAHOO_LEAGUE_KEY`.

## Setup (browser scraping — works now, no API approval needed)

While Yahoo's API access is pending, the skills can get live data via Playwright browser
automation instead:

1. `npm install` (installs `playwright` too)
2. `npx playwright install chromium` (one-time, downloads the browser binary)
3. `node yahoo/login.js` — opens a browser window, log into Yahoo once. Your session is
   saved in `yahoo/.playwright-profile/` (gitignored) and reused by every script below.
4. That's it — `challenge-tracker`, `lineup-advice`, `trade-analyzer`, `waiver-targets`,
   and `weekly-recap` will now use `node yahoo/get-*.js` / `node yahoo/run-challenge.js`
   automatically instead of asking you to paste screenshots.

If a script ever fails with `NOT_LOGGED_IN`, just run `node yahoo/login.js` again.

## Project structure

```
yahoo/                  Yahoo OAuth + API client (auth.js, client.js) and the weekly
                         challenge evaluator engine (challenge-config.js, evaluate-challenge.js)
reference/               League rules, weekly challenge definitions, and API notes
.claude/skills/           The five skills listed above
docs/superpowers/         Design spec and implementation plan for this project
```

## Notes

- Secrets (`.env`, `yahoo/token.json`) are gitignored and never committed.
- The league's full rules are in `reference/2026_League_Rules.pdf`; the 15 weekly
  challenges are summarized in `reference/challenges.md`.
