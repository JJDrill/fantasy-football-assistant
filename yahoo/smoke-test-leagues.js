// yahoo/smoke-test-leagues.js
const { getUserLeagues } = require('./client');

getUserLeagues()
  .then((leagues) => {
    console.log('Leagues found for your Yahoo account:');
    console.table(leagues);
  })
  .catch((err) => {
    console.error('Failed to fetch leagues:', err.response?.data || err.message);
    process.exit(1);
  });
