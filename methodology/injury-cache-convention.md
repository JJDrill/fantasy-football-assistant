# Shared Injury/Availability Cache

Both `pre-game-check` and `lineup-advice` need up-to-date injury/availability news for
starters (and, for `lineup-advice`, bench players being considered as a swap). Rather than
each skill independently re-searching the same player, they share one cache per week so a
search done by one is reused by the other.

## Where it lives

`seasons/2026/Kicker I Hardly Know Her/week-<NN>.md` (the same per-week notes file
lineup decisions already live in) — add or update a section:

```
## Injury/Availability Report (cached)

| Player | Status | Note | Checked | Source |
|---|---|---|---|---|
| Josh Jacobs | Questionable | groin injury, limited practice; suspension risk pending | 2026-08-26 14:32 ET | [Yahoo Sports](https://...) |
```

If the week's file doesn't exist yet, create it (see existing weeks for the rest of the
expected structure — matchup, lineup, notes).

## Protocol for any skill that needs a player's status

1. **Check the cache first.** Look for that player's row in the current week's file.
2. **Freshness rule:**
   - No entry, or entry from a previous calendar day → stale. Re-search.
   - Entry from earlier today, more than ~4 hours old, **and** it's game day (Sunday, or
     whatever day that player's game falls on) → stale. Re-search — status can flip right
     up to kickoff on game day itself.
   - Otherwise → fresh. Reuse it, and say so ("per the cached check from earlier today...")
     instead of silently re-searching.
3. **On a fresh search:** run `WebSearch` (e.g. "<player name> injury status week <N>
   2026"), then upsert the row (player, status, one-line note, timestamp, source link) into
   the week's cache table — update the existing row if present rather than duplicating it.
4. Cite the source link when reporting the status to the user, whether it came from cache
   or a fresh search.

This means the first skill to touch a given player in a given week pays the search cost;
anything after that in the same week reads the cache until it goes stale.

## No backup files

Always edit `week-<NN>.md` in place — never copy it aside (e.g. `week-01.backup.md`)
before a re-search, even temporarily for comparison. Git history already gives you a
diff of what changed; a hand-made backup risks going stale and orphaning references in
the real file once it's deleted (this happened in Week 1 — a "See week-01.backup.md for
the full table" note outlived the backup itself). If a re-search finds real deltas worth
calling out, summarize them inline in the week's file instead (see the Week 1 "What
changed" section for the pattern) — do not keep a second file around for the diff.
