const { teamUrl, assertLoggedIn } = require('./base-page');

// The "team notes" box at the top of a team page (live-verified 2026-09-29): IR usage,
// waiver priority, and a "Pending Transactions" list. Each pending item is an <a>.
// Waiver claims link to .../viewwaiver?claim_id=..., and the list also contains an
// "Edit Waiver Priority" link that Yahoo counts in the badge number.

const WAIVER_RE = /^Waiver (\d+) \(([^)]+)\):\s*Add (.+?)(?:,\s*Drop (.+?))?\s*(?:View Details)?$/;

function parsePendingItem(text, href) {
  // Yahoo's icon font renders as private-use characters (e.g. U+E213, U+E005) inside the
  // link text, which trim() doesn't remove.
  const clean = String(text ?? '').replace(/[-]/g, '').replace(/\s+/g, ' ').trim();
  if (/editwaivers/.test(href ?? '')) return null;

  const match = clean.match(WAIVER_RE);
  if (match) {
    const claimId = (String(href).match(/claim_id=([^&]+)/) || [])[1] ?? null;
    return {
      kind: 'waiver',
      order: Number(match[1]),
      processDate: match[2],
      add: match[3].trim(),
      drop: match[4] ? match[4].trim() : null,
      claimId,
    };
  }

  // Pending trades (proposed by us or offered to us) share this list. Their exact live text
  // hasn't been captured yet, so match "trade" in the text or link and keep the raw text.
  const rest = clean.replace(/\s*View Details$/, '');
  if (/trade/i.test(rest) || /trade/i.test(href ?? '')) return { kind: 'trade', text: rest, href };

  // Anything else: keep it raw rather than dropping it.
  return { kind: 'other', text: rest, href };
}

function parseWaiverPriority(text) {
  const match = String(text ?? '').match(/Waiver Priority:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseIrUsage(text) {
  const match = String(text ?? '').match(/used (\d+) of (\d+) IR positions/);
  return match ? { used: Number(match[1]), total: Number(match[2]) } : null;
}

async function getTeamNotes(page, teamId) {
  await page.goto(teamUrl(teamId));
  await assertLoggedIn(page);
  const box = page.locator('.teamnotes-content').first();
  await box.waitFor();
  const raw = await box.evaluate((el) => ({
    header: el.textContent,
    items: Array.from(el.querySelectorAll('#pending_transactions a')).map((a) => ({
      text: a.textContent,
      href: a.getAttribute('href'),
    })),
  }));
  const header = raw.header.replace(/\s+/g, ' ');
  return {
    waiverPriority: parseWaiverPriority(header),
    irUsage: parseIrUsage(header),
    pending: raw.items.map((i) => parsePendingItem(i.text, i.href)).filter(Boolean),
  };
}

module.exports = { parsePendingItem, parseWaiverPriority, parseIrUsage, getTeamNotes };
