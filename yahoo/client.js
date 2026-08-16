// yahoo/client.js
require('dotenv').config();
const axios = require('axios');
const { getValidAccessToken } = require('./auth');

const BASE_URL = 'https://fantasysports.yahooapis.com/fantasysports/v2';

async function apiGet(resourcePath) {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const accessToken = await getValidAccessToken({ clientId, clientSecret });
  const separator = resourcePath.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${resourcePath}${separator}format=json`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

// NOTE: This parsing logic is UNVERIFIED against a real Yahoo API response.
// Yahoo's JSON API shape is known to be unusual (numeric-string-indexed
// objects mixed with arrays). This is a best-effort guess based on general
// knowledge of the Yahoo Fantasy API and may need adjustment once real data
// is available.
async function getUserLeagues() {
  const data = await apiGet('/users;use_login=1/games;game_keys=nfl/leagues');
  const games = data.fantasy_content.users['0'].user[1].games;
  const leagues = [];
  for (const key of Object.keys(games)) {
    if (key === 'count') continue;
    const game = games[key].game;
    const leaguesObj = game[1] && game[1].leagues;
    if (!leaguesObj) continue;
    for (const lk of Object.keys(leaguesObj)) {
      if (lk === 'count') continue;
      const league = leaguesObj[lk].league[0];
      leagues.push({
        league_key: league.league_key,
        league_id: league.league_id,
        name: league.name,
        season: league.season,
      });
    }
  }
  return leagues;
}

module.exports = { apiGet, getUserLeagues };
