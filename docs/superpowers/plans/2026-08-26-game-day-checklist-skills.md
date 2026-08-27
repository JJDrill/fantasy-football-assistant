# Game-Day Checklist Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new skills, `pre-game-check` and `post-game-check`, that chain together
the existing per-concern skills (`lineup-advice`, `challenge-tracker`, `weekly-recap`,
`trade-finder`, `waiver-targets`) into single game-day checklists, front-loading any
manual-input questions so each can run unattended once answered.

**Architecture:** Two new plain-markdown skill files under `.claude/skills/`, following
the exact same pattern as every existing skill in this repo (frontmatter `name` +
`description`, then a `## Steps` list the assistant follows at run time). No new code,
scripts, or business logic — these are pure orchestration instructions that reference
existing skills and existing live-data scripts by name. No new page objects or fetch
scripts are needed; both skills reuse scripts that `lineup-advice`, `challenge-tracker`,
`weekly-recap`, `trade-finder`, and `waiver-targets` already reference.

**Tech Stack:** Markdown skill files only (no Node.js/Playwright changes in this plan).

**Spec:** `docs/superpowers/specs/2026-08-26-game-day-checklist-skills-design.md`

---

### Task 1: `pre-game-check` skill

**Files:**
- Create: `.claude/skills/pre-game-check/SKILL.md`

No test file for this task: it's a plain-markdown instruction file, same convention as
every other skill in `.claude/skills/` (see `trade-finder/SKILL.md`,
`lineup-advice/SKILL.md`) — there's no code to unit test, so verification is a manual
read-through in Step 2 instead of an automated test run.

- [ ] **Step 1: Write the skill file**

```markdown
---
name: pre-game-check
description: Use when the user wants to confirm they're ready for an upcoming week/game in the "Kicker? I Hardly Know Her" Yahoo league — lineup set correctly, no inactive starters, trades accounted for, challenge rule known.
---

# Pre-Game Check

Runs a full readiness checklist before a week's lineup locks: confirms the lineup, flags
inactive/out/bye starters, accounts for any recent trades, and surfaces the week's $10
challenge rule. Chains `lineup-advice` and `challenge-tracker` — for a deeper dive on
either individually, use those skills directly instead.

## Steps

1. Determine the week (default: current).

2. **Check live-data availability** for everything this checklist needs:
   - `yahoo/get-matchup.js` (roster data, used by `lineup-advice`)
   - `yahoo/run-challenge.js` (challenge data, used by `challenge-tracker`)

   Try each; note which succeed and which fall back (missing script, expired session,
   Yahoo API not yet approved — all expected until OAuth + Yahoo API approval is done).

3. **Ask everything needed, in ONE combined message, before doing any analysis:**
   - If live roster data is unavailable: ask the user to paste or screenshot their
     current roster (starters and bench, with positions).
   - If live challenge data is unavailable: ask for whatever this week's specific
     challenge rule requires per `reference/challenges.md` (e.g. Week 3 needs every
     team's starting kicker's points).
   - Always ask (no live source exists for trade approval/veto status today): "Any
     trades proposed, approved, or vetoed recently that might not be reflected yet in
     your roster?"
   - Always ask: "Anything specific worrying you this week — an injury, a tough
     matchup — you want me to focus on?"

   Do not proceed to Step 4 until this single message has been sent and answered (or
   skipped because live data covered everything). Never ask a follow-up mid-checklist —
   if something else comes up while running Step 4, note it in the final summary instead
   of interrupting.

4. **Run the rest of the checklist without further questions**, using whatever was
   gathered in Step 3:
   - Invoke the `lineup-advice` skill for start/sit recommendations against the
     roster.
   - Cross-check for inactive/out/bye starters: if live roster data included status
     flags, check them directly; otherwise rely on the user's Step 3 answer plus your
     own general injury-news knowledge, and flag anything uncertain rather than
     asserting confidently.
   - If the user flagged a trade in Step 3 that isn't reflected in the roster data
     you have, note this explicitly rather than trying to resolve it automatically —
     it requires a fresh roster fetch after the trade posts, which is out of scope for
     this pass.
   - Invoke the `challenge-tracker` skill for this week's $10 challenge rule — surfaced
     here because some challenge rules constrain lineup choices (e.g. a challenge scored
     on starting kicker points), worth knowing before locking the lineup.

5. **Present one consolidated go/no-go checklist:**
   - Lineup: confirmed / N changes suggested (list them)
   - Inactive starters: none found / list
   - Trades: none pending / user should double-check roster reflects trade X
   - This week's challenge rule: one-line summary
```

- [ ] **Step 2: Read the file back and verify structure**

Check that:
- Frontmatter has `name: pre-game-check` and a `description:` line matching the pattern
  used by every other skill (starts with "Use when...").
- Every skill it references by name (`lineup-advice`, `challenge-tracker`) actually
  exists at `.claude/skills/<name>/SKILL.md`.
- Every script it references by path (`yahoo/get-matchup.js`, `yahoo/run-challenge.js`)
  actually exists in the repo.

Run: `ls .claude/skills/lineup-advice/SKILL.md .claude/skills/challenge-tracker/SKILL.md yahoo/get-matchup.js yahoo/run-challenge.js`
Expected: all four paths listed with no "No such file" errors.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/pre-game-check/SKILL.md
git commit -m "Add pre-game-check skill for weekly readiness checklist"
```

---

### Task 2: `post-game-check` skill

**Files:**
- Create: `.claude/skills/post-game-check/SKILL.md`

Same as Task 1: plain-markdown instruction file, no automated test, verified by
read-through.

- [ ] **Step 1: Write the skill file**

```markdown
---
name: post-game-check
description: Use when the user wants a full post-game/weekly wrap-up in the "Kicker? I Hardly Know Her" Yahoo league — recap, new trade opportunities, challenge status, and waiver targets for next week.
---

# Post-Game Check

Runs a full post-week wrap-up: recaps how the week went, scans for new trade
opportunities the results opened up, checks the $10 challenge standing, and surfaces
waiver targets for next week. Chains `weekly-recap`, `trade-finder`, `challenge-tracker`,
and `waiver-targets` — for a deeper dive on any one of these individually, use that skill
directly instead.

## Steps

1. Determine the week (default: most recently completed).

2. **Check live-data availability** for everything this checklist needs:
   - `yahoo/get-matchup.js` / `yahoo/get-scoreboard.js` (recap)
   - `yahoo/get-all-rosters.js` (trade-finder)
   - `yahoo/run-challenge.js` (challenge-tracker)
   - `yahoo/get-free-agents.js` (waiver-targets)

   Try each; note which succeed and which fall back (missing script, expired session,
   Yahoo API not yet approved — all expected until OAuth + Yahoo API approval is done).

3. **Ask everything needed, in ONE combined message, before doing any analysis:**
   - If live recap data is unavailable: ask for the final box score for that week (both
     teams' starters and points, and the final score).
   - If live trade-finder data is unavailable: ask for every other team's roster in one
     message (text or screenshots).
   - If live challenge data is unavailable: ask for whatever this week's specific
     challenge rule requires per `reference/challenges.md`.
   - If live waiver data is unavailable: ask for the waiver wire / available-players
     list, and which position(s) they're interested in (or "all").
   - Always ask: "Anything specific you want me to flag — a position need, a challenge
     you're chasing?"

   Do not proceed to Step 4 until this single message has been sent and answered (or
   skipped because live data covered everything). Never ask a follow-up mid-checklist —
   if something else comes up while running Step 4, note it in the final summary instead
   of interrupting.

4. **Run the rest of the checklist without further questions**, using whatever was
   gathered in Step 3:
   - Invoke the `weekly-recap` skill.
   - Invoke the `trade-finder` skill.
   - Invoke the `challenge-tracker` skill.
   - Invoke the `waiver-targets` skill.

5. **Present one consolidated summary**, not four separate walls of text:
   - Recap: 2-3 sentence version of the full recap
   - Trades: top candidate, if any, or "nothing worth pursuing this week"
   - Challenge: current standing/result
   - Waivers: top 2-3 pickups
   - Note that full detail from any individual step is available on request
```

- [ ] **Step 2: Read the file back and verify structure**

Check that:
- Frontmatter has `name: post-game-check` and a `description:` line matching the pattern
  used by every other skill (starts with "Use when...").
- Every skill it references by name (`weekly-recap`, `trade-finder`, `challenge-tracker`,
  `waiver-targets`) actually exists at `.claude/skills/<name>/SKILL.md`.
- Every script it references by path (`yahoo/get-matchup.js`, `yahoo/get-scoreboard.js`,
  `yahoo/get-all-rosters.js`, `yahoo/run-challenge.js`, `yahoo/get-free-agents.js`)
  actually exists in the repo.

Run: `ls .claude/skills/weekly-recap/SKILL.md .claude/skills/trade-finder/SKILL.md .claude/skills/challenge-tracker/SKILL.md .claude/skills/waiver-targets/SKILL.md yahoo/get-matchup.js yahoo/get-scoreboard.js yahoo/get-all-rosters.js yahoo/run-challenge.js yahoo/get-free-agents.js`
Expected: all nine paths listed with no "No such file" errors.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/post-game-check/SKILL.md
git commit -m "Add post-game-check skill for weekly wrap-up checklist"
```

---

### Task 3: Verify skill discovery

**Files:** None (verification only, no changes).

- [ ] **Step 1: Confirm both skills are listed as available**

Start a fresh Claude Code session in this project (or check the current session's
available-skills listing after the commits above) and confirm `pre-game-check` and
`post-game-check` both appear in the skill listing with their descriptions intact.

Expected: both names appear alongside the existing six league skills
(`challenge-tracker`, `lineup-advice`, `trade-analyzer`, `trade-finder`,
`waiver-targets`, `weekly-recap`).

No commit for this task — it's a read-only check that the two prior commits produced
discoverable skills.
