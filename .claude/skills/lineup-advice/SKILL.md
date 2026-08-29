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
   - Also ask if there's anything specific worrying them (a bye week, an injury designation,
     a tough matchup) so you can focus there.
4. Get injury/availability status for every player on the full roster (starters and
   bench), plus any off-field legal/status red flags (arrests, citations, suspensions,
   DUIs, etc. — the kind of thing that can sideline a player independent of health; see
   the Josh Jacobs note in `seasons/2026/Kicker I Hardly Know Her/week-00-draft.md` for
   why this check exists), per the shared cache protocol in
   `reference/injury-cache-convention.md` — reuse a fresh cached entry if one exists for
   that player this week, otherwise `WebSearch` both (injury status, and something like
   "<player name> arrest OR charged OR suspended OR DUI") and record them there so other
   skills (and later calls this week) don't re-search it. Cite sources for anything
   surfaced. A legal/off-field flag is informational only — surface it clearly in the
   final list (step 8), but don't auto-bench the player for it.
5. Get a matchup grade for every player on the full roster: look up their real-life NFL
   opponent for the week and that opponent's defensive rank against the player's
   position (e.g. rushing yards allowed to RBs, for a RB). `WebSearch` per team+position
   if not already cached this week (e.g. "CIN defense vs RB rank 2026") — reuse the same
   cache file as step 4, keyed by team+position+week, since defense-vs-position rank
   doesn't change within a week and is shared across every player facing that defense.
   Grade on a 3-tier scale from the 32-team rank:
   - Rank 1–10 (stingiest defense) → Unfavorable
   - Rank 11–21 → Neutral
   - Rank 22–32 (most generous defense) → Favorable
6. Using whatever roster data you have (live or pasted) plus the injury/legal search
   results and matchup grades, reason about which bench players might outperform
   current starters this week. You don't have live stat projections from any script
   here — combine the news you found with your own general knowledge of the players
   involved (recent form) and say clearly when you're speculating vs. reporting fetched
   data.
7. Flag anything roster-rule-relevant from `reference/2026_League_Rules.pdf` if applicable
   (e.g. IR eligibility rules, no median matchup so only your own score matters).
8. Present recommendations as a short list per player: position, current starter,
   suggested replacement (if any), matchup grade (Favorable/Neutral/Unfavorable) with a
   one-line reason, any off-field legal/status flag, and one-line start/sit reasoning.
