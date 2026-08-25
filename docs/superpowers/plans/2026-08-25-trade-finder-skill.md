# Trade Finder Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `trade-finder` skill that scans every team in the league for realistic,
two-sided trade opportunities against the user's roster, plus the live-data script it
needs to fetch every team's roster in one pass.

**Architecture:** One new orchestration script, `yahoo/get-all-rosters.js`, follows the
same pattern as the existing `yahoo/get-matchup.js`: it composes existing page objects
(`standings-page.js` for the team list, `roster-page.js` for each roster) and prints JSON.
One new skill file, `.claude/skills/trade-finder/SKILL.md`, follows the same
plain-markdown-instructions pattern as the existing `trade-analyzer`, `waiver-targets`,
etc. skills — no new parsing/business logic is needed there, since the design's
surplus/need matching and plausibility filtering is done by the assistant at run time
using the fetched roster data, not by code.

**Tech Stack:** Node.js (`node:test` for the existing test suite), Playwright (already
wired up in `yahoo/browser.js`), Markdown skill files.

**Spec:** `docs/superpowers/specs/2026-08-25-trade-finder-skill-design.md`

---

### Task 1: `get-all-rosters.js` data script

**Files:**
- Create: `yahoo/get-all-rosters.js`

No test file for this task: it's a thin orchestration script with no new parsing logic
(all parsing is already covered by `yahoo/pages/standings-page.test.js` and
`yahoo/pages/roster-page.test.js`). This matches the existing convention in this repo —
`yahoo/get-matchup.js`, `yahoo/get-free-agents.js`, and `yahoo/get-scoreboard.js` are all
untested top-level scripts that just compose already-tested page objects.

- [ ] **Step 1: Write `yahoo/get-all-rosters.js`**

```javascript
// yahoo/get-all-rosters.js
const { launchContext } = require('./browser');
const { getStandings } = require('./pages/standings-page');
const { getRoster } = require('./pages/roster-page');

async function main() {
  const week = process.argv[2]; // optional; omit for current roster snapshot

  const context = await launchContext();
  try {
    const page = await context.newPage();
    const teams = await getStandings(page);

    // One tab per team so every roster fetch can run concurrently without racing
    // navigations against each other (same reasoning as get-matchup.js's opponent tab).
    const rosters = await Promise.all(
      teams.map(async (team) => {
        const teamPage = await context.newPage();
        try {
          return await getRoster(teamPage, team.teamId, week ? { week } : {});
        } finally {
          await teamPage.close();
        }
      })
    );

    const result = teams.map((team, i) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      roster: rosters[i].roster,
    }));

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Smoke-test it against live Yahoo (manual, not automated)**

Run: `node yahoo/get-all-rosters.js`
Expected: JSON array, one entry per league team, each with `teamId`, `teamName`, `wins`,
`losses`, `ties`, and a non-empty `roster` array. If it errors (login/session issue,
selector drift, etc.), that's expected per the design's manual-fallback path — note the
failure mode in a code comment at the top of the file the same way
`yahoo/pages/roster-page.js` documents its live-verification history, then move on; the
skill itself (Task 2) already specifies what to do when this script isn't available.

- [ ] **Step 3: Commit**

```bash
git add yahoo/get-all-rosters.js
git commit -m "Add get-all-rosters.js to fetch every team's roster in one pass"
```

---

### Task 2: `trade-finder` skill

**Files:**
- Create: `.claude/skills/trade-finder/SKILL.md`

- [ ] **Step 1: Write the skill file**

```markdown
---
name: trade-finder
description: Use when the user wants to scan the whole league for good trade opportunities, rather than evaluate one specific offer, in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Trade Finder

Scans every other team in the league for realistic trade opportunities against the
user's roster, and ranks the best candidates. For evaluating one specific trade the user
already has in mind, use `trade-analyzer` instead.

## Steps

1. **Get the user's roster.**
   - Live data: run `node yahoo/get-matchup.js <current week>` (or
     `yahoo/smoke-test-roster.js`) to get the user's roster.
   - If unavailable, ask the user to paste or screenshot their current roster.

2. **Get every other team's roster.**
   - Live data: run `node yahoo/get-all-rosters.js` to fetch every team's roster in one
     pass (includes the user's own team too — you can skip re-fetching it if step 1
     already got it live).
   - If that errors or live data isn't available at all, ask the user to paste or
     screenshot every other team's roster in one message. Do this once per scan rather
     than team-by-team, to avoid a long back-and-forth.

3. **Find candidate surplus/need matches.**
   For each other team, compare their bench depth against the user's roster needs, and
   the user's bench depth against their needs, position by position (`QB, WR, WR, RB,
   RB, TE, W/R/T, K, DEF`, plus bench). Use your general knowledge of the players
   involved — there's no live projections/rankings data source in this repo, same
   constraint `waiver-targets` and `trade-analyzer` already work under.

4. **Filter for plausibility.**
   Discard anything that's a one-sided win for the user. Keep only trades where the
   other team also has a believable reason to say yes: they offload a real surplus,
   fill a real need, or it fits their competitive context (e.g. a team with a losing
   record valuing a younger/upside asset, a team near the top prioritizing an immediate
   starter over a bench piece). Use each team's win/loss record from `get-all-rosters.js`
   (or the standings, if pasted) as a hint of their competitive context.

5. **Rank and present the top 3-5.**
   Output a flat, ranked list of the best candidate trades league-wide, not grouped by
   team. For each candidate, give:
   - The teams and players on each side
   - **Why it helps the user** — need filled, positional upgrade, bye-week/depth relief
   - **Why it helps the other team** — their surplus offloaded, their need filled, or
     competitive-context reasoning that makes it attractive to them

   The "why it helps the other team" point is meant as a ready-made talking point the
   user can lean on when pitching the trade, even if they don't use the full write-up.

6. **Check league constraints.**
   Check `reference/2026_League_Rules.pdf` for the trade cap (15/season) and deadline
   (November 21, 2026) — mention these if the season is getting close to either.

7. **Point to trade-analyzer for a full verdict.**
   Tell the user they can run `trade-analyzer` on any of these candidates for a fully
   vetted favors-user/favors-other-team/fair verdict — this skill's ranking is a lighter
   inline pass to build the shortlist, not a substitute for that deeper analysis.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/trade-finder/SKILL.md
git commit -m "Add trade-finder skill for league-wide trade scouting"
```
