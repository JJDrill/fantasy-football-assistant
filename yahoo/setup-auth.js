// yahoo/setup-auth.js
require('dotenv').config();
const readline = require('readline');
const { buildAuthorizeUrl, exchangeCodeForTokens } = require('./auth');

async function main() {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Missing YAHOO_CLIENT_ID / YAHOO_CLIENT_SECRET in .env — see Task 2.');
    process.exit(1);
  }

  const url = buildAuthorizeUrl(clientId);
  console.log('1. Open this URL in your browser and log in to Yahoo:\n');
  console.log(url);
  console.log('\n2. Click "Agree" to grant read access. Yahoo will display a code on screen.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\n3. Paste that code here and press Enter: ', async (code) => {
    rl.close();
    try {
      await exchangeCodeForTokens({ clientId, clientSecret, code: code.trim() });
      console.log('\nSuccess — token saved to yahoo/token.json.');
    } catch (err) {
      console.error('\nToken exchange failed:', err.response?.data || err.message);
      process.exit(1);
    }
  });
}

main();
