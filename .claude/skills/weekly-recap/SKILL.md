---
name: weekly-recap
description: Use when the user wants a flavorful recap or trash-talk writeup of their current or most recent matchup in the "Kicker? I Hardly Know Her" Yahoo league.
---

# Weekly Recap

Generates a dynamic, flavorful recap of the user's matchup for a given week — no fixed
opponent "personas," just banter grounded in the real data for that week.

## Steps

1. Determine the week (default: most recently completed week).
2. **Try live data first, if it's available:**
   - Check whether the relevant fetch scripts exist and work (`yahoo/get-matchup.js`
     for rosters, `yahoo/get-scoreboard.js` for final scores). If so, use them.
   - If unavailable, fall through to the manual path — expected until either the
     Playwright login (`node yahoo/login.js`) or OAuth + Yahoo API approval are done.
3. **Manual path (used until live data works):**
   - Ask the user to paste or screenshot their matchup box score for that week (both
     teams' starters and points, and the final score) from the Yahoo app.
4. Write a short (3-6 sentence) recap in a fun, lightly trash-talking tone, referencing
   specific real players/scores from the data provided — not generic filler.
5. If it's a challenge week, check `seasons/2026/Kicker I Hardly Know Her/reference/challenges.md` and mention whether the user's
   team looks to be in contention for that week's $10 challenge based on what's known.
6. Keep it good-natured — this is a friend league, not actual beef.
