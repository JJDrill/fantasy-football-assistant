const { test } = require('node:test');
const assert = require('node:assert');
const { parsePendingItem, parseWaiverPriority, parseIrUsage } = require('./team-notes-page');

test('parsePendingItem reads an add/drop waiver claim (live text 2026-09-29)', () => {
  const item = parsePendingItem(
    'Waiver 1 (Sep 30): Add Kenyon Sadiq, Drop Oronde Gadsden View Details',
    '/f1/109715/2/viewwaiver?claim_id=2_42638_41951&pspid=782200906&activity=transaction'
  );
  assert.deepStrictEqual(item, {
    kind: 'waiver',
    order: 1,
    processDate: 'Sep 30',
    add: 'Kenyon Sadiq',
    drop: 'Oronde Gadsden',
    claimId: '2_42638_41951',
  });
});

test('parsePendingItem strips the icon-font glyphs Yahoo puts around the live text', () => {
  // Live textContent (2026-09-29) starts with U+E213 (transaction icon) and ends with
  // U+E005 (the "View Details" chevron). Both are private-use characters, so trim() keeps them.
  const item = parsePendingItem(' Waiver 1 (Sep 30): Add Kenyon Sadiq, Drop Oronde Gadsden View Details', '/f1/109715/2/viewwaiver?claim_id=2_1');
  assert.strictEqual(item.kind, 'waiver');
  assert.strictEqual(item.drop, 'Oronde Gadsden');
});

test('parsePendingItem handles an add-only claim and a name with a suffix', () => {
  const item = parsePendingItem('Waiver 2 (Sep 30): Add Ollie Gordon II View Details', '/f1/109715/2/viewwaiver?claim_id=2_41969');
  assert.strictEqual(item.add, 'Ollie Gordon II');
  assert.strictEqual(item.drop, null);
  assert.strictEqual(item.order, 2);
});

test('parsePendingItem skips the "Edit Waiver Priority" link, which Yahoo counts in the badge', () => {
  assert.strictEqual(parsePendingItem('Edit Waiver Priority Edit', '/f1/109715/2/editwaivers?pspid=1'), null);
});

test('parsePendingItem keeps any other pending item (e.g. a trade) as raw text', () => {
  assert.deepStrictEqual(parsePendingItem('  Trade proposed to Russini   View Details ', '/f1/109715/2/pendingtrade?x=1'), {
    kind: 'other',
    text: 'Trade proposed to Russini',
    href: '/f1/109715/2/pendingtrade?x=1',
  });
});

test('parseWaiverPriority and parseIrUsage read the team notes header', () => {
  assert.strictEqual(parseWaiverPriority('Waiver Priority: 7th'), 7);
  assert.strictEqual(parseWaiverPriority('Waiver Priority: 1st'), 1);
  assert.strictEqual(parseWaiverPriority('nothing here'), null);
  assert.deepStrictEqual(parseIrUsage('You have used 0 of 2 IR positions on your roster.'), { used: 0, total: 2 });
  assert.strictEqual(parseIrUsage(''), null);
});
