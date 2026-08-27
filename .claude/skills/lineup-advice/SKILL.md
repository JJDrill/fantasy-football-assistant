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
4. Get injury/availability status for each starter and each bench player being
   considered as a replacement, per the shared cache protocol in
   `reference/injury-cache-convention.md` — reuse a fresh cached entry if one exists
   for that player this week, otherwise `WebSearch` and record it there so other
   skills (and later calls this week) don't re-search it. Cite sources for anything
   surfaced.
5. Using whatever roster data you have (live or pasted) plus the search results, reason
   about which bench players might outperform current starters this week. You don't
   have live stat projections from any script here — combine the news you found with
   your own general knowledge of the players involved (matchups, recent form) and say
   clearly when you're speculating vs. reporting fetched data.
6. Flag anything roster-rule-relevant from `reference/2026_League_Rules.pdf` if applicable
   (e.g. IR eligibility rules, no median matchup so only your own score matters).
7. Present recommendations as a short list: position, current starter, suggested
   replacement (if any), and one-line reasoning per swap.
