// yahoo/fantasypros-ecr.js
//
// FantasyPros weekly Expert Consensus Rankings (ECR), half-PPR (this league's scoring).
// Free, no login: each rankings page embeds its full table as `var ecrData = {...};`, so we
// read that JSON instead of the JS-rendered table (a plain page fetch sees no rows).
//
// Usage:
//   node yahoo/fantasypros-ecr.js                      # all positions, full lists
//   node yahoo/fantasypros-ecr.js TE RB                # just these positions
//   node yahoo/fantasypros-ecr.js --players "Isaiah Likely,Kyle Pitts Sr."
//
// `ecr` is the consensus positional rank; `best`/`worst`/`std` show expert disagreement.
// Treat it as one signal in lineup-advice, scored weekly in reference/source-accuracy.md.

const axios = require('axios');

const PAGES = {
  QB: 'qb.php',
  RB: 'half-point-ppr-rb.php',
  WR: 'half-point-ppr-wr.php',
  TE: 'half-point-ppr-te.php',
  K: 'k.php',
  DST: 'dst.php',
};

function parseEcrHtml(html) {
  const m = html.match(/var ecrData = (\{[\s\S]*?\});\s/);
  if (!m) throw new Error('ECR_NOT_FOUND: no ecrData on the page (FantasyPros layout may have changed)');
  const d = JSON.parse(m[1]);
  return {
    week: Number(d.week),
    position: d.position_id,
    scoring: d.scoring,
    experts: d.total_experts,
    lastUpdated: d.last_updated,
    players: d.players.map((p) => ({
      name: p.player_name,
      team: p.player_team_id,
      position: p.player_position_id,
      opponent: p.player_opponent,
      ecr: p.rank_ecr,
      best: Number(p.rank_min),
      worst: Number(p.rank_max),
      avg: Number(p.rank_ave),
      std: Number(p.rank_std),
      grade: p.start_sit_grade ?? null,
    })),
  };
}

// Yahoo and FantasyPros spell names differently ("Kyle Pitts Sr." vs "Kyle Pitts").
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/-/g, ' ')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickPlayers(players, names) {
  const byName = new Map(players.map((p) => [normalizeName(p.name), p]));
  const found = [];
  const missing = [];
  for (const n of names) {
    const p = byName.get(normalizeName(n));
    if (p) found.push(p);
    else missing.push(n);
  }
  return { found, missing };
}

async function fetchPosition(pos) {
  const url = `https://www.fantasypros.com/nfl/rankings/${PAGES[pos]}`;
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  return parseEcrHtml(res.data);
}

async function main() {
  const args = process.argv.slice(2);
  const pi = args.indexOf('--players');
  const names = pi >= 0 ? args[pi + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
  const positions = args.filter((a, i) => a !== '--players' && i !== pi + 1 && PAGES[a.toUpperCase()])
    .map((a) => a.toUpperCase());

  const out = {};
  const missingByPos = {};
  for (const pos of positions.length ? positions : Object.keys(PAGES)) {
    const r = await fetchPosition(pos);
    if (names) {
      const { found, missing } = pickPlayers(r.players, names);
      out[pos] = { week: r.week, experts: r.experts, lastUpdated: r.lastUpdated, players: found };
      missingByPos[pos] = missing;
    } else {
      out[pos] = r;
    }
  }
  if (names) {
    // A name is only truly missing if no position page had it.
    out.notFound = names.filter((n) => Object.values(missingByPos).every((m) => m.includes(n)));
  }
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { parseEcrHtml, pickPlayers, normalizeName, PAGES };
