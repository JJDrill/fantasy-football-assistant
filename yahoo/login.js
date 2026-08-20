const { launchContext } = require('./browser');
const { LEAGUE_URL } = require('./pages/base-page');

async function main() {
  const context = await launchContext({ headless: false });
  const page = await context.newPage();
  await page.goto(LEAGUE_URL);

  console.log('A browser window has opened. Log into Yahoo, then come back here.');
  console.log('Waiting for you to reach the league page...');

  await page.waitForURL((url) => !url.toString().includes('login.yahoo.com'), {
    timeout: 0,
  });

  console.log('Logged in. Session saved — you can close the browser window now.');
  await context.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
