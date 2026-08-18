# Fantasy Football Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Yahoo Fantasy Football OAuth data layer plus five Claude Code skills (`/lineup-advice`, `/waiver-targets`, `/trade-analyzer`, `/challenge-tracker`, `/weekly-recap`) for the league "Kicker? I Hardly Know Her" (league id 109715).

**Architecture:** A small Node.js `yahoo/` package handles OAuth2 (out-of-band flow — no local callback server needed) and wraps the Yahoo Fantasy Sports REST API (JSON mode). Five `.claude/skills/*/SKILL.md` files sit on top, each documenting how Claude should call the data-layer scripts and reason over the result for that task. A `reference/challenges.md` file holds the 15 weekly side-challenge rules as structured data so `/challenge-tracker` can evaluate them generically.

**Tech Stack:** Node.js (v23, already installed), `axios` for HTTP, `dotenv` for local secrets, Node's built-in `node:test` + `assert` for unit tests (no extra test framework needed).

---

## Before you start

Confirm tooling:

```bash
node --version   # expect v23.x or later
npm --version    # expect 11.x or later
```

All commands below assume the working directory is the project root:
`C:\Users\jjdri\OneDrive\Documents\Development\Fantasy Football`

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Modify: `.gitignore` (already has `.env` and `*.token.json` — confirm, don't duplicate)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fantasy-football-assistant",
  "version": "0.1.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "test": "node --test"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "dotenv": "^16.4.7"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 3: Create `.env.example`**

```
YAHOO_CLIENT_ID=
YAHOO_CLIENT_SECRET=
YAHOO_LEAGUE_KEY=
```

- [ ] **Step 4: Confirm `.gitignore` already covers secrets**

Open `.gitignore` and confirm it contains `.env` and `*.token.json` (it does, from the earlier setup commit). No changes needed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "Scaffold Node project for Yahoo Fantasy data layer"
```

---

### Task 2: Register a Yahoo Developer app (manual checkpoint)

This step cannot be automated — it requires the user to log in to Yahoo and click through their developer console.

- [ ] **Step 1: STOP — user action required.** Go to https://developer.yahoo.com/apps/create/ and create a new app with:
  - Application Name: `Fantasy Football Assistant` (or anything)
  - Homepage URL: anything, e.g. `https://football.fantasysports.yahoo.com/f1/109715`
  - Redirect URI(s): `oob` (out-of-band — required for this flow; Yahoo accepts the literal string `oob`)
  - API Permissions: check **Fantasy Sports** with **Read** access

- [ ] **Step 2: STOP — user action required.** After creating the app, copy the **Client ID (Consumer Key)** and **Client Secret (Consumer Secret)** from the app's details page.

- [ ] **Step 3: Create local `.env` from the template**

```bash
cp .env.example .env
```

Then edit `.env` and paste in the real values:

```
YAHOO_CLIENT_ID=<paste client id>
YAHOO_CLIENT_SECRET=<paste client secret>
YAHOO_LEAGUE_KEY=
```

Leave `YAHOO_LEAGUE_KEY` blank for now — Task 6 discovers it.

- [ ] **Step 4: Verify `.env` is ignored by git**

Run: `git status`
Expected: `.env` does NOT appear in the output (it's gitignored). If it does appear, stop and fix `.gitignore` before continuing — do not commit secrets.

---

### Task 3: OAuth token exchange and caching (`yahoo/auth.js`)

**Files:**
- Create: `yahoo/auth.js`
- Test: `yahoo/auth.test.js`

- [ ] **Step 1: Write the failing test for `buildAuthorizeUrl`**

```js
// yahoo/auth.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAuthorizeUrl } = require('./auth');

test('buildAuthorizeUrl includes client id, oob redirect, and code response type', () => {
  const url = buildAuthorizeUrl('abc123');
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, 'https://api.login.yahoo.com/oauth2/request_auth');
  assert.equal(parsed.searchParams.get('client_id'), 'abc123');
  assert.equal(parsed.searchParams.get('redirect_uri'), 'oob');
  assert.equal(parsed.searchParams.get('response_type'), 'code');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/auth.test.js`
Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 3: Write `yahoo/auth.js`**

```js
// yahoo/auth.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const AUTHORIZE_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const REDIRECT_URI = 'oob';

function buildAuthorizeUrl(clientId) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    language: 'en-us',
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function loadTokens() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
}

function saveTokens(tokenResponse) {
  const record = {
    ...tokenResponse,
    expires_at: Date.now() + tokenResponse.expires_in * 1000,
  };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(record, null, 2));
  return record;
}

function basicAuthHeader(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

async function exchangeCodeForTokens({ clientId, clientSecret, code }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
  });
  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basicAuthHeader(clientId, clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return saveTokens(res.data);
}

async function refreshTokens({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshToken,
  });
  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basicAuthHeader(clientId, clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return saveTokens(res.data);
}

async function getValidAccessToken({ clientId, clientSecret }) {
  let tokens = loadTokens();
  if (!tokens) {
    throw new Error('No cached tokens found. Run `node yahoo/setup-auth.js` first.');
  }
  const bufferMs = 60 * 1000;
  if (Date.now() + bufferMs >= tokens.expires_at) {
    tokens = await refreshTokens({
      clientId,
      clientSecret,
      refreshToken: tokens.refresh_token,
    });
  }
  return tokens.access_token;
}

module.exports = {
  TOKEN_PATH,
  buildAuthorizeUrl,
  loadTokens,
  saveTokens,
  exchangeCodeForTokens,
  refreshTokens,
  getValidAccessToken,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test yahoo/auth.test.js`
Expected: PASS (1 test)

- [ ] **Step 5: Write the failing test for `saveTokens`/`loadTokens` round trip**

```js
// append to yahoo/auth.test.js
const fs = require('fs');
const { saveTokens, loadTokens, TOKEN_PATH } = require('./auth');

test('saveTokens then loadTokens round-trips and computes expires_at', () => {
  saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 });
  const loaded = loadTokens();
  assert.equal(loaded.access_token, 'a');
  assert.equal(loaded.refresh_token, 'r');
  assert.ok(loaded.expires_at > Date.now());
  fs.unlinkSync(TOKEN_PATH); // clean up test artifact
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test yahoo/auth.test.js`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add yahoo/auth.js yahoo/auth.test.js
git commit -m "Add Yahoo OAuth token exchange, caching, and refresh logic"
```

---

### Task 4: Interactive OAuth setup script + manual login checkpoint

**Files:**
- Create: `yahoo/setup-auth.js`

- [ ] **Step 1: Write `yahoo/setup-auth.js`**

```js
// yahoo/setup-auth.js
require('dotenv').config();
const readline = require('readline');
const { buildAuthorizeUrl, exchangeCodeForTokens } = require('./auth');

async function main() {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Missing YAHOO_CLIENT_ID / YAHOO_CLIENT_SECRET in .env — see Task 2.');
    process.exit(1);
  }

  const url = buildAuthorizeUrl(clientId);
  console.log('1. Open this URL in your browser and log in to Yahoo:\n');
  console.log(url);
  console.log('\n2. Click "Agree" to grant read access. Yahoo will display a code on screen.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\n3. Paste that code here and press Enter: ', async (code) => {
    rl.close();
    try {
      await exchangeCodeForTokens({ clientId, clientSecret, code: code.trim() });
      console.log('\nSuccess — token saved to yahoo/token.json.');
    } catch (err) {
      console.error('\nToken exchange failed:', err.response?.data || err.message);
      process.exit(1);
    }
  });
}

main();
```

- [ ] **Step 2: STOP — user action required.** Run the script and complete the login in a real browser:

Run: `node yahoo/setup-auth.js`

Follow the printed instructions: open the URL, log in to Yahoo, approve access, copy the code Yahoo displays, paste it back into the terminal.

Expected: `Success — token saved to yahoo/token.json.`

- [ ] **Step 3: Verify the token file exists and is gitignored**

Run: `git status`
Expected: `yahoo/token.json` does NOT appear (matches `*.token.json` in `.gitignore`). If it appears, stop and fix `.gitignore` before continuing.

- [ ] **Step 4: Commit the script (not the token)**

```bash
git add yahoo/setup-auth.js
git commit -m "Add interactive OAuth setup script"
```

---

### Task 5: Yahoo API client — discover the league key

**Files:**
- Create: `yahoo/client.js`
- Create: `yahoo/smoke-test-leagues.js`

- [ ] **Step 1: Write `yahoo/client.js` with `apiGet` and `getUserLeagues`**

```js
// yahoo/client.js
require('dotenv').config();
const axios = require('axios');
const { getValidAccessToken } = require('./auth');

const BASE_URL = 'https://fantasysports.yahooapis.com/fantasysports/v2';

async function apiGet(resourcePath) {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const accessToken = await getValidAccessToken({ clientId, clientSecret });
  const separator = resourcePath.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${resourcePath}${separator}format=json`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

async function getUserLeagues() {
  const data = await apiGet('/users;use_login=1/games;game_keys=nfl/leagues');
  const games = data.fantasy_content.users['0'].user[1].games;
  const leagues = [];
  for (const key of Object.keys(games)) {
    if (key === 'count') continue;
    const game = games[key].game;
    const leaguesObj = game[1] && game[1].leagues;
    if (!leaguesObj) continue;
    for (const lk of Object.keys(leaguesObj)) {
      if (lk === 'count') continue;
      const league = leaguesObj[lk].league[0];
      leagues.push({
        league_key: league.league_key,
        league_id: league.league_id,
        name: league.name,
        season: league.season,
      });
    }
  }
  return leagues;
}

module.exports = { apiGet, getUserLeagues };
```

- [ ] **Step 2: Write `yahoo/smoke-test-leagues.js`**

```js
// yahoo/smoke-test-leagues.js
const { getUserLeagues } = require('./client');

getUserLeagues()
  .then((leagues) => {
    console.log('Leagues found for your Yahoo account:');
    console.table(leagues);
  })
  .catch((err) => {
    console.error('Failed to fetch leagues:', err.response?.data || err.message);
    process.exit(1);
  });
```

- [ ] **Step 3: STOP — run against the real Yahoo API and confirm the league**

Run: `node yahoo/smoke-test-leagues.js`
Expected: a table including a row with `league_id: 109715` and `name` matching "Kicker? I Hardly Know Her". Note the `league_key` value shown (format like `461.l.109715` — the leading number is Yahoo's internal game key for the NFL season and varies by year).

If the shape of `data.fantasy_content...` doesn't match (Yahoo's JSON nesting is quirky and can shift), inspect the raw response with `console.log(JSON.stringify(data, null, 2))` temporarily in `getUserLeagues` and adjust the parsing to match what's actually returned. This is expected troubleshooting, not a sign the plan is wrong.

- [ ] **Step 4: Save the discovered league key to `.env`**

Edit `.env` and set:

```
YAHOO_LEAGUE_KEY=<the league_key value from Step 3>
```

- [ ] **Step 5: Commit**

```bash
git add yahoo/client.js yahoo/smoke-test-leagues.js
git commit -m "Add Yahoo API client and league discovery smoke test"
```

---

### Task 6: Fetch own team roster + league teams

**Files:**
- Modify: `yahoo/client.js`
- Create: `yahoo/smoke-test-roster.js`

- [ ] **Step 1: Add `getLeagueTeams` and `getTeamRoster` to `yahoo/client.js`**

```js
// add to yahoo/client.js, above module.exports

async function getLeagueTeams(leagueKey) {
  const data = await apiGet(`/league/${leagueKey}/teams`);
  const teamsObj = data.fantasy_content.league[1].teams;
  const teams = [];
  for (const key of Object.keys(teamsObj)) {
    if (key === 'count') continue;
    const teamArr = teamsObj[key].team[0];
    const flat = Object.assign({}, ...teamArr.filter((x) => typeof x === 'object' && !Array.isArray(x)));
    teams.push({ team_key: flat.team_key, name: flat.name });
  }
  return teams;
}

function flattenPlayer(playerArr) {
  const flat = Object.assign(
    {},
    ...playerArr[0].filter((x) => typeof x === 'object' && !Array.isArray(x))
  );
  const selectedPosition = playerArr[1] && playerArr[1].selected_position && playerArr[1].selected_position[1]
    ? playerArr[1].selected_position[1].position
    : null;
  return {
    player_key: flat.player_key,
    name: flat.name ? flat.name.full : null,
    position: flat.display_position,
    selected_position: selectedPosition,
  };
}

async function getTeamRoster(teamKey, week) {
  const data = await apiGet(`/team/${teamKey}/roster;week=${week}/players`);
  const playersObj = data.fantasy_content.team[1].roster['0'].players;
  const players = [];
  for (const key of Object.keys(playersObj)) {
    if (key === 'count') continue;
    players.push(flattenPlayer(playersObj[key].player));
  }
  return players;
}
```

- [ ] **Step 2: Update `module.exports` in `yahoo/client.js`**

```js
module.exports = { apiGet, getUserLeagues, getLeagueTeams, getTeamRoster, flattenPlayer };
```

- [ ] **Step 3: Write `yahoo/smoke-test-roster.js`**

```js
// yahoo/smoke-test-roster.js
require('dotenv').config();
const { getLeagueTeams, getTeamRoster } = require('./client');

async function main() {
  const leagueKey = process.env.YAHOO_LEAGUE_KEY;
  if (!leagueKey) {
    console.error('Set YAHOO_LEAGUE_KEY in .env first (see Task 5).');
    process.exit(1);
  }
  const teams = await getLeagueTeams(leagueKey);
  console.log('All teams in the league:');
  console.table(teams);

  const myTeam = teams[0]; // placeholder pick; Step 4 below has you confirm/replace this
  const roster = await getTeamRoster(myTeam.team_key, 1);
  console.log(`\nRoster for "${myTeam.name}" (week 1):`);
  console.table(roster);
}

main().catch((err) => {
  console.error('Smoke test failed:', err.response?.data || err.message);
  process.exit(1);
});
```

- [ ] **Step 4: STOP — run and confirm against the real Yahoo app**

Run: `node yahoo/smoke-test-roster.js`

Compare the printed team list to the standings page in the Yahoo app to find which `name` is yours, then edit Step 3's `const myTeam = teams[0]` line to select your actual team (e.g. `teams.find(t => t.name === 'Your Team Name')`) and re-run. Confirm the printed roster matches your actual Week 1 roster in the Yahoo app.

- [ ] **Step 5: Commit**

```bash
git add yahoo/client.js yahoo/smoke-test-roster.js
git commit -m "Add league teams and team roster fetching"
```

---

### Task 7: League-wide data scope check (resolves the key open risk)

**Files:**
- Create: `yahoo/smoke-test-scope.js`
- Create: `reference/api-notes.md`

- [ ] **Step 1: Write `yahoo/smoke-test-scope.js`**

```js
// yahoo/smoke-test-scope.js
require('dotenv').config();
const { getLeagueTeams, getTeamRoster } = require('./client');

async function main() {
  const leagueKey = process.env.YAHOO_LEAGUE_KEY;
  const teams = await getLeagueTeams(leagueKey);
  if (teams.length < 2) {
    console.error('Need at least 2 teams in the league to test this.');
    process.exit(1);
  }
  // Deliberately fetch a team that is NOT yours — adjust index if teams[1] happens to be yours.
  const otherTeam = teams[1];
  console.log(`Attempting to fetch roster for "${otherTeam.name}" (not your team)...`);
  const roster = await getTeamRoster(otherTeam.team_key, 1);
  console.log(`Success — got ${roster.length} players.`);
  console.table(roster);
}

main().catch((err) => {
  console.error('FAILED — league-wide roster access is likely restricted:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});
```

- [ ] **Step 2: STOP — run and record the result**

Run: `node yahoo/smoke-test-scope.js`

- If it prints another team's roster successfully: league-wide access works. `/challenge-tracker` can fetch every team's data automatically.
- If it fails with a 401/403: access is restricted to your own team. `/challenge-tracker` will need the fallback (user pastes/screenshots the league scoreboard).

- [ ] **Step 3: Write `reference/api-notes.md` documenting the result**

```markdown
# Yahoo API Notes

## League-wide roster access

Tested on <fill in today's date> by running `node yahoo/smoke-test-scope.js`.

Result: <ACCESSIBLE | RESTRICTED — fill in based on Step 2's actual output>

- If ACCESSIBLE: `/challenge-tracker` fetches every team's roster/stats directly via
  `getTeamRoster`/`getTeamRosterWithStats` for each team in `getLeagueTeams`.
- If RESTRICTED: `/challenge-tracker` fetches only the user's own team automatically and
  prompts the user to paste or screenshot the full league scoreboard from the Yahoo app
  for the remaining data.
```

(Fill in the actual date and result before committing — do not leave the placeholders in.)

- [ ] **Step 4: Commit**

```bash
git add yahoo/smoke-test-scope.js reference/api-notes.md
git commit -m "Confirm league-wide Yahoo API data scope"
```

---

### Task 8: League settings + stat category name map

**Files:**
- Modify: `yahoo/client.js`
- Test: `yahoo/client.test.js`

- [ ] **Step 1: Write the failing test for `buildStatNameMap`**

```js
// yahoo/client.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStatNameMap } = require('./client');

test('buildStatNameMap maps stat_id to lowercase display_name', () => {
  const categories = [
    { stat_id: '4', name: 'Interceptions', display_name: 'INT' },
    { stat_id: '11', name: 'Sacks', display_name: 'Sack' },
  ];
  const map = buildStatNameMap(categories);
  assert.equal(map.get('int'), '4');
  assert.equal(map.get('sack'), '11');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test yahoo/client.test.js`
Expected: FAIL — `buildStatNameMap is not a function`

- [ ] **Step 3: Add `getLeagueSettings`, `getTeamRosterWithStats`, and `buildStatNameMap` to `yahoo/client.js`**

```js
// add to yahoo/client.js, above module.exports

async function getLeagueSettings(leagueKey) {
  const data = await apiGet(`/league/${leagueKey}/settings`);
  const settings = data.fantasy_content.league[1].settings[0];
  return settings.stat_categories.stats.map((s) => ({
    stat_id: s.stat.stat_id,
    name: s.stat.name,
    display_name: s.stat.display_name,
  }));
}

function buildStatNameMap(statCategories) {
  const map = new Map();
  for (const cat of statCategories) {
    map.set(cat.display_name.toLowerCase(), cat.stat_id);
    map.set(cat.name.toLowerCase(), cat.stat_id);
  }
  return map;
}

async function getTeamRosterWithStats(teamKey, week) {
  const data = await apiGet(`/team/${teamKey}/roster;week=${week}/players/stats`);
  const playersObj = data.fantasy_content.team[1].roster['0'].players;
  const players = [];
  for (const key of Object.keys(playersObj)) {
    if (key === 'count') continue;
    const playerArr = playersObj[key].player;
    const base = flattenPlayer(playerArr);
    const statsList = (playerArr[2] && playerArr[2].player_stats && playerArr[2].player_stats.stats) || [];
    const stats = {};
    for (const s of statsList) {
      stats[s.stat.stat_id] = s.stat.value;
    }
    players.push({ ...base, stats });
  }
  return players;
}
```

- [ ] **Step 4: Update `module.exports` in `yahoo/client.js`**

```js
module.exports = {
  apiGet,
  getUserLeagues,
  getLeagueTeams,
  getTeamRoster,
  flattenPlayer,
  getLeagueSettings,
  getTeamRosterWithStats,
  buildStatNameMap,
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test yahoo/client.test.js`
Expected: PASS (1 test)

- [ ] **Step 6: STOP — smoke-test against real data**

Run a one-off check:

```bash
node -e "require('dotenv').config(); const {getLeagueSettings}=require('./yahoo/client'); getLeagueSettings(process.env.YAHOO_LEAGUE_KEY).then(c=>console.table(c))"
```

Expected: a table of this league's real stat categories. Confirm names like interceptions, sacks, receiving yards, incomplete passes, and longest pass appear somewhere (needed for Task 9) — note their exact `display_name` strings, since Yahoo's wording can differ from what's guessed in this plan.

- [ ] **Step 7: Commit**

```bash
git add yahoo/client.js yahoo/client.test.js
git commit -m "Add league stat categories and per-player stat fetching"
```

---

### Task 9: Extract the 15 weekly challenges to `reference/challenges.md`

**Files:**
- Create: `reference/challenges.md`

- [ ] **Step 1: Write `reference/challenges.md`**

```markdown
# 2026 Weekly Challenges

Source: `reference/2026_League_Rules.pdf` and `reference/FFL_2026_Weekly_Challenges_Mobile.pdf`.
$10 prize per week, 15 weeks (Weeks 1-15). Only players in the stated lineup position
count unless a challenge says otherwise.

| Week | Name | Rule |
|------|------|------|
| 1 | Revis and Butthead | Highest-scoring player or D/ST left on the bench, league-wide. |
| 2 | You're Killin' Me, Smalls | Among winning teams, the lowest-scoring starter in a winning lineup. |
| 3 | Scobee Snacks | Highest-scoring starting kicker, league-wide. |
| 4 | Give It Away, Give It Away Now | Starting QB (or superflex) with the most interceptions thrown. |
| 5 | Gotta Catch Jamaal | Starting RB with the most fantasy points. |
| 6 | Sack Up | Starting IDP with the most sacks. Tie broken by highest team fantasy score that week. |
| 7 | Gronk Memorial Challenge | Starting TE whose receiving yardage is closest to 69 (over or under). |
| 8 | Jerry Rice Week | Highest-scoring starting WR, league-wide. |
| 9 | If at First You Don't Succeed | Starting QB (or superflex) with the most incomplete passes. |
| 10 | Horseshoes and Hand Grenades | Losing team with the smallest margin of defeat. |
| 11 | Fatality! | Winning team with the largest margin of victory. |
| 12 | Uncle Rico | Starting QB with the most fantasy points (starter only, not superflex). |
| 13 | Come On! | Highest-scoring team that still loses its matchup. |
| 14 | Closest to 21 | Any starter closest to 21 fantasy points without going over. |
| 15 | Longest Pass | Starting QB (or superflex) who threw the longest single pass. |

Administration: scoring source is final Yahoo scoring after stat corrections. Contact the
commissioner for questions or scoring errors.
```

- [ ] **Step 2: Commit**

```bash
git add reference/challenges.md
git commit -m "Extract 15 weekly challenge rules to reference/challenges.md"
```

---

### Task 10: Challenge evaluator engine

**Files:**
- Create: `yahoo/challenge-config.js`
- Create: `yahoo/evaluate-challenge.js`
- Test: `yahoo/evaluate-challenge.test.js`

This is the generic engine `/challenge-tracker` uses. Every one of the 15 challenges reduces
to one of two mechanisms: picking a player from a filtered pool by a stat (max/min/closest-to-target),
or picking a team by score margin/result. `yahoo/challenge-config.js` declares which mechanism
and filters apply per week; `yahoo/evaluate-challenge.js` is the generic engine that runs them.

- [ ] **Step 1: Write `yahoo/challenge-config.js`**

```js
// yahoo/challenge-config.js
// type: 'player_stat' | 'team_score'
// pool: 'starters' | 'bench' (player_stat only)
// positions: array of Yahoo position codes, or 'any', or 'IDP' (DL/LB/DB)
// includeSuperflex: also count a player started in a superflex/OP slot as QB-eligible
// stat: display_name of the stat to compare (resolved via buildStatNameMap)
// pick: 'max' | 'min' | 'closest' | 'closestUnder'
// target: number, required when pick is 'closest' or 'closestUnder'
// teamFilter (player_stat only): 'winners' | 'losers' | undefined (no filter)
// filter (team_score only): 'winners' | 'losers'

const IDP_POSITIONS = ['DL', 'LB', 'DB', 'DE', 'DT', 'CB', 'S'];

const CHALLENGES = {
  1: { week: 1, type: 'player_stat', pool: 'bench', positions: 'any', stat: 'points', pick: 'max' },
  2: { week: 2, type: 'player_stat', pool: 'starters', positions: 'any', teamFilter: 'winners', stat: 'points', pick: 'min' },
  3: { week: 3, type: 'player_stat', pool: 'starters', positions: ['K'], stat: 'points', pick: 'max' },
  4: { week: 4, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'int', pick: 'max' },
  5: { week: 5, type: 'player_stat', pool: 'starters', positions: ['RB'], stat: 'points', pick: 'max' },
  6: { week: 6, type: 'player_stat', pool: 'starters', positions: IDP_POSITIONS, stat: 'sack', pick: 'max', tiebreak: 'teamTotal' },
  7: { week: 7, type: 'player_stat', pool: 'starters', positions: ['TE'], stat: 'rec yds', pick: 'closest', target: 69 },
  8: { week: 8, type: 'player_stat', pool: 'starters', positions: ['WR'], stat: 'points', pick: 'max' },
  9: { week: 9, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'inc', pick: 'max' },
  10: { week: 10, type: 'team_score', filter: 'losers', pick: 'minMargin' },
  11: { week: 11, type: 'team_score', filter: 'winners', pick: 'maxMargin' },
  12: { week: 12, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: false, stat: 'points', pick: 'max' },
  13: { week: 13, type: 'team_score', filter: 'losers', pick: 'maxScore' },
  14: { week: 14, type: 'player_stat', pool: 'starters', positions: 'any', stat: 'points', pick: 'closestUnder', target: 21 },
  15: { week: 15, type: 'player_stat', pool: 'starters', positions: ['QB'], includeSuperflex: true, stat: 'lng', pick: 'max' },
};

module.exports = { CHALLENGES, IDP_POSITIONS };
```

- [ ] **Step 2: Write the failing test for the evaluator**

```js
// yahoo/evaluate-challenge.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge } = require('./evaluate-challenge');

test('week 1: highest-scoring bench player wins', () => {
  const config = { pool: 'bench', positions: 'any', stat: 'points', pick: 'max' };
  const teams = [
    { team_name: 'A', players: [{ name: 'Bench Star', selected_position: 'BN', position: 'WR', points: 28 }] },
    { team_name: 'B', players: [{ name: 'Bench Dud', selected_position: 'BN', position: 'RB', points: 5 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'Bench Star');
  assert.equal(winner.team_name, 'A');
});

test('week 7: TE closest to 69 receiving yards wins, over or under', () => {
  const config = { pool: 'starters', positions: ['TE'], stat: 'rec yds', pick: 'closest', target: 69 };
  const teams = [
    { team_name: 'A', players: [{ name: 'TE Over', selected_position: 'TE', position: 'TE', 'rec yds': 74 }] },
    { team_name: 'B', players: [{ name: 'TE Under', selected_position: 'TE', position: 'TE', 'rec yds': 65 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'TE Under'); // |65-69|=4 vs |74-69|=5
});

test('week 14: starter closest to 21 points without going over', () => {
  const config = { pool: 'starters', positions: 'any', stat: 'points', pick: 'closestUnder', target: 21 };
  const teams = [
    { team_name: 'A', players: [{ name: 'Over', selected_position: 'RB', position: 'RB', points: 22 }] },
    { team_name: 'B', players: [{ name: 'Perfect', selected_position: 'WR', position: 'WR', points: 21 }] },
    { team_name: 'C', players: [{ name: 'Close', selected_position: 'QB', position: 'QB', points: 19 }] },
  ];
  const winner = evaluatePlayerStatChallenge(config, teams);
  assert.equal(winner.name, 'Perfect');
});

test('week 11: winning team with largest margin of victory', () => {
  const config = { filter: 'winners', pick: 'maxMargin' };
  const matchups = [
    { teams: [{ team_name: 'A', score: 120 }, { team_name: 'B', score: 100 }] },
    { teams: [{ team_name: 'C', score: 90 }, { team_name: 'D', score: 88 }] },
  ];
  const winner = evaluateTeamScoreChallenge(config, matchups);
  assert.equal(winner.team_name, 'A');
  assert.equal(winner.margin, 20);
});

test('week 13: highest-scoring team that still loses', () => {
  const config = { filter: 'losers', pick: 'maxScore' };
  const matchups = [
    { teams: [{ team_name: 'A', score: 120 }, { team_name: 'B', score: 130 }] },
    { teams: [{ team_name: 'C', score: 90 }, { team_name: 'D', score: 95 }] },
  ];
  const winner = evaluateTeamScoreChallenge(config, matchups);
  assert.equal(winner.team_name, 'A'); // A lost 120-130, highest score among losers
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test yahoo/evaluate-challenge.test.js`
Expected: FAIL — `Cannot find module './evaluate-challenge'`

- [ ] **Step 4: Write `yahoo/evaluate-challenge.js`**

```js
// yahoo/evaluate-challenge.js
const { IDP_POSITIONS } = require('./challenge-config');

function playerMatchesPositions(player, positions, includeSuperflex) {
  if (positions === 'any') return true;
  const list = positions === 'IDP' ? IDP_POSITIONS : positions;
  if (list.includes(player.position)) return true;
  if (includeSuperflex && player.position === 'QB' && ['OP', 'SUPERFLEX', 'W/R/T/Q'].includes(player.selected_position)) {
    return true;
  }
  return false;
}

function isStarter(player) {
  return player.selected_position && player.selected_position !== 'BN' && player.selected_position !== 'IR';
}

function isBench(player) {
  return player.selected_position === 'BN';
}

function buildPool(config, teams) {
  const pool = [];
  for (const team of teams) {
    if (config.teamFilter === 'winners' && !team.isWinner) continue;
    if (config.teamFilter === 'losers' && team.isWinner) continue;
    for (const player of team.players) {
      const positionOk = playerMatchesPositions(player, config.positions, config.includeSuperflex);
      if (!positionOk) continue;
      if (config.pool === 'starters' && !isStarter(player)) continue;
      if (config.pool === 'bench' && !isBench(player)) continue;
      const value = Number(player[config.stat]);
      if (Number.isNaN(value)) continue;
      pool.push({ ...player, team_name: team.team_name, statValue: value });
    }
  }
  return pool;
}

function evaluatePlayerStatChallenge(config, teams) {
  const pool = buildPool(config, teams);
  if (pool.length === 0) return null;

  if (config.pick === 'max') {
    return pool.reduce((best, p) => (p.statValue > best.statValue ? p : best));
  }
  if (config.pick === 'min') {
    return pool.reduce((best, p) => (p.statValue < best.statValue ? p : best));
  }
  if (config.pick === 'closest') {
    return pool.reduce((best, p) =>
      Math.abs(p.statValue - config.target) < Math.abs(best.statValue - config.target) ? p : best
    );
  }
  if (config.pick === 'closestUnder') {
    const eligible = pool.filter((p) => p.statValue <= config.target);
    if (eligible.length === 0) return null;
    return eligible.reduce((best, p) => (p.statValue > best.statValue ? p : best));
  }
  throw new Error(`Unknown pick strategy: ${config.pick}`);
}

function withMargins(matchups) {
  const results = [];
  for (const matchup of matchups) {
    const [t1, t2] = matchup.teams;
    const t1Won = t1.score > t2.score;
    results.push({ team_name: t1.name || t1.team_name, score: t1.score, margin: Math.abs(t1.score - t2.score), isWinner: t1Won });
    results.push({ team_name: t2.name || t2.team_name, score: t2.score, margin: Math.abs(t1.score - t2.score), isWinner: !t1Won });
  }
  return results;
}

function evaluateTeamScoreChallenge(config, matchups) {
  const teams = withMargins(matchups);
  const filtered = teams.filter((t) => (config.filter === 'winners' ? t.isWinner : !t.isWinner));
  if (filtered.length === 0) return null;

  if (config.pick === 'maxMargin') {
    return filtered.reduce((best, t) => (t.margin > best.margin ? t : best));
  }
  if (config.pick === 'minMargin') {
    return filtered.reduce((best, t) => (t.margin < best.margin ? t : best));
  }
  if (config.pick === 'maxScore') {
    return filtered.reduce((best, t) => (t.score > best.score ? t : best));
  }
  throw new Error(`Unknown pick strategy: ${config.pick}`);
}

module.exports = { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge, buildPool };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test yahoo/evaluate-challenge.test.js`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add yahoo/challenge-config.js yahoo/evaluate-challenge.js yahoo/evaluate-challenge.test.js
git commit -m "Add generic weekly-challenge evaluator engine and config for all 15 weeks"
```

---

### Task 11: Wire the evaluator to live data (`yahoo/run-challenge.js`)

**Files:**
- Create: `yahoo/run-challenge.js`

- [ ] **Step 1: Write `yahoo/run-challenge.js`**

This script fetches the data the evaluator needs for a given week and runs it. Which fetch
path it uses depends on the Task 7 finding — both are written; the ACCESSIBLE path is
tried first and falls back to instructions if it fails.

```js
// yahoo/run-challenge.js
require('dotenv').config();
const { getLeagueTeams, getTeamRosterWithStats, getLeagueSettings, buildStatNameMap } = require('./client');
const { CHALLENGES } = require('./challenge-config');
const { evaluatePlayerStatChallenge, evaluateTeamScoreChallenge } = require('./evaluate-challenge');

function normalizeStatsToNames(players, statNameMap) {
  const idToName = new Map();
  for (const [name, id] of statNameMap.entries()) idToName.set(id, name);
  return players.map((p) => {
    const named = { ...p, points: Number(p.stats && p.stats['0'] ? p.stats['0'] : 0) };
    for (const [statId, value] of Object.entries(p.stats || {})) {
      const name = idToName.get(statId);
      if (name) named[name] = Number(value);
    }
    return named;
  });
}

async function main() {
  const week = Number(process.argv[2]);
  if (!week || !CHALLENGES[week]) {
    console.error('Usage: node yahoo/run-challenge.js <week 1-15>');
    process.exit(1);
  }
  const leagueKey = process.env.YAHOO_LEAGUE_KEY;
  const config = CHALLENGES[week];
  const statCategories = await getLeagueSettings(leagueKey);
  const statNameMap = buildStatNameMap(statCategories);
  const leagueTeams = await getLeagueTeams(leagueKey);

  const teamsWithPlayers = [];
  for (const team of leagueTeams) {
    const roster = await getTeamRosterWithStats(team.team_key, week);
    teamsWithPlayers.push({ team_name: team.name, players: normalizeStatsToNames(roster, statNameMap) });
  }

  if (config.type === 'player_stat') {
    const winner = evaluatePlayerStatChallenge(config, teamsWithPlayers);
    console.log(`Week ${week} challenge winner:`, winner);
  } else {
    console.log('This challenge needs matchup scores/margins, not just rosters.');
    console.log('team_score challenges (weeks 10, 11, 13) need a separate scoreboard fetch — see Task 12.');
  }
}

main().catch((err) => {
  console.error('run-challenge failed:', err.response?.data || err.message);
  process.exit(1);
});
```

- [ ] **Step 2: STOP — run against a real completed week and sanity-check**

Once at least one week of the season has completed:

Run: `node yahoo/run-challenge.js 1`

Compare the reported winner against what you can see manually in the Yahoo app (bench points for each team, week 1). If the stat parsing looks wrong (e.g. `points` comes back as 0 or `undefined`), inspect `player.stats` raw output for one player and adjust `normalizeStatsToNames` — Yahoo's stat id `'0'` is fantasy points by convention but confirm against `getLeagueSettings` output.

- [ ] **Step 3: Commit**

```bash
git add yahoo/run-challenge.js
git commit -m "Wire challenge evaluator to live Yahoo roster/stat data"
```

---

### Task 12: Scoreboard fetch for team-score challenges (weeks 10, 11, 13)

**Files:**
- Modify: `yahoo/client.js`
- Modify: `yahoo/run-challenge.js`

- [ ] **Step 1: Add `getScoreboard` to `yahoo/client.js`**

```js
// add to yahoo/client.js, above module.exports

async function getScoreboard(leagueKey, week) {
  const data = await apiGet(`/league/${leagueKey}/scoreboard;week=${week}`);
  const matchupsObj = data.fantasy_content.league[1].scoreboard['0'].matchups;
  const matchups = [];
  for (const key of Object.keys(matchupsObj)) {
    if (key === 'count') continue;
    const teamsObj = matchupsObj[key].matchup['0'].teams;
    const teams = [];
    for (const tKey of Object.keys(teamsObj)) {
      if (tKey === 'count') continue;
      const teamArr = teamsObj[tKey].team;
      const flat = Object.assign({}, ...teamArr[0].filter((x) => typeof x === 'object' && !Array.isArray(x)));
      const points = teamArr[1] && teamArr[1].team_points ? Number(teamArr[1].team_points.total) : null;
      teams.push({ name: flat.name, team_key: flat.team_key, score: points });
    }
    matchups.push({ teams });
  }
  return matchups;
}
```

- [ ] **Step 2: Update `module.exports` in `yahoo/client.js`** to include `getScoreboard`.

- [ ] **Step 3: Update `yahoo/run-challenge.js`** to handle `team_score` challenges

Replace the `else` branch from Task 11 Step 1 with:

```js
  if (config.type === 'player_stat') {
    const winner = evaluatePlayerStatChallenge(config, teamsWithPlayers);
    console.log(`Week ${week} challenge winner:`, winner);
  } else {
    const { getScoreboard } = require('./client');
    const matchups = await getScoreboard(leagueKey, week);
    const winner = evaluateTeamScoreChallenge(config, matchups);
    console.log(`Week ${week} challenge winner:`, winner);
  }
```

(Also add `const { getScoreboard } = require('./client');` to the top-level requires instead of inline, then remove the inline require — inline shown above only to make the diff obvious.)

- [ ] **Step 4: STOP — run against a real completed week**

Run: `node yahoo/run-challenge.js 11` (largest margin of victory) once Week 11 has completed, or test with an earlier completed week's number substituted into `CHALLENGES` temporarily if you want to test the mechanism sooner — team-score logic doesn't depend on the specific week's rule, only on real scoreboard data existing for that week.

Compare against the real standings/scores in the Yahoo app.

- [ ] **Step 5: Commit**

```bash
git add yahoo/client.js yahoo/run-challenge.js
git commit -m "Add scoreboard fetching for margin-based weekly challenges"
```

---

### Task 13: `/challenge-tracker` skill

**Files:**
- Create: `.claude/skills/challenge-tracker/SKILL.md`

- [ ] **Step 1: Write the skill file**

```markdown
---
name: challenge-tracker
description: Use when the user asks who's winning (or won) this week's or a specific week's $10 side-challenge in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Challenge Tracker

Reports the current leader (or final winner) for one of the 15 weekly $10 side-challenges
defined in `reference/challenges.md`.

## Steps

1. Determine which week the user means. Default to the current NFL week if unspecified.
2. Run: `node yahoo/run-challenge.js <week>` from the project root.
3. If the script errors because `yahoo/token.json` is missing or expired, tell the user to
   run `node yahoo/setup-auth.js` and stop — do not attempt to work around missing auth.
4. If `reference/api-notes.md` says league-wide roster access is RESTRICTED, the script's
   output will be incomplete. Ask the user to paste or screenshot the full league scoreboard
   from the Yahoo app for that week, and compute the answer manually using the rule text
   from `reference/challenges.md` instead.
5. Report the winner, their team, and the stat value that won it, referencing the specific
   rule text from `reference/challenges.md` for that week so the user can double check it.
6. Note that this is based on live-but-possibly-not-final Yahoo scoring — remind the user
   that official results use final scoring after stat corrections (per the league rules).
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/challenge-tracker/SKILL.md
git commit -m "Add /challenge-tracker skill"
```

---

### Task 14: `/lineup-advice` skill

**Files:**
- Create: `.claude/skills/lineup-advice/SKILL.md`
- Create: `yahoo/get-matchup.js`

- [ ] **Step 1: Write `yahoo/get-matchup.js`** — fetches the user's roster and their current opponent's roster together, since lineup advice needs both.

```js
// yahoo/get-matchup.js
require('dotenv').config();
const { getScoreboard, getTeamRoster } = require('./client');

async function main() {
  const week = Number(process.argv[2]);
  const myTeamKey = process.env.YAHOO_MY_TEAM_KEY;
  if (!week || !myTeamKey) {
    console.error('Usage: node yahoo/get-matchup.js <week>');
    console.error('Requires YAHOO_MY_TEAM_KEY in .env (find it via yahoo/smoke-test-roster.js output).');
    process.exit(1);
  }
  const leagueKey = process.env.YAHOO_LEAGUE_KEY;
  const matchups = await getScoreboard(leagueKey, week);
  const myMatchup = matchups.find((m) => m.teams.some((t) => t.team_key === myTeamKey));
  if (!myMatchup) {
    console.error(`No matchup found for team ${myTeamKey} in week ${week}.`);
    process.exit(1);
  }
  const opponent = myMatchup.teams.find((t) => t.team_key !== myTeamKey);
  const myRoster = await getTeamRoster(myTeamKey, week);
  const opponentRoster = await getTeamRoster(opponent.team_key, week);
  console.log(JSON.stringify({ week, myRoster, opponent: opponent.name, opponentRoster }, null, 2));
}

main().catch((err) => {
  console.error('get-matchup failed:', err.response?.data || err.message);
  process.exit(1);
});
```

- [ ] **Step 2: STOP — add your team key to `.env`**

Add to `.env`:

```
YAHOO_MY_TEAM_KEY=<your team_key from yahoo/smoke-test-roster.js output, Task 6>
```

- [ ] **Step 3: STOP — run and sanity check**

Run: `node yahoo/get-matchup.js 1`
Expected: JSON with your roster and your Week 1 opponent's roster. Confirm the opponent name matches what's shown in the Yahoo app for your Week 1 matchup.

- [ ] **Step 4: Write `.claude/skills/lineup-advice/SKILL.md`**

```markdown
---
name: lineup-advice
description: Use when the user wants start/sit help or lineup optimization advice for an upcoming or current week in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Lineup Advice

Gives start/sit recommendations for the user's team for a given week.

## Steps

1. Determine which week the user means (default: current NFL week).
2. Run: `node yahoo/get-matchup.js <week>` from the project root to get the user's roster,
   their opponent's name, and the opponent's roster as JSON.
3. If it errors about `YAHOO_MY_TEAM_KEY` missing, ask the user to add it to `.env` — the
   value is their `team_key` from the Yahoo API (visible in `yahoo/smoke-test-roster.js` output).
4. Using the roster JSON (positions, selected_position showing current starters vs bench),
   reason about which bench players might outperform current starters this week. You do not
   have live projections from this script — supplement with your own general knowledge of
   the players involved (matchups, recent form) and say clearly when you're speculating vs.
   reporting fetched data.
5. Flag anything roster-rule-relevant from `reference/2026_League_Rules.pdf` if applicable
   (e.g. IR eligibility, no median matchup).
6. Present recommendations as a short list: position, current starter, suggested replacement
   (if any), and one-line reasoning per swap.
```

- [ ] **Step 5: Commit**

```bash
git add yahoo/get-matchup.js .claude/skills/lineup-advice/SKILL.md
git commit -m "Add /lineup-advice skill and matchup data fetch"
```

---

### Task 15: `/waiver-targets`, `/trade-analyzer`, `/weekly-recap` skills

**Files:**
- Create: `yahoo/get-free-agents.js`
- Create: `.claude/skills/waiver-targets/SKILL.md`
- Create: `.claude/skills/trade-analyzer/SKILL.md`
- Create: `.claude/skills/weekly-recap/SKILL.md`

- [ ] **Step 1: Add `getFreeAgents` to `yahoo/client.js`**

```js
// add to yahoo/client.js, above module.exports

async function getFreeAgents(leagueKey, position) {
  const posFilter = position ? `;position=${position}` : '';
  const data = await apiGet(`/league/${leagueKey}/players;status=FA${posFilter};sort=OR;count=25`);
  const playersObj = data.fantasy_content.league[1].players;
  const players = [];
  for (const key of Object.keys(playersObj)) {
    if (key === 'count') continue;
    const flat = Object.assign(
      {},
      ...playersObj[key].player[0].filter((x) => typeof x === 'object' && !Array.isArray(x))
    );
    players.push({ player_key: flat.player_key, name: flat.name ? flat.name.full : null, position: flat.display_position });
  }
  return players;
}
```

Update `module.exports` in `yahoo/client.js` to include `getFreeAgents`.

- [ ] **Step 2: Write `yahoo/get-free-agents.js`**

```js
// yahoo/get-free-agents.js
require('dotenv').config();
const { getFreeAgents } = require('./client');

async function main() {
  const position = process.argv[2]; // e.g. RB, WR, QB, or omit for all
  const leagueKey = process.env.YAHOO_LEAGUE_KEY;
  const players = await getFreeAgents(leagueKey, position);
  console.log(JSON.stringify(players, null, 2));
}

main().catch((err) => {
  console.error('get-free-agents failed:', err.response?.data || err.message);
  process.exit(1);
});
```

- [ ] **Step 3: STOP — run and sanity check**

Run: `node yahoo/get-free-agents.js RB`
Expected: a JSON list of currently-available running backs. Spot check a couple of names against the Yahoo app's waiver wire.

- [ ] **Step 4: Write `.claude/skills/waiver-targets/SKILL.md`**

```markdown
---
name: waiver-targets
description: Use when the user wants waiver-wire or free-agent pickup suggestions for the "Kicker? I Hardly Know Her" Yahoo league.
---

# Waiver Targets

Suggests free agents worth adding, given the user's roster needs.

## Steps

1. Run `node yahoo/get-matchup.js <current week>` (or `yahoo/smoke-test-roster.js` if that
   fails) to see the user's current roster and identify weak positions.
2. Run `node yahoo/get-free-agents.js <position>` for the position(s) that look weakest, or
   omit the position argument to see all available free agents.
3. Cross-reference `reference/2026_League_Rules.pdf` for the season acquisition cap (60 total)
   and remind the user how many they've used if that's known/askable — otherwise just note
   the cap exists.
4. Recommend 2-3 specific pickups with one-line reasoning each (role, opportunity, matchup —
   using general knowledge since these scripts don't provide projections).
```

- [ ] **Step 5: Write `.claude/skills/trade-analyzer/SKILL.md`**

```markdown
---
name: trade-analyzer
description: Use when the user wants help evaluating a specific trade offer in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Trade Analyzer

Evaluates a specific trade: players the user gives up vs. players they receive.

## Steps

1. Ask the user (if not already stated) exactly which players are on each side of the trade,
   and which team they're trading with.
2. Run `node yahoo/get-matchup.js <current week>` or `yahoo/smoke-test-roster.js` to see the
   user's full current roster for context (positional depth, bye weeks if known).
3. If needed, fetch the other team's roster with `getTeamRoster` (see `yahoo/client.js`) to
   understand their team context — write a small one-off script the same way `get-matchup.js`
   does, or reuse it if the other team is the user's current opponent.
4. Check `reference/2026_League_Rules.pdf` for trade rules: max 15 trades/season, deadline
   November 21 2026, and that 3 league veto votes cancel a trade — mention these if relevant.
5. Give a clear verdict: favors user / favors other team / fair, with the main reasoning
   (positional value, depth impact, rest-of-season outlook using general knowledge).
```

- [ ] **Step 6: Write `.claude/skills/weekly-recap/SKILL.md`**

```markdown
---
name: weekly-recap
description: Use when the user wants a flavorful recap or trash-talk writeup of their current or most recent matchup in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Weekly Recap

Generates a dynamic, flavorful recap of the user's matchup for a given week — no fixed
opponent "personas," just banter grounded in the real data for that week.

## Steps

1. Determine the week (default: most recently completed week).
2. Run `node yahoo/get-matchup.js <week>` to get the user's roster, opponent name, and
   opponent's roster. If the matchup is complete, also run
   `node -e "..."` against `getScoreboard` (see `yahoo/client.js`) to get final scores.
3. Write a short (3-6 sentence) recap in a fun, lightly trash-talking tone, referencing
   specific real players/scores from the fetched data — not generic filler.
4. If it's a challenge week (check `reference/challenges.md`), mention whether the user's
   team is in contention for that week's $10 challenge based on what's known.
5. Keep it good-natured — this is a friend league, not actual beef.
```

- [ ] **Step 7: Commit**

```bash
git add yahoo/client.js yahoo/get-free-agents.js .claude/skills/waiver-targets/SKILL.md .claude/skills/trade-analyzer/SKILL.md .claude/skills/weekly-recap/SKILL.md
git commit -m "Add /waiver-targets, /trade-analyzer, and /weekly-recap skills"
```

---

## Done criteria

- `node yahoo/setup-auth.js` successfully authenticates once (manual, one-time).
- `node yahoo/run-challenge.js <week>` produces a plausible winner for a completed week,
  cross-checked against the Yahoo app.
- All five `.claude/skills/*/SKILL.md` files exist and can be invoked by name.
- `npm test` passes (auth.js, client.js, evaluate-challenge.js unit tests).
- No secrets (`​.env`, `yahoo/token.json`) ever appear in `git status` as trackable/staged.
