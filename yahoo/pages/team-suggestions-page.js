const { teamUrl, assertLoggedIn } = require('./base-page');

// The suggestions box on a team page (live-verified 2026-10-21): three tab buttons,
// data-tst="sit_start" | "add_drop" | "trade". The box's own data-tst follows the active tab
// (e.g. "add_drop_suggestions" once that tab is clicked), so match any "*_suggestions".
// Sit/start is the default tab. Each add/drop suggestion is a card with two player photos
// (alt "Photo of <name>": the player to ADD first, then the one to DROP) and a
// "Compare" link (data-tst="player_compare_btn") whose playerKeys list DROP first, then ADD,
// e.g. playerKeys=470.p.40108,470.p.41058 for "add Malik Washington (41058), drop Kendre Miller (40108)".
// The trade tab is Yahoo Fantasy Plus (paid) only, so it isn't read.

const BOX_SELECTOR = 'div[data-tst$="_suggestions"]';
const COMPARE_SELECTOR = 'a[data-tst="player_compare_btn"]';

function parsePlayerKeys(href) {
  const match = String(href ?? '').match(/playerKeys=([^&]+)/);
  if (!match) return [];
  return decodeURIComponent(match[1])
    .split(',')
    .map((key) => (key.match(/\.p\.(\d+)$/) || [])[1] ?? null);
}

function parseSuggestion({ alts, href }) {
  const names = (alts ?? []).map((alt) => String(alt).replace(/^Photo of\s+/, '').trim());
  if (names.length < 2) return null;
  const [dropId, addId] = parsePlayerKeys(href);
  return {
    add: names[0],
    addYahooPlayerId: addId ?? null,
    drop: names[1],
    dropYahooPlayerId: dropId ?? null,
  };
}

async function readTab(page, tab) {
  await page.locator(`button[data-tst="${tab}"]`).first().click();
  await page.waitForTimeout(1500);
  return page.locator(BOX_SELECTOR).first().evaluate((box, compareSelector) => ({
    text: box.innerText,
    cards: Array.from(box.querySelectorAll(compareSelector)).map((a) => {
      // Climb to the card that holds this link's two player photos.
      let card = a.parentElement;
      while (card && card !== box && card.querySelectorAll('img[alt^="Photo of"]').length < 2) {
        card = card.parentElement;
      }
      return {
        alts: card ? Array.from(card.querySelectorAll('img[alt^="Photo of"]')).map((img) => img.alt) : [],
        href: a.getAttribute('href'),
      };
    }),
  }), COMPARE_SELECTOR);
}

// Sit/start cards haven't been seen live yet (the tab said "no suggestions" on 2026-10-21),
// so keep that tab's text raw, minus the tab labels.
function cleanTabText(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    // Live (2026-10-21) the empty tab still renders three placeholder cards: "Start Player / Sit Player / Compare".
    .filter((line) => line && !/^((Sit\/start|Add\/drop|Trade) suggestions|Start Player|Sit Player|Compare)$/.test(line));
}

async function getTeamSuggestions(page, teamId) {
  await page.goto(teamUrl(teamId));
  await assertLoggedIn(page);
  await page.locator('button[data-tst="add_drop"]').first().waitFor();

  const sitStart = await readTab(page, 'sit_start');
  const addDrop = await readTab(page, 'add_drop');

  return {
    addDrop: addDrop.cards.map(parseSuggestion).filter(Boolean),
    sitStartText: cleanTabText(sitStart.text),
  };
}

module.exports = { parsePlayerKeys, parseSuggestion, cleanTabText, getTeamSuggestions };
