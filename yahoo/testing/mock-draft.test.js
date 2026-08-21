const { test } = require('node:test');
const assert = require('node:assert');
const { classifyLobbyState } = require('./mock-draft');

test('classifyLobbyState: no active draft', () => {
  assert.strictEqual(classifyLobbyState(0), 'none');
});

test('classifyLobbyState: exactly one active draft', () => {
  assert.strictEqual(classifyLobbyState(1), 'one');
});

test('classifyLobbyState: more than one active draft is flagged', () => {
  assert.strictEqual(classifyLobbyState(2), 'multiple');
  assert.strictEqual(classifyLobbyState(5), 'multiple');
});
