// yahoo/auth.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { buildAuthorizeUrl, saveTokens, loadTokens, refreshTokens } = require('./auth');

// Tests use their own token file, never the production TOKEN_PATH, so
// running the suite never touches a developer's real cached tokens.
const TEST_TOKEN_PATH = path.join(__dirname, 'test-token.json');

function cleanupTestTokenFile() {
  if (fs.existsSync(TEST_TOKEN_PATH)) fs.unlinkSync(TEST_TOKEN_PATH);
}

test('buildAuthorizeUrl includes client id, oob redirect, and code response type', () => {
  const url = buildAuthorizeUrl('abc123');
  const parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, 'https://api.login.yahoo.com/oauth2/request_auth');
  assert.equal(parsed.searchParams.get('client_id'), 'abc123');
  assert.equal(parsed.searchParams.get('redirect_uri'), 'urn:ietf:wg:oauth:2.0:oob');
  assert.equal(parsed.searchParams.get('response_type'), 'code');
});

test('saveTokens then loadTokens round-trips and computes expires_at', () => {
  try {
    saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 }, TEST_TOKEN_PATH);
    const loaded = loadTokens(TEST_TOKEN_PATH);
    assert.equal(loaded.access_token, 'a');
    assert.equal(loaded.refresh_token, 'r');
    assert.ok(loaded.expires_at > Date.now());
  } finally {
    cleanupTestTokenFile();
  }
});

test('refreshTokens preserves the previous refresh_token when the response omits one', async () => {
  const originalPost = axios.post;
  axios.post = async () => ({ data: { access_token: 'new-access', expires_in: 3600 } });
  try {
    const result = await refreshTokens({
      clientId: 'id',
      clientSecret: 'secret',
      refreshToken: 'old-refresh',
      tokenPath: TEST_TOKEN_PATH,
    });
    assert.equal(result.access_token, 'new-access');
    assert.equal(result.refresh_token, 'old-refresh');
  } finally {
    axios.post = originalPost;
    cleanupTestTokenFile();
  }
});
