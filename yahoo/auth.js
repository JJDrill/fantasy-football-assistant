// yahoo/auth.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const AUTHORIZE_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

function buildAuthorizeUrl(clientId) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    language: 'en-us',
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function loadTokens(tokenPath = TOKEN_PATH) {
  if (!fs.existsSync(tokenPath)) return null;
  return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
}

function saveTokens(tokenResponse, tokenPath = TOKEN_PATH) {
  const record = {
    ...tokenResponse,
    expires_at: Date.now() + tokenResponse.expires_in * 1000,
  };
  fs.writeFileSync(tokenPath, JSON.stringify(record, null, 2));
  return record;
}

function basicAuthHeader(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

async function exchangeCodeForTokens({ clientId, clientSecret, code, tokenPath = TOKEN_PATH }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
  });
  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basicAuthHeader(clientId, clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return saveTokens(res.data, tokenPath);
}

async function refreshTokens({ clientId, clientSecret, refreshToken, tokenPath = TOKEN_PATH }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshToken,
  });
  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basicAuthHeader(clientId, clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  // Yahoo (like many providers) may omit refresh_token on a refresh response
  // since it isn't rotated. Keep the previous refresh_token unless the
  // response explicitly provides a new one (response spread last so it can
  // only override with a real value, never with undefined).
  return saveTokens({ refresh_token: refreshToken, ...res.data }, tokenPath);
}

async function getValidAccessToken({ clientId, clientSecret, tokenPath = TOKEN_PATH }) {
  let tokens = loadTokens(tokenPath);
  if (!tokens) {
    throw new Error('No cached tokens found. Run `node yahoo/setup-auth.js` first.');
  }
  const bufferMs = 60 * 1000;
  if (Date.now() + bufferMs >= tokens.expires_at) {
    tokens = await refreshTokens({
      clientId,
      clientSecret,
      refreshToken: tokens.refresh_token,
      tokenPath,
    });
  }
  return tokens.access_token;
}

module.exports = {
  TOKEN_PATH,
  buildAuthorizeUrl,
  loadTokens,
  saveTokens,
  exchangeCodeForTokens,
  refreshTokens,
  getValidAccessToken,
};
