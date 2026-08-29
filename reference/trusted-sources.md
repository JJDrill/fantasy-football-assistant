# Trusted Source Tiers

Any skill that `WebSearch`es for injury status, legal/off-field news, suspensions, or
similar factual claims about a player should tier its sources by this list rather than
treating every hit equally — this is what would have caught the George Pickens
"suspended for PED use" rumor earlier (it traced back only to uncorroborated
Instagram/Facebook posts, not a real outlet).

This is **not** a hard restriction on `WebSearch`'s `allowed_domains` — breaking news
(especially legal/suspension news) often surfaces first via a beat reporter's own post
before a wire outlet picks it up, and a hard allowlist would delay or miss that. Instead,
every search stays open, but what a result is *allowed to justify* differs by tier.

## Tier 1 — Trusted (cite as fact, no extra hedging needed)

- League/official: `nfl.com`, the player's official team site (e.g. `buffalobills.com`,
  `packers.com`, any `*.nfl.com`/team-branded domain)
- Wire services: `apnews.com`, `reuters.com`
- Major national sports outlets: `espn.com`, `cbssports.com`, `nbcsports.com`,
  `foxsports.com`, `sports.yahoo.com`, `si.com`, `theathletic.com`
- Established fantasy/analytics outlets: `fantasypros.com`, `pro-football-reference.com`,
  `profootballnetwork.com`, `rotoballer.com`
- A named beat reporter's post (Adam Schefter, Ian Rapoport, etc.) even on a platform
  like X/Twitter — cite them by name, not just the platform, since the reporter (not the
  platform) is the trust signal

## Tier 2 — Everything else (label, don't assert)

Local/regional outlets not covered above, team-fan blogs/aggregators (Yardbarker,
Heavy.com, Bleacher Nation, SI's "onsi" network, etc.), and any social media post that
isn't a named credentialed reporter (a rando Instagram/Facebook post, an unsourced
Reddit thread) all fall here. These aren't necessarily wrong, but they aren't enough on
their own to assert a claim as settled fact — especially for something consequential
like a suspension, arrest, or roster status.

**When a claim shows up only in Tier 2 sources:**
1. Try one more targeted search using a Tier 1 outlet's name in the query (e.g. "espn
   <player> suspension") to see if it's been corroborated.
2. If still uncorroborated, report it labeled **Unverified** (see the George Pickens row
   in `reference/legal-watch-list.md` for the pattern) rather than stating it as fact.
   Recommend the user manually double-check (e.g. the actual Yahoo roster page's status
   badge) before acting on it.
3. Once a Tier 1 source corroborates it, drop the "Unverified" label and cite the Tier 1
   source going forward.

## Where this applies

- `lineup-advice` Step 4 (injury/legal search) and Step 5 (matchup-grade sourcing)
- `post-game-check`'s legal watch-list refresh
- Any other skill's `WebSearch` call that feeds a factual claim into a cached file
  (`reference/injury-cache-convention.md`, `reference/legal-watch-list.md`, a week's
  notes file)
